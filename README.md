# Resume Analytics Platform

A production-grade platform for analyzing resumes with skill extraction, ATS compatibility checks, and role-based scoring across 16 different job positions and experience levels. Features **secure user authentication**, **resume comparison**, **job description matching**, and **PDF report generation**.

## ✨ Features

### Core Resume Analysis
- **Resume Upload**: PDF and DOCX support with text extraction
- **Text Extraction**: Automated parsing and cleaning with 100+ skill detection
- **Skill Analysis**: Dictionary-based skill detection across technical, business, and soft skills
- **16 Job Roles**: Data Analytics (8 roles) + Software Development (8 roles)
- **Experience Levels**: Fresher (0-2 yrs), Intermediate (2-5 yrs), Experienced (5+ yrs)
- **Role-Based Scoring**: Tailored requirements and scoring for each position and level
- **ATS Compatibility**: Format and structure validation
- **Scoring System**: 0-100 overall score with skill match and ATS breakdowns
- **Analytics Dashboard**: Visual charts and metrics with Recharts
- **Job Search**: Keyword search to quickly find relevant roles

### Advanced Features (NEW)
- **🔐 User Authentication**: 
  - Secure registration with password strength validation
  - JWT-based login with email/password
  - Automatic token refresh (1-hour access tokens, 7-day refresh tokens)
  - Rate limiting (5 login attempts per 5 minutes)
  - Bcrypt password hashing
- **📊 Resume Comparison**: 
  - Side-by-side comparison of 2 resumes
  - Technical skill analysis and comparison
  - Detailed breakdown of shared vs unique skills
  - Performance metrics (overall score, skill match, ATS score)
- **🎯 Job Description Matching**: 
  - Match resume against job descriptions
  - Skill gap analysis with missing skills highlighted
  - Match percentage with recommendations
  - Technical and business skill breakdowns
- **📄 PDF Report Generation**: 
  - Download analysis results as formatted PDF reports
  - Includes scores, skills breakdown, and recommendations
  - Professional formatting with charts and metrics
- **📈 Enhanced History Tracking**: 
  - View all past analyses with filtering
  - Search and sort by date, role, or score
  - Track analysis trends over time
  - User's data isolated and secure

## Tech Stack

**Backend:**
- Python 3.10+
- FastAPI 0.104.1
- SQLAlchemy 2.0.23 + SQLite
- Authentication: `passlib[bcrypt]`, `python-jose`, `bcrypt`, `python-dotenv`
- PDF Generation: `reportlab` 4.0.9
- Document Parsing: `pdfplumber` 0.10.4, `python-docx` 0.8.11
- Data Processing: `pandas` 2.1.3, `scikit-learn` 1.3.2

**Frontend:**
- React 18
- Vite 4.5.0 (for Node.js 16+ compatibility)
- React Router 6.20.0 (for routing)
- JavaScript (no TypeScript)
- Tailwind CSS
- Axios for HTTP requests
- Recharts for visualizations

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python main.py
```

Server runs at `http://localhost:8001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Authentication & Security

### User Registration & Login
1. **Register**: Create account with email and strong password
   - Password must be 8+ characters with uppercase, lowercase, and digit
   - Email validation and uniqueness check
2. **Login**: Authenticate with email/password
   - Credentials checked against bcrypt-hashed passwords
   - Rate limiting: Maximum 5 login attempts per 5 minutes per email
   - Returns JWT access token (1 hour) + refresh token (7 days)
3. **Protected Routes**: All features require authentication
   - Automatic token refresh before expiration
   - User data isolated by user_id
   - Logout clears all tokens

### JWT Token Flow
- **Access Token**: Used for API requests, 1-hour expiration
- **Refresh Token**: Used to get new access tokens, 7-day expiration, stored in database
- **Token Storage**: Stored securely in React state (browser memory)
- **Auto-Refresh**: Tokens auto-refresh 5 minutes before expiration

## API Endpoints

### Authentication Endpoints
- `POST /register` - Register new account
  - Request: `{email, password}`
  - Returns: `{message, email, user_id}`
- `POST /login` - Login and get tokens
  - Request: `{email, password}`
  - Returns: `{access_token, refresh_token, token_type}`
  - Rate limited: 5 attempts per 5 minutes
- `POST /refresh` - Refresh access token
  - Request: `{refresh_token}`
  - Returns: `{access_token, refresh_token, token_type}`
- `POST /logout` - Logout (invalidate refresh token)
  - Request: `{refresh_token}`
  - Returns: `{message}`
- `GET /me` - Get current user info
  - Returns: `{user_id, email, created_at}`

### Resume Analysis Endpoints (Protected)
- `POST /upload` - Upload resume (PDF/DOCX)
  - Returns: `{resume_id, filename, word_count, email, phone}`
  - Associates resume with authenticated user
- `POST /analyze` - Run analysis with role and experience level
  - Request: `{resume_id, role, level}`
  - Returns: `{analysis_id, overall_score, skill_match_score, ats_score, found_required_skills, found_preferred_skills, missing_skills}`
- `GET /history` - Get user's analysis history
  - Returns: `{total, analyses[...]}`
  - Filtered by authenticated user
- `GET /analysis/{id}` - Get detailed analysis
  - Returns: Full analysis with skill breakdown
  - Ownership verification required
