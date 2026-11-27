
import { useEffect, useState } from "react";
import api from "../services/api";

const statuses = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Selected",
];

const initialForm = {
  job_title: "",
  company: "",
  location: "",
  job_url: "",
  status: "Applied",
  notes: "",
};

function Applications() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    Applied: 0,
    Shortlisted: 0,
    Interview: 0,
    Rejected: 0,
    Selected: 0,
    success_rate: 0,
  });

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const [applicationsResponse, statsResponse] = await Promise.all([
        api.get("/applications/"),
        api.get("/applications/stats"),
      ]);

      setApplications(applicationsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/applications/", form);

      setForm(initialForm);
      setShowForm(false);

      await fetchApplications();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to save application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await api.put(`/applications/${id}`, {
        status: newStatus,
      });

      await fetchApplications();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update application status."
      );
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/applications/${id}`);
      await fetchApplications();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete application."
      );
    }
  }

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter((app) => app.status === filter);

  function getStatusStyle(status) {
    const styles = {
      Applied: "bg-blue-100 text-blue-700",
      Shortlisted: "bg-purple-100 text-purple-700",
      Interview: "bg-amber-100 text-amber-700",
      Rejected: "bg-red-100 text-red-700",
      Selected: "bg-green-100 text-green-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  }

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const statCards = [
    {
      title: "Total Applications",
      value: stats.total,
      color: "border-blue-500",
    },
    {
      title: "Interviews",
      value: stats.Interview,
      color: "border-amber-500",
    },
    {
      title: "Shortlisted",
      value: stats.Shortlisted,
      color: "border-purple-500",
    },
    {
      title: "Selected",
      value: stats.Selected,
      color: "border-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Application Tracker
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your job applications and track your placement journey.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Application"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-xl border-l-4 ${stat.color} bg-white p-5 shadow-sm`}
            >
              <p className="text-sm font-medium text-gray-500">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Success Rate */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow">
          <p className="text-sm font-medium text-blue-100">
            Application Success Rate
          </p>

          <p className="mt-2 text-4xl font-bold">
            {stats.success_rate ?? 0}%
          </p>

          <p className="mt-2 text-sm text-blue-100">
            Percentage of applications resulting in selection.
          </p>
        </div>

        {/* Add Application Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Add New Application
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>

                  <input
                    type="text"
                    name="job_title"
                    value={form.job_title}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    required
                    maxLength={150}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Company *
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Google"
                    required
                    maxLength={150}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Bangalore, India"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Job Link
                  </label>

                  <input
                    type="url"
                    name="job_url"
                    value={form.job_url}
                    onChange={handleChange}
                    placeholder="https://company.com/careers"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Application Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Add interview details, follow-up reminders, or other notes..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Application"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
                    setShowForm(false);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Application List */}
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Your Applications
            </h2>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2"
            >
              <option value="All">All Applications</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No applications found
              </p>

              <p className="mt-2 text-gray-500">
                Add your first job application to start tracking your progress.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {application.job_title}
                      </h3>

                      <p className="mt-1 font-medium text-blue-600">
                        {application.company}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-700">
                        Location:
                      </span>{" "}
                      {application.location || "Not specified"}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Applied:
                      </span>{" "}
                      {formatDate(application.applied_date)}
                    </p>
                  </div>

                  {application.notes && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-700">
                        Notes
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                        {application.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(
                          application.id,
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {application.job_url && (
                      <a
                        href={application.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        View Job ↗
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(application.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Applications;
