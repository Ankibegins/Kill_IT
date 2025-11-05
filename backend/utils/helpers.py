"""
Common helper functions
"""
from datetime import datetime
from typing import Any, Dict
from bson import ObjectId

def convert_objectid_to_str(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert MongoDB ObjectId to string in document
    
    Args:
        doc: MongoDB document with _id field
    
    Returns:
        Document with _id converted to id string
    """
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def get_current_timestamp() -> datetime:
    """
    Get current UTC timestamp
    
    Returns:
        Current datetime in UTC
    """
    return datetime.utcnow()

def validate_object_id(obj_id: str) -> ObjectId:
    """
    Validate and convert string ID to ObjectId
    
    Args:
        obj_id: String ID to validate
    
    Returns:
        ObjectId instance
    
    Raises:
        ValueError: If ID is invalid
    """
    try:
        return ObjectId(obj_id)
    except Exception:
        raise ValueError(f"Invalid ObjectId: {obj_id}")

