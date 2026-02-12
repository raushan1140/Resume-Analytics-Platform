from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Header
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import shutil
import os
import json
from typing import Optional

from database import engine, SessionLocal, init_db
from models import Resume, Analysis, Skill, Base, User, RefreshToken
from resume_parser import parse_resume, extract_text, extract_skills
from analytics_engine import analyze_resume
from report_generator import generate_analysis_report, generate_comparison_report
from auth import (
    hash_password, verify_password, validate_password_strength,
    create_access_token, create_refresh_token, verify_token,
    check_rate_limit, record_login_attempt, clear_login_attempts,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Pydantic models
class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class AnalyzeRequest(BaseModel):
    resume_id: int
    role: str = "data_analyst"
    level: str = "intermediate"

class CompareRequest(BaseModel):
    resume_id_1: int
    resume_id_2: int
    role: str = "data_analyst"
    level: str = "intermediate"

class JobDescriptionRequest(BaseModel):
    resume_id: int
    job_description: str
    job_title: str = "Not specified"

app = FastAPI(title="Resume Analytics API")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://resume-analytics-platform.vercel.app",
    ],
    allow_origin_regex=r"https://resume-analytics-platform.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Extract user from JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = verify_token(token)
        
        if not payload:
            print(f"Token verification failed for token: {token[:20]}...")
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Reject refresh tokens on protected endpoints
        if payload.get("type") == "refresh":
            raise HTTPException(status_code=401, detail="Cannot use refresh token for this request")
        
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(status_code=401, detail="Invalid token - no user ID")
        
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise HTTPException(status_code=401, detail="Invalid token - bad user ID")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def read_root():
    return {"message": "Resume Analytics Platform API", "version": "2.0", "status": "Authentication Enabled"}

# ==================== AUTH ENDPOINTS ====================

@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    
    # Validate email format
    if "@" not in request.email or "." not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password strength
    is_valid, message = validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    try:
        # Hash password and create user
        password_hash = hash_password(request.password)
        user = User(
            email=request.email,
            password_hash=password_hash
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "message": "Registration successful",
            "email": user.email,
            "user_id": user.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return access and refresh tokens."""
    
    # Check rate limiting
    can_attempt, message = check_rate_limit(request.email)
    if not can_attempt:
        raise HTTPException(status_code=429, detail=message)
    
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        record_login_attempt(request.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        record_login_attempt(request.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear login attempts after successful login
    clear_login_attempts(request.email)
    
    try:
        # Create tokens with string user_id
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # Store refresh token in database
        token_expires = datetime.utcnow() + timedelta(days=7)
        db_refresh_token = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=token_expires
        )
        db.add(db_refresh_token)
        db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    
    # Verify refresh token
    payload = verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    
    # Check if refresh token exists in database
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == request.refresh_token,
        RefreshToken.user_id == user_id
    ).first()
    
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")
    
    try:
        # Create new access token
        access_token = create_access_token({"sub": user_id})
        
        return {
            "access_token": access_token,
            "refresh_token": request.refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@app.post("/logout")
def logout(refresh_token: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Logout user by deleting refresh token."""
    
    try:
        db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token,
            RefreshToken.user_id == current_user.id
        ).delete()
        db.commit()
        
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat()
    }

