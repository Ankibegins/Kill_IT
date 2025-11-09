# AnkiPlan Backend Architecture & Extensibility Guide 🏗️

## Current Architecture Overview

The codebase is built with a **modular, layered architecture** that separates concerns and makes it easy to extend with new features.

```
backend/
├── core/           # Core infrastructure (database, auth, utilities)
├── routers/        # API endpoints (thin HTTP layer)
├── services/       # Business logic (reusable, testable)
├── schemas/        # Data models (Pydantic validation)
├── utils/          # Helper functions
└── main.py         # Application entry point
```

## Architecture Layers

### 1. **Routers Layer** (`routers/`)
**Purpose:** HTTP request handling, input validation, response formatting

**Responsibilities:**
- Receive HTTP requests
- Validate input (Pydantic schemas)
- Call service layer functions
- Format responses
- Handle HTTP errors

**Pattern:**
```python
@router.get("/endpoint")
async def endpoint(current_user: UserOut = Depends(get_current_user)):
    return await service_function(user_id=current_user.id)
```

### 2. **Services Layer** (`services/`)
**Purpose:** Business logic, reusable operations

**Responsibilities:**
- Business rules
- Data validation
- Database operations
- Complex calculations
- Reusable functions

**Pattern:**
```python
async def service_function(user_id: str, data: dict) -> Result:
    # Business logic here
    # Database operations
    return result
```

### 3. **Schemas Layer** (`schemas/`)
**Purpose:** Data validation and type safety

**Responsibilities:**
- Request/response models
- Data validation
- Type definitions
- API contracts

**Pattern:**
```python
class ModelBase(BaseModel):
    field: str

class ModelCreate(ModelBase):
    pass

class ModelOut(ModelBase):
    id: str
```

### 4. **Core Layer** (`core/`)
**Purpose:** Infrastructure and shared utilities

**Responsibilities:**
- Database connection
- Authentication
- Background tasks
- Shared utilities

## How to Add New Features

### Adding a New Feature Module

#### Step 1: Create Schema
```python
# schemas/new_feature_schema.py
from pydantic import BaseModel

class NewFeatureBase(BaseModel):
    name: str
    description: str

class NewFeatureCreate(NewFeatureBase):
    pass

class NewFeatureOut(NewFeatureBase):
    id: str
    user_id: str
```

#### Step 2: Create Service
```python
# services/new_feature_service.py
from core.database import get_collection
from schemas.new_feature_schema import NewFeatureOut

async def create_new_feature(user_id: str, data: dict) -> NewFeatureOut:
    collection = get_collection("new_features")
    # Business logic here
    result = await collection.insert_one({...})
    return NewFeatureOut(...)
```

#### Step 3: Create Router
```python
# routers/new_feature.py
from fastapi import APIRouter, Depends
from core.auth import get_current_user
from schemas.user_schema import UserOut
from services.new_feature_service import create_new_feature

router = APIRouter(prefix="/new-feature", tags=["New Feature"])

@router.post("/", response_model=NewFeatureOut)
async def create_feature(
    data: NewFeatureCreate,
    current_user: UserOut = Depends(get_current_user)
):
    return await create_new_feature(current_user.id, data.dict())
```

#### Step 4: Register Router
```python
# main.py
from routers import new_feature

app.include_router(new_feature.router)
```

**That's it!** Your new feature is integrated.

## Extension Patterns

### Pattern 1: Adding New Endpoints to Existing Module

**Example: Add search endpoint to tasks**

```python
# services/task_service.py
async def search_tasks(user_id: str, query: str) -> List[TaskOut]:
    tasks_collection = get_collection("tasks")
    # Search logic
    return tasks

# routers/tasks.py
@router.get("/search")
async def search_tasks_endpoint(
    q: str,
    current_user: UserOut = Depends(get_current_user)
):
    return await search_tasks(current_user.id, q)
```

### Pattern 2: Adding Background Tasks

**Example: Add email notification scheduler**

```python
# core/email_scheduler.py
async def send_daily_reminders():
    while True:
        # Send reminders
        await asyncio.sleep(86400)  # Daily

# main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    await Database.connect()
    asyncio.create_task(run_task_reset_scheduler())
    asyncio.create_task(send_daily_reminders())  # Add new task
    yield
    await Database.close()
```

### Pattern 3: Extending Gamification

**Example: Add badges system**

```python
# services/badge_service.py
async def check_and_award_badges(user_id: str):
    # Check conditions
    # Award badges
    pass

# services/task_service.py (modify complete_task)
async def complete_task(...):
    # Existing logic
    await check_and_award_badges(user_id)  # Add new feature
```

### Pattern 4: Adding New User Fields

**Example: Add phone number**

```python
# schemas/user_schema.py
class UserBase(BaseModel):
    email: EmailStr
    username: str
    phone: Optional[str] = None  # Add new field

# routers/auth.py (modify signup)
user_doc = {
    "email": user.email,
    "username": user.username,
    "phone": user.phone,  # Include new field
    # ... existing fields
}
```

### Pattern 5: Adding New Service Module

**Example: Add notification service**

```python
# services/notifications/__init__.py
from .email_service import send_email
from .push_service import send_push

# services/notifications/email_service.py
async def send_email(user_id: str, message: str):
    # Email logic
    pass

# Use in any service
from services.notifications import send_email
await send_email(user_id, "Task completed!")
```

## Database Extension

### Adding New Collections

No schema changes needed! MongoDB is schema-less:

```python
# Simply use the collection
collection = get_collection("new_collection")
await collection.insert_one({...})
```

