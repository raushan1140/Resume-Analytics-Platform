from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

ROLE_REQUIREMENTS = {
    "data_analyst": {
        "fresher": {
            "required_skills": ["sql", "excel", "analytics", "python"],
            "preferred_skills": ["tableau", "power bi", "reporting", "visualization", "statistical analysis"],
            "technical_weight": 0.4,
            "business_weight": 0.4,
            "soft_weight": 0.2,
            "min_words": 250,
            "min_skills": 3
        },
        "intermediate": {
            "required_skills": ["sql", "excel", "analytics", "python", "visualization"],
            "preferred_skills": ["tableau", "power bi", "looker", "statistical analysis", "business intelligence"],
            "technical_weight": 0.45,
            "business_weight": 0.35,
            "soft_weight": 0.2,
            "min_words": 350,
            "min_skills": 5
        },
        "experienced": {
            "required_skills": ["sql", "excel", "analytics", "python", "visualization", "business intelligence"],
            "preferred_skills": ["tableau", "power bi", "looker", "statistical analysis", "ml", "predictive"],
            "technical_weight": 0.5,
            "business_weight": 0.3,
            "soft_weight": 0.2,
            "min_words": 450,
            "min_skills": 6
        }
    },
    "bi_engineer": {
        "fresher": {
            "required_skills": ["sql", "power bi", "etl", "data"],
            "preferred_skills": ["azure", "aws", "python", "reporting", "data warehouse"],
            "technical_weight": 0.5,
            "business_weight": 0.3,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 3
        },
        "intermediate": {
            "required_skills": ["sql", "power bi", "etl", "data pipeline", "azure"],
            "preferred_skills": ["aws", "python", "data warehouse", "informatica", "looker"],
            "technical_weight": 0.55,
            "business_weight": 0.25,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 5
        },
        "experienced": {
            "required_skills": ["sql", "power bi", "etl", "data pipeline", "azure", "aws"],
            "preferred_skills": ["python", "data warehouse", "informatica", "spark", "machine learning"],
            "technical_weight": 0.6,
            "business_weight": 0.2,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 6
        }
    },
    "data_scientist": {
        "fresher": {
            "required_skills": ["python", "ml", "machine learning", "statistics", "sql"],
            "preferred_skills": ["tensorflow", "scikit-learn", "pandas", "numpy", "r", "data analysis"],
            "technical_weight": 0.6,
            "business_weight": 0.2,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["python", "ml", "machine learning", "statistics", "sql", "tensorflow"],
            "preferred_skills": ["scikit-learn", "pandas", "deep learning", "nlp", "pytorch", "data modeling"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["python", "ml", "machine learning", "statistics", "sql", "tensorflow", "deep learning"],
            "preferred_skills": ["scikit-learn", "pytorch", "nlp", "nlp", "mlops", "research", "publications"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 7
        }
    },
    "analytics_engineer": {
        "fresher": {
            "required_skills": ["sql", "data warehouse", "python", "analytics"],
            "preferred_skills": ["dbt", "snowflake", "bigquery", "modeling", "python"],
            "technical_weight": 0.55,
            "business_weight": 0.25,
            "soft_weight": 0.2,
            "min_words": 280,
            "min_skills": 3
        },
        "intermediate": {
            "required_skills": ["sql", "data warehouse", "python", "dbt", "analytics"],
            "preferred_skills": ["snowflake", "bigquery", "modeling", "airflow", "git", "ci/cd"],
            "technical_weight": 0.6,
            "business_weight": 0.2,
            "soft_weight": 0.2,
            "min_words": 380,
            "min_skills": 5
        },
        "experienced": {
            "required_skills": ["sql", "data warehouse", "python", "dbt", "analytics", "modeling"],
            "preferred_skills": ["snowflake", "bigquery", "airflow", "git", "ci/cd", "leadership"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 480,
            "min_skills": 6
        }
    },
    "ml_engineer": {
        "fresher": {
            "required_skills": ["python", "ml", "machine learning", "deep learning", "tensorflow"],
            "preferred_skills": ["pytorch", "nlp", "computer vision", "scikit-learn", "keras", "deployment"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["python", "ml", "deep learning", "tensorflow", "pytorch", "deployment"],
            "preferred_skills": ["nlp", "computer vision", "kubernetes", "docker", "aws", "mlops"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["python", "ml", "deep learning", "tensorflow", "pytorch", "deployment", "mlops"],
            "preferred_skills": ["kubernetes", "docker", "aws", "gcp", "research", "publications", "system design"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 7
        }
    },
    "data_engineer": {
        "fresher": {
            "required_skills": ["python", "sql", "etl", "data pipeline", "hadoop"],
            "preferred_skills": ["spark", "scala", "aws", "azure", "kafka", "airflow"],
            "technical_weight": 0.6,
            "business_weight": 0.2,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["python", "sql", "etl", "data pipeline", "spark", "aws"],
            "preferred_skills": ["scala", "kafka", "airflow", "docker", "kubernetes", "hive"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["python", "sql", "etl", "spark", "aws", "data architecture", "system design"],
            "preferred_skills": ["scala", "kafka", "kubernetes", "ci/cd", "performance tuning", "leadership"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 7
        }
    },
    "database_admin": {
        "fresher": {
            "required_skills": ["sql", "database", "mysql", "postgresql", "backup"],
            "preferred_skills": ["sql server", "oracle", "monitoring", "performance", "security"],
            "technical_weight": 0.6,
            "business_weight": 0.2,
            "soft_weight": 0.2,
            "min_words": 280,
            "min_skills": 3
        },
        "intermediate": {
            "required_skills": ["sql", "database", "mysql", "postgresql", "backup", "monitoring"],
            "preferred_skills": ["sql server", "oracle", "performance tuning", "security", "replication"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 380,
            "min_skills": 5
        },
        "experienced": {
            "required_skills": ["sql", "database", "mysql", "postgresql", "backup", "monitoring", "performance tuning"],
            "preferred_skills": ["sql server", "oracle", "security", "high availability", "disaster recovery"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 480,
            "min_skills": 7
        }
    },
    "business_analyst": {
        "fresher": {
            "required_skills": ["sql", "excel", "analytics", "requirements", "business"],
            "preferred_skills": ["power bi", "tableau", "python", "visualization", "communication"],
            "technical_weight": 0.35,
            "business_weight": 0.5,
            "soft_weight": 0.15,
            "min_words": 280,
            "min_skills": 3
        },
        "intermediate": {
            "required_skills": ["sql", "excel", "analytics", "requirements", "business intelligence", "python"],
            "preferred_skills": ["power bi", "tableau", "visualization", "communication", "project management"],
            "technical_weight": 0.4,
            "business_weight": 0.45,
            "soft_weight": 0.15,
            "min_words": 380,
            "min_skills": 5
        },
        "experienced": {
            "required_skills": ["sql", "excel", "analytics", "business intelligence", "python", "project management"],
            "preferred_skills": ["power bi", "tableau", "visualization", "communication", "leadership", "strategy"],
            "technical_weight": 0.35,
            "business_weight": 0.5,
            "soft_weight": 0.15,
            "min_words": 480,
            "min_skills": 6
        }
    },
    "backend_developer": {
        "fresher": {
            "required_skills": ["python", "java", "nodejs", "api", "sql", "database"],
            "preferred_skills": ["rest", "microservices", "git", "docker", "testing", "design patterns"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 280,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["python", "java", "nodejs", "api", "sql", "database", "microservices"],
            "preferred_skills": ["rest", "docker", "kubernetes", "git", "testing", "ci/cd"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 380,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["python", "java", "nodejs", "api", "database", "microservices", "system design"],
            "preferred_skills": ["docker", "kubernetes", "ci/cd", "aws", "gcp", "performance optimization"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 480,
            "min_skills": 7
        }
    },
    "frontend_developer": {
        "fresher": {
            "required_skills": ["javascript", "html", "css", "react", "git"],
            "preferred_skills": ["typescript", "angular", "vue", "css", "responsive design", "testing"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 260,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["javascript", "react", "html", "css", "git", "api"],
            "preferred_skills": ["typescript", "webpack", "responsive design", "testing", "performance", "ui/ux"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 360,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["javascript", "react", "typescript", "git", "design patterns", "testing"],
            "preferred_skills": ["webpack", "performance optimization", "accessibility", "ui/ux", "aws", "ci/cd"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 460,
            "min_skills": 7
        }
    },
    "fullstack_developer": {
        "fresher": {
            "required_skills": ["javascript", "python", "react", "nodejs", "sql", "database"],
            "preferred_skills": ["typescript", "html", "css", "api", "git", "docker"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 5
        },
        "intermediate": {
            "required_skills": ["javascript", "react", "nodejs", "python", "database", "sql", "api"],
            "preferred_skills": ["typescript", "docker", "git", "testing", "microservices", "ci/cd"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 7
        },
        "experienced": {
            "required_skills": ["javascript", "react", "nodejs", "python", "database", "system design", "api"],
            "preferred_skills": ["typescript", "docker", "kubernetes", "ci/cd", "aws", "performance"],
            "technical_weight": 0.8,
            "business_weight": 0.0,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 8
        }
    },
    "software_developer": {
        "fresher": {
            "required_skills": ["java", "python", "c++", "oop", "git", "data structures"],
            "preferred_skills": ["design patterns", "testing", "api", "database", "algorithms"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 280,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["java", "python", "oop", "design patterns", "testing", "git"],
            "preferred_skills": ["api", "database", "ci/cd", "microservices", "docker"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 380,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["java", "python", "design patterns", "system architecture", "testing"],
            "preferred_skills": ["microservices", "docker", "ci/cd", "aws", "performance optimization"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 480,
            "min_skills": 7
        }
    },
    "software_tester": {
        "fresher": {
            "required_skills": ["testing", "qa", "test automation", "bug tracking", "sql"],
            "preferred_skills": ["selenium", "jira", "manual testing", "api testing", "documentation"],
            "technical_weight": 0.5,
            "business_weight": 0.3,
            "soft_weight": 0.2,
            "min_words": 260,
            "min_skills": 3
        },
        "intermediate": {
            "required_skills": ["testing", "test automation", "selenium", "sql", "api testing"],
            "preferred_skills": ["jira", "performance testing", "mobile testing", "ci/cd", "python"],
            "technical_weight": 0.55,
            "business_weight": 0.25,
            "soft_weight": 0.2,
            "min_words": 360,
            "min_skills": 5
        },
        "experienced": {
            "required_skills": ["testing", "test automation", "selenium", "api testing", "performance testing"],
            "preferred_skills": ["ci/cd", "python", "mobile testing", "test strategy", "leadership"],
            "technical_weight": 0.6,
            "business_weight": 0.2,
            "soft_weight": 0.2,
            "min_words": 460,
            "min_skills": 6
        }
    },
    "devops_engineer": {
        "fresher": {
            "required_skills": ["docker", "kubernetes", "linux", "git", "ci/cd"],
            "preferred_skills": ["aws", "jenkins", "terraform", "monitoring", "bash"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 280,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["docker", "kubernetes", "linux", "ci/cd", "aws"],
            "preferred_skills": ["jenkins", "terraform", "monitoring", "bash", "ansible"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 380,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["docker", "kubernetes", "aws", "ci/cd", "infrastructure as code"],
            "preferred_skills": ["terraform", "monitoring", "ansible", "gcp", "azure"],
            "technical_weight": 0.8,
            "business_weight": 0.0,
            "soft_weight": 0.2,
            "min_words": 480,
            "min_skills": 7
        }
    },
    "cloud_architect": {
        "fresher": {
            "required_skills": ["aws", "cloud design", "ec2", "s3", "security"],
            "preferred_skills": ["azure", "gcp", "load balancing", "auto-scaling", "monitoring"],
            "technical_weight": 0.65,
            "business_weight": 0.15,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["aws", "azure", "cloud design", "security", "cost optimization"],
            "preferred_skills": ["gcp", "terraform", "microservices", "disaster recovery", "compliance"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["aws", "azure", "gcp", "cloud architecture", "security", "cost optimization"],
            "preferred_skills": ["terraform", "microservices", "disaster recovery", "compliance", "leadership"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 7
        }
    },
    "security_engineer": {
        "fresher": {
            "required_skills": ["security", "encryption", "penetration testing", "firewalls", "network"],
            "preferred_skills": ["vulnerability assessment", "security tools", "linux", "api security"],
            "technical_weight": 0.7,
            "business_weight": 0.1,
            "soft_weight": 0.2,
            "min_words": 300,
            "min_skills": 4
        },
        "intermediate": {
            "required_skills": ["security", "penetration testing", "encryption", "firewalls", "incident response"],
            "preferred_skills": ["siem", "vulnerability assessment", "secure coding", "api security", "linux"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 400,
            "min_skills": 6
        },
        "experienced": {
            "required_skills": ["security architecture", "penetration testing", "incident response", "compliance"],
            "preferred_skills": ["siem", "vulnerability management", "secure coding", "risk assessment"],
            "technical_weight": 0.75,
            "business_weight": 0.05,
            "soft_weight": 0.2,
            "min_words": 500,
            "min_skills": 7
        }
    }
}

ATS_KEYWORDS = {
    "format": ["pdf", "docx", "clean formatting", "readable"],
    "structure": ["education", "experience", "skills", "projects"],
    "bad_words": ["photograph", "image", "graphics", "fancy fonts"],
    "required_sections": ["contact", "experience", "education"]
}

def calculate_skill_match(extracted_skills, role, level="intermediate"):
    if role not in ROLE_REQUIREMENTS or level not in ROLE_REQUIREMENTS[role]:
        role = "data_analyst"
        level = "intermediate"
    
    requirements = ROLE_REQUIREMENTS[role].get(level, ROLE_REQUIREMENTS[role]["intermediate"])
    all_required = set(requirements["required_skills"])
    all_preferred = set(requirements["preferred_skills"])
    
    found_required = set()
    for category in extracted_skills.values():
        for skill in category:
            if skill in all_required:
                found_required.add(skill)
    
    found_preferred = set()
    for category in extracted_skills.values():
        for skill in category:
            if skill in all_preferred:
                found_preferred.add(skill)
    
    required_match = len(found_required) / len(all_required) if all_required else 0
    preferred_match = len(found_preferred) / len(all_preferred) if all_preferred else 0
    
    score = (required_match * 0.7 + preferred_match * 0.3) * 100
    score = min(100, max(0, score))
    
    return score, list(found_required), list(found_preferred)

def calculate_overall_score(skill_match_score, ats_score, word_count, role, level="intermediate"):
    if role not in ROLE_REQUIREMENTS or level not in ROLE_REQUIREMENTS[role]:
        role = "data_analyst"
        level = "intermediate"
    
    requirements = ROLE_REQUIREMENTS[role].get(level, ROLE_REQUIREMENTS[role]["intermediate"])
    
    length_score = 100 if word_count >= requirements["min_words"] else (word_count / requirements["min_words"]) * 100
    
    weights = {
        "skill_match": requirements["technical_weight"],
        "ats": requirements["business_weight"],
        "length": requirements["soft_weight"]
    }
    
    overall = (
        skill_match_score * weights["skill_match"] +
        ats_score * weights["ats"] +
        length_score * weights["length"]
    )
    
    return min(100, max(0, overall))

def calculate_ats_score(text, filename):
    text_lower = text.lower()
    score = 50
    
    if not filename.endswith((".pdf", ".docx")):
        score -= 30
    
    required_sections = ["education", "experience", "skills"]
    sections_found = sum(1 for section in required_sections if section in text_lower)
    score += (sections_found / 3) * 30
    
    bad_patterns = ["photograph", "image", "fancy"]
    found_bad = sum(1 for pattern in bad_patterns if pattern in text_lower)
    score -= found_bad * 5
    
    if len(text) < 200:
        score -= 20
    
    if "@" not in text or not any(char.isdigit() for char in text):
        score -= 10
    
    return min(100, max(0, score))

def get_missing_skills(extracted_skills, role, level="intermediate"):
    if role not in ROLE_REQUIREMENTS or level not in ROLE_REQUIREMENTS[role]:
        role = "data_analyst"
        level = "intermediate"
    
    requirements = ROLE_REQUIREMENTS[role].get(level, ROLE_REQUIREMENTS[role]["intermediate"])
    all_skills = set(requirements["required_skills"] + requirements["preferred_skills"])
    
    found_skills = set()
    for category in extracted_skills.values():
        for skill in category:
            found_skills.add(skill)
    
    missing = list(all_skills - found_skills)
    return missing

def analyze_resume(extracted_data, role="data_analyst", level="intermediate"):
    skills = extracted_data["skills"]
    text = extracted_data["raw_text"]
    word_count = extracted_data["word_count"]
    
    skill_match_score, found_required, found_preferred = calculate_skill_match(skills, role, level)
    ats_score = calculate_ats_score(text, "resume.pdf")
    overall_score = calculate_overall_score(skill_match_score, ats_score, word_count, role, level)
    
    missing_skills = get_missing_skills(skills, role, level)
    
    return {
        "overall_score": overall_score,
        "skill_match_score": skill_match_score,
        "ats_score": ats_score,
        "found_required_skills": found_required,
        "found_preferred_skills": found_preferred,
        "missing_skills": missing_skills,
        "word_count": word_count,
        "all_extracted_skills": skills
    }
