"""
Analytics Engine Service - MongoDB Async
Handles user progress tracking and analytics
"""
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Dict, Optional

from core.database import get_collection
from schemas.task_schema import TaskStatus

async def get_user_analytics(user_id: str) -> Dict:
    """
    Get analytics dashboard for a specific user
    
    Args:
        user_id: User ID
    
    Returns:
        Dictionary containing analytics data
    """
    users_collection = get_collection("users")
    task_logs_collection = get_collection("task_logs")
    
    # Get user data
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "User not found"}
    
    # 1. Get stats from User model (already calculated)
    streak = user.get("current_streak", 0)
    total_points = user.get("total_points", 0)
    completed_tasks = user.get("completed_tasks", 0)
    failed_tasks = user.get("failed_tasks", 0)
    
    # 2. Calculate stats from TaskLog (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Query logs from last 7 days
    query = {
        "user_id": user_id,
        "timestamp": {"$gte": seven_days_ago}
    }
    
    logs = []
    async for log in task_logs_collection.find(query):
        logs.append(log)
    
    # Count by status
    completed_count = len([log for log in logs if log.get("status") == TaskStatus.COMPLETED.value])
    skipped_count = len([log for log in logs if log.get("status") == TaskStatus.SKIPPED.value])
    total_logs = completed_count + skipped_count
    
    # Calculate completion rate
    completion_rate = 0.0
    if total_logs > 0:
        completion_rate = (completed_count / total_logs) * 100
    
    # Calculate stats for last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    query_30d = {
        "user_id": user_id,
        "timestamp": {"$gte": thirty_days_ago}
    }
    
    logs_30d = []
    async for log in task_logs_collection.find(query_30d):
        logs_30d.append(log)
    
    completed_30d = len([log for log in logs_30d if log.get("status") == TaskStatus.COMPLETED.value])
    
    # Calculate category breakdown for last 7 days
    category_breakdown = {}
    for log in logs:
        if log.get("status") == TaskStatus.COMPLETED.value:
            category = log.get("category", "daily")
            category_breakdown[category] = category_breakdown.get(category, 0) + 1
    
    return {
        "user_id": user_id,
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "current_streak": streak,
        "total_points": total_points,
        "total_completed_tasks": completed_tasks,
        "total_failed_tasks": failed_tasks,
        "weekly_stats": {
            "completed": completed_count,
            "skipped": skipped_count,
            "total": total_logs,
            "completion_rate": f"{completion_rate:.0f}%"
        },
        "monthly_completed": completed_30d,
        "category_breakdown_weekly": category_breakdown
    }

async def get_user_analytics_by_date_range(user_id: str, days: int = 7) -> Dict:
    """
    Get analytics for a user within a specific date range
    
    Args:
        user_id: User ID
        days: Number of days to look back (default: 7)
    
    Returns:
        Dictionary containing analytics data for the date range
    """
    users_collection = get_collection("users")
    task_logs_collection = get_collection("task_logs")
    
    # Get user data
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "User not found"}
    
    # Calculate date range
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Query logs within date range
    query = {
        "user_id": user_id,
        "timestamp": {"$gte": start_date}
    }
    
    logs = []
    async for log in task_logs_collection.find(query).sort("timestamp", 1):
        logs.append(log)
    
    # Count by status
    completed_count = len([log for log in logs if log.get("status") == TaskStatus.COMPLETED.value])
    skipped_count = len([log for log in logs if log.get("status") == TaskStatus.SKIPPED.value])
    total_logs = completed_count + skipped_count
    
    # Calculate completion rate
    completion_rate = 0.0
    if total_logs > 0:
        completion_rate = (completed_count / total_logs) * 100
    
    # Daily breakdown
    daily_stats = {}
    for log in logs:
        log_date = log.get("timestamp")
        if isinstance(log_date, datetime):
            date_str = log_date.strftime("%Y-%m-%d")
        else:
            date_str = str(log_date)[:10]  # Get date part
        
        if date_str not in daily_stats:
            daily_stats[date_str] = {"completed": 0, "skipped": 0}
        
        status = log.get("status")
        if status == TaskStatus.COMPLETED.value:
            daily_stats[date_str]["completed"] += 1
        elif status == TaskStatus.SKIPPED.value:
            daily_stats[date_str]["skipped"] += 1
    
    return {
        "user_id": user_id,
        "username": user.get("username", ""),
        "period_days": days,
        "total_completed": completed_count,
        "total_skipped": skipped_count,
        "total_actions": total_logs,
        "completion_rate": f"{completion_rate:.0f}%",
        "daily_breakdown": daily_stats
    }



