"""
Initialize database tables for Supabase
Run this once to create all tables
"""
import os
from database import engine, Base
from models import User, Resume, Analysis, Skill, RefreshToken

def init_db():
    """Create all tables in the database"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    init_db()
