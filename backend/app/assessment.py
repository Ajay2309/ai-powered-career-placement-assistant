
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_student

router = APIRouter(prefix="/assessment", tags=["Assessment"])

ASSESSMENT_QUESTIONS = [
    # Python
    {"id": 1, "topic": "Python", "question": "Which keyword defines a function in Python?", "options": ["function", "def", "fun", "define"], "correct_answer": "def", "explanation": "The def keyword defines a function."},
    {"id": 2, "topic": "Python", "question": "Which data type is mutable?", "options": ["Tuple", "String", "List", "Integer"], "correct_answer": "List", "explanation": "Lists can be modified after creation."},
    {"id": 3, "topic": "Python", "question": "What is the output of len('Python')?", "options": ["5", "6", "7", "8"], "correct_answer": "6", "explanation": "Python contains six characters."},
    {"id": 4, "topic": "Python", "question": "Which symbol is used for comments in Python?", "options": ["//", "#", "/*", "--"], "correct_answer": "#", "explanation": "The # symbol begins a single-line comment."},
    {"id": 5, "topic": "Python", "question": "Which keyword handles exceptions?", "options": ["catch", "error", "try", "final"], "correct_answer": "try", "explanation": "Python uses try and except to handle exceptions."},

    # SQL
    {"id": 6, "topic": "SQL", "question": "Which SQL command retrieves data?", "options": ["INSERT", "UPDATE", "SELECT", "DELETE"], "correct_answer": "SELECT", "explanation": "SELECT retrieves records from a database."},
    {"id": 7, "topic": "SQL", "question": "Which clause filters records?", "options": ["ORDER BY", "WHERE", "GROUP BY", "JOIN"], "correct_answer": "WHERE", "explanation": "WHERE filters records using conditions."},
    {"id": 8, "topic": "SQL", "question": "Which command removes a table completely?", "options": ["DELETE", "REMOVE", "DROP", "CLEAR"], "correct_answer": "DROP", "explanation": "DROP removes the table structure and its data."},
    {"id": 9, "topic": "SQL", "question": "Which JOIN returns matching rows from both tables?", "options": ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], "correct_answer": "INNER JOIN", "explanation": "INNER JOIN returns rows with matching values in both tables."},
    {"id": 10, "topic": "SQL", "question": "Which function counts rows?", "options": ["SUM()", "COUNT()", "TOTAL()", "NUMBER()"], "correct_answer": "COUNT()", "explanation": "COUNT() returns the number of rows."},

    # Machine Learning
    {"id": 11, "topic": "Machine Learning", "question": "Which learning type uses labeled data?", "options": ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Deep Learning"], "correct_answer": "Supervised Learning", "explanation": "Supervised learning uses labeled training examples."},
    {"id": 12, "topic": "Machine Learning", "question": "What is overfitting?", "options": ["Poor training performance", "Memorizing training data and generalizing poorly", "No model parameters", "Always predicting one output"], "correct_answer": "Memorizing training data and generalizing poorly", "explanation": "Overfitting occurs when a model learns training data too closely."},
    {"id": 13, "topic": "Machine Learning", "question": "Which task predicts a continuous value?", "options": ["Classification", "Regression", "Clustering", "Sorting"], "correct_answer": "Regression", "explanation": "Regression predicts continuous numerical values."},
    {"id": 14, "topic": "Machine Learning", "question": "Which algorithm is commonly used for classification?", "options": ["Linear Regression", "Logistic Regression", "K-Means only", "PCA"], "correct_answer": "Logistic Regression", "explanation": "Logistic Regression is commonly used for classification."},

    # JavaScript
    {"id": 15, "topic": "JavaScript", "question": "Which keyword declares a block-scoped variable that can be reassigned?", "options": ["var", "let", "const", "static"], "correct_answer": "let", "explanation": "let declares a block-scoped reassignable variable."},
    {"id": 16, "topic": "JavaScript", "question": "Which method converts JSON text into a JavaScript object?", "options": ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"], "correct_answer": "JSON.parse()", "explanation": "JSON.parse() converts JSON text into a JavaScript value."},
    {"id": 17, "topic": "JavaScript", "question": "Which operator checks both value and type equality?", "options": ["==", "=", "===", "!="], "correct_answer": "===", "explanation": "The strict equality operator checks value and type."},
    {"id": 18, "topic": "JavaScript", "question": "Which method adds an item to the end of an array?", "options": ["push()", "pop()", "shift()", "unshift()"], "correct_answer": "push()", "explanation": "push() adds an item to the end of an array."},

    # React
    {"id": 19, "topic": "React", "question": "What is React primarily used for?", "options": ["Database management", "Building user interfaces", "Operating systems", "Networking"], "correct_answer": "Building user interfaces", "explanation": "React is a library for building user interfaces."},
    {"id": 20, "topic": "React", "question": "Which hook manages state in a function component?", "options": ["useEffect", "useState", "useRef", "useMemo"], "correct_answer": "useState", "explanation": "useState adds state to function components."},
    {"id": 21, "topic": "React", "question": "What are props used for?", "options": ["Passing data to components", "Creating databases", "Styling only", "Routing only"], "correct_answer": "Passing data to components", "explanation": "Props pass data from parent components to child components."},
    {"id": 22, "topic": "React", "question": "Which hook is commonly used for side effects?", "options": ["useState", "useEffect", "useContext", "useId"], "correct_answer": "useEffect", "explanation": "useEffect handles side effects such as data fetching."},

    # HTML
    {"id": 23, "topic": "HTML", "question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Transfer Markup Link", "Home Tool Markup Language"], "correct_answer": "Hyper Text Markup Language", "explanation": "HTML stands for Hyper Text Markup Language."},
    {"id": 24, "topic": "HTML", "question": "Which tag creates a hyperlink?", "options": ["<link>", "<a>", "<href>", "<url>"], "correct_answer": "<a>", "explanation": "The a element creates hyperlinks."},
    {"id": 25, "topic": "HTML", "question": "Which tag displays an image?", "options": ["<picture-text>", "<img>", "<image>", "<src>"], "correct_answer": "<img>", "explanation": "The img element embeds an image."},
    {"id": 26, "topic": "HTML", "question": "Which attribute provides alternative text for an image?", "options": ["title", "src", "alt", "name"], "correct_answer": "alt", "explanation": "The alt attribute provides alternative text."},

    # CSS
    {"id": 27, "topic": "CSS", "question": "What does CSS stand for?", "options": ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], "correct_answer": "Cascading Style Sheets", "explanation": "CSS stands for Cascading Style Sheets."},
    {"id": 28, "topic": "CSS", "question": "Which property changes text color?", "options": ["font-color", "text-style", "color", "background"], "correct_answer": "color", "explanation": "The color property sets text color."},
    {"id": 29, "topic": "CSS", "question": "Which layout system is one-dimensional?", "options": ["CSS Grid", "Flexbox", "Table layout", "Positioning"], "correct_answer": "Flexbox", "explanation": "Flexbox is designed primarily for one-dimensional layouts."},
    {"id": 30, "topic": "CSS", "question": "Which CSS property controls space inside an element's border?", "options": ["margin", "padding", "outline", "gap"], "correct_answer": "padding", "explanation": "Padding controls the space between content and border."},
]


