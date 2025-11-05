from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List
from pydantic import BaseModel

from core.database import get_collection
from core.auth import get_current_user
from schemas.user_schema import UserOut

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    email: str
    total_points: int

class LeaderboardResponse(BaseModel):
    group_id: str
    group_name: str
    rankings: List[LeaderboardEntry]

@router.get("/{group_id}", response_model=LeaderboardResponse)
async def get_leaderboard(
    group_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Get leaderboard for a specific group"""
    groups_collection = get_collection("groups")
    users_collection = get_collection("users")
    
    # Fetch the group
    group = await groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Get members list from group
    members = group.get("members", [])
    if not members:
        return LeaderboardResponse(
            group_id=group_id,
            group_name=group.get("group_name", ""),
            rankings=[]
        )
    
    # Convert string IDs to ObjectIds
    member_object_ids = [ObjectId(member_id) for member_id in members]
    
    # Query users where _id is in members list
    cursor = users_collection.find({"_id": {"$in": member_object_ids}})
    
    rankings = []
    async for user_doc in cursor:
        rankings.append(LeaderboardEntry(
            user_id=str(user_doc["_id"]),
            username=user_doc.get("username", ""),
            email=user_doc.get("email", ""),
            total_points=user_doc.get("total_points", 0)
        ))
    
    # Sort by total_points descending
    rankings.sort(key=lambda x: x.total_points, reverse=True)
    
    return LeaderboardResponse(
        group_id=group_id,
        group_name=group.get("group_name", ""),
        rankings=rankings
    )

@router.get("/all-time", response_model=List[LeaderboardEntry])
async def get_all_time_leaderboard(
    current_user: UserOut = Depends(get_current_user),
    limit: int = 100
):
    """
    Get all-time leaderboard sorted by total_points in descending order
    
    Query params:
    - limit: Maximum number of users to return (default: 100)
    """
    users_collection = get_collection("users")
    
    # Query users sorted by total_points descending
    cursor = users_collection.find().sort("total_points", -1).limit(limit)
    
    rankings = []
    async for user_doc in cursor:
        rankings.append(LeaderboardEntry(
            user_id=str(user_doc["_id"]),
            username=user_doc.get("username", ""),
            email=user_doc.get("email", ""),
            total_points=user_doc.get("total_points", 0)
        ))
    
    return rankings

