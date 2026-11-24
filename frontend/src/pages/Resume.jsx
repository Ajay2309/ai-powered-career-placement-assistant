
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Resume() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Handle API errors safely
  const getErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item.msg || "Validation error")
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    return fallback;
  };

  // Display status messages
  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  // Handle PDF selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setMessage("");
    setResume(null);
    setAnalysis(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      showMessage("Please select a PDF file only.", "error");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      showMessage("File size must be less than 5 MB.", "error");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    showMessage("PDF selected successfully.", "success");
  };

  // Upload resume
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      showMessage("Please select a PDF resume first.", "error");
      return;
    }

    setLoading(true);
    setMessage("");
    setResume(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResume(response.data);
      setFile(null);

      showMessage(
        "Your resume has been uploaded successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Resume upload error:",
        error.response?.data || error
      );

      showMessage(
        getErrorMessage(
          error,
          "Resume upload failed. Please try again."
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Analyze uploaded resume
  const handleAnalyze = async () => {
    if (!resume?.resume_id) {
      showMessage("Please upload your resume first.", "error");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setMessage("");

    try {
      const response = await api.get(
        `/resume/${resume.resume_id}/analysis`
      );

      setAnalysis(response.data);

      showMessage(
        "Resume analysis completed successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Resume analysis error:",
        error.response?.data || error
      );

      showMessage(
        getErrorMessage(
          error,
          "Resume analysis failed. Please try again."
        ),
        "error"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Resume Analysis
            </h1>

            <p className="text-slate-500 mt-2">
              Upload your resume and discover your technical skills
              and areas for improvement.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg transition"
          >
            ← Back to Dashboard
          </button>

        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Upload Your Resume
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Upload your resume in PDF format. Maximum file size is 5 MB.
            </p>
          </div>

          <form onSubmit={handleUpload}>

            <div className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 p-8 text-center">

              <div className="text-5xl mb-4">
                📄
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                Select Your Resume
              </h3>

              <p className="text-sm text-slate-500 mt-2 mb-5">
                Choose a PDF file from your computer.
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full max-w-md mx-auto text-sm text-slate-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  disabled:opacity-50"
              />

              {file && (
                <div className="mt-5 text-sm text-green-700 font-medium">
                  Selected file: {file.name}
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Uploading Resume..." : "Upload Resume"}
            </button>

          </form>

          {/* Status Message */}
          {message && (
            <div
              className={`mt-5 p-4 rounded-lg text-sm font-medium ${
                messageType === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {message}
            </div>
          )}

        </div>

        {/* Uploaded Resume Details */}
        {resume && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-green-200 p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="bg-green-100 text-green-700 rounded-full w-11 h-11 flex items-center justify-center text-xl">
                ✓
              </div>

              <div>
                <h2 className="text-xl font-bold text-green-800">
                  Resume Uploaded Successfully
                </h2>

                <p className="text-sm text-slate-500">
                  Your resume is ready for analysis.
                </p>
              </div>

            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">

              <p className="text-slate-700">
                <strong>File Name:</strong> {resume.file_name}
              </p>

              <p className="text-slate-700">
                <strong>Resume ID:</strong> {resume.resume_id}
              </p>

            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-5 bg-purple-600 hover:bg-purple-700
                disabled:opacity-50 text-white font-semibold
                py-3 rounded-lg transition"
            >
              {analyzing
                ? "Analyzing Your Resume..."
                : "Analyze My Resume"}
            </button>

          </div>
        )}

        {/* Resume Analysis Dashboard */}
        {analysis && (
          <div className="mt-10 space-y-6">

            {/* Dashboard Heading */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Resume Analysis Dashboard
              </h2>

              <p className="text-slate-500 mt-2">
                Review the results extracted from your uploaded resume.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-sm font-medium text-blue-700">
                  Total Technical Skills
                </p>

                <h3 className="text-4xl font-bold text-blue-900 mt-3">
                  {analysis.total_skills ?? analysis.skills?.length ?? 0}
                </h3>

                <p className="text-sm text-blue-700 mt-2">
                  Skills identified in your resume
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <p className="text-sm font-medium text-green-700">
                  Resume Word Count
                </p>

                <h3 className="text-4xl font-bold text-green-900 mt-3">
                  {analysis.word_count ?? 0}
                </h3>

                <p className="text-sm text-green-700 mt-2">
                  Total words extracted from your resume
                </p>
              </div>

            </div>

            {/* Technical Skills */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">

              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Technical Skills
              </h3>

              {analysis.skills?.length > 0 ? (

                <div className="flex flex-wrap gap-3">

                  {analysis.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              ) : (

                <p className="text-slate-500">
                  No technical skills were detected in your resume.
                </p>

              )}

            </div>

            {/* Improvement Suggestions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">

              <h3 className="text-xl font-bold text-amber-900 mb-4">
                Resume Improvement Suggestions
              </h3>

              {analysis.suggestions?.length > 0 ? (

                <div className="space-y-4">

                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3"
                    >

                      <span className="bg-amber-200 text-amber-900
                        w-7 h-7 flex items-center justify-center
                        rounded-full font-bold shrink-0"
                      >
                        {index + 1}
                      </span>

                      <p className="text-slate-700 pt-1">
                        {suggestion}
                      </p>

                    </div>
                  ))}

                </div>

              ) : (

                <p className="text-slate-600">
                  No additional improvement suggestions are available.
                </p>

              )}

            </div>

            {/* Analysis Summary */}
            <div className="bg-slate-900 text-white rounded-xl p-6">

              <h3 className="text-xl font-bold mb-3">
                Analysis Summary
              </h3>

              <p className="text-slate-300 leading-relaxed">
                Your resume contains {analysis.word_count ?? 0} words
                and {analysis.total_skills ?? analysis.skills?.length ?? 0}
                detected technical skills.

                {" "}Review the improvement suggestions to identify
                opportunities to strengthen your resume for placement
                opportunities.
              </p>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Resume;
