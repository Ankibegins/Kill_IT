"""
Background Task Scheduler for Automatic Task Resets
Runs periodic checks to reset recurring tasks based on their category
"""
import asyncio
from datetime import datetime
from core.task_reset import reset_all_due_tasks

async def run_task_reset_scheduler():
    """
    Background scheduler that checks for tasks needing reset
    Runs every hour to check for daily/weekly/weekend/monthly resets
    """
    while True:
        try:
            # Check and reset all due tasks
            reset_count = await reset_all_due_tasks()
            if reset_count > 0:
                print(f"[{datetime.utcnow()}] ✅ Reset {reset_count} tasks")
            
            # Sleep for 1 hour before next check
            await asyncio.sleep(3600)  # 3600 seconds = 1 hour
            
        except Exception as e:
            # Log error but continue running (non-critical background task)
            error_msg = str(e)
            # Only log non-SSL errors or first SSL error to avoid spam
            if "SSL" not in error_msg or "SSL handshake failed" not in str(e):
                print(f"[{datetime.utcnow()}] ⚠️ Error in task reset scheduler: {error_msg}")
            # Continue running even if there's an error
            # Sleep for shorter time on error to retry sooner
            await asyncio.sleep(300)  # Retry in 5 minutes on error

def start_scheduler():
    """
    Start the background scheduler in a separate task
    Call this from main.py on startup
    """
    asyncio.create_task(run_task_reset_scheduler())
    print("✅ Task reset scheduler started")

