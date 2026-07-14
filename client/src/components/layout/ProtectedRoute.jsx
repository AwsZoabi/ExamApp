import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/PageState';

export function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <LoadingState label="Checking your session…" />;
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate replace to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return <LoadingState label="Checking your session…" />;
  if (user) return <Navigate replace to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  return <Outlet />;
}

export function RoleHome() {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return <LoadingState label="Opening your workspace…" />;
  if (!user) return <Navigate replace to="/login" />;
  return <Navigate replace to={user.role === 'teacher' ? '/teacher' : '/student'} />;
}
