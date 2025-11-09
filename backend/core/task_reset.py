"""
Task Reset Logic for Recurring Tasks
Handles automatic reset of tasks based on their category (daily, weekly, weekend, monthly)
"""
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId

from core.database import get_collection
from schemas.task_schema import TaskStatus

def calculate_next_reset(category: str, current_time: Optional[datetime] = None) -> datetime:
    """
    Calculate the next reset time based on task category
    
    Args:
        category: Task category ('daily', 'weekly', 'weekend', 'monthly')
        current_time: Current datetime (defaults to now)
    
    Returns:
        datetime: Next reset time
    """
    if current_time is None:
        current_time = datetime.utcnow()
    
    if category == "daily":
        # Reset at midnight (00:00) next day
        next_day = current_time + timedelta(days=1)
        return next_day.replace(hour=0, minute=0, second=0, microsecond=0)
    
    elif category == "weekly":
        # Reset every Monday at 00:00
        days_until_monday = (7 - current_time.weekday()) % 7
        if days_until_monday == 0:  # It's already Monday
            days_until_monday = 7
        next_monday = current_time + timedelta(days=days_until_monday)
        return next_monday.replace(hour=0, minute=0, second=0, microsecond=0)
    
    elif category == "weekend":
        # Reset every Saturday at 00:00 (active Sat-Sun)
        days_until_saturday = (5 - current_time.weekday()) % 7
        if days_until_saturday == 0:  # It's already Saturday
            days_until_saturday = 7
        next_saturday = current_time + timedelta(days=days_until_saturday)
        return next_saturday.replace(hour=0, minute=0, second=0, microsecond=0)
    
    elif category == "monthly":
        # Reset on 1st of next month at 00:00
        if current_time.month == 12:
            next_month = current_time.replace(year=current_time.year + 1, month=1, day=1)
        else:
            next_month = current_time.replace(month=current_time.month + 1, day=1)
        return next_month.replace(hour=0, minute=0, second=0, microsecond=0)
    
    else:
        # Default: daily reset
        next_day = current_time + timedelta(days=1)
        return next_day.replace(hour=0, minute=0, second=0, microsecond=0)

async def reset_tasks_for_category(category: str):
    """
    Reset all tasks of a specific category that have passed their next_reset time
    
    Args:
        category: Task category to reset
    """
    tasks_collection = get_collection("tasks")
    current_time = datetime.utcnow()
    
    # Find tasks that need reset (only completed tasks get reset)
    query = {
        "category": category,
        "next_reset": {"$lte": current_time},
        "status": TaskStatus.COMPLETED.value
    }
    
    # Reset tasks: set status to pending and update next_reset
    tasks_to_reset = []
    async for task in tasks_collection.find(query):
        next_reset = calculate_next_reset(category, current_time)
        
        await tasks_collection.update_one(
            {"_id": task["_id"]},
            {
                "$set": {
                    "status": TaskStatus.PENDING.value,
                    "next_reset": next_reset,
                    "updated_at": current_time
                }
            }
        )
        tasks_to_reset.append(str(task["_id"]))
    
    return tasks_to_reset

async def reset_all_due_tasks():
    """
    Reset all tasks that are due for reset (across all categories)
    Called by background scheduler
    """
    categories = ["daily", "weekly", "weekend", "monthly"]
    total_reset = 0
    
    for category in categories:
        reset_count = await reset_tasks_for_category(category)
        total_reset += len(reset_count)
    
    return total_reset

async def initialize_task_reset(task_id: str, category: str):
    """
    Initialize next_reset for a newly created task
    
    Args:
        task_id: Task ID
        category: Task category
    """
    tasks_collection = get_collection("tasks")
    next_reset = calculate_next_reset(category)
    
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"next_reset": next_reset}}
    )

