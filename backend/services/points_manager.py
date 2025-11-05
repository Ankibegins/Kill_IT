"""
Points Manager Service - MongoDB Async
Handles point calculations and updates for task completion
"""
from bson import ObjectId
from core.database import get_collection

async def update_points_for_task(
    user_id: str,
    task_value: int,
    task_category: str,
    has_proof: bool = False,
    completed: bool = True
):
    """
    Update user points based on task completion
    
    Args:
        user_id: User ID
        task_value: Base points value of the task
        task_category: Task category (daily, weekly, weekend, monthly)
        has_proof: Whether task has proof URL
        completed: Whether task was completed (True) or failed (False)
    
    Returns:
        Updated points value
    """
    users_collection = get_collection("users")
    
    if completed:
        # Calculate points with multipliers
        points = task_value
        
        # Category multipliers
        if task_category == "weekly":
            points *= 2
        elif task_category == "monthly":
            points *= 4
        
        # Bonus for proof
        if has_proof:
            points += 2
        
        # Update user: add points and increment completed_tasks
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$inc": {
                    "total_points": points,
                    "completed_tasks": 1
                }
            }
        )
        
        return points
    else:
        # Task failed: deduct points and increment failed_tasks
        penalty = 5
        
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$inc": {
                    "total_points": -penalty,
                    "failed_tasks": 1
                }
            }
        )
        
        return -penalty

