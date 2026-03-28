import { Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './lib/auth';
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import CreatePage     from './pages/CreatePage';
import DeckPage       from './pages/DeckPage';
import StudyPage      from './pages/StudyPage';
import QuizPage       from './pages/QuizPage';
import SummaryPage    from './pages/SummaryPage';
import SettingsPage      from './pages/SettingsPage';
import ExaminerPage      from './pages/ExaminerPage';
import ExaminerSessionPage from './pages/ExaminerSessionPage';
import PlannerPage          from './pages/PlannerPage';
import MissedQuestionsPage  from './pages/MissedQuestionsPage';
import TutorPage            from './pages/TutorPage';

function Protected({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/dashboard"    element={<Protected><DashboardPage /></Protected>} />
      <Route path="/create"       element={<Protected><CreatePage /></Protected>} />
      <Route path="/deck/:id"     element={<Protected><DeckPage /></Protected>} />
      <Route path="/study/:id"    element={<Protected><StudyPage /></Protected>} />
      <Route path="/quiz/:id"     element={<Protected><QuizPage /></Protected>} />
      <Route path="/summary/:id"  element={<Protected><SummaryPage /></Protected>} />
      <Route path="/settings"     element={<Protected><SettingsPage /></Protected>} />
      <Route path="/examiner"     element={<Protected><ExaminerPage /></Protected>} />
      <Route path="/examiner/:id" element={<Protected><ExaminerSessionPage /></Protected>} />
      <Route path="/planner"          element={<Protected><PlannerPage /></Protected>} />
      <Route path="/missed-questions" element={<Protected><MissedQuestionsPage /></Protected>} />
      <Route path="/tutor/:id"        element={<Protected><TutorPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
