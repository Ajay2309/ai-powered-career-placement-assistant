
import { useEffect, useState } from "react";
import api from "../services/api";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        message: "",
        notification_type: "study",
        reminder_date: "",
    });

    const loadNotifications = async () => {
        try {
            const [notificationResponse, statsResponse] = await Promise.all([
                api.get("/notifications/"),
                api.get("/notifications/stats"),
            ]);

            setNotifications(notificationResponse.data);
            setStats(statsResponse.data);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.message.trim()) {
            setError("Please enter a title and message.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const params = {
                title: form.title.trim(),
                message: form.message.trim(),
                notification_type: form.notification_type,
            };

            if (form.reminder_date) {
                params.reminder_date = form.reminder_date;
            }

            await api.post("/notifications/", null, { params });

            setForm({
                title: "",
                message: "",
                notification_type: "study",
                reminder_date: "",
            });

            await loadNotifications();
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to create reminder."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            await loadNotifications();
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to mark notification as read."
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            await loadNotifications();
        } catch (err) {
            setError("Unable to mark all notifications as read.");
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            await loadNotifications();
        } catch (err) {
            setError("Unable to delete notification.");
        }
    };

    const deleteAllNotifications = async () => {
        if (!window.confirm("Delete all notifications?")) {
            return;
        }

        try {
            await api.delete("/notifications/");
            await loadNotifications();
        } catch (err) {
            setError("Unable to delete all notifications.");
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case "interview":
                return "bg-purple-100 text-purple-700";
            case "application":
                return "bg-blue-100 text-blue-700";
            case "study":
                return "bg-green-100 text-green-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "interview":
                return "🎤";
            case "application":
                return "💼";
            case "study":
                return "📚";
            default:
                return "🔔";
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-900 text-white px-6 py-5 flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 className="text-xl font-bold">
                        Notifications & Reminders
                    </h1>
                    <p className="text-sm text-slate-300">
                        Stay organized during your placement journey
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Dashboard
                </button>
            </header>

            <main className="max-w-6xl mx-auto p-6">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Notification Center
                </h2>

                <p className="text-slate-600 mb-7">
                    Manage interviews, applications and preparation reminders.
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-5">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl shadow">
                        <p className="text-slate-500 text-sm">Total Notifications</p>
                        <h3 className="text-3xl font-bold text-slate-800">
                            {stats.total}
                        </h3>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow">
                        <p className="text-slate-500 text-sm">Unread</p>
                        <h3 className="text-3xl font-bold text-blue-600">
                            {stats.unread}
                        </h3>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow">
                        <p className="text-slate-500 text-sm">Read</p>
                        <h3 className="text-3xl font-bold text-green-600">
                            {stats.read}
                        </h3>
                    </div>
                </div>

                {/* Create Reminder Form */}
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <h3 className="text-xl font-bold mb-5">
                        Create a Reminder
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Reminder Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Prepare for TCS interview"
                                maxLength={200}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Write what you need to remember..."
                                rows={3}
                                required
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Reminder Type
                                </label>
                                <select
                                    name="notification_type"
                                    value={form.notification_type}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white"
                                >
                                    <option value="study">Study / Preparation</option>
                                    <option value="interview">Interview</option>
                                    <option value="application">Application Update</option>
                                    <option value="general">General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Reminder Date & Time (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    name="reminder_date"
                                    value={form.reminder_date}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? "Creating..." : "Create Reminder"}
                        </button>
                    </form>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                        <h3 className="text-xl font-bold">
                            Your Notifications
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {stats.unread > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200"
                                >
                                    Mark All Read
                                </button>
                            )}

                            {notifications.length > 0 && (
                                <button
                                    onClick={deleteAllNotifications}
                                    className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
                                >
                                    Delete All
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center py-10 text-slate-500">
                            Loading notifications...
                        </p>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-3">🔔</div>
                            <h4 className="text-lg font-semibold mb-2">
                                No notifications yet
                            </h4>
                            <p className="text-slate-500">
                                Create your first reminder using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border rounded-xl p-5 ${
                                        notification.is_read
                                            ? "bg-white border-slate-200"
                                            : "bg-blue-50 border-blue-200"
                                    }`}
                                >
                                    <div className="flex flex-wrap justify-between gap-3">
                                        <div className="flex gap-3">
                                            <div className="text-2xl">
                                                {getTypeIcon(notification.notification_type)}
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-800">
                                                        {notification.title}
                                                    </h4>

                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${getTypeStyle(notification.notification_type)}`}
                                                    >
                                                        {notification.notification_type}
                                                    </span>

                                                    {!notification.is_read && (
                                                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-slate-600 whitespace-pre-wrap">
                                                    {notification.message}
                                                </p>

                                                {notification.reminder_date && (
                                                    <p className="text-sm text-purple-700 mt-2">
                                                        📅 Reminder:{" "}
                                                        {new Date(notification.reminder_date).toLocaleString()}
                                                    </p>
                                                )}

                                                <p className="text-xs text-slate-400 mt-2">
                                                    Created:{" "}
                                                    {notification.created_at
                                                        ? new Date(notification.created_at).toLocaleString()
                                                        : "Date unavailable"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-start">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200"
                                                >
                                                    Mark Read
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Notifications;
