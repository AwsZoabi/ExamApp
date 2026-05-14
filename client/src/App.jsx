import { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import Login from './components/Login';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [role, setRole] = useState('student');

  const handleLogin = (username, selectedRole) => {
    setUser(username);
    setRole(selectedRole);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUser('');
    setRole('student');
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-book-half me-2"></i>E-Test System - {user} ({role})
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container-fluid">
          <p className="mb-0">
            E-Test System v1.0 | Designed for Educational Assessment | Ready for Backend Integration
          </p>
          <small className="text-muted">Mock API in use - Ready for Node.js backend</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
