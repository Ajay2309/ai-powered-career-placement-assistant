
import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    branch: "",
    graduation_year: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");

        setProfile({
          full_name: response.data.full_name || "",
          email: response.data.email || "",
          branch: response.data.branch || "",
          graduation_year: response.data.graduation_year || "",
        });
      } catch (error) {
        setMessage(
          error.response?.data?.detail ||
          "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Update student profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await api.put("/profile", {
        full_name: profile.full_name,
        branch: profile.branch,
        graduation_year: Number(profile.graduation_year),
      });

      setProfile({
        ...profile,
        ...response.data,
      });

      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Profile update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-lg text-slate-600">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        {/* Back to Dashboard */}
        <button
          type="button"
          onClick={() => window.location.href = "/dashboard"}
          className="mb-6 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg transition"
        >
          ← Back to Dashboard
        </button>

        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Student Profile
        </h1>

        <p className="text-slate-500 mb-8">
          View and update your personal information.
        </p>

        {/* Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block font-medium mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-100"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block font-medium mb-2">
              Branch
            </label>

            <input
              type="text"
              name="branch"
              value={profile.branch}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block font-medium mb-2">
              Graduation Year
            </label>

            <input
              type="number"
              name="graduation_year"
              value={profile.graduation_year}
              onChange={handleChange}
              min="2020"
              max="2100"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Update Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>

        </form>

        {/* Success or Error Message */}
        {message && (
          <p className="mt-5 text-center font-medium text-blue-600">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default Profile;
