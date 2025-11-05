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
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    next_reset: Optional[datetime] = None
    proof_url: Optional[str] = None

class TaskOut(TaskInDB):
    pass