- `GET /report/{id}` - Download PDF analysis report
  - Returns: PDF file attachment
  - Ownership verification required

### Advanced Endpoints (Protected)
- `POST /compare` - Compare two resumes
  - Request: `{resume_id_1, resume_id_2, role, level}`
  - Returns: Detailed comparison with shared/unique skills for both resumes
- `POST /match-job-description` - Match resume against job description
  - Request: `{resume_id, job_description, job_title}`
  - Returns: Match percentage, skill gap analysis, recommendations

## Supported Roles

### Data & Analytics (8 roles)
- Data Analyst
- BI Engineer
- Data Scientist
- Analytics Engineer
- ML Engineer
- Data Engineer
- Database Administrator
- Business Analyst

### Software Development (8 roles)
- Backend Developer
- Frontend Developer
- Full Stack Developer
- Software Developer
- QA/Software Tester
- DevOps Engineer
- Cloud Architect
- Security Engineer

### Experience Levels
- **Fresher** (0-2 years)
- **Intermediate** (2-5 years)
- **Experienced** (5+ years)

Each role has tailored skill requirements based on experience level.

## Database Schema

**Resumes**: id, filename, original_text, cleaned_text, role, level, created_at
**Analyses**: id, resume_id, overall_score, skill_match_score, ats_score, role, level, extracted_skills (JSON), missing_skills (JSON), created_at
**Skills**: id, analysis_id, skill_name, category, proficiency, created_at

## Usage

1. Open browser to `http://localhost:5173`
2. **Register/Login**: Create account or login with email and password
   - Password must contain uppercase, lowercase, and digits (8+ chars)
3. **Search for role** (optional): Enter job title in search bar (e.g., "backend", "frontend", "data analyst")
4. **Upload resume**: Drag-drop or click to select PDF/DOCX file
5. **Select role**: Choose from 16 roles in dropdown (organized by category)
6. **Select experience level**: Pick one of Fresher/Intermediate/Experienced
7. **Analyze**: System extracts skills and scores resume against role requirements
8. **View results**: 
   - Overall score, Skill Match %, ATS score
   - Skill breakdown showing found and missing skills
   - Visual charts and analysis
   - Download PDF report button
9. **Additional features**:
   - **Compare Resumes**: Upload and compare 2 resumes side-by-side
   - **Match Job Description**: Paste job description and get skill gap analysis
   - **View History**: Browse all past analyses with filtering and sorting

## Features Breakdown

### Authentication & Security
- **Secure Registration**: Email validation, password strength requirements (8+ chars, uppercase, lowercase, digit)
- **JWT Authentication**: Secure token-based authentication with 1-hour access tokens
- **Rate Limiting**: 5 login attempts per 5 minutes to prevent brute force
- **Password Hashing**: Bcrypt hashing for maximum security
- **User Data Isolation**: Each user can only see their own resumes and analyses
- **Token Auto-Refresh**: Automatic refresh before expiration
- **Logout**: Secure logout that invalidates refresh tokens

### Smart Job Search
- Type keywords like "backend", "frontend", "qa", "devops", "cloud", "security"
- Automatically matches to relevant role(s)
- Fast access to specific roles without scrolling

### Skill Detection
- **100+ technical skills** detected (React, Docker, Kubernetes, Python, Java, etc.)
- **Business skills** (Agile, Project Management, Analytics, etc.)
- **Soft skills** (Communication, Leadership, Problem Solving, etc.)
- Skill categories organized in results (required vs preferred)

### Role-Based Scoring
- **Skill Match**: Percentage of required skills found in resume
- **ATS Score**: Resume structure and format compatibility
- **Overall Score**: Weighted combination based on role requirements
- **Requirements vary by experience level** - junior roles expect different skills than senior roles

### Resume Comparison (NEW)
- Upload and compare 2 resumes side-by-side
- Compare skills across both resumes
- Identify shared technical skills
- Highlight unique skills for each resume
- Performance comparison (overall score, skill match, ATS score)

### Job Description Matching (NEW)
- Paste job description text
- Get match percentage against resume
- Identify missing technical and business skills
- Receive improvement recommendations
- Technical skill breakdown with match counts

### PDF Report Generation (NEW)
- Download analysis results as professional PDF reports
- Includes scores, skill breakdown, and recommendations
- Beautiful formatted document with metrics

### Analytics Dashboard
- Bar charts comparing scores across dimensions
- Skill breakdown pie charts
- Trend analysis over time (last analyses)
- Detailed skill lists (found, missing, preferred)
- Filter and search past analyses

## Notes

- Backend runs on port **8001**
- Frontend runs on port **5173**
- Analysis results persisted in `resume_db.sqlite` in backend directory
- All file uploads stored in `backend/uploads/` directory (auto-created on first run)
- Supports both PDF and DOCX formats
- Initial analysis may take 2-3 seconds as FastAPI loads ML modules
- Database schema automatically initialized on first run
- All authenticated API requests require JWT token in Authorization header
- Search feature performs keyword matching on role IDs and descriptions
- Experience level requirements dynamically adjust how scores are calculated
- User data is completely isolated - users cannot see other users' resumes or analyses
- Refresh tokens stored in database for security and revocation capability
