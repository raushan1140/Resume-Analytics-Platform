import pdfplumber
from docx import Document
import re
import string

SKILL_DICTIONARY = {
    "technical": [
        "python", "sql", "r", "java", "javascript", "typescript", "c++", "c#", "golang", "rust", "kotlin", "swift",
        "nodejs", "node", "react", "angular", "vue", "express", "django", "flask", "spring", "fastapi",
        "html", "css", "scss", "sass", "bootstrap", "tailwind", "material ui",
        "excel", "power bi", "tableau", "looker", "qlik", "informatica",
        "aws", "azure", "gcp", "google cloud", "kubernetes", "docker", "terraform", "ansible",
        "spark", "hadoop", "airflow", "etl", "data pipeline", "kafka", "rabbitmq",
        "machine learning", "ml", "deep learning", "nlp", "tensorflow", "pytorch", "keras", "scikit-learn",
        "pandas", "numpy", "matplotlib", "seaborn", "plotly",
        "postgresql", "mysql", "mongodb", "cassandra", "elasticsearch", "redis", "dynamodb",
        "linux", "unix", "git", "jenkins", "gitlab", "github", "bitbucket",
        "api", "rest", "graphql", "microservices", "soap", "websockets",
        "testing", "unittest", "jest", "mocha", "pytest", "selenium",
        "ci", "cd", "devops", "monitoring", "prometheus", "grafana", "datadog",
        "design patterns", "oop", "solid", "mvc", "mvvm", "architecture",
        "database", "nosql", "orm", "sqlalchemy", "sequelize",
        "security", "encryption", "authentication", "oauth", "jwt", "ssl", "tls",
        "performance", "optimization", "scaling", "load balancing", "caching",
        "mobile", "android", "ios", "flutter", "react native", "xamarin",
        "responsive design", "ui", "ux", "accessibility", "seo", "webpack", "vite",
        "junit", "testng", "rspec", "cypress", "pupperteer", "appium", "xcode", "gradle", "maven"
    ],
    "business": [
        "analytics", "business intelligence", "data analysis", "statistical analysis",
        "reporting", "dashboard", "visualization", "kpi", "metrics",
        "forecasting", "modeling", "optimization", "ab testing", "experimental design",
        "requirement gathering", "stakeholder management", "process improvement",
        "project management", "agile", "scrum", "jira", "kanban",
        "documentation", "technical writing", "communication", "api documentation",
        "incident response", "troubleshooting", "debugging", "root cause analysis",
        "performance tuning", "cost optimization", "infrastructure",
        "compliance", "security", "caching", "disaster recovery"
    ],
    "soft_skills": [
        "communication", "leadership", "teamwork", "problem solving", "critical thinking",
        "project management", "time management", "collaboration", "presentation",
        "documentation", "mentoring", "strategic thinking", "customer focus",
        "attention to detail", "analytical thinking", "adaptability", "creativity",
        "reliability", "responsibility", "accountability", "initiative"
    ]
}

def extract_text_from_pdf(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        raise ValueError(f"Error reading PDF: {str(e)}")
    return text

def extract_text_from_docx(file_path):
    text = ""
    try:
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        raise ValueError(f"Error reading DOCX: {str(e)}")
    return text

def extract_text(file_path, file_type):
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file type. Use PDF or DOCX.")

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    text = text.lower()
    return text.strip()

def extract_skills(text):
    text_lower = text.lower()
    found_skills = {"technical": [], "business": [], "soft_skills": []}
    
    for category, skills in SKILL_DICTIONARY.items():
        for skill in skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills[category].append(skill)
    
    return found_skills

def extract_email(text):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else None

def extract_phone(text):
    phone_pattern = r'(\+?1?\s?)?(\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    return phones[0] if phones else None

def parse_resume(file_path, file_type):
    raw_text = extract_text(file_path, file_type)
    cleaned_text = clean_text(raw_text)
    skills = extract_skills(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    
    return {
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
        "skills": skills,
        "email": email,
        "phone": phone,
        "word_count": len(cleaned_text.split())
    }