### Adding Indexes

```python
# core/database.py (add to connect method)
async def connect(cls):
    cls.client = AsyncIOMotorClient(MONGODB_URL)
    
    # Add indexes
    db = cls.get_database()
    db.tasks.create_index([("user_id", 1), ("priority", 1)])
    db.users.create_index([("total_points", -1)])
```

## Authentication Extension

### Adding Role-Based Access

```python
# core/auth.py
async def get_admin_user(current_user: UserOut = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return current_user

# Use in router
@router.delete("/admin/{user_id}")
async def admin_delete_user(
    user_id: str,
    admin: UserOut = Depends(get_admin_user)
):
    # Admin only endpoint
    pass
```

## Middleware Extension

### Adding Custom Middleware

```python
# main.py
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## Future-Ready Features You Can Add

### 1. **Notifications System**
- Real-time notifications
- Email notifications
- Push notifications
- In-app notifications

**Extension Points:**
- New service: `services/notifications/`
- New router: `routers/notifications.py`
- Background task for scheduled notifications

### 2. **Social Features**
- Friend requests
- User profiles
- Activity feeds
- Comments on tasks

**Extension Points:**
- New router: `routers/social.py`
- New service: `services/social_service.py`
- Extend user schema with friend list

### 3. **Rewards System**
- Badges/Achievements
- Virtual rewards
- Prize pool distribution
- Milestone rewards

**Extension Points:**
- New service: `services/rewards_service.py`
- Extend gamification in `complete_task`
- New router: `routers/rewards.py`

### 4. **Analytics & Reporting**
- User analytics
- Task completion reports
- Progress charts
- Export data

**Extension Points:**
- New service: `services/analytics_service.py`
- New router: `routers/analytics.py`
- Background aggregation jobs

### 5. **Advanced AI Features**
- Task auto-categorization
- Smart scheduling
- Predictive analytics
- Personalized recommendations

**Extension Points:**
- Extend `services/ai_engine/`
- New AI services
- Integration with external AI APIs

### 6. **Team Collaboration**
- Shared tasks
- Task assignments
- Team goals
- Collaborative planning

**Extension Points:**
- Extend groups system
- New service: `services/collaboration_service.py`
- New router: `routers/collaboration.py`

### 7. **Integration Features**
- Calendar sync
- Third-party app integration
- Webhooks
- API for mobile apps

**Extension Points:**
- New service: `services/integrations/`
- New router: `routers/integrations.py`
- Background sync jobs

### 8. **Advanced Gamification**
- Levels/XP system
- Challenges
- Competitions
- Seasonal events

**Extension Points:**
- Extend points system
- New service: `services/gamification/`
- Event-driven architecture

## Best Practices for Extension

### 1. **Follow the Pattern**
- Keep routers thin (HTTP only)
- Put business logic in services
- Use schemas for validation
- Keep core utilities separate

### 2. **Reuse Existing Services**
```python
# Don't duplicate
from services.task_service import get_task_by_id
from services.points_manager import update_points_for_task

# Use in new feature
async def new_feature(user_id: str):
    task = await get_task_by_id(task_id, user_id)
    await update_points_for_task(...)
```

### 3. **Maintain Consistency**
- Use same error handling patterns
- Follow naming conventions
- Use same async patterns
- Keep code style consistent

### 4. **Test New Features**
- Test service functions independently
- Test router endpoints
- Test integration with existing features

### 5. **Document Changes**
- Update API documentation
- Add comments for complex logic
- Document new environment variables
- Update README if needed

## Code Organization Principles

### ✅ Do's
- ✅ Keep services reusable
- ✅ Use dependency injection
- ✅ Follow single responsibility
- ✅ Write async functions
- ✅ Use type hints
- ✅ Validate with Pydantic
- ✅ Handle errors properly

### ❌ Don'ts
- ❌ Put business logic in routers
- ❌ Access database directly from routers
- ❌ Duplicate code
- ❌ Mix concerns
- ❌ Hardcode values
- ❌ Skip error handling

## Migration Strategy

### Adding Fields to Existing Models

**Step 1:** Update schema with optional field
```python
class UserOut(UserBase):
    new_field: Optional[str] = None  # Optional for backward compatibility
```

**Step 2:** Update service to handle new field
```python
user_doc = {
    "new_field": data.get("new_field"),  # Safe get
    # ... existing fields
}
```

**Step 3:** Gradually migrate existing data (if needed)
```python
# Migration script
async def migrate_users():
    users = await users_collection.find({"new_field": {"$exists": False}})
    async for user in users:
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"new_field": "default_value"}}
        )
```

## Scalability Considerations

### Current Architecture Supports:
- ✅ Horizontal scaling (stateless API)
- ✅ Microservices extraction (services can become separate services)
- ✅ Background job scaling
- ✅ Database sharding (MongoDB)
- ✅ Caching layer addition
- ✅ Load balancing

### Easy to Add:
- Redis for caching
- Message queue for background jobs
- Separate notification service
- Separate analytics service
- CDN for static files

## Conclusion

Your codebase is **highly extensible** and follows best practices:

✅ **Modular Architecture** - Easy to add new features  
✅ **Separation of Concerns** - Clear layer boundaries  
✅ **Reusable Services** - Business logic can be shared  
✅ **Type Safety** - Pydantic schemas ensure correctness  
✅ **Async Ready** - Can handle high concurrency  
✅ **Database Flexible** - MongoDB adapts to schema changes  
✅ **Testable** - Services can be tested independently  

**You can confidently add new features without major refactoring!**

