
# 🚀 Resume Analytics Platform

<p align="center">
  <b>Production-Grade Resume Analysis SaaS</b><br/>
  FastAPI • React (Vite) • PostgreSQL • JWT Authentication • Render • Vercel
</p>


------------------------------------------------------------------------

# 📚 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [System Architecture](#system-architecture)
- [Complete Feature Breakdown](#complete-feature-breakdown)
  - [Authentication & Security](#authentication--security)
  - [Resume Upload & Parsing](#resume-upload--parsing)
  - [Resume Scoring Engine](#resume-scoring-engine)
  - [Role-Based Evaluation](#role-based-evaluation)
  - [Resume Comparison](#resume-comparison)
  - [Job Description Matcher](#job-description-matcher)
  - [Analysis History](#analysis-history)
- [Database Architecture](#database-architecture)
- [Local Setup Guide](#local-setup-guide)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Author](#author)
- [Copyright](#copyright)



------------------------------------------------------------------------

## 📌 Overview

The **Resume Analytics Platform** is a full-stack, production-ready SaaS
application designed to evaluate resumes using NLP-driven skill
extraction, ATS scoring, role-based evaluation, resume comparison, and
job description matching.

It helps candidates understand:

> "How strong is my resume for a specific job role?"

This project demonstrates real-world backend architecture,
authentication systems, database persistence, deployment strategies, and
secure API design.

------------------------------------------------------------------------

# 🎯 Problem Statement

Recruiters scan resumes in **6--8 seconds**.

Common rejection reasons: - Missing relevant keywords - Poor role
alignment - Weak measurable impact - ATS incompatibility - No structured
formatting

This platform solves these problems by providing:

-   Role-specific scoring
-   Skill gap analysis
-   ATS compatibility checks
-   Improvement recommendations

------------------------------------------------------------------------

# 🏗 System Architecture

## High-Level Architecture

                    ┌────────────────────┐
                    │   React Frontend   │
                    │     (Vercel)       │
                    └──────────┬─────────┘
                               │ REST API (HTTPS)
                               ▼
                    ┌────────────────────┐
                    │   FastAPI Backend  │
                    │     (Render)       │
                    └──────────┬─────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │   PostgreSQL DB    │
                    │     (Render)       │
                    └────────────────────┘

------------------------------------------------------------------------

## Resume Processing Flow

    Resume (PDF/DOCX)
            ↓
    Text Extraction (pdfplumber / python-docx)
            ↓
    Cleaning & Normalization
            ↓
    NLP Skill Detection
            ↓
    Role-Based Scoring Engine
            ↓
    ATS Evaluation
            ↓
    Dashboard + PDF Report

------------------------------------------------------------------------

# ✨ Complete Feature Breakdown

## 🔐 Authentication & Security

-   User Registration
-   Secure Login
-   Password hashing using Bcrypt
-   JWT Access Tokens (1 hour expiry)
-   Refresh Token System
-   Token-based route protection
-   Rate limiting (5 attempts per 5 minutes)
-   Secure logout
-   Per-user data isolation
-   SQL Injection prevention via SQLAlchemy ORM
-   CORS protection

------------------------------------------------------------------------

## 📄 Resume Upload & Parsing

-   Supports PDF and DOCX formats
-   Automatic text extraction
-   Data normalization
-   Structured skill extraction
-   Action verb detection
-   Keyword density calculation

------------------------------------------------------------------------

## 📊 Resume Scoring Engine

  Category               Weight
  ---------------------- --------
  Skill Match            40%
  Experience Alignment   25%
  Keyword Density        15%
  ATS Compatibility      10%
  Action Verbs           10%

Outputs: - Overall Score - Skill Match Score - ATS Score - Missing
Skills - Improvement Suggestions

------------------------------------------------------------------------

## 🎯 Role-Based Evaluation

Supports 16 job roles across Data & Software Engineering domains with 3
experience levels: - Fresher (0--2 years) - Intermediate (2--5 years) -
Experienced (5+ years)

------------------------------------------------------------------------

## 🔄 Resume Comparison

-   Upload two resumes
-   Compare skill overlaps
-   Identify unique strengths
-   Compare performance scores

------------------------------------------------------------------------

## 🧠 Job Description Matcher

-   Paste job description
-   Match resume against JD
-   Detect missing keywords
-   Generate improvement suggestions

------------------------------------------------------------------------

## 📈 Analysis History

-   Persistent storage of analyses
-   Filtering & sorting
-   Downloadable reports
-   User-specific data isolation

------------------------------------------------------------------------

# 🗄 Database Architecture

Production: - PostgreSQL (Render)

Local Development: - SQLite fallback

Core Tables: - Users - Resumes - Analyses - Refresh Tokens

------------------------------------------------------------------------

# 🛠 Local Setup Guide

## Clone Repository

``` bash
git clone https://github.com/raushan1140/Resume-Analytics-Platform.git
cd Resume-Analytics-Platform
```

## Backend Setup

``` bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Frontend Setup

``` bash
cd frontend
npm install
npm run dev
```

------------------------------------------------------------------------

# ⚙ Environment Variables

Frontend (.env): VITE_API_BASE_URL=http://localhost:8001

Backend (Production):
DATABASE_URL=postgresql://username:password@host:5432/dbname

------------------------------------------------------------------------

# ☁ Deployment

Frontend: Vercel\
Backend: Render\
Database: PostgreSQL

------------------------------------------------------------------------

# 📸 Screenshots

> **Note:** User email blurred for privacy.

---

## 🔐 Login Page
<p align="center">
  <img src="./screenshots/Login.png" width="800"/>
</p>

---

## 📊 Resume Analysis Dashboard
<p align="center">
  <img src="./screenshots/Analyze.png" width="800"/>
</p>

---

## 🔄 Resume Comparison
<p align="center">
  <img src="./screenshots/Compare.png" width="800"/>
</p>

---

## 🎯 Job Description Matcher
<p align="center">
  <img src="./screenshots/JobMatch.png" width="800"/>
</p>

---

## 📈 Analysis History
<p align="center">
  <img src="./screenshots/History.png" width="800"/>
</p>



------------------------------------------------------------------------

# 👨‍💻 Author

**Raushan Raj**

📧 Email: [raj.raushan9101@gmail.com](mailto:raj.raushan9101@gmail.com)  
🔗 GitHub: https://github.com/raushan1140  
💼 LinkedIn: https://www.linkedin.com/in/raushan1140/  
🌐 Live App: https://resume-analytics-platform-rccm9wnjd-raushan1140s-projects.vercel.app/


------------------------------------------------------------------------

# 📜 Copyright

© 2026 Raushan Raj. All rights reserved.  

This project is created for educational and portfolio purposes.  
Unauthorized commercial use is prohibited without permission.
