from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    filename = Column(String, index=True)
    original_text = Column(Text)
    cleaned_text = Column(Text)
    role = Column(String, default="data_analyst")
    level = Column(String, default="intermediate")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, index=True)
    overall_score = Column(Float)
    skill_match_score = Column(Float)
    ats_score = Column(Float)
    role = Column(String)
    level = Column(String, default="intermediate")
    extracted_skills = Column(Text)
    missing_skills = Column(Text)
    ats_issues = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, index=True)
    skill_name = Column(String, index=True)
    category = Column(String)
    proficiency = Column(String, default="mentioned")
    created_at = Column(DateTime, default=datetime.utcnow)
