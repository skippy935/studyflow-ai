import { Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn, isEmailVerified } from './lib/auth';
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/auth/LoginPage';
import RegisterPage   from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
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
import LeaderboardPage      from './pages/LeaderboardPage';
import TeacherPage          from './pages/TeacherPage';
import TeacherClassPage     from './pages/TeacherClassPage';
import ParentPage           from './pages/ParentPage';
import StudyGroupPage       from './pages/StudyGroupPage';
import GeneralTutorPage     from './pages/GeneralTutorPage';
import AnalyticsPage        from './pages/AnalyticsPage';
import PricingPage          from './pages/PricingPage';

function Protected({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isEmailVerified()) return <Navigate to="/verify-email" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"        element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register"     element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
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
      <Route path="/leaderboard"          element={<Protected><LeaderboardPage /></Protected>} />
      <Route path="/teacher"              element={<Protected><TeacherPage /></Protected>} />
      <Route path="/teacher/classes/:id"  element={<Protected><TeacherClassPage /></Protected>} />
      <Route path="/parent"               element={<Protected><ParentPage /></Protected>} />
      <Route path="/groups"               element={<Protected><StudyGroupPage /></Protected>} />
      <Route path="/tutor"                element={<Protected><GeneralTutorPage /></Protected>} />
      <Route path="/analytics"            element={<Protected><AnalyticsPage /></Protected>} />
      <Route path="/pricing"              element={<Protected><PricingPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
