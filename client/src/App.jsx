import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import { authService } from './services/authService';
import './App.css';

function TeacherPlaceholder({ user }) {
  return (
    <div className="container py-4">
      <h1>Teacher Dashboard</h1>
      <p className="text-muted">
        Welcome {user.fullName}. Teacher pages will be completed by the next teammate.
      </p>

      <div className="alert alert-warning">
        This section is prepared for Project 2 continuation: create exams,
        manage questions, view students, and check results.
      </div>
    </div>
  );
}

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
            E-Test System
          </Link>

          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <>
                <span className="text-white small">
                  {currentUser.fullName} ({currentUser.role})
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
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
          path="/teacher"
          element={
            currentUser && currentUser.role === 'teacher' ? (
              <TeacherPlaceholder user={currentUser} />
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