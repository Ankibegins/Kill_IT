# Complete Testing Guide for AnkiPlan Backend 🧪

## Quick Access

### Interactive API Documentation
Once your server is running, open these URLs in your browser:

1. **Swagger UI (Recommended)**: http://localhost:8000/docs
   - Interactive interface
   - Test endpoints directly
   - See request/response schemas
   - Try it out functionality

2. **ReDoc**: http://localhost:8000/redoc
   - Clean documentation view
   - Better for reading
   - All endpoints listed

## Complete Endpoint List

### 🔐 Authentication Endpoints (`/auth`)

#### 1. User Registration
```http
POST http://localhost:8000/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Test with curl:**
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"johndoe","password":"securepassword123"}'
```

#### 2. User Login
```http
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Test with curl:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"
```

---

### 📋 Task Endpoints (`/tasks`)

**All task endpoints require authentication:**
```http
Authorization: Bearer <access_token>
```

#### 1. Get All Tasks
```http
GET http://localhost:8000/tasks/
Authorization: Bearer <token>
```

**Query Parameters:**
- `completed_only` (optional): `true` or `false`
- `category` (optional): `daily`, `weekly`, `weekend`, or `monthly`

**Example:**
```bash
curl -X GET "http://localhost:8000/tasks/?completed_only=false&category=daily" \
  -H "Authorization: Bearer <token>"
```

#### 2. Get Priority Queue (Incomplete Tasks Only)
```http
GET http://localhost:8000/tasks/priority_queue
Authorization: Bearer <token>
```

**Example:**
```bash
curl -X GET "http://localhost:8000/tasks/priority_queue" \
  -H "Authorization: Bearer <token>"
```

#### 3. Create New Task
```http
POST http://localhost:8000/tasks/add
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=Exercise for 30 minutes
category=daily
priority=1
description=Morning workout routine
value=10
```

**Example:**
```bash
curl -X POST "http://localhost:8000/tasks/add" \
  -H "Authorization: Bearer <token>" \
  -F "title=Exercise for 30 minutes" \
  -F "category=daily" \
  -F "priority=1" \
  -F "description=Morning workout routine" \
  -F "value=10"
```

#### 4. Update Task
```http
PUT http://localhost:8000/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=Updated Task Title
priority=2
```

**Example:**
```bash
curl -X PUT "http://localhost:8000/tasks/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>" \
  -F "title=Updated Task Title" \
  -F "priority=2"
```

#### 5. Complete Task
```http
POST http://localhost:8000/tasks/{task_id}/complete
Authorization: Bearer <token>
```

**Example:**
```bash
curl -X POST "http://localhost:8000/tasks/507f1f77bcf86cd799439011/complete" \
  -H "Authorization: Bearer <token>"
```

**Note:** This automatically:
- Updates user points
- Updates user streak
- Increments completed_tasks counter

#### 6. Delete Task
```http
DELETE http://localhost:8000/tasks/{task_id}
Authorization: Bearer <token>
```

**Example:**
```bash
curl -X DELETE "http://localhost:8000/tasks/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

#### 7. Upload Proof File
```http
POST http://localhost:8000/tasks/{task_id}/upload_proof
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=@/path/to/image.jpg
```

**Example:**
```bash
curl -X POST "http://localhost:8000/tasks/507f1f77bcf86cd799439011/upload_proof" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

---

### 👥 Group Endpoints (`/groups`)

**All group endpoints require authentication**

#### 1. Create Group
```http
POST http://localhost:8000/groups/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "group_name": "Team Alpha",
  "pool_amount": 1000
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/groups/create" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"group_name":"Team Alpha","pool_amount":1000}'
```

#### 2. Join Group
```http
POST http://localhost:8000/groups/join/{group_id}
Authorization: Bearer <token>
```

**Example:**
```bash
curl -X POST "http://localhost:8000/groups/join/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

#### 3. Get Group Details
```http
GET http://localhost:8000/groups/{group_id}
Authorization: Bearer <token>
```

**Example:**
```bash
curl -X GET "http://localhost:8000/groups/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

---

### 🏆 Leaderboard Endpoints (`/leaderboard`)

**All leaderboard endpoints require authentication**

#### 1. Get Group Leaderboard
```http
GET http://localhost:8000/leaderboard/{group_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "group_id": "507f1f77bcf86cd799439011",
  "group_name": "Team Alpha",
  "rankings": [
    {
      "user_id": "user123",
      "username": "alice",
      "email": "alice@example.com",
      "total_points": 500
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/leaderboard/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

#### 2. Get All-Time Leaderboard
```http
GET http://localhost:8000/leaderboard/all-time?limit=100
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Maximum number of users (default: 100)

**Example:**
```bash
curl -X GET "http://localhost:8000/leaderboard/all-time?limit=50" \
  -H "Authorization: Bearer <token>"
```

---

### 🤖 AI Assistant Endpoints (`/ai`)

**All AI endpoints require authentication**

#### 1. Get Motivational Message
```http
GET http://localhost:8000/ai/motivate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "🔥 Amazing streak of 5 days! You're unstoppable, johndoe!"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/ai/motivate" \
  -H "Authorization: Bearer <token>"
```

#### 2. Get Task Suggestion
```http
GET http://localhost:8000/ai/suggest
Authorization: Bearer <token>
```

**Response:**
```json
{
  "suggestion": "You're on a roll! How about a bonus task? Maybe 'Plan tomorrow's goals'?",
  "category": "daily",
  "priority": 5,
  "value": 10
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/ai/suggest" \
  -H "Authorization: Bearer <token>"
```

---

### 📊 General Endpoints

#### 1. Root Endpoint
```http
GET http://localhost:8000/
```

