
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from "recharts";

const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
];

function Analytics() {
    const [applications, setApplications] = useState([]);
    const [applicationStats, setApplicationStats] = useState({});
    const [assessmentHistory, setAssessmentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const [applicationsResponse, statsResponse, historyResponse] =
                    await Promise.all([
                        api.get("/applications/"),
                        api.get("/applications/stats"),
                        api.get("/assessment/history"),
                    ]);

                setApplications(applicationsResponse.data || []);
                setApplicationStats(statsResponse.data || {});
                setAssessmentHistory(historyResponse.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load analytics data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    const averageScore = useMemo(() => {
        if (assessmentHistory.length === 0) return 0;

        const total = assessmentHistory.reduce(
            (sum, attempt) => sum + Number(attempt.score_percentage || 0),
            0
        );

        return Math.round(total / assessmentHistory.length);
    }, [assessmentHistory]);

    const scoreTrend = useMemo(() => {
        return [...assessmentHistory]
            .reverse()
            .map((attempt, index) => ({
                name: `Attempt ${index + 1}`,
                score: Number(attempt.score_percentage || 0),
            }));
    }, [assessmentHistory]);

    const statusData = useMemo(() => {
        const statuses = [
            "Applied",
            "Shortlisted",
            "Interview",
            "Rejected",
            "Selected",
        ];

        return statuses
            .map((status) => ({
                name: status,
                value: Number(applicationStats[status] || 0),
            }))
            .filter((item) => item.value > 0);
    }, [applicationStats]);

    const topicData = useMemo(() => {
        const topics = {};

        assessmentHistory.forEach((attempt) => {
            Object.entries(attempt.topic_performance || {}).forEach(
                ([topic, details]) => {
                    if (!topics[topic]) {
                        topics[topic] = {
                            total: 0,
                            attempts: 0,
                        };
                    }

                    topics[topic].total += Number(
                        details.score_percentage || 0
                    );

                    topics[topic].attempts += 1;
                }
            );
        });

        return Object.entries(topics)
            .map(([topic, details]) => ({
                topic,
                score: Math.round(
                    details.total / details.attempts
                ),
            }))
            .sort((a, b) => b.score - a.score);
    }, [assessmentHistory]);

    const recentApplications = useMemo(() => {
        return [...applications]
            .sort(
                (a, b) =>
                    new Date(b.applied_date || b.created_at) -
                    new Date(a.applied_date || a.created_at)
            )
            .slice(0, 5);
    }, [applications]);

    const totalApplications = Number(applicationStats.total || 0);
    const interviews = Number(applicationStats.Interview || 0);
    const shortlisted = Number(applicationStats.Shortlisted || 0);
    const selected = Number(applicationStats.Selected || 0);
    const successRate = Number(applicationStats.success_rate || 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <p className="text-lg text-slate-600">
                    Loading placement analytics...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <header className="bg-slate-900 text-white px-6 py-5 flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        Placement Analytics
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Track your placement preparation and progress
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Dashboard
                </button>
            </header>

            <main className="max-w-7xl mx-auto p-6">

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    <StatCard
                        title="Total Applications"
                        value={totalApplications}
                        subtitle="Jobs tracked"
                        color="blue"
                    />

                    <StatCard
                        title="Shortlisted"
                        value={shortlisted}
                        subtitle="Companies interested"
                        color="purple"
                    />

                    <StatCard
                        title="Interviews"
                        value={interviews}
                        subtitle="Interview opportunities"
                        color="orange"
                    />

                    <StatCard
                        title="Selected"
                        value={selected}
                        subtitle="Selection offers"
                        color="green"
                    />

                </div>

                {/* Secondary stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                    <StatCard
                        title="Application Success Rate"
                        value={`${successRate}%`}
                        subtitle="Selection rate"
                        color="green"
                    />

                    <StatCard
                        title="Average Assessment Score"
                        value={`${averageScore}%`}
                        subtitle={`${assessmentHistory.length} assessment attempts`}
                        color="blue"
                    />

                    <StatCard
                        title="Assessments Completed"
                        value={assessmentHistory.length}
                        subtitle="Practice sessions"
                        color="purple"
                    />

                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Application status */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-2">
                            Application Status
                        </h2>

                        <p className="text-slate-500 text-sm mb-5">
                            Overview of your job application progress
                        </p>

                        {statusData.length === 0 ? (
                            <EmptyChart message="Add job applications to see your chart." />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Score trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold mb-2">
                            Assessment Score Trend
                        </h2>

                        <p className="text-slate-500 text-sm mb-5">
                            See how your mock assessment performance changes
                        </p>

                        {scoreTrend.length === 0 ? (
                            <EmptyChart message="Complete assessments to see your score trend." />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={scoreTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="name" />

                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />

                                    <Tooltip
                                        formatter={(value) => `${value}%`}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                </div>

                {/* Topic scores */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">

                    <h2 className="text-xl font-bold mb-2">
                        Topic-wise Performance
                    </h2>

                    <p className="text-slate-500 text-sm mb-5">
                        Average scores across your assessment topics
                    </p>

                    {topicData.length === 0 ? (
                        <EmptyChart message="Your topic-wise performance will appear here." />
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topicData}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="topic"
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    height={80}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />

                                <Tooltip
                                    formatter={(value) => `${value}%`}
                                />

                                <Bar
                                    dataKey="score"
                                    name="Average Score"
                                    fill="#2563eb"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Recent applications */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">

                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                        <div>
                            <h2 className="text-xl font-bold">
                                Recent Applications
                            </h2>

                            <p className="text-slate-500 text-sm mt-1">
                                Your latest job application activity
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.href = "/applications"}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            View All Applications →
                        </button>
                    </div>

                    {recentApplications.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">
                            No job applications added yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-slate-500 text-sm">
                                        <th className="pb-3">Job Title</th>
                                        <th className="pb-3">Company</th>
                                        <th className="pb-3">Location</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentApplications.map((application) => (
                                        <tr
                                            key={application.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-4 font-medium">
                                                {application.job_title}
                                            </td>

                                            <td className="py-4">
                                                {application.company}
                                            </td>

                                            <td className="py-4 text-slate-500">
                                                {application.location || "—"}
                                            </td>

                                            <td className="py-4">
                                                <StatusBadge
                                                    status={application.status}
                                                />
                                            </td>

                                            <td className="py-4 text-sm text-slate-500">
                                                {application.applied_date
                                                    ? new Date(
                                                        application.applied_date
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Preparation recommendations */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white rounded-2xl p-6">

                    <h2 className="text-xl font-bold mb-3">
                        Your Placement Preparation
                    </h2>

                    {assessmentHistory.length === 0 && totalApplications === 0 ? (
                        <p className="text-blue-100">
                            Start by completing mock assessments and tracking
                            your job applications. Your personalized analytics
                            will develop as you use the platform.
                        </p>
                    ) : (
                        <div className="space-y-2 text-blue-100">
                            <p>
                                You have completed{" "}
                                <strong className="text-white">
                                    {assessmentHistory.length}
                                </strong>{" "}
                                mock assessments and tracked{" "}
                                <strong className="text-white">
                                    {totalApplications}
                                </strong>{" "}
                                job applications.
                            </p>

                            {topicData.length > 0 && (
                                <p>
                                    Your strongest topic is{" "}
                                    <strong className="text-white">
                                        {topicData[0].topic}
                                    </strong>{" "}
                                    with an average score of{" "}
                                    <strong className="text-white">
                                        {topicData[0].score}%
                                    </strong>.
                                </p>
                            )}

                            {topicData.length > 0 && (
                                <p>
                                    Focus your practice on{" "}
                                    <strong className="text-white">
                                        {topicData[topicData.length - 1].topic}
                                    </strong>{" "}
                                    to improve your overall performance.
                                </p>
                            )}

                            {totalApplications > 0 && (
                                <p>
                                    Keep your application statuses updated
                                    to get an accurate picture of your
                                    placement progress.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-5">
                        <button
                            onClick={() => window.location.href = "/assessment"}
                            className="bg-white text-blue-900 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50"
                        >
                            Practice Assessment
                        </button>

                        <button
                            onClick={() => window.location.href = "/applications"}
                            className="bg-blue-600 border border-blue-400 px-5 py-2 rounded-lg font-semibold hover:bg-blue-500"
                        >
                            Manage Applications
                        </button>
                    </div>

                </div>

            </main>
        </div>
    );
}

function StatCard({ title, value, subtitle, color }) {
    const colorClasses = {
        blue: "border-blue-500",
        green: "border-green-500",
        purple: "border-purple-500",
        orange: "border-orange-500",
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${colorClasses[color]}`}>
            <p className="text-slate-500 text-sm font-medium">
                {title}
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
                {value}
            </p>

            <p className="text-slate-400 text-sm mt-2">
                {subtitle}
            </p>
        </div>
    );
}

function EmptyChart({ message }) {
    return (
        <div className="h-[300px] flex items-center justify-center text-center text-slate-400">
            <p>{message}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    const classes = {
        Applied: "bg-blue-100 text-blue-700",
        Shortlisted: "bg-purple-100 text-purple-700",
        Interview: "bg-orange-100 text-orange-700",
        Rejected: "bg-red-100 text-red-700",
        Selected: "bg-green-100 text-green-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                classes[status] || "bg-slate-100 text-slate-700"
            }`}
        >
            {status}
        </span>
    );
}

export default Analytics;
