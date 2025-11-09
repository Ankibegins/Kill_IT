from fastapi import APIRouter, Depends, Form, UploadFile, File
from typing import List, Optional
import os

from core.auth import get_current_user
from schemas.user_schema import UserOut
from schemas.task_schema import TaskOut
from services.priority_manager import get_sorted_tasks_from_db, get_priority_queue
from services.task_service import (
    create_task,
    update_task,
    complete_task,
    skip_task,
    delete_task,
    upload_task_proof
)

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Ensure uploads directory exists
UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.get("/", response_model=List[TaskOut])
async def get_tasks(
    current_user: UserOut = Depends(get_current_user),
    completed_only: Optional[bool] = None,
    category: Optional[str] = None
):
    """
    Get all tasks for the current user, sorted by priority (lower = higher priority)
    
    Query params:
    - completed_only: Filter by completion status (true/false)
    - category: Filter by category (daily/weekly/weekend/monthly)
    """
    return await get_sorted_tasks_from_db(
        user_id=current_user.id,
        completed_only=completed_only,
        category=category
    )

@router.get("/priority_queue", response_model=List[TaskOut])
async def get_priority_queue_endpoint(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Get priority queue - only incomplete tasks sorted by priority
    """
    return await get_priority_queue(current_user.id)

@router.post("/add", response_model=TaskOut, status_code=201)
async def add_task(
    title: str = Form(...),
    category: str = Form(...),
    priority: int = Form(...),
    description: Optional[str] = Form(None),
    value: int = Form(10),
    current_user: UserOut = Depends(get_current_user)
):
    """
    Create a new task for the current user
    
    Category must be one of: daily, weekly, weekend, monthly
    Priority: Lower number = higher priority (e.g., 1 is highest priority)
    Value: Points assigned by user for completing this task (default: 10)
    """
    return await create_task(
        user_id=current_user.id,
        title=title,
        category=category,
        priority=priority,
        description=description,
        value=value
    )

@router.put("/{task_id}", response_model=TaskOut)
async def update_task_endpoint(
    task_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    priority: Optional[int] = Form(None),
    current_user: UserOut = Depends(get_current_user)
):
    """Update a task (only if it belongs to the current user)"""
    return await update_task(
        task_id=task_id,
        user_id=current_user.id,
        title=title,
        description=description,
        category=category,
        priority=priority
    )

@router.post("/{task_id}/complete", response_model=TaskOut)
async def complete_task_endpoint(
    task_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Mark a task as completed (only if it belongs to the current user)"""
    return await complete_task(task_id=task_id, user_id=current_user.id)

@router.post("/{task_id}/skip", response_model=TaskOut)
async def skip_task_endpoint(
    task_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Mark a task as skipped (only if it belongs to the current user)"""
    return await skip_task(task_id=task_id, user_id=current_user.id)

@router.delete("/{task_id}", status_code=204)
async def delete_task_endpoint(
    task_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    """Delete a task (only if it belongs to the current user)"""
    await delete_task(task_id=task_id, user_id=current_user.id)
    return None

@router.post("/{task_id}/upload_proof", response_model=TaskOut)
async def upload_proof_endpoint(
    task_id: str,
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    """Upload proof file for a task"""
    # Read file content
    file_content = await file.read()
    
    return await upload_task_proof(
        task_id=task_id,
        user_id=current_user.id,
        file_content=file_content,
        filename=file.filename
    )

