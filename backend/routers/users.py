from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from core.database import get_collection
from core.auth import get_current_user
from schemas.user_schema import UserOut

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
async def get_current_user_profile(
    current_user: UserOut = Depends(get_current_user)
):
    """Get the current authenticated user's profile"""
    return current_user

@router.get("/{user_id}", response_model=UserOut)
async def get_user_profile(
    user_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Get a user's profile by ID (users can only view their own profile)"""
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile"
        )
    return current_user

