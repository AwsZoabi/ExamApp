import { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState('student'); // 'teacher' or 'student'

  const handleRoleSwitch = (role) => {
    setUserRole(role);
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-book-half me-2"></i>E-Test System
          </span>
          <div className="d-flex gap-2">
            <button
              className={`btn ${userRole === 'teacher' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRoleSwitch('teacher')}
            >
              <i className="bi bi-person-workspace me-2"></i>Teacher
            </button>
            <button
              className={`btn ${userRole === 'student' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => handleRoleSwitch('student')}
            >
              <i className="bi bi-person-check me-2"></i>Student
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {userRole === 'teacher' ? (
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
