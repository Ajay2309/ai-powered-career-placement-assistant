
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Jobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setMessage("");

            // Fetch jobs recommended for the logged-in student
            const response = await api.get("/jobs/recommendations/me");

            const data = response.data;
            setJobs(Array.isArray(data) ? data : data.recommendations || []);
        } catch (error) {
            const detail = error.response?.data?.detail;

            setMessage(
                typeof detail === "string"
                    ? detail
                    : "Unable to load job recommendations. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    Job Recommendations
                </h1>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
                >
                    Back to Dashboard
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Recommended Jobs
                </h2>

                <p className="text-slate-600 mb-8">
                    Explore job opportunities that match your skills and qualifications.
                </p>

                {loading && (
                    <p className="text-blue-600 font-medium">
                        Loading job recommendations...
                    </p>
                )}

                {!loading && message && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                        {message}
                        <button
                            onClick={fetchJobs}
                            className="ml-3 underline font-semibold"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !message && jobs.length === 0 && (
                    <div className="bg-white p-8 rounded-xl shadow text-center">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            No job recommendations found
                        </h3>
                        <p className="text-slate-600">
                            Upload and analyze your resume to get personalized job recommendations.
                        </p>
                        <button
                            onClick={() => navigate("/resume")}
                            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                        >
                            Analyze My Resume
                        </button>
                    </div>
                )}

                {!loading && !message && jobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.map((job, index) => (
                            <div
                                key={job.job_id || job.id || index}
                                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {job.title || job.job_title || "Job Opportunity"}
                                </h3>

                                <p className="text-blue-600 font-semibold mb-3">
                                    {job.company || job.company_name || "Company not specified"}
                                </p>

                                <div className="space-y-2 text-slate-600">
                                    <p>
                                        <strong>Location:</strong>{" "}
                                        {job.location || "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Matched Skills:</strong>{" "}
                                        {job.matched_skills?.length
                                            ? job.matched_skills.join(", ")
                                            : "None"}
                                    </p>

                                    <p>
                                        <strong>Missing Skills:</strong>{" "}
                                        {job.missing_skills?.length
                                            ? job.missing_skills.join(", ")
                                            : "None"}
                                    </p>

                                    <p>
                                        <strong>Match Percentage:</strong>{" "}
                                        {job.match_percentage !== undefined
                                            ? `${job.match_percentage}%`
                                            : "Not available"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Jobs;
