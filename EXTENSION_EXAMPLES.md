# Extension Examples - How to Add New Features

## Quick Reference: Adding New Features

### Example 1: Add a "Reminders" Feature

#### Step 1: Create Schema
```python
# schemas/reminder_schema.py
from pydantic import BaseModel
from datetime import datetime

class ReminderBase(BaseModel):
    task_id: str
    reminder_time: datetime
    message: str

class ReminderCreate(ReminderBase):
    pass

class ReminderOut(ReminderBase):
    id: str
    user_id: str
    sent: bool = False
```

#### Step 2: Create Service
```python
# services/reminder_service.py
from core.database import get_collection
from schemas.reminder_schema import ReminderOut

async def create_reminder(user_id: str, reminder_data: dict) -> ReminderOut:
    reminders_collection = get_collection("reminders")
    reminder_doc = {
        **reminder_data,
        "user_id": user_id,
        "sent": False
    }
    result = await reminders_collection.insert_one(reminder_doc)
    reminder_doc["id"] = str(result.inserted_id)
    return ReminderOut(**reminder_doc)
```

#### Step 3: Create Router
```python
# routers/reminders.py
from fastapi import APIRouter, Depends
from core.auth import get_current_user
from schemas.user_schema import UserOut
from schemas.reminder_schema import ReminderCreate, ReminderOut
from services.reminder_service import create_reminder

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.post("/", response_model=ReminderOut)
async def create_reminder_endpoint(
    reminder: ReminderCreate,
    current_user: UserOut = Depends(get_current_user)
):
    return await create_reminder(current_user.id, reminder.dict())
```

#### Step 4: Register in main.py
```python
from routers import reminders
app.include_router(reminders.router)
```

**Done!** New feature added in 4 simple steps.

---

### Example 2: Add "Badges" to Gamification

#### Step 1: Extend User Schema
```python
# schemas/user_schema.py
class UserOut(UserBase):
    # ... existing fields
    badges: List[str] = []  # Add badges field
```

#### Step 2: Create Badge Service
```python
# services/badge_service.py
async def check_and_award_badges(user_id: str):
    users_collection = get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    badges = []
    
    # Check conditions and award badges
    if user.get("total_points", 0) >= 1000:
        badges.append("thousand_points")
    if user.get("current_streak", 0) >= 30:
        badges.append("month_streak")
    
    if badges:
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"badges": {"$each": badges}}}
        )
```

#### Step 3: Integrate with Task Completion
```python
# services/task_service.py (modify complete_task)
async def complete_task(...):
    # ... existing logic
    
    # Add badge check
    from services.badge_service import check_and_award_badges
    await check_and_award_badges(user_id)
```

**Done!** Badges automatically awarded on task completion.

---

### Example 3: Add "Challenges" Feature

#### Step 1: Create Schema
```python
# schemas/challenge_schema.py
class ChallengeBase(BaseModel):
    title: str
    description: str
    target_points: int
    deadline: datetime

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeOut(ChallengeBase):
    id: str
    group_id: str
    participants: List[str] = []
    winner_id: Optional[str] = None
```

#### Step 2: Create Service
```python
# services/challenge_service.py
async def create_challenge(group_id: str, challenge_data: dict) -> ChallengeOut:
    challenges_collection = get_collection("challenges")
    challenge_doc = {
        **challenge_data,
        "group_id": group_id,
        "participants": [],
        "winner_id": None
    }
    result = await challenges_collection.insert_one(challenge_doc)
    challenge_doc["id"] = str(result.inserted_id)
    return ChallengeOut(**challenge_doc)
```

#### Step 3: Create Router
```python
# routers/challenges.py
from fastapi import APIRouter, Depends
from core.auth import get_current_user
from schemas.challenge_schema import ChallengeCreate, ChallengeOut
from services.challenge_service import create_challenge

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("/", response_model=ChallengeOut)
async def create_challenge_endpoint(
    challenge: ChallengeCreate,
    current_user: UserOut = Depends(get_current_user)
):
    # Get user's first group (or pass group_id)
    return await create_challenge(group_id, challenge.dict())
```

#### Step 4: Register
```python
from routers import challenges
app.include_router(challenges.router)
```

---

## Template: New Feature Checklist

When adding a new feature, follow this checklist:

### ✅ Planning
- [ ] Define feature requirements
- [ ] Design data model
- [ ] Plan API endpoints
- [ ] Consider integration points

### ✅ Implementation
- [ ] Create schema file (`schemas/feature_schema.py`)
- [ ] Create service file (`services/feature_service.py`)
- [ ] Create router file (`routers/feature.py`)
- [ ] Register router in `main.py`

### ✅ Integration
- [ ] Add to existing services if needed
- [ ] Update related schemas
- [ ] Add background tasks if needed
- [ ] Update documentation

### ✅ Testing
- [ ] Test service functions
- [ ] Test API endpoints
- [ ] Test error handling
- [ ] Test integration with existing features

---

## Common Extension Patterns

### Pattern 1: Adding to Existing Router
```python
# routers/tasks.py
@router.get("/stats")  # New endpoint
async def get_task_stats(
    current_user: UserOut = Depends(get_current_user)
):
    # Use existing service
    tasks = await get_sorted_tasks_from_db(current_user.id)
    # Calculate stats
    return {"total": len(tasks), "completed": sum(1 for t in tasks if t.is_completed)}
```

### Pattern 2: Extending Service
```python
# services/task_service.py
async def create_task(...):
    # Existing logic
    task = await create_task(...)
    
    # Add new feature
    await schedule_reminder(task.id)  # New integration
    return task
```

### Pattern 3: Adding Background Task
```python
# core/new_scheduler.py
async def run_new_scheduler():
    while True:
        # Do work
        await asyncio.sleep(3600)

# main.py
asyncio.create_task(run_new_scheduler())
```

---

## Architecture Benefits

### ✅ Easy to Extend
- Add new features without touching existing code
- Modular structure allows independent development
- Services can be reused across features

### ✅ Easy to Test
- Services can be tested independently
- Mock dependencies easily
- Test business logic without HTTP layer

### ✅ Easy to Maintain
- Clear separation of concerns
- Easy to find and fix bugs
- Changes isolated to specific modules

### ✅ Easy to Scale
- Services can become microservices
- Background tasks can be separated
- Database can be sharded
- Can add caching layer

---

## Your Codebase is Future-Ready! 🚀

You can confidently:
- ✅ Add new features easily
- ✅ Extend existing features
- ✅ Integrate third-party services
- ✅ Scale horizontally
- ✅ Maintain and update

The architecture is production-ready and designed for growth!

