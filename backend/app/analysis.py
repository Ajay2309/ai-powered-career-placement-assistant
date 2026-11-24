
import re


TECHNICAL_SKILLS = [
    "Python",
    "Java",
    "C",
    "C++",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "FastAPI",
    "Django",
    "Flask",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Data Science",
    "Pandas",
    "NumPy",
    "TensorFlow",
    "PyTorch",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Microsoft Azure",
    "Linux",
    "REST API",
]


def analyze_resume_text(text: str) -> dict:
    """Identify technical skills and basic resume statistics."""

    found_skills = []

    for skill in TECHNICAL_SKILLS:
        pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"

        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)

    words = re.findall(r"\b[\w+#.]+\b", text)
    word_count = len(words)

    suggestions = []

    if word_count < 150:
        suggestions.append(
            "Your resume appears short. Consider adding more details about your education, projects, and experience."
        )

    if not found_skills:
        suggestions.append(
            "Add a dedicated technical skills section to highlight your abilities."
        )

    if "project" not in text.lower():
        suggestions.append(
            "Include an academic or personal projects section."
        )

    if "education" not in text.lower():
        suggestions.append(
            "Add an education section with your degree and graduation year."
        )

    if "experience" not in text.lower():
        suggestions.append(
            "Include internships, work experience, or relevant practical experience if available."
        )

    if not suggestions:
        suggestions.append(
            "Your resume contains several useful sections. Continue improving it with measurable project achievements."
        )

    return {
        "skills": found_skills,
        "total_skills": len(found_skills),
        "word_count": word_count,
        "suggestions": suggestions,
    }


def calculate_job_match(resume_skills: list[str], required_skills: list[str]) -> dict:
    """Calculate compatibility between resume skills and job requirements."""

    resume_skill_set = {
        skill.strip().lower()
        for skill in resume_skills
        if skill.strip()
    }

    required_skill_set = {
        skill.strip().lower()
        for skill in required_skills
        if skill.strip()
    }

    matched_skills = sorted(
        resume_skill_set.intersection(required_skill_set)
    )

    missing_skills = sorted(
        required_skill_set - resume_skill_set
    )

    if not required_skill_set:
        match_percentage = 0
    else:
        match_percentage = round(
            (len(matched_skills) / len(required_skill_set)) * 100
        )

    return {
        "match_percentage": match_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }
