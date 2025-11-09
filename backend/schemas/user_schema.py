from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(..., alias="id")
    hashed_password: str = Field(..., alias="hashed_password")
    total_points: int = 0
    current_streak: int = 0
    last_active_date: Optional[datetime] = None
    completed_tasks: int = 0
    failed_tasks: int = 0
    group_ids: List[str] = []
    
    class Config:
        populate_by_name = True

class UserOut(UserBase):
    id: str = Field(..., alias="id")
    total_points: int = 0
    current_streak: int = 0
    last_active_date: Optional[datetime] = None
    completed_tasks: int = 0
    failed_tasks: int = 0
    group_ids: List[str] = []
    
    class Config:
        populate_by_name = True

