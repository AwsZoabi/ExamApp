import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { notifyService } from '../services/notifyService';

function Login({ onLogin }) {
  const [email, setEmail] = useState('student@examapp.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      notifyService.success(`Welcome ${user.fullName}`);
      onLogin(user);
    } catch (error) {
      notifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="mb-3 text-center">Login</h2>
              <p className="text-muted text-center">
                Use demo student or teacher account.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="mt-3 small">
                <div>Student: student@examapp.com / 123456</div>
                <div>Teacher: teacher@examapp.com / 123456</div>
              </div>

              <p className="mt-3 text-center">
                New user? <Link to="/register">Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;