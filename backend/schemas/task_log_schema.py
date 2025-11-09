"""
Task Log Schema - MongoDB Async
Schema for tracking task status changes and analytics
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from schemas.task_schema import TaskStatus, TaskCategory

class TaskLogBase(BaseModel):
    """Base task log schema"""
    user_id: str
    task_id: str
    status: TaskStatus
    category: TaskCategory

class TaskLogCreate(TaskLogBase):
    """Schema for creating a new task log entry"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TaskLogOut(TaskLogBase):
    """Schema for task log output"""
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True



