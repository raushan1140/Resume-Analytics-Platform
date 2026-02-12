import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine.url import make_url

# -------------------------------------------------
# Get DATABASE_URL from environment (Render)
# -------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

# -------------------------------------------------
# If DATABASE_URL exists → Use PostgreSQL (Production)
# Else → Fallback to SQLite (Local Dev)
# -------------------------------------------------
if DATABASE_URL:

    # Fix Render old format if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True  # Prevents stale DB connections
    )

else:
    DATABASE_URL = "sqlite:///./resume_db.sqlite"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

# -------------------------------------------------
# Session & Base
# -------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# -------------------------------------------------
# Dependency for FastAPI routes
# -------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------
# Initialize Database (Create Tables)
# -------------------------------------------------
def init_db():
    Base.metadata.create_all(bind=engine)

# -------------------------------------------------
# Debu