def get_assessment_questions(topic: str | None = None) -> list[dict]:
    if topic is None or topic.lower() == "all":
        questions = ASSESSMENT_QUESTIONS
    else:
        questions = [
            q for q in ASSESSMENT_QUESTIONS
            if q["topic"].lower() == topic.lower()
        ]

    return [
        {
            "id": q["id"],
            "topic": q["topic"],
            "question": q["question"],
            "options": q["options"],
        }
        for q in questions
    ]


def evaluate_assessment(answers: list[dict]) -> dict:
    question_lookup = {q["id"]: q for q in ASSESSMENT_QUESTIONS}

    results = []
    correct_count = 0
    topic_scores = {}

    for answer in answers:
        question = question_lookup.get(answer.get("question_id"))
        if question is None:
            continue

        selected = answer.get("selected_answer", "")
        is_correct = selected.strip().lower() == question["correct_answer"].lower()

        if is_correct:
            correct_count += 1

        topic = question["topic"]
        topic_scores.setdefault(topic, {"total": 0, "correct": 0})
        topic_scores[topic]["total"] += 1

        if is_correct:
            topic_scores[topic]["correct"] += 1

        results.append({
            "question_id": question["id"],
            "topic": topic,
            "selected_answer": selected,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct,
            "explanation": question["explanation"],
        })

    total = len(results)
    percentage = round(correct_count / total * 100) if total else 0

    topic_performance = {
        topic: {
            "total_questions": scores["total"],
            "correct_answers": scores["correct"],
            "score_percentage": round(scores["correct"] / scores["total"] * 100),
        }
        for topic, scores in topic_scores.items()
    }

    return {
        "total_questions": total,
        "correct_answers": correct_count,
        "incorrect_answers": total - correct_count,
        "score_percentage": percentage,
        "topic_performance": topic_performance,
        "results": results,
    }


@router.get("/questions", response_model=list[schemas.AssessmentQuestion])
def get_questions(
    topic: str | None = None,
    current_student: models.Student = Depends(get_current_student),
):
    questions = get_assessment_questions(topic)
    if not questions:
        raise HTTPException(status_code=404, detail="No assessment questions found.")
    return questions


@router.post("/submit", response_model=schemas.AssessmentResponse)
def submit_assessment(
    submission: schemas.AssessmentSubmit,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    question_ids = [answer.question_id for answer in submission.answers]

    if not question_ids:
        raise HTTPException(status_code=400, detail="Please answer the assessment questions.")

    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(status_code=400, detail="Duplicate question IDs are not allowed.")

    valid_ids = {q["id"] for q in ASSESSMENT_QUESTIONS}
    if any(qid not in valid_ids for qid in question_ids):
        raise HTTPException(status_code=400, detail="Invalid question ID.")

    result = evaluate_assessment([
        answer.model_dump() for answer in submission.answers
    ])

    attempt = models.AssessmentAttempt(
        student_id=current_student.id,
        total_questions=result["total_questions"],
        correct_answers=result["correct_answers"],
        incorrect_answers=result["incorrect_answers"],
        score_percentage=result["score_percentage"],
        topic_performance=result["topic_performance"],
        results=result["results"],
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return result


@router.get("/history", response_model=list[schemas.AssessmentHistoryResponse])
def get_assessment_history(
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.AssessmentAttempt)
        .filter(models.AssessmentAttempt.student_id == current_student.id)
        .order_by(models.AssessmentAttempt.created_at.desc())
        .all()
    )
