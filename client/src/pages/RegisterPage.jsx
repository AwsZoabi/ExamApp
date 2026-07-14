import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appConfig } from '../config';
import { useAuth } from '../context/AuthContext';
import { notifyService } from '../services/notifyService';
import { Icon } from '../components/common/Icon';

export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const user = await register(form);
      notifyService.success('Your ExamApp workspace is ready.');
      navigate(user.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
      notifyService.error(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-visual auth-visual--register" aria-label="ExamApp registration introduction">
        <div className="auth-visual__glow" />
        <Link className="brand brand--auth" to="/login">
          <span className="brand__mark">E</span><span>{appConfig.name}</span>
        </Link>
        <div className="auth-visual__content">
          <span className="eyebrow eyebrow--light">Start with clarity</span>
          <h1>A workspace that grows with your learning.</h1>
          <p>Create an account in seconds. Your role shapes a focused experience from the very first screen.</p>
          <ul className="benefit-list">
            <li><Icon name="check" size={17} /> Role-aware, distraction-free navigation</li>
            <li><Icon name="check" size={17} /> Clear progress and actionable results</li>
            <li><Icon name="check" size={17} /> Accessible on desktop, tablet, and mobile</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <header className="auth-heading">
            <span className="eyebrow">Create your account</span>
            <h2>Choose your ExamApp workspace</h2>
            <p>All fields are required. You can begin immediately after registration.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="inline-alert inline-alert--error" role="alert"><Icon name="warning" size={18} />{error}</div>}
            <div className="field-group">
              <label htmlFor="fullName">Full name</label>
              <input autoComplete="name" id="fullName" name="fullName" onChange={updateField} placeholder="Your full name" required value={form.fullName} />
            </div>
            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <input autoComplete="email" id="email" name="email" onChange={updateField} placeholder="you@example.com" required type="email" value={form.email} />
            </div>
            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input autoComplete="new-password" id="password" minLength="6" name="password" onChange={updateField} placeholder="At least 6 characters" required type="password" value={form.password} />
            </div>

            <fieldset className="role-picker">
              <legend>Your role</legend>
              <label className={form.role === 'student' ? 'is-selected' : ''}>
                <input checked={form.role === 'student'} name="role" onChange={updateField} type="radio" value="student" />
                <span><Icon name="book" size={20} /></span>
                <div><strong>Student</strong><small>Take exams and review progress</small></div>
              </label>
              <label className={form.role === 'teacher' ? 'is-selected' : ''}>
                <input checked={form.role === 'teacher'} name="role" onChange={updateField} type="radio" value="teacher" />
                <span><Icon name="users" size={20} /></span>
                <div><strong>Teacher</strong><small>Create exams and analyze results</small></div>
              </label>
            </fieldset>

            <button className="button button--primary button--large" disabled={isSubmitting} type="submit">
              {isSubmitting ? <><span className="button-spinner" /> Creating workspace…</> : <>Create account <Icon name="arrowRight" size={18} /></>}
            </button>
          </form>
          <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
