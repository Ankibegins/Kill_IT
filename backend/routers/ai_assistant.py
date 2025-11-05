"""
AI Assistant Router - MongoDB Async
Endpoints for AI-powered motivation and task suggestions
"""
from fastapi import APIRouter, Depends
from core.auth import get_current_user
from schemas.user_schema import UserOut
from services.ai_engine import motivation_engine, task_suggester

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.get("/motivate")
async def motivate_user(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Gets a dynamic motivational message for the current user.
    Uses their performance data to generate personalized encouragement.
    """
    return motivation_engine.generate_motivational_message(current_user)

@router.get("/suggest")
async def suggest_task_for_user(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Suggests a new task for the current user based on their performance.
    Considers their completion ratio, streak, and points to provide relevant suggestions.
    """
    return task_suggester.suggest_new_task(current_user)

@router.get("/motivate/{user_id}")
async def motivate_user_by_id(
    user_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Gets a motivational message for a specific user (admin/self only).
    Currently returns message for current user (can be extended for admin access).
    """
    # For now, only allow users to get their own motivation
    # Can be extended to allow admins to view other users
    if user_id != current_user.id:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own motivation messages"
        )
    
    return motivation_engine.generate_motivational_message(current_user)

@router.get("/suggest/{user_id}")
async def suggest_task_for_user_by_id(
    user_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Suggests a task for a specific user (admin/self only).
    Currently returns suggestion for current user (can be extended for admin access).
    """
    # For now, only allow users to get their own suggestions
    if user_id != current_user.id:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own task suggestions"
        )
    
    return task_suggester.suggest_new_task(current_user)

