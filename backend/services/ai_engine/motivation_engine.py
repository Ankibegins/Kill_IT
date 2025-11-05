"""
Motivation Engine - MongoDB Async
Generates context-aware motivational messages based on user performance
"""
from typing import Dict, Union
from schemas.user_schema import UserOut, UserInDB
from services.ai_engine.performance_analyzer import analyze_performance

def generate_motivational_message(user: Union[UserOut, UserInDB, dict]) -> Dict[str, str]:
    """
    Generates a context-aware motivational message based on user performance.
    
    Args:
        user: UserOut, UserInDB, or dict with user data
    
    Returns:
        Dictionary with motivational message
    """
    stats = analyze_performance(user)
    message = ""
    
    # High streak achievement
    if stats["current_streak"] >= 7:
        message = f"🔥 Incredible! {stats['current_streak']} days in a row! You're building an unstoppable habit, {stats['name']}!"
    elif stats["current_streak"] >= 5:
        message = f"🔥 Amazing streak of {stats['current_streak']} days! You're unstoppable, {stats['name']}!"
    elif stats["current_streak"] >= 3:
        message = f"⭐ Great momentum, {stats['name']}! {stats['current_streak']} days strong. Keep it going!"
    # Struggling phase
    elif stats["failed_tasks"] > stats["completed_tasks"] and stats["total_tasks"] > 5:
        message = f"💪 You've hit a rough patch, {stats['name']}. Remember, discipline is built in the comeback. You can do this!"
    # Low completion ratio
    elif stats["completion_ratio"] < 0.4 and stats["total_tasks"] > 5:
        message = f"🌟 Every comeback starts with a single step, {stats['name']}. Let's focus on completing one task today. You've got this!"
    # New user
    elif stats["total_points"] == 0 and stats["completed_tasks"] == 0:
        message = f"🌱 Every great journey starts with a single step. Add one new task today, {stats['name']}, and let's get started!"
    # High points achievement
    elif stats["total_points"] >= 1000:
        message = f"🏆 Champion! You've earned {stats['total_points']} points, {stats['name']}! You're a productivity powerhouse!"
    elif stats["total_points"] >= 500:
        message = f"💎 Exceptional work, {stats['name']}! You've crossed {stats['total_points']} points. Keep pushing forward!"
    # Good progress
    elif stats["completed_tasks"] > 0:
        message = f"⭐ Great work, {stats['name']}! You've completed {stats['completed_tasks']} tasks and earned {stats['total_points']} points. Keep that momentum going!"
    # Default encouragement
    else:
        message = f"🌟 Ready to make today count, {stats['name']}? Let's add some tasks and build your productivity streak!"
    
    return {"message": message}

