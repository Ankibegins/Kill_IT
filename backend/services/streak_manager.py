"""
Streak Manager Service - MongoDB Async
Handles user streak calculations and updates
"""
from datetime import date, datetime, timedelta
from bson import ObjectId
from core.database import get_collection

async def update_user_streak(user_id: str):
    """
    Update user's daily streak based on last active date
    
    Args:
        user_id: User ID
    
    Returns:
        Updated streak count
    """
    users_collection = get_collection("users")
    
    # Get current user
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return 0
    
    today = date.today()
    last_active = user.get("last_active_date")
    
    # Convert datetime to date if needed
    if last_active is None:
        last_active_date = None
    elif isinstance(last_active, date):
        last_active_date = last_active
    elif isinstance(last_active, datetime):
        last_active_date = last_active.date()
    else:
        # Handle string or other formats
        try:
            if isinstance(last_active, str):
                last_active_date = datetime.fromisoformat(last_active).date()
            else:
                last_active_date = None
        except:
            last_active_date = None
    
    # Calculate new streak
    if last_active_date:
        if last_active_date == today - timedelta(days=1):
            # Consecutive day: increment streak
            new_streak = user.get("current_streak", 0) + 1
        elif last_active_date == today:
            # Already updated today: keep current streak
            new_streak = user.get("current_streak", 0)
        else:
            # Gap detected: reset streak to 1
            new_streak = 1
    else:
        # First time: start streak at 1
        new_streak = 1
    
    # Update user with new streak and last_active_date (store as datetime for MongoDB)
    today_datetime = datetime.combine(today, datetime.min.time())
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "current_streak": new_streak,
                "last_active_date": today_datetime
            }
        }
    )
    
    return new_streak

