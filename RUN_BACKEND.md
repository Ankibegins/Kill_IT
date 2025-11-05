# How to Run the Backend Server 🚀

## Prerequisites

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up Environment Variables:**
   - Copy `env.example` to `.env`
   - Update the values:
     ```env
     MONGODB_URL=mongodb://localhost:27017
     DATABASE_NAME=ankiplan
     SECRET_KEY=your-secret-key-change-in-production-minimum-32-characters
     ```

3. **Ensure MongoDB is Running:**
   - MongoDB should be running on `localhost:27017` (or your configured URL)

## Running the Server

### Option 1: Using Uvicorn (Recommended) ⭐

**From the project root:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Or from backend directory:**
```bash
uvicorn main:app --reload
```

### Option 2: Using Python Directly

**From the backend directory:**
```bash
cd backend
python main.py
```

### Option 3: Using Uvicorn with Module Path

**From the project root:**
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Command Options Explained

- `--reload`: Auto-reloads server on code changes (development only)
- `--host 0.0.0.0`: Makes server accessible from all network interfaces
- `--port 8000`: Sets the port (default is 8000)

## Verification

Once running, you should see:
```
✅ Connected to MongoDB: ankiplan
✅ Task reset scheduler started
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Access Points

- **API Base URL:** `http://localhost:8000`
- **API Documentation:** `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs:** `http://localhost:8000/redoc` (ReDoc)
- **Health Check:** `http://localhost:8000/health`
- **Root:** `http://localhost:8000/`

## Testing the Server

Open your browser or use curl:
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "message": "Welcome to AnkiPlan API!",
  "status": "running",
  "version": "1.0.0"
}
```

## Troubleshooting

### Port Already in Use
If port 8000 is busy, use a different port:
```bash
uvicorn main:app --reload --port 8001
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URL` in `.env` file
- Verify MongoDB is accessible

### Module Not Found
- Make sure you're in the `backend` directory
- Or use: `uvicorn backend.main:app --reload`

### Dependencies Missing
- Run: `pip install -r requirements.txt`
- Activate virtual environment if using one

## Production Deployment

For production, remove `--reload` and use:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Stop the Server

Press `CTRL+C` in the terminal where the server is running.

