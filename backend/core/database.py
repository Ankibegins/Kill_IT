from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config
import os

MONGODB_URL = config("MONGODB_URL", default="mongodb://localhost:27017")
DATABASE_NAME = config("DATABASE_NAME", default="ankiplan")

class Database:
    client: AsyncIOMotorClient = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        cls.client = AsyncIOMotorClient(MONGODB_URL)
        print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
    
    @classmethod
    async def close(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("❌ MongoDB connection closed")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        return cls.client[DATABASE_NAME]

# Helper function to get collections
def get_collection(collection_name: str):
    db = Database.get_database()
    return db[collection_name]
