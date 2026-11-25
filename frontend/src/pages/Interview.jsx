
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Interview() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [interview, setInterview] = useState(null);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchQuestions(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setMessage("");

      const response = await api.get("/jobs/recommendations/me");

      const data = response.data;

      const jobsList = Array.isArray(data)
        ? data
        : data.recommendations || [];

      setJobs(jobsList);

      if (jobsList.length > 0) {
        setSelectedJobId(String(jobsList[0].job_id));
      } else {
        setMessage(
          "No recommended jobs found. Upload and analyze your resume first."
        );
      }
    } catch (error) {
      const detail = error.response?.data?.detail;

      setMessage(
        typeof detail === "string"
          ? detail
          : "Unable to load jobs. Please try again."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchQuestions = async (jobId) => {
    try {
      setLoadingQuestions(true);
      setInterview(null);
      setMessage("");

      const response = await api.get(
        `/jobs/${jobId}/interview-questions`
      );

      setInterview(response.data);
    } catch (error) {
      const detail = error.response?.data?.detail;

      setMessage(
        typeof detail === "string"
          ? detail
          : "Unable to generate interview questions."
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Interview Preparation
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Prepare for Your Interview
        </h2>

        <p className="text-slate-600 mb-8">
          Practice technical and HR interview questions
          personalized for your resume and selected job role.
        </p>

        {/* Job Selection */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <label
            htmlFor="jobSelect"
            className="block text-lg font-semibold text-slate-800 mb-3"
          >
            Select a Job Role
          </label>

          {loadingJobs ? (
            <p className="text-blue-600">
              Loading recommended jobs...
            </p>
          ) : (
            <select
              id="jobSelect"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">
                Select a job to prepare for
              </option>

              {jobs.map((job) => (
                <option
                  key={job.job_id}
                  value={job.job_id}
                >
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error Message */}
        {message && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {message}

            {!loadingJobs && jobs.length === 0 && (
              <button
                onClick={fetchJobs}
                className="ml-3 underline font-semibold"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loadingQuestions && (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-blue-600 font-medium">
              Generating personalized interview questions...
            </p>
          </div>
        )}

        {/* Interview Questions */}
        {!loadingQuestions && interview && (
          <>
            {/* Job Details */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                {interview.job_title}
              </h3>

              <p className="text-blue-600 font-semibold mt-1">
                {interview.company}
              </p>
            </div>

            {/* Technical Questions */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h3 className="text-2xl font-bold text-blue-700 mb-6">
                Technical Interview Questions
              </h3>

              {interview.technical_questions?.length > 0 ? (
                <div className="space-y-5">
                  {interview.technical_questions.map(
                    (question, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-xl p-5"
                      >
                        <div className="flex gap-3 items-start">
                          <span className="bg-blue-100 text-blue-700 font-bold w-9 h-9 flex items-center justify-center rounded-full shrink-0">
                            {index + 1}
                          </span>

                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-lg">
                              {question.question}
                            </p>

                            {question.skill && (
                              <span className="inline-block mt-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                                Skill: {question.skill}
                              </span>
                            )}

                            {question.answer && (
                              <details className="mt-4">
                                <summary className="cursor-pointer text-blue-600 font-medium">
                                  View Suggested Answer
                                </summary>

                                <p className="mt-3 text-slate-700 bg-blue-50 p-4 rounded-lg">
                                  {question.answer}
                                </p>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-slate-500">
                  No technical questions available.
                </p>
              )}
            </div>

            {/* HR Questions */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">
                HR Interview Questions
              </h3>

              {interview.hr_questions?.length > 0 ? (
                <div className="space-y-4">
                  {interview.hr_questions.map(
                    (question, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-xl p-5"
                      >
                        <div className="flex gap-3 items-start">
                          <span className="bg-purple-100 text-purple-700 font-bold w-9 h-9 flex items-center justify-center rounded-full shrink-0">
                            {index + 1}
                          </span>

                          <div className="flex-1">
                            <p className="text-slate-800 font-semibold">
                              {question.question}
                            </p>

                            {question.answer && (
                              <details className="mt-4">
                                <summary className="cursor-pointer text-purple-600 font-medium">
                                  View Suggested Answer
                                </summary>

                                <p className="mt-3 text-slate-700 bg-purple-50 p-4 rounded-lg">
                                  {question.answer}
                                </p>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-slate-500">
                  No HR questions available.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Interview;
