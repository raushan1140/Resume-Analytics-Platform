-- Create tables in Supabase
-- Copy and paste this into Supabase SQL Editor to initialize your database

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_created_at ON users(created_at);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_token ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    filename VARCHAR NOT NULL,
    original_text TEXT,
    cleaned_text TEXT,
    role VARCHAR DEFAULT 'data_analyst',
    level VARCHAR DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS ix_resumes_filename ON resumes(filename);
CREATE INDEX IF NOT EXISTS ix_resumes_created_at ON resumes(created_at);

CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL,
    overall_score FLOAT,
    skill_match_score FLOAT,
    ats_score FLOAT,
    role VARCHAR,
    level VARCHAR DEFAULT 'intermediate',
    extracted_skills TEXT,
    missing_skills TEXT,
    ats_issues TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_analyses_resume_id ON analyses(resume_id);
CREATE INDEX IF NOT EXISTS ix_analyses_created_at ON analyses(created_at);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL,
    skill_name VARCHAR NOT NULL,
    category VARCHAR,
    proficiency VARCHAR DEFAULT 'mentioned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_skills_analysis_id ON skills(analysis_id);
CREATE INDEX IF NOT EXISTS ix_skills_skill_name ON skills(skill_name);
