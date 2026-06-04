import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import TakeExam from './pages/TakeExam';
import { authService } from './services/authService';
import { configService } from './services/configService';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            {configService.appName}
          </Link>

          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <>
                {currentUser.role === 'teacher' && (
                  <Link className="btn btn-outline-light btn-sm" to="/teacher">
                    Teacher Dashboard
                  </Link>
                )}

                {currentUser.role === 'student' && (
                  <Link className="btn btn-outline-light btn-sm" to="/student">
                    Student Dashboard
                  </Link>
                )}

                <span className="text-white small">
                  {currentUser.fullName} ({currentUser.role})
                </span>

                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-success btn-sm" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              currentUser.role === 'student' ? (
                <Navigate to="/student" />
              ) : (
                <Navigate to="/teacher" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/login"
          element={
            currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          }
        />

        <Route
          path="/register"
          element={
            currentUser ? <Navigate to="/" /> : <Register onLogin={handleLogin} />
          }
        />

        <Route
          path="/student"
          element={
            currentUser && currentUser.role === 'student' ? (
              <StudentDashboard user={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/student/exam/:id"
          element={
            currentUser && currentUser.role === 'student' ? (
              <TakeExam user={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/teacher"
          element={
            currentUser && currentUser.role === 'teacher' ? (
              <TeacherDashboard user={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/teacher/create"
          element={
            currentUser && currentUser.role === 'teacher' ? (
              <CreateExam />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/teacher/edit/:id"
          element={
            currentUser && currentUser.role === 'teacher' ? (
              <EditExam />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;