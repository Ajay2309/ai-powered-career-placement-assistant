
import { useEffect, useState } from "react";
import api from "../services/api";

function Assessment() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [topic, setTopic] = useState("All");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadQuestions = async (selectedTopic = topic) => {
        try {
            setLoading(true);
            setError("");
            setResult(null);
            setAnswers({});

            const response = await api.get("/assessment/questions", {
                params: selectedTopic === "All" ? {} : { topic: selectedTopic },
            });

            setQuestions(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Unable to load questions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions("All");
    }, []);

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            setError(`Please answer all ${questions.length} questions before submitting.`);
            return;
        }

        if (!window.confirm("Are you sure you want to submit your assessment?")) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const submission = {
                answers: questions.map((question) => ({
                    question_id: question.id,
                    selected_answer: answers[question.id],
                })),
            };

            const response = await api.post("/assessment/submit", submission);
            setResult(response.data);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setError(err.response?.data?.detail || "Unable to submit assessment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
                <h1 className="text-xl font-bold">Mock Assessment</h1>
                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                    Dashboard
                </button>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-2">Test Your Knowledge</h2>
                <p className="text-slate-600 mb-6">
                    Select your answers and click Submit Assessment when you are ready.
                </p>

                {!result && (
                    <div className="bg-white rounded-xl shadow p-5 mb-6">
                        <label className="font-semibold mr-3">Select Topic:</label>
                        <select
                            value={topic}
                            disabled={loading}
                            onChange={(e) => {
                                const selected = e.target.value;
                                setTopic(selected);
                                loadQuestions(selected);
                            }}
                            className="border rounded-lg p-2"
                        >
                            <option value="All">All</option>
                            <option value="Python">Python</option>
                            <option value="SQL">SQL</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="React">React</option>
                            <option value="HTML">HTML</option>
                            <option value="CSS">CSS</option>
                        </select>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center py-10">Loading questions...</p>
                ) : result ? (
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-2xl font-bold text-green-700 mb-5">
                            Assessment Completed!
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                ["Score", `${result.score_percentage}%`],
                                ["Total", result.total_questions],
                                ["Correct", result.correct_answers],
                                ["Incorrect", result.incorrect_answers],
                            ].map(([label, value]) => (
                                <div key={label} className="bg-slate-100 rounded-lg p-4 text-center">
                                    <p className="text-sm text-slate-500">{label}</p>
                                    <p className="text-2xl font-bold">{value}</p>
                                </div>
                            ))}
                        </div>

                        <h4 className="text-xl font-bold mb-3">Topic Performance</h4>

                        {Object.entries(result.topic_performance || {}).map(([name, data]) => (
                            <div key={name} className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <span>{name}</span>
                                    <span>{data.score_percentage}%</span>
                                </div>
                                <div className="bg-slate-200 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full"
                                        style={{ width: `${data.score_percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        <h4 className="text-xl font-bold mt-7 mb-4">Answer Review</h4>

                        {result.results?.map((item, index) => (
                            <div key={item.question_id} className="border rounded-lg p-4 mb-3">
                                <p className="font-semibold">
                                    {index + 1}. {item.topic}
                                </p>
                                <p className="mt-2">Your answer: {item.selected_answer}</p>
                                <p className="text-green-700">
                                    Correct answer: {item.correct_answer}
                                </p>
                                <p className="text-slate-600 mt-2">{item.explanation}</p>
                                <p className={`font-semibold mt-2 ${
                                    item.is_correct ? "text-green-600" : "text-red-600"
                                }`}>
                                    {item.is_correct ? "Correct" : "Incorrect"}
                                </p>
                            </div>
                        ))}

                        <button
                            onClick={() => loadQuestions(topic)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-5"
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() => window.location.href = "/assessment-history"}
                            className="bg-slate-800 text-white px-6 py-3 rounded-lg mt-5 ml-3"
                        >
                            View History
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-semibold">
                                Total questions: {questions.length}
                            </p>
                            <p className="text-blue-700 font-semibold">
                                Answered: {Object.keys(answers).length}/{questions.length}
                            </p>
                        </div>

                        {questions.map((question, index) => (
                            <div key={question.id} className="bg-white rounded-xl shadow p-6 mb-5">
                                <p className="text-sm text-blue-600 font-semibold">
                                    {question.topic}
                                </p>

                                <h3 className="text-lg font-semibold my-3">
                                    {index + 1}. {question.question}
                                </h3>

                                <div className="space-y-3">
                                    {question.options.map((option) => (
                                        <label
                                            key={option}
                                            className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${
                                                answers[question.id] === option
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option}
                                                checked={answers[question.id] === option}
                                                onChange={() => {
                                                    setAnswers((previous) => ({
                                                        ...previous,
                                                        [question.id]: option,
                                                    }));
                                                }}
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {questions.length > 0 && (
                            <div className="bg-white rounded-xl shadow p-6 mt-6 mb-10">
                                <p className="font-semibold text-slate-700 mb-4">
                                    Answered: {Object.keys(answers).length} / {questions.length}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full !bg-blue-700 hover:!bg-blue-800 !text-white font-extrabold py-4 px-6 rounded-xl text-xl border-2 border-blue-900 shadow-lg cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "⬇ SUBMIT ASSESSMENT"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Assessment;
