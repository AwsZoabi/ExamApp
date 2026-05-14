import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username, role);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-header bg-primary text-white text-center">
          <h3>Login to E-Test System</h3>
        </div>
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                className="form-select"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleLogin}
              disabled={!username.trim()}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;