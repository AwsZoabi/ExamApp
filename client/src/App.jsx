import { Route, Routes } from 'react-router-dom';
import { ToastHost } from './components/common/ToastHost';
import { AppShell } from './components/layout/AppShell';
import { GuestRoute, ProtectedRoute, RoleHome } from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ExamEditorPage } from './pages/ExamEditorPage';
import { ExamResultsPage } from './pages/ExamResultsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { SubmissionResultPage } from './pages/SubmissionResultPage';
import { TakeExamPage } from './pages/TakeExamPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastHost />
      <Routes>
        <Route element={<RoleHome />} path="/" />

        <Route element={<GuestRoute />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
        </Route>

        <Route element={<ProtectedRoute roles={['teacher']} />}>
          <Route element={<AppShell />}>
            <Route element={<TeacherDashboardPage />} path="/teacher" />
            <Route element={<ExamEditorPage />} path="/teacher/exams/new" />
            <Route element={<ExamEditorPage />} path="/teacher/exams/:id/edit" />
            <Route element={<ExamResultsPage />} path="/teacher/exams/:id/results" />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route element={<AppShell />}>
            <Route element={<StudentDashboardPage />} path="/student" />
            <Route element={<TakeExamPage />} path="/student/exams/:id/take" />
            <Route element={<SubmissionResultPage />} path="/student/results/:submissionId" />
          </Route>
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </AuthProvider>
  );
}
