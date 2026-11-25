
import { useEffect, useState } from "react";
import api from "../services/api";

function AssessmentHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await api.get("/assessment/history");
                setHistory(response.data);
            } catch (err) {
                setError(err.response?.data?.detail || "Unable to load assessment history.");
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
                <h1 className="text-xl font-bold">Assessment History</h1>
                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Dashboard
                </button>
            </header>

            <main className="max-w-5xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-2">
                    Your Performance
                </h2>
                <p className="text-slate-600 mb-7">
                    Review your previous assessment attempts and scores.
                </p>

                {loading ? (
                    <p className="text-center py-10">Loading history...</p>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <h3 className="text-xl font-semibold mb-2">
                            No assessments yet
                        </h3>
                        <p className="text-slate-600 mb-5">
                            Complete your first mock assessment to see your results here.
                        </p>
                        <button
                            onClick={() => window.location.href = "/assessment"}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
                        >
                            Start Assessment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {history.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="bg-white rounded-xl shadow p-6"
                            >
                                <div className="flex flex-wrap justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            Assessment #{attempt.id}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {attempt.created_at
                                                ? new Date(attempt.created_at).toLocaleString()
                                                : "Date unavailable"}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-blue-600">
                                            {attempt.score_percentage}%
                                        </p>
                                        <p className="text-sm text-slate-500">Score</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center mb-5">
                                    <div className="bg-slate-100 rounded-lg p-3">
                                        <p className="text-xl font-bold">{attempt.total_questions}</p>
                                        <p className="text-sm text-slate-500">Total</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <p className="text-xl font-bold text-green-700">{attempt.correct_answers}</p>
                                        <p className="text-sm text-slate-500">Correct</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <p className="text-xl font-bold text-red-700">{attempt.incorrect_answers}</p>
                                        <p className="text-sm text-slate-500">Incorrect</p>
                                    </div>
                                </div>

                                <h4 className="font-semibold mb-3">Topic Performance</h4>
                                {Object.entries(attempt.topic_performance || {}).map(([name, data]) => (
                                    <div key={name} className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{name}</span>
                                            <span>{data.score_percentage}%</span>
                                        </div>
                                        <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full"
                                                style={{ width: `${data.score_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AssessmentHistory;
