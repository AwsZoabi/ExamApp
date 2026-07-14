import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { useAuth } from '../context/AuthContext';

export function NotFoundPage() {
  const { user } = useAuth();
  const destination = user ? (user.role === 'teacher' ? '/teacher' : '/student') : '/login';
  return (
    <main className="not-found-page">
      <span className="not-found-page__code">404</span>
      <span className="eyebrow">Page not found</span>
      <h1>This page stepped out for an exam.</h1>
      <p>The link may be outdated, or the page may have moved to a new workspace.</p>
      <Link className="button button--primary" to={destination}><Icon name="arrowLeft" size={17} /> Return to ExamApp</Link>
    </main>
  );
}
