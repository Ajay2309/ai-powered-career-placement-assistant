
TECHNICAL_QUESTIONS = {
    "python": [
        "What are the main features of Python?",
        "What is the difference between a list and a tuple?",
        "Explain the concept of object-oriented programming in Python.",
        "What are Python decorators?",
    ],
    "sql": [
        "What is the difference between SQL and NoSQL databases?",
        "Explain the different types of SQL joins.",
        "What is the difference between DELETE, TRUNCATE, and DROP?",
        "What is database normalization?",
    ],
    "fastapi": [
        "What is FastAPI, and what are its main advantages?",
        "What is the difference between GET and POST requests?",
        "What is dependency injection in FastAPI?",
        "How does FastAPI validate request data?",
    ],
    "git": [
        "What is Git, and why is it used?",
        "What is the difference between Git and GitHub?",
        "Explain the purpose of git commit, git push, and git pull.",
        "What is a Git branch?",
    ],
    "machine learning": [
        "What is machine learning?",
        "Explain supervised and unsupervised learning.",
        "What is overfitting in machine learning?",
        "What is the difference between classification and regression?",
    ],
    "javascript": [
        "What is the difference between var, let, and const?",
        "What is the DOM in JavaScript?",
        "Explain promises and async/await.",
        "What is event bubbling?",
    ],
    "react": [
        "What are React components?",
        "What is the difference between props and state?",
        "What are React hooks?",
        "What is the purpose of useEffect?",
    ],
    "html": [
        "What is semantic HTML?",
        "What is the difference between div and span?",
        "What are HTML forms?",
    ],
    "css": [
        "What is the CSS box model?",
        "What is the difference between Flexbox and Grid?",
        "How do you make a website responsive?",
    ],
}

HR_QUESTIONS = [
    "Tell me about yourself.",
    "What are your strengths and weaknesses?",
    "Why should we hire you?",
    "Describe a challenging project you have worked on.",
    "Where do you see yourself in five years?",
]


def generate_interview_questions(
    resume_skills: list[str],
    required_skills: list[str],
    job_title: str,
    technical_question_limit: int = 10,
) -> dict:
    """Generate technical and HR interview questions with answer guidance."""

    all_skills = list(dict.fromkeys(
        skill.strip()
        for skill in resume_skills + required_skills
        if skill.strip()
    ))

    technical_questions = []
    selected_skills = []

    for skill in all_skills:
        questions = TECHNICAL_QUESTIONS.get(skill.lower(), [])

        for question in questions:
            if question not in technical_questions:
                technical_questions.append(question)
                selected_skills.append(skill)

            if len(technical_questions) >= technical_question_limit:
                break

        if len(technical_questions) >= technical_question_limit:
            break

    # Add general technical questions if needed.
    if len(technical_questions) < technical_question_limit:
        for skill in all_skills:
            questions = [
                f"How have you used {skill} in your academic or personal projects?",
                f"What challenges have you faced while working with {skill}?",
            ]

            for question in questions:
                if question not in technical_questions:
                    technical_questions.append(question)
                    selected_skills.append(skill)

                if len(technical_questions) >= technical_question_limit:
                    break

            if len(technical_questions) >= technical_question_limit:
                break

    # Technical questions with suggested answers.
    interview_questions = []

    for skill, question in zip(selected_skills, technical_questions):
        suggested_answer = (
            f"To answer this question about {skill}, start by explaining "
            f"the relevant concept clearly. Then describe how you have used "
            f"{skill} in a project, assignment, or practical exercise. "
            f"Explain the problem you faced, the approach you took, "
            f"and the result. Finally, mention what you learned. "
            f"Make sure your answer specifically addresses: {question}"
        )

        interview_questions.append({
            "skill": skill,
            "question": question,
            "answer": suggested_answer,
        })

    # HR questions with suggested answer guidance.
    hr_interview_questions = []

    for question in HR_QUESTIONS:
        hr_interview_questions.append({
            "question": question,
            "answer": (
                "Answer honestly and confidently. Use a specific example "
                "from your academic experience, projects, internships, "
                "or personal learning where appropriate. Structure your "
                "answer clearly, explain your reasoning, and connect "
                "your response to the job role. Avoid memorizing "
                "answers word-for-word."
            ),
        })

    # Return interview preparation data.
    return {
        "job_title": job_title,
        "technical_questions": interview_questions,
        "hr_questions": hr_interview_questions,
    }