# ==================== PROTECTED RESUME ENDPOINTS ====================

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Upload resume (protected)."""
    if file.filename == "":
        raise HTTPException(status_code=400, detail="No file selected")
    
    allowed_extensions = {".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File must be PDF or DOCX")
    
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_type = "pdf" if file_ext == ".pdf" else "docx"
        parsed_data = parse_resume(file_path, file_type)
        
        resume_record = Resume(
            user_id=current_user.id,
            filename=file.filename,
            original_text=parsed_data["raw_text"],
            cleaned_text=parsed_data["cleaned_text"],
            role="data_analyst",
            level="intermediate"
        )
        db.add(resume_record)
        db.commit()
        db.refresh(resume_record)
        
        return {
            "resume_id": resume_record.id,
            "filename": file.filename,
            "word_count": parsed_data["word_count"],
            "email": parsed_data["email"],
            "phone": parsed_data["phone"],
            "message": "Resume uploaded successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/analyze")
def analyze_resume_endpoint(request: AnalyzeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Analyze resume (protected)."""
    resume_id = request.resume_id
    role = request.role
    level = request.level
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        skills = extract_skills(resume.original_text)
        extracted_data = {
            "raw_text": resume.original_text,
            "cleaned_text": resume.cleaned_text,
            "skills": skills,
            "word_count": len(resume.cleaned_text.split())
        }
        
        analysis_results = analyze_resume(extracted_data, role=role, level=level)
        
        analysis_record = Analysis(
            resume_id=resume.id,
            overall_score=analysis_results["overall_score"],
            skill_match_score=analysis_results["skill_match_score"],
            ats_score=analysis_results["ats_score"],
            role=role,
            level=level,
            extracted_skills=json.dumps(analysis_results["all_extracted_skills"]),
            missing_skills=json.dumps(analysis_results["missing_skills"]),
            ats_issues=json.dumps({"status": "checked"})
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        
        for skill_name in analysis_results["found_required_skills"]:
            skill = Skill(
                analysis_id=analysis_record.id,
                skill_name=skill_name,
                category="required",
                proficiency="found"
            )
            db.add(skill)
        
        for skill_name in analysis_results["found_preferred_skills"]:
            skill = Skill(
                analysis_id=analysis_record.id,
                skill_name=skill_name,
                category="preferred",
                proficiency="found"
            )
            db.add(skill)
        
        db.commit()
        
        return {
            "analysis_id": analysis_record.id,
            "resume_id": resume.id,
            "overall_score": round(analysis_results["overall_score"], 2),
            "skill_match_score": round(analysis_results["skill_match_score"], 2),
            "ats_score": round(analysis_results["ats_score"], 2),
            "found_required_skills": analysis_results["found_required_skills"],
            "found_preferred_skills": analysis_results["found_preferred_skills"],
            "missing_skills": analysis_results["missing_skills"],
            "word_count": analysis_results["word_count"],
            "role": role,
            "level": level,
            "timestamp": analysis_record.created_at.isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")

@app.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get user's analysis history (protected)."""
    # Get all resumes for this user
    user_resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    resume_ids = [r.id for r in user_resumes]
    
    # Get all analyses for those resumes
    if resume_ids:
        analyses = db.query(Analysis).filter(Analysis.resume_id.in_(resume_ids)).order_by(Analysis.created_at.desc()).all()
    else:
        analyses = []
    
    history = []
    for analysis in analyses:
        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        history.append({
            "analysis_id": analysis.id,
            "resume_id": analysis.resume_id,
            "filename": resume.filename if resume else "Unknown",
            "role": analysis.role,
            "level": analysis.level,
            "overall_score": analysis.overall_score,
            "skill_match_score": analysis.skill_match_score,
            "ats_score": analysis.ats_score,
            "timestamp": analysis.created_at.isoformat()
        })
    
    return {"total": len(history), "analyses": history}

@app.get("/analysis/{analysis_id}")
def get_analysis_detail(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get analysis detail (protected)."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    
    # Ensure user owns this resume
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    skills = db.query(Skill).filter(Skill.analysis_id == analysis_id).all()
    
    return {
        "analysis_id": analysis.id,
        "resume_id": analysis.resume_id,
        "filename": resume.filename if resume else "Unknown",
        "overall_score": analysis.overall_score,
        "skill_match_score": analysis.skill_match_score,
        "ats_score": analysis.ats_score,
        "role": analysis.role,
        "level": analysis.level,
        "extracted_skills": json.loads(analysis.extracted_skills),
        "missing_skills": json.loads(analysis.missing_skills),
        "found_skills": [{"name": s.skill_name, "category": s.category} for s in skills],
        "timestamp": analysis.created_at.isoformat()
    }

@app.get("/report/{analysis_id}")
def download_report(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Download PDF report (protected)."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    
    # Ensure user owns this resume
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    analysis_data = {
        "overall_score": analysis.overall_score,
        "skill_match_score": analysis.skill_match_score,
        "ats_score": analysis.ats_score,
        "extracted_skills": json.loads(analysis.extracted_skills),
        "missing_skills": json.loads(analysis.missing_skills),
        "role_display": analysis.role.replace("_", " ").title(),
        "level_display": analysis.level.title(),
        "word_count": len(resume.cleaned_text.split())
    }
    
    pdf_buffer = generate_analysis_report(analysis_data, resume.filename)
    filename = f"Resume_Analysis_{analysis.id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        iter([pdf_buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/compare")
def compare_resumes(request: CompareRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Compare two resumes (protected)."""
    
    resume1 = db.query(Resume).filter(Resume.id == request.resume_id_1, Resume.user_id == current_user.id).first()
    resume2 = db.query(Resume).filter(Resume.id == request.resume_id_2, Resume.user_id == current_user.id).first()
    
    if not resume1 or not resume2:
        raise HTTPException(status_code=404, detail="One or both resumes not found")
    
    try:
        skills1 = extract_skills(resume1.original_text)
        extracted_data1 = {
            "raw_text": resume1.original_text,
            "cleaned_text": resume1.cleaned_text,
            "skills": skills1,
            "word_count": len(resume1.cleaned_text.split())
        }
        analysis1 = analyze_resume(extracted_data1, role=request.role, level=request.level)
        
        skills2 = extract_skills(resume2.original_text)
        extracted_data2 = {
            "raw_text": resume2.original_text,
            "cleaned_text": resume2.cleaned_text,
            "skills": skills2,
            "word_count": len(resume2.cleaned_text.split())
        }
        analysis2 = analyze_resume(extracted_data2, role=request.role, level=request.level)
        
        tech_skills1 = set(analysis1["all_extracted_skills"].get("technical", []))
        tech_skills2 = set(analysis2["all_extracted_skills"].get("technical", []))
        
        shared_skills = tech_skills1 & tech_skills2
        unique_to_1 = tech_skills1 - tech_skills2
        unique_to_2 = tech_skills2 - tech_skills1
        
        return {
            "resume1": {
                "id": resume1.id,
                "filename": resume1.filename,
                "overall_score": analysis1["overall_score"],
                "skill_match_score": analysis1["skill_match_score"],
                "ats_score": analysis1["ats_score"],
                "word_count": len(resume1.cleaned_text.split()),
                "skills": analysis1["all_extracted_skills"]
            },
            "resume2": {
                "id": resume2.id,
                "filename": resume2.filename,
                "overall_score": analysis2["overall_score"],
                "skill_match_score": analysis2["skill_match_score"],
                "ats_score": analysis2["ats_score"],
                "word_count": len(resume2.cleaned_text.split()),
                "skills": analysis2["all_extracted_skills"]
            },
            "comparison": {
                "shared_technical_skills": list(shared_skills),
                "unique_to_resume1": list(unique_to_1),
                "unique_to_resume2": list(unique_to_2),
                "shared_skill_count": len(shared_skills),
                "better_overall_score": "resume1" if analysis1["overall_score"] > analysis2["overall_score"] else "resume2",
                "better_skill_match": "resume1" if analysis1["skill_match_score"] > analysis2["skill_match_score"] else "resume2",
                "better_ats_score": "resume1" if analysis1["ats_score"] > analysis2["ats_score"] else "resume2"
            },
            "role": request.role,
            "level": request.level
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing resumes: {str(e)}")

@app.post("/match-job-description")
def match_job_description(request: JobDescriptionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Match resume against job description (protected)."""
    
    resume = db.query(Resume).filter(Resume.id == request.resume_id, Resume.user_id == current_user.id).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        resume_skills = extract_skills(resume.original_text)
        job_desc_skills = extract_skills(request.job_description)
        
        resume_tech = set(resume_skills.get("technical", []))
        job_tech = set(job_desc_skills.get("technical", []))
        
        resume_business = set(resume_skills.get("business", []))
        job_business = set(job_desc_skills.get("business", []))
        
        tech_match = len(resume_tech & job_tech)
        tech_required = len(job_tech)
        business_match = len(resume_business & job_business)
        business_required = len(job_business)
        
        total_job_skills = tech_required + business_required
        matched_skills = tech_match + business_match
        
        match_percentage = (matched_skills / total_job_skills * 100) if total_job_skills > 0 else 0
        
        if match_percentage >= 80:
            fit_level = "Excellent Match"
        elif match_percentage >= 60:
            fit_level = "Good Match"
        elif match_percentage >= 40:
            fit_level = "Moderate Match"
        else:
            fit_level = "Poor Match"
        
        missing_tech = job_tech - resume_tech
        missing_business = job_business - resume_business
        
        return {
            "job_title": request.job_title,
            "resume_id": resume.id,
            "resume_filename": resume.filename,
            "match_percentage": round(match_percentage, 2),
            "fit_level": fit_level,
            "technical_skills": {
                "matched": list(resume_tech & job_tech),
                "missing": list(missing_tech),
                "match_count": tech_match,
                "required_count": tech_required
            },
            "business_skills": {
                "matched": list(resume_business & job_business),
                "missing": list(missing_business),
                "match_count": business_match,
                "required_count": business_required
            },
            "recommendation": f"You match {match_percentage:.0f}% of the job requirements. Focus on acquiring: {', '.join(list(missing_tech)[:5]) if missing_tech else 'none'}",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching job description: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
