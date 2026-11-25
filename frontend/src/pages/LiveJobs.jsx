
import { useEffect, useState } from "react";
import api from "../services/api";

function LiveJobs() {
    const [jobs, setJobs] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [location, setLocation] = useState("All");
    const [jobType, setJobType] = useState("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [total, setTotal] = useState(0);

    const searchJobs = async (searchTerm = keyword) => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/live-jobs/search", {
                params: {
                    keyword: searchTerm,
                    limit: 50,
                },
            });

            setJobs(response.data.jobs || []);
            setTotal(response.data.total || 0);
            setKeyword(searchTerm);
        } catch (err) {
            setError(
                err.response?.data?.detail || "Unable to load live jobs."
            );
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchJobs("");
    }, []);

    const cleanDescription = (html) => {
        if (!html) return "No description available.";

        return html
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    };

    const filteredJobs = jobs.filter((job) => {
        const matchesLocation =
            location === "All" ||
            (job.location || "").toLowerCase().includes(location.toLowerCase());

        const matchesType =
            jobType === "All" ||
            (job.job_type || "").toLowerCase().includes(jobType.toLowerCase());

        return matchesLocation && matchesType;
    });

    const handleSearch = (e) => {
        e.preventDefault();
        searchJobs(searchInput.trim());
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
                <h1 className="text-xl font-bold">Live Job Search</h1>

                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                    Dashboard
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Find Your Next Opportunity
                </h2>

                <p className="text-slate-600 mb-7">
                    Explore real remote job listings from external employers.
                </p>

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white p-5 rounded-xl shadow mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search Python, React, Data Analyst, Developer..."
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg disabled:opacity-50"
                        >
                            {loading ? "Searching..." : "Search Jobs"}
                        </button>
                    </div>
                </form>

                {/* Filters */}
                <div className="bg-white p-5 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold mb-2">
                            Location
                        </label>

                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded-lg p-3"
                        >
                            <option value="All">All Locations</option>
                            <option value="Worldwide">Worldwide</option>
                            <option value="India">India</option>
                            <option value="Asia">Asia</option>
                            <option value="Europe">Europe</option>
                            <option value="United States">United States</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">
                            Employment Type
                        </label>

                        <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            className="w-full border rounded-lg p-3"
                        >
                            <option value="All">All Types</option>
                            <option value="full_time">Full-time</option>
                            <option value="contract">Contract</option>
                            <option value="part_time">Part-time</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>
                </div>

                {/* Results */}
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold">
                        Job Results ({filteredJobs.length})
                    </h3>

                    <button
                        onClick={() => {
                            setSearchInput("");
                            setKeyword("");
                            setLocation("All");
                            setJobType("All");
                            searchJobs("");
                        }}
                        className="text-blue-700 font-semibold hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-5">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-16">
                        <p className="text-lg font-semibold">
                            Finding jobs...
                        </p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-10 text-center">
                        <h3 className="text-xl font-bold mb-2">
                            No jobs found
                        </h3>

                        <p className="text-slate-600">
                            Try another keyword or remove the filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-xl shadow hover:shadow-lg transition p-6"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    {job.company_logo ? (
                                        <img
                                            src={job.company_logo}
                                            alt={job.company}
                                            className="w-14 h-14 object-contain rounded-lg border p-1"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                                            {job.company?.charAt(0)?.toUpperCase() || "J"}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {job.title}
                                        </h3>

                                        <p className="text-slate-600 font-medium">
                                            {job.company}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {job.location || "Remote"}
                                    </span>

                                    {job.job_type && (
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                            {job.job_type.replace(/_/g, " ")}
                                        </span>
                                    )}

                                    {job.category && (
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                            {job.category}
                                        </span>
                                    )}
                                </div>

                                <p className="font-semibold text-slate-700 mb-2">
                                    Salary: {job.salary || "Not disclosed"}
                                </p>

                                <p className="text-slate-600 leading-relaxed mb-5">
                                    {cleanDescription(job.description).slice(0, 300)}
                                    {job.description?.length > 300 ? "..." : ""}
                                </p>

                                <div className="flex justify-between items-center border-t pt-4">
                                    <span className="text-xs text-slate-500">
                                        Source: {job.source}
                                    </span>

                                    <a
                                        href={job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold"
                                    >
                                        View & Apply ↗
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-sm text-slate-500 mt-8">
                    Job listings provided by Remotive. Listings may be delayed.
                </p>
            </main>
        </div>
    );
}

export default LiveJobs;
