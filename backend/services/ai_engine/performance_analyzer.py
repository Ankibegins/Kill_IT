"""
Performance Analyzer - MongoDB Async
Analyzes user performance metrics and returns statistics
"""
from datetime import date, datetime, timedelta
from typing import Dict, Union
from schemas.user_schema import UserOut, UserInDB

def analyze_performance(user: Union[UserOut, UserInDB, dict]) -> Dict:
    """
    Takes a User object (or dict) and returns a dictionary of key stats.
    
    Args:
        user: UserOut, UserInDB, or dict with user data
    
    Returns:
        Dictionary with performance statistics
    """
    # Handle dict input (from MongoDB)
    if isinstance(user, dict):
        name = user.get("username", "User")
        total_points = user.get("total_points", 0)
        current_streak = user.get("current_streak", 0)
        completed_tasks = user.get("completed_tasks", 0)
        failed_tasks = user.get("failed_tasks", 0)
        last_active_date = user.get("last_active_date")
    else:
        # Handle Pydantic models
        name = user.username
        total_points = user.total_points
        current_streak = user.current_streak
        completed_tasks = user.completed_tasks
        failed_tasks = user.failed_tasks
        last_active_date = user.last_active_date
    
    # Calculate completion ratio
    total_tasks = completed_tasks + failed_tasks
    completion_ratio = 0.0
    if total_tasks > 0:
        completion_ratio = completed_tasks / total_tasks
    
    # Check streak status
    is_on_streak = False
    today = date.today()
    
    if last_active_date:
        # Convert datetime to date if needed
        if isinstance(last_active_date, datetime):
            last_active = last_active_date.date()
        elif isinstance(last_active_date, date):
            last_active = last_active_date
        else:
            last_active = None
        
        # Check if user was active yesterday (consecutive streak)
        if last_active == today - timedelta(days=1):
            is_on_streak = True
        # Also check if they're maintaining streak today
        elif last_active == today:
            is_on_streak = current_streak > 0
    
    return {
        "name": name,
        "username": name,  # Alias for compatibility
        "total_points": total_points,
        "current_streak": current_streak,
        "is_on_streak": is_on_streak,
        "completed_tasks": completed_tasks,
        "failed_tasks": failed_tasks,
        "total_tasks": total_tasks,
        "completion_ratio": completion_ratio
    }

