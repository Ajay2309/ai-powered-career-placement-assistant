from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_student

router = APIRouter(prefix="/assessment", tags=["Assessment"])

ASSESSMENT_QUESTIONS = [
    {
        "id": 1,
        "topic": "Python",
        "question": "Which keyword is used to define a function in Python?",
        "options": ["function", "def", "fun", "define"],
        "correct_answer": "def",
        "explanation": "The def keyword is used to define a function in Python.",
    },
    {
        "id": 2,
        "topic": "Python",
        "question": "Which data type is mutable in Python?",
        "options": ["Tuple", "String", "List", "Integer"],
        "correct_answer": "List",
        "explanation": "Lists are mutable, meaning their elements can be changed.",
    },
    {
        "id": 3,
        "topic": "Python",
        "question": "What is the output of len('Python')?",
        "options": ["5", "6", "7", "8"],
        "correct_answer": "6",
        "explanation": "The word Python contains six characters.",
    },
    {
        "id": 4,
        "topic": "SQL",
        "question": "Which SQL command retrieves data from a database?",
        "options": ["INSERT", "UPDATE", "SELECT", "DELETE"],
        "correct_answer": "SELECT",
        "explanation": "SELECT is used to retrieve records from a database.",
    },
    {
        "id": 5,
        "topic": "SQL",
        "question": "Which SQL clause is used to filter records?",
        "options": ["ORDER BY", "WHERE", "GROUP BY", "JOIN"],
        "correct_answer": "WHERE",
        "explanation": "WHERE filters records based on specified conditions.",
    },
    {
        "id": 6,
        "topic": "Machine Learning",
        "question": "Which learning type uses labeled training data?",
        "options": [
            "Unsupervised Learning",
            "Supervised Learning",
            "Reinforcement Learning",
            "Deep Learning",
        ],
        "correct_answer": "Supervised Learning",
        "explanation": "Supervised learning trains models using labeled examples.",
    },
    {
        "id": 7,
        "topic": "Machine Learning",
        "question": "What is overfitting?",
        "options": [
            "Model performs poorly on training data",
            "Model memorizes training data and generalizes poorly",
            "Model has no parameters",
            "Model always predicts the same output",
        ],
        "correct_answer": "Model memorizes training data and generalizes poorly",
        "explanation": "Overfitting occurs when a model learns training data too closely.",
    },
]


def get_assessment_questions(topic: str | None = None) -> list[dict]:
    """Return assessment questions, optionally filtered by topic."""

    if topic is None or topic.lower() == "all":
        questions = ASSESSMENT_QUESTIONS
    else:
        questions = [
            question
            for question in ASSESSMENT_QUESTIONS
            if question["topic"].lower() == topic.lower()
        ]

    # Never expose correct answers before submission.
    return [
        {
            "id": question["id"],
            "topic": question["topic"],
            "question": question["question"],
            "options": question["options"],
        }
        for question in questions
    ]


def evaluate_assessment(answers: list[dict]) -> dict:
    """Evaluate submitted answers and calculate the assessment score."""

    question_lookup = {
        question["id"]: question
        for question in ASSESSMENT_QUESTIONS
    }

    results = []
    correct_count = 0
    topic_scores = {}

    for answer in answers:
        question_id = answer.get("question_id")
        selected_answer = answer.get("selected_answer", "")

        question = question_lookup.get(question_id)

        if question is None:
            continue

        is_correct = (
            selected_answer.strip().lower()
            == question["correct_answer"].lower()
        )

        if is_correct:
            correct_count += 1

        topic = question["topic"]

        if topic not in topic_scores:
            topic_scores[topic] = {
                "total": 0,
                "correct": 0,
            }

        topic_scores[topic]["total"] += 1

        if is_correct:
            topic_scores[topic]["correct"] += 1

        results.append({
            "question_id": question_id,
            "topic": topic,
            "selected_answer": selected_answer,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct,
            "explanation": question["explanation"],
        })

    total_questions = len(results)

    score_percentage = (
        round((correct_count / total_questions) * 100)
        if total_questions > 0
        else 0
    )

    topic_performance = {
        topic: {
            "total_questions": scores["total"],
            "correct_answers": scores["correct"],
            "score_percentage": round(
                (scores["correct"] / scores["total"]) * 100
            ),
        }
        for topic, scores in topic_scores.items()
    }

    return {
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "incorrect_answers": total_questions - correct_count,
        "score_percentage": score_percentage,
        "topic_performance": topic_performance,
        "results": results,
    }


@router.get(
    "/questions",
    response_model=list[schemas.AssessmentQuestion],
)
def get_questions(
    topic: str | None = None,
    current_student: models.Student = Depends(get_current_student),
):
    questions = get_assessment_questions(topic)

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No assessment questions found for this topic.",
        )

    return questions



@router.post(
    "/submit",
    response_model=schemas.AssessmentResponse,
)
def submit_assessment(
    submission: schemas.AssessmentSubmit,
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    # Prevent duplicate question submissions.
    question_ids = [
        answer.question_id
        for answer in submission.answers
    ]

    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate question IDs are not allowed.",
        )

    # Validate submitted question IDs.
    valid_question_ids = {
        question["id"]
        for question in ASSESSMENT_QUESTIONS
    }

    if any(
        question_id not in valid_question_ids
        for question_id in question_ids
    ):
        raise HTTPException(
            status_code=400,
            detail="One or more question IDs are invalid.",
        )

    # Evaluate the student's answers.
    result = evaluate_assessment(
        [
            answer.model_dump()
            for answer in submission.answers
        ]
    )

    # Save the assessment result in PostgreSQL.
    assessment_attempt = models.AssessmentAttempt(
        student_id=current_student.id,
        total_questions=result["total_questions"],
        correct_answers=result["correct_answers"],
        incorrect_answers=result["incorrect_answers"],
        score_percentage=result["score_percentage"],
        topic_performance=result["topic_performance"],
        results=result["results"],
    )

    db.add(assessment_attempt)
    db.commit()
    db.refresh(assessment_attempt)

    # Return the assessment result.
    return result

@router.get(
    "/history",
    response_model=list[schemas.AssessmentHistoryResponse],
)
def get_assessment_history(
    current_student: models.Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    attempts = (
        db.query(models.AssessmentAttempt)
        .filter(
            models.AssessmentAttempt.student_id == current_student.id
        )
        .order_by(
            models.AssessmentAttempt.created_at.desc()
        )
        .all()
    )

    return attempts