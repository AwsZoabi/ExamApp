import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { appConfig, demoAccounts } from '../config';
import { useAuth } from '../context/AuthContext';
import { activeDataSource } from '../services/dataService';
import { notifyService } from '../services/notifyService';
import { Icon } from '../components/common/Icon';

export function LoginPage() {
  const [credentials, setCredentials] = useState({ ...demoAccounts.student });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const updateField = (event) => {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const selectDemo = (role) => {
    setCredentials({ ...demoAccounts[role] });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const user = await login(credentials);
      notifyService.success(`Welcome back, ${user.fullName.split(' ')[0]}.`);
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath ?? (user.role === 'teacher' ? '/teacher' : '/student'), {
        replace: true,
      });
    } catch (submitError) {
      setError(submitError.message);
      notifyService.error(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="ExamApp introduction">
        <div className="auth-visual__glow" />
        <Link className="brand brand--auth" to="/login">
          <span className="brand__mark">E</span>
          <span>{appConfig.name}</span>
        </Link>
        <div className="auth-visual__content">
          <span className="eyebrow eyebrow--light">Assessment, thoughtfully designed</span>
          <h1>Make every exam a better learning moment.</h1>
          <p>
            One calm workspace to create assessments, take them with confidence, and turn results into clear next steps.
          </p>
          <div className="auth-proof">
            <div><Icon name="spark" /><span><strong>Focused workflows</strong><small>From draft to insight</small></span></div>
            <div><Icon name="chart" /><span><strong>Instant clarity</strong><small>Results that make sense</small></span></div>
          </div>
        </div>
        <p className="auth-visual__footer">Built for teachers and students who value their time.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <div className="source-pill source-pill--auth">
            <span className={`source-pill__dot source-pill__dot--${activeDataSource}`} />
            {activeDataSource === 'mock' ? 'Self-contained demo' : 'Connected to ExamApp API'}
          </div>
          <header className="auth-heading">
            <span className="eyebrow">Welcome back</span>
            <h2>Sign in to your workspace</h2>
            <p>Use your account or choose a demo profile below.</p>
          </header>

          <div className="demo-switcher" aria-label="Demo accounts">
            <button onClick={() => selectDemo('student')} type="button">
              <span className="demo-switcher__icon"><Icon name="book" size={18} /></span>
              <span><strong>Student demo</strong><small>Take an assessment</small></span>
            </button>
            <button onClick={() => selectDemo('teacher')} type="button">
              <span className="demo-switcher__icon"><Icon name="users" size={18} /></span>
              <span><strong>Teacher demo</strong><small>Manage assessments</small></span>
            </button>
          </div>

          <div className="divider"><span>or continue with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="inline-alert inline-alert--error" role="alert"><Icon name="warning" size={18} />{error}</div>}
            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <input
                autoComplete="email"
                id="email"
                name="email"
                onChange={updateField}
                placeholder="you@example.com"
                required
                type="email"
                value={credentials.email}
              />
            </div>
            <div className="field-group">
              <div className="field-label-row"><label htmlFor="password">Password</label><span>Demo: 123456</span></div>
              <input
                autoComplete="current-password"
                id="password"
                minLength="6"
                name="password"
                onChange={updateField}
                required
                type="password"
                value={credentials.password}
              />
            </div>
            <button className="button button--primary button--large" disabled={isSubmitting} type="submit">
              {isSubmitting ? <><span className="button-spinner" /> Signing in…</> : <>Sign in <Icon name="arrowRight" size={18} /></>}
            </button>
          </form>

          <p className="auth-link">New to ExamApp? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
