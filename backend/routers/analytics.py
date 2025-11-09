"""
Analytics Router - MongoDB Async
Endpoints for user progress tracking and analytics
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional

from core.auth import get_current_user
from schemas.user_schema import UserOut
from services.analytics_engine import get_user_analytics, get_user_analytics_by_date_range

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/me")
async def get_my_analytics(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Get analytics dashboard for the current authenticated user
    Returns weekly stats, completion rates, and category breakdown
    """
    return await get_user_analytics(current_user.id)

@router.get("/me/range")
async def get_my_analytics_by_range(
    days: int = Query(default=7, ge=1, le=365, description="Number of days to look back"),
    current_user: UserOut = Depends(get_current_user)
):
    """
    Get analytics for the current user within a specific date range
    Returns daily breakdown and completion stats for the specified period
    """
    return await get_user_analytics_by_date_range(current_user.id, days)

@router.get("/{user_id}")
async def get_analytics_for_user(
    user_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Get analytics dashboard for a specific user
    Currently only allows users to view their own analytics (can be extended for admin access)
    """
    # For now, only allow users to get their own analytics
    if user_id != current_user.id:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own analytics"
        )
    
    return await get_user_analytics(user_id)



