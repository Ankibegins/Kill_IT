from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from enum import Enum

class TaskCategory(str, Enum):
    """Task frequency categories"""
    DAILY = "daily"
    WEEKLY = "weekly"
    WEEKEND = "weekend"
    MONTHLY = "monthly"

class TaskStatus(str, Enum):
    """Task status options"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Literal["daily", "weekly", "weekend", "monthly"]
    priority: int = Field(..., ge=1, description="Lower number = higher priority")

class TaskCreate(TaskBase):
    value: int = Field(default=10, description="Points assigned by user for completing this task")

class TaskInDB(TaskBase):
    id: str
    user_id: str
    value: int = Field(default=10, description="Points assigned by user for completing this task")
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    next_reset: Optional[datetime] = None
    proof_url: Optional[str] = None

class TaskOut(TaskInDB):
    pass

