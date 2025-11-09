from pydantic import BaseModel, Field
from typing import List

class GroupBase(BaseModel):
    group_name: str
    pool_amount: int = Field(default=1, ge=1, le=10, description="Min 1, Max 10")

class GroupCreate(GroupBase):
    pass

class GroupInDB(GroupBase):
    id: str
    admin_id: str
    members: List[str] = []
    monthly_goal: str = ""

class GroupOut(GroupInDB):
    pass

