from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
import hashlib

from decouple import config

from core.database import get_collection
from schemas.user_schema import UserInDB
from schemas.token_schema import TokenData

# Security configuration
SECRET_KEY = config("SECRET_KEY", default="your-secret-key-change-in-production-minimum-32-characters")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        password_bytes = plain_password.encode('utf-8')
        # Bcrypt has a 72-byte limit, so for longer passwords, hash with SHA-256 first
        if len(password_bytes) > 72:
            # Pre-hash with SHA-256 (32 bytes) to stay within bcrypt's limit
            password_to_check = hashlib.sha256(password_bytes).digest()
        else:
            password_to_check = password_bytes
        
        # Verify the password
        return bcrypt.checkpw(password_to_check, hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password (handles passwords longer than 72 bytes by pre-hashing with SHA-256)"""
    password_bytes = password.encode('utf-8')
    # Bcrypt has a 72-byte limit, so for longer passwords, hash with SHA-256 first
    if len(password_bytes) > 72:
        # Pre-hash with SHA-256 (32 bytes) to stay within bcrypt's limit
        password_to_hash = hashlib.sha256(password_bytes).digest()
    else:
        password_to_hash = password_bytes
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_to_hash, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id)
    except JWTError:
        raise credentials_exception
    
    users_collection = get_collection("users")
    user_doc = await users_collection.find_one({"_id": ObjectId(token_data.id)})
    
    if user_doc is None:
        raise credentials_exception
    
    # Convert ObjectId to string and create UserInDB
    user_doc["id"] = str(user_doc["_id"])
    del user_doc["_id"]
    return UserInDB(**user_doc)

