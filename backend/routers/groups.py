from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from core.database import get_collection
from core.auth import get_current_user
from schemas.user_schema import UserOut
from schemas.group_schema import GroupCreate, GroupOut

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("/create", response_model=GroupOut, status_code=status.HTTP_201_CREATED)
async def create_group(
    group: GroupCreate,
    current_user: UserOut = Depends(get_current_user)
):
    """Create a new group with current user as admin"""
    groups_collection = get_collection("groups")
    users_collection = get_collection("users")
    
    # Create group document
    group_doc = {
        "group_name": group.group_name,
        "pool_amount": group.pool_amount,
        "admin_id": current_user.id,
        "members": [current_user.id],
        "monthly_goal": ""
    }
    
    result = await groups_collection.insert_one(group_doc)
    group_id = str(result.inserted_id)
    
    # Add group_id to user's group_ids list
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$addToSet": {"group_ids": group_id}}
    )
    
    # Return group with id
    group_doc["id"] = group_id
    return GroupOut(**group_doc)

@router.post("/join/{group_id}", response_model=GroupOut)
async def join_group(
    group_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Join a group (add current user to group members)"""
    groups_collection = get_collection("groups")
    users_collection = get_collection("users")
    
    # Verify group exists
    group = await groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if user is already a member
    if current_user.id in group.get("members", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this group"
        )
    
    # Add user to group members
    await groups_collection.update_one(
        {"_id": ObjectId(group_id)},
        {"$addToSet": {"members": current_user.id}}
    )
    
    # Add group_id to user's group_ids list
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$addToSet": {"group_ids": group_id}}
    )
    
    # Return updated group
    updated_group = await groups_collection.find_one({"_id": ObjectId(group_id)})
    updated_group["id"] = str(updated_group["_id"])
    del updated_group["_id"]
    
    return GroupOut(**updated_group)

@router.get("/{group_id}", response_model=GroupOut)
async def get_group(
    group_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Get group details by ID"""
    groups_collection = get_collection("groups")
    
    group = await groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    group["id"] = str(group["_id"])
    del group["_id"]
    
    return GroupOut(**group)

