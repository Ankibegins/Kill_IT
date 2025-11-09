from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import asyncio

from core.database import Database
from core.scheduler import run_task_reset_scheduler
from routers import auth, tasks, groups, leaderboard, ai_assistant, analytics, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await Database.connect()
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    # Start background task reset scheduler
    asyncio.create_task(run_task_reset_scheduler())
    print("✅ Task reset scheduler started")
    yield
    # Shutdown
    await Database.close()

app = FastAPI(
    title="AnkiPlan API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(groups.router)
app.include_router(leaderboard.router)
app.include_router(ai_assistant.router)
app.include_router(analytics.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to AnkiPlan API!",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
