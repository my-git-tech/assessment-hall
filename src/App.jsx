import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateQuiz from "./pages/CreateQuiz";
import QuizResults from "./pages/QuizResults";
import StudentJoin from "./pages/StudentJoin";
import TakeQuiz from "./pages/TakeQuiz";
import StudentResult from "./pages/StudentResult";
import "./styles.css";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Shell() {
  return (
    <div className="qp-root">
      <div className="qp-brand qp-display">Assessment Hall</div>
      <Routes>
        <Route path="/" element={<Navigate to="/join" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateQuiz /></RequireAuth>} />
        <Route path="/results/:quizId" element={<RequireAuth><QuizResults /></RequireAuth>} />
        <Route path="/join" element={<StudentJoin />} />
        <Route path="/quiz/:quizId" element={<TakeQuiz />} />
        <Route path="/quiz-result" element={<StudentResult />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
