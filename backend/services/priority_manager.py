"""
Priority Management Service
Handles task sorting and priority queue logic using MongoDB
"""
from typing import List, Optional
from bson import ObjectId

from core.database import get_collection
from schemas.task_schema import TaskOut

async def get_sorted_tasks_from_db(
    user_id: str,
    completed_only: Optional[bool] = None,
    category: Optional[str] = None
) -> List[TaskOut]:
    """
    Get tasks sorted by priority (lower number = higher priority)
    
    Args:
        user_id: User ID to filter tasks
        completed_only: Optional filter by completion status
        category: Optional filter by category
    
    Returns:
        List of TaskOut objects sorted by priority (ascending)
    """
    tasks_collection = get_collection("tasks")
    
    # Build query
    query = {"user_id": user_id}
    if completed_only is not None:
        query["is_completed"] = completed_only
    if category:
        query["category"] = category
    
    # Fetch tasks and sort by priority (ascending - lower number = higher priority)
    # Secondary sort by created_at for consistent ordering
    cursor = tasks_collection.find(query).sort([
        ("priority", 1),  # Primary sort: priority ascending
        ("created_at", 1)  # Secondary sort: created_at ascending
    ])
    
    tasks = []
    async for task_doc in cursor:
        task_doc["id"] = str(task_doc["_id"])
        del task_doc["_id"]
        tasks.append(TaskOut(**task_doc))
    
    return tasks

async def get_priority_queue(user_id: str) -> List[TaskOut]:
    """
    Get priority queue - only incomplete tasks sorted by priority
    
    Args:
        user_id: User ID to filter tasks
    
    Returns:
        List of incomplete TaskOut objects sorted by priority
    """
    return await get_sorted_tasks_from_db(user_id, completed_only=False)

