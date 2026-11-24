
function Dashboard() {
  const features = [
    {
      title: "Resume Analysis",
      description:
        "Upload and analyze your resume to identify strengths and weaknesses.",
      path: "/resume",
    },
    {
      title: "Job Recommendations",
      description:
        "Discover jobs matching your skills and qualifications.",
    },
    {
      title: "Skill Gap Analysis",
      description:
        "Identify missing skills and improve your employability.",
    },
    {
      title: "Interview Preparation",
      description:
        "Practice interview questions and improve your confidence.",
    },
    {
      title: "Mock Assessments",
      description:
        "Test your technical knowledge through practice assessments.",
    },
    {
      title: "Assessment History",
      description:
        "Track your previous assessment scores and performance.",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const handleExplore = (path) => {
    if (path) {
      window.location.href = path;
    } else {
      alert("This feature will be available soon!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Career & Placement Assistant
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = "/profile"}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
          >
            My Profile
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Student Dashboard
        </h2>

        <p className="text-slate-600 mb-8">
          Welcome! Manage your career preparation from one place.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-600">
                {feature.description}
              </p>

              <button
                onClick={() => handleExplore(feature.path)}
                className="mt-5 text-blue-600 font-semibold hover:text-blue-800"
              >
                Explore →
              </button>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
