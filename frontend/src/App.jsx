
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";
import SkillGap from "./pages/SkillGap";
import Interview from "./pages/Interview";
import Assessment from "./pages/Assessment";
import AssessmentHistory from "./pages/AssessmentHistory";
import LiveJobs from "./pages/LiveJobs";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="/resume" element={
          <ProtectedRoute><Resume /></ProtectedRoute>
        } />

        <Route path="/jobs" element={
          <ProtectedRoute><Jobs /></ProtectedRoute>
        } />

        <Route path="/live-jobs" element={
          <ProtectedRoute><LiveJobs /></ProtectedRoute>
        } />

        <Route path="/skill-gap" element={
          <ProtectedRoute><SkillGap /></ProtectedRoute>
        } />

        <Route path="/interview" element={
          <ProtectedRoute><Interview /></ProtectedRoute>
        } />

        <Route path="/assessment" element={
          <ProtectedRoute><Assessment /></ProtectedRoute>
        } />

        <Route path="/assessment-history" element={
          <ProtectedRoute><AssessmentHistory /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
