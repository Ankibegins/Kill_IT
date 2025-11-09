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

@router.post("/leave", response_model=dict)
async def leave_group(
    current_user: UserOut = Depends(get_current_user)
):
    """Leave the current user's group"""
    groups_collection = get_collection("groups")
    users_collection = get_collection("users")
    
    # Check if user is in any group
    user_doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_group_ids = user_doc.get("group_ids", [])
    if not user_group_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not in any group"
        )
    
    # Remove user from all their groups
    for group_id in user_group_ids:
        # Remove user from group members
        await groups_collection.update_one(
            {"_id": ObjectId(group_id)},
            {"$pull": {"members": current_user.id}}
        )
        
        # Check if group is now empty and delete it
        group = await groups_collection.find_one({"_id": ObjectId(group_id)})
        if group and (not group.get("members") or len(group.get("members", [])) == 0):
            await groups_collection.delete_one({"_id": ObjectId(group_id)})
    
    # Remove all group_ids from user
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"group_ids": []}}
    )
    
    return {"message": "Left group successfully"}

@router.get("/{group_id}", response_model=dict)
async def get_group(
    group_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Get group details by ID with member information"""
    groups_collection = get_collection("groups")
    users_collection = get_collection("users")
    
    group = await groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Get member details
    members = group.get("members", [])
    members_info = []
    
    if members:
        member_object_ids = [ObjectId(member_id) for member_id in members]
        cursor = users_collection.find({"_id": {"$in": member_object_ids}})
        async for user_doc in cursor:
            members_info.append({
                "user_id": str(user_doc["_id"]),
                "username": user_doc.get("username", ""),
                "email": user_doc.get("email", ""),
                "total_points": user_doc.get("total_points", 0)
            })
        
        # Sort by total_points descending
        members_info.sort(key=lambda x: x["total_points"], reverse=True)
    
    # Prepare response
    group_data = {
        "id": str(group["_id"]),
        "group_name": group.get("group_name", ""),
        "pool_amount": group.get("pool_amount", 1),
        "admin_id": group.get("admin_id", ""),
        "members": group.get("members", []),
        "monthly_goal": group.get("monthly_goal", ""),
        "members_info": members_info
    }
    
    return {"group": group_data}

