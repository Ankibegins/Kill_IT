"""
Task Suggester - MongoDB Async
Suggests new tasks based on user performance patterns
"""
from typing import Dict, Union
from schemas.user_schema import UserOut, UserInDB
from services.ai_engine.performance_analyzer import analyze_performance

def suggest_new_task(user: Union[UserOut, UserInDB, dict]) -> Dict[str, str]:
    """
    Suggests a new task based on user performance patterns.
    
    Args:
        user: UserOut, UserInDB, or dict with user data
    
    Returns:
        Dictionary with task suggestion
    """
    stats = analyze_performance(user)
    suggestion = ""
    
    # Low completion ratio - suggest easier tasks
    if stats["completion_ratio"] < 0.4 and stats["total_tasks"] > 5:
        suggestions = [
            "You're missing a few tasks. Let's try a lighter, catch-up task. How about a 10-minute review session?",
            "Time for a quick win! Try a 5-minute task like 'Organize your workspace' to build momentum.",
            "Let's reset with something manageable. How about 'Review and update one goal'?"
        ]
        suggestion = suggestions[stats["total_tasks"] % len(suggestions)]
    
    # On a streak - suggest bonus tasks
    elif stats["is_on_streak"] and stats["current_streak"] >= 3:
        suggestions = [
            "You're on a roll! How about a bonus task? Maybe 'Plan tomorrow's goals' to keep the streak alive?",
            f"Amazing {stats['current_streak']}-day streak! Let's add a momentum task: 'Reflect on your progress'.",
            "Streak champion! Try 'Set up tomorrow's priority tasks' to maintain your winning habit."
        ]
        suggestion = suggestions[stats["current_streak"] % len(suggestions)]
    
    # High points - suggest challenging tasks
    elif stats["total_points"] >= 500:
        suggestions = [
            "You're a productivity powerhouse! How about a challenging task? Maybe 'Plan your next big project'?",
            "With your track record, try something ambitious: 'Break down a major goal into actionable steps'.",
            "Level up! Consider: 'Review and optimize your task management system'."
        ]
        suggestion = suggestions[int(stats["total_points"] / 100) % len(suggestions)]
    
    # Balanced routine
    elif stats["completion_ratio"] >= 0.7:
        suggestions = [
            "You're doing great! How about a task to balance your routine? Maybe '15-minute walk' for mental clarity?",
            "Keep the balance! Try '10-minute meditation' or 'Read one chapter' for personal growth.",
            "Well-rounded approach! Consider 'Review your goals' or 'Plan your week ahead'."
        ]
        suggestion = suggestions[stats["completed_tasks"] % len(suggestions)]
    
    # New user - gentle onboarding
    elif stats["total_tasks"] == 0:
        suggestions = [
            "Welcome! Start with something simple: 'Set up your workspace' or 'Create your first daily task'.",
            "Begin your journey: 'Write down three goals for this week'.",
            "Let's start strong: 'Complete one small task today' to build your first streak!"
        ]
        suggestion = suggestions[0]
    
    # Default balanced suggestion
    else:
        suggestions = [
            "You're making progress! How about 'Review your completed tasks' to celebrate wins?",
            "Keep building momentum: Try 'Plan tomorrow's top 3 priorities'.",
            "Balance is key: Consider 'Take a short break and reflect' or 'Tackle a quick 5-minute task'."
        ]
        suggestion = suggestions[stats["completed_tasks"] % len(suggestions)]
    
    return {"suggestion": suggestion, "category": "daily", "priority": 5, "value": 10}

