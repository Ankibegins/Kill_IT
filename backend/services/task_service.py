"""
Task Service - Business logic for task operations
Handles CRUD operations and task management
"""
from typing import Optional
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status

from core.database import get_collection
from core.task_reset import calculate_next_reset
from schemas.task_schema import TaskOut

VALID_CATEGORIES = ["daily", "weekly", "weekend", "monthly"]

def validate_category(category: str):
    """Validate task category"""
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category must be one of: {', '.join(VALID_CATEGORIES)}"
        )

async def create_task(
    user_id: str,
    title: str,
    category: str,
    priority: int,
    description: Optional[str] = None,
    value: int = 10
) -> TaskOut:
    """
    Create a new task for a user
    
    Args:
        user_id: User ID
        title: Task title
        category: Task category
        priority: Task priority (lower = higher priority)
        description: Optional task description
    
    Returns:
        Created TaskOut object
    """
    validate_category(category)
    
    tasks_collection = get_collection("tasks")
    current_time = datetime.utcnow()
    
    # Calculate next reset time
    next_reset = calculate_next_reset(category, current_time)
    
    task_doc = {
        "title": title,
        "description": description,
        "category": category,
        "priority": priority,
        "value": value,
        "user_id": user_id,
        "is_completed": False,
        "created_at": current_time,
        "updated_at": current_time,
        "next_reset": next_reset,
        "proof_url": None
    }
    
    result = await tasks_collection.insert_one(task_doc)
    task_doc["id"] = str(result.inserted_id)
    del task_doc["_id"]
    
    return TaskOut(**task_doc)

async def get_task_by_id(task_id: str, user_id: str) -> Optional[dict]:
    """
    Get a task by ID, verifying it belongs to the user
    
    Args:
        task_id: Task ID
        user_id: User ID for verification
    
    Returns:
        Task document or None if not found
    """
    tasks_collection = get_collection("tasks")
    task = await tasks_collection.find_one({
        "_id": ObjectId(task_id),
        "user_id": user_id
    })
    return task

async def update_task(
    task_id: str,
    user_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[int] = None
) -> TaskOut:
    """
    Update a task
    
    Args:
        task_id: Task ID
        user_id: User ID for verification
        title: Optional new title
        description: Optional new description
        category: Optional new category
        priority: Optional new priority
    
    Returns:
        Updated TaskOut object
    """
    # Verify task exists and belongs to user
    task = await get_task_by_id(task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Validate category if provided
    if category is not None:
        validate_category(category)
    
    tasks_collection = get_collection("tasks")
    
    # Build update dict
    update_data = {"updated_at": datetime.utcnow()}
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description
    if category is not None:
        update_data["category"] = category
        # Recalculate next_reset if category changed
        update_data["next_reset"] = calculate_next_reset(category)
    if priority is not None:
        update_data["priority"] = priority
    
    if update_data:
        await tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
    
    # Return updated task
    updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    del updated_task["_id"]
    
    return TaskOut(**updated_task)

async def complete_task(task_id: str, user_id: str) -> TaskOut:
    """
    Mark a task as completed and update gamification metrics
    
    Args:
        task_id: Task ID
        user_id: User ID for verification
    
    Returns:
        Updated TaskOut object
    """
    # Verify task exists and belongs to user
    task = await get_task_by_id(task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    tasks_collection = get_collection("tasks")
    current_time = datetime.utcnow()
    
    # Mark as completed and update timestamp
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"is_completed": True, "updated_at": current_time}}
    )
    
    # --- GAMIFICATION LOGIC ---
    from services.points_manager import update_points_for_task
    from services.streak_manager import update_user_streak
    
    # Get task value (default to 10 if not set)
    task_value = task.get("value", 10)
    task_category = task.get("category", "daily")
    has_proof = bool(task.get("proof_url"))
    
    # 1. Update points based on the task
    await update_points_for_task(
        user_id=user_id,
        task_value=task_value,
        task_category=task_category,
        has_proof=has_proof,
        completed=True
    )
    
    # 2. Update the user's daily streak
    await update_user_streak(user_id=user_id)
    # --- END GAMIFICATION LOGIC ---
    
    # Return updated task
    updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    del updated_task["_id"]
    
    return TaskOut(**updated_task)

async def delete_task(task_id: str, user_id: str):
    """
    Delete a task
    
    Args:
        task_id: Task ID
        user_id: User ID for verification
    """
    # Verify task exists and belongs to user
    task = await get_task_by_id(task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    tasks_collection = get_collection("tasks")
    
    # Delete proof file if exists
    if task.get("proof_url"):
        import os
        UPLOADS_DIR = "uploads"
        proof_path = task["proof_url"].replace("/uploads/", UPLOADS_DIR + "/")
        if os.path.exists(proof_path):
            os.remove(proof_path)
    
    # Delete task
    await tasks_collection.delete_one({"_id": ObjectId(task_id)})

async def upload_task_proof(
    task_id: str,
    user_id: str,
    file_content: bytes,
    filename: str
) -> TaskOut:
    """
    Upload proof file for a task
    
    Args:
        task_id: Task ID
        user_id: User ID for verification
        file_content: File content bytes
        filename: Original filename
    
    Returns:
        Updated TaskOut object
    """
    # Verify task exists and belongs to user
    task = await get_task_by_id(task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    import os
    import shutil
    UPLOADS_DIR = "uploads"
    
    # Save file
    file_path = f"{UPLOADS_DIR}/{task_id}_{filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    proof_url = f"/uploads/{task_id}_{filename}"
    
    # Update task with proof URL
    tasks_collection = get_collection("tasks")
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"proof_url": proof_url}}
    )
    
    # Return updated task
    updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    del updated_task["_id"]
    
    return TaskOut(**updated_task)