**Response:**
```json
{
  "message": "Welcome to AnkiPlan API!",
  "status": "running",
  "version": "1.0.0"
}
```

#### 2. Health Check
```http
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy"
}
```

---

## Testing Workflow

### Step 1: Register a New User
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test123"}'
```

**Save the `access_token` from the response!**

### Step 2: Create Some Tasks
```bash
# Set your token
TOKEN="your_access_token_here"

# Create daily task
curl -X POST "http://localhost:8000/tasks/add" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Morning Exercise" \
  -F "category=daily" \
  -F "priority=1" \
  -F "value=10"

# Create weekly task
curl -X POST "http://localhost:8000/tasks/add" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Weekly Review" \
  -F "category=weekly" \
  -F "priority=2" \
  -F "value=20"
```

### Step 3: Get Your Tasks
```bash
curl -X GET "http://localhost:8000/tasks/" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Complete a Task (Triggers Gamification)
```bash
# Get task ID from previous response, then:
curl -X POST "http://localhost:8000/tasks/{task_id}/complete" \
  -H "Authorization: Bearer $TOKEN"
```

**This will:**
- Award points (with category multipliers)
- Update your streak
- Increment completed_tasks

### Step 5: Check Your Motivation
```bash
curl -X GET "http://localhost:8000/ai/motivate" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 6: Get Task Suggestion
```bash
curl -X GET "http://localhost:8000/ai/suggest" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 7: Create a Group
```bash
curl -X POST "http://localhost:8000/groups/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"group_name":"My Team","pool_amount":500}'
```

### Step 8: Check Leaderboard
```bash
# All-time leaderboard
curl -X GET "http://localhost:8000/leaderboard/all-time" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Using Swagger UI (Easiest Method)

1. **Start your server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Open browser:**
   ```
   http://localhost:8000/docs
   ```

3. **Authenticate first:**
   - Click on `/auth/signup` or `/auth/login`
   - Click "Try it out"
   - Fill in the form
   - Click "Execute"
   - Copy the `access_token` from response

4. **Authorize:**
   - Click the green "Authorize" button at the top
   - Paste your token: `Bearer <your_token>`
   - Click "Authorize"
   - Now all endpoints are unlocked!

5. **Test endpoints:**
   - Click on any endpoint
   - Click "Try it out"
   - Fill required fields
   - Click "Execute"
   - See the response!

---

## Using Postman

### Import Collection
1. Create a new collection in Postman
2. Add environment variable: `base_url = http://localhost:8000`
3. Add environment variable: `token = <your_token>`

### Setup Authentication
1. Go to Collection settings
2. Under "Authorization", select "Bearer Token"
3. Set token to `{{token}}`

### Test Endpoints
1. Create requests for each endpoint
2. Use `{{base_url}}/auth/signup` format
3. All requests will automatically include the token!

---

## Testing Checklist

### ✅ Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Verify token is returned
- [ ] Try accessing protected route without token (should fail)
- [ ] Try accessing protected route with token (should work)

### ✅ Tasks
- [ ] Create task (daily)
- [ ] Create task (weekly)
- [ ] Create task (monthly)
- [ ] Get all tasks
- [ ] Get priority queue
- [ ] Filter by category
- [ ] Filter by completion status
- [ ] Update task
- [ ] Complete task (check points/streak update)
- [ ] Delete task
- [ ] Upload proof file

### ✅ Gamification
- [ ] Complete daily task (check points awarded)
- [ ] Complete weekly task (check 2x multiplier)
- [ ] Complete monthly task (check 4x multiplier)
- [ ] Upload proof (check +2 bonus)
- [ ] Check streak updates
- [ ] Verify user stats (total_points, streak, completed_tasks)

### ✅ Groups
- [ ] Create group
- [ ] Join group
- [ ] Get group details
- [ ] Verify user added to group_ids

### ✅ Leaderboards
- [ ] Get group leaderboard
- [ ] Get all-time leaderboard
- [ ] Verify sorting by points
- [ ] Test limit parameter

### ✅ AI Assistant
- [ ] Get motivational message
- [ ] Get task suggestion
- [ ] Verify messages are personalized
- [ ] Test with different user states (new user, high streak, etc.)

---

## Expected Responses

### Success Responses
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests (creation)
- `204 No Content`: Successful DELETE requests

### Error Responses
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Tips for Testing

1. **Use Swagger UI first** - It's the easiest way to test
2. **Save your token** - You'll need it for all protected endpoints
3. **Test in order** - Register → Login → Create → Complete
4. **Check gamification** - Complete tasks and watch points/streak update
5. **Test edge cases** - Invalid data, missing fields, wrong IDs
6. **Verify data** - Check MongoDB to see actual database changes

---

## Common Issues

### "401 Unauthorized"
- Token missing or expired
- Token format wrong (should be `Bearer <token>`)
- Token not copied correctly

### "404 Not Found"
- Wrong endpoint URL
- Resource ID doesn't exist
- Typo in path

### "422 Unvalidation Error"
- Missing required fields
- Invalid data format
- Wrong data types

---

## Quick Test Script

Save this as `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

# Register
echo "Registering user..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test123"}')

TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Registration failed!"
  exit 1
fi

echo "Token: $TOKEN"
echo ""

# Create task
echo "Creating task..."
curl -X POST "$BASE_URL/tasks/add" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Task" \
  -F "category=daily" \
  -F "priority=1" \
  -F "value=10"

echo ""
echo "✅ All tests passed!"
```

---

## Next Steps

1. **Test all endpoints** using Swagger UI
2. **Verify gamification** works correctly
3. **Check database** to see data changes
4. **Start building frontend** with confidence!

