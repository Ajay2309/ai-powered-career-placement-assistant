
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SkillGap() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [message, setMessage] = useState("");

  // Fetch recommended jobs when the page loads
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch skill gap analysis whenever a job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchSkillGap(selectedJobId);
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

  const fetchSkillGap = async (jobId) => {
    try {
      setLoadingAnalysis(true);
      setAnalysis(null);
      setMessage("");

      const response = await api.get(
        `/jobs/${jobId}/skill-gap`
      );

      setAnalysis(response.data);
    } catch (error) {
      const detail = error.response?.data?.detail;

      setMessage(
        typeof detail === "string"
          ? detail
          : "Unable to generate skill gap analysis."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const matchedSkills = analysis?.matched_skills || [];
  const missingSkills = analysis?.missing_skills || [];

  const recommendations =
    analysis?.learning_recommendations || [];

  const matchPercentage =
    analysis?.match_percentage ?? 0;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Skill Gap Analysis
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
          Analyze Your Skills
        </h2>

        <p className="text-slate-600 mb-8">
          Compare your skills with job requirements and
          discover what you need to learn.
        </p>

        {/* Job Selection */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <label
            htmlFor="jobSelect"
            className="block text-lg font-semibold text-slate-800 mb-3"
          >
            Select a Job
          </label>

          {loadingJobs ? (
            <p className="text-blue-600">
              Loading recommended jobs...
            </p>
          ) : (
            <select
              id="jobSelect"
              value={selectedJobId}
              onChange={(e) =>
                setSelectedJobId(e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">
                Select a job to analyze
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

        {/* Error or Information Message */}
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

        {/* Loading Analysis */}
        {loadingAnalysis && (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-blue-600 font-medium">
              Analyzing your skills for this job...
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {!loadingAnalysis && analysis && (
          <>
            {/* Selected Job Details */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                {analysis.job_title}
              </h3>

              <p className="text-blue-600 font-semibold mt-1">
                {analysis.company}
              </p>
            </div>

            {/* Match Percentage */}
            <div className="bg-white p-8 rounded-xl shadow mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Skill Match Percentage
              </h3>

              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold text-blue-600">
                  {matchPercentage}%
                </div>

                <div className="flex-1">
                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(matchPercentage, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="text-slate-600 mt-2">
                    Your skills match this job's requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Matched and Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Matched Skills */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-bold text-green-700 mb-4">
                  Matched Skills ({matchedSkills.length})
                </h3>

                {matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No matched skills found.
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-bold text-red-700 mb-4">
                  Missing Skills ({missingSkills.length})
                </h3>

                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    You have all the required skills!
                  </p>
                )}
              </div>
            </div>

            {/* Learning Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-5">
                Learning Recommendations
              </h3>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map(
                    (recommendation, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 p-4 rounded-lg"
                      >
                        <div className="flex gap-3 items-start">
                          <span className="bg-blue-100 text-blue-700 font-bold w-8 h-8 flex items-center justify-center rounded-full shrink-0">
                            {index + 1}
                          </span>

                          <p className="text-slate-700">
                            {typeof recommendation === "string"
                              ? recommendation
                              : recommendation.skill ||
                                recommendation.recommendation ||
                                JSON.stringify(recommendation)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-slate-500">
                  No learning recommendations available.
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default SkillGap;
