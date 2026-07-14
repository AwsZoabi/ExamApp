import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { appConfig } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { activeDataSource } from '../../services/dataService';
import { initials } from '../../utils/format';
import { Icon } from '../common/Icon';

const teacherNavigation = [
  { to: '/teacher', label: 'Overview', icon: 'dashboard', end: true },
  { to: '/teacher/exams/new', label: 'Create exam', icon: 'plus' },
];

const studentNavigation = [
  { to: '/student', label: 'My workspace', icon: 'dashboard', end: true },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = user.role === 'teacher' ? teacherNavigation : studentNavigation;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="mobile-header">
        <NavLink className="brand" to={user.role === 'teacher' ? '/teacher' : '/student'}>
          <span className="brand__mark">E</span>
          <span>{appConfig.name}</span>
        </NavLink>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          className="icon-button"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <NavLink
            className="brand brand--sidebar"
            onClick={() => setMenuOpen(false)}
            to={user.role === 'teacher' ? '/teacher' : '/student'}
          >
            <span className="brand__mark">E</span>
            <span>
              {appConfig.name}
              <small>Assessment workspace</small>
            </span>
          </NavLink>

          <nav aria-label="Primary navigation" className="sidebar__nav">
            <span className="sidebar__label">Workspace</span>
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                end={item.end}
                key={item.to}
                onClick={() => setMenuOpen(false)}
                to={item.to}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar__footer">
          <div className="source-pill" title="Configured client data source">
            <span className={`source-pill__dot source-pill__dot--${activeDataSource}`} />
            {activeDataSource === 'mock' ? 'Mock workspace' : 'Live API'}
          </div>
          <div className="profile-card">
            <span className="avatar">{initials(user.fullName)}</span>
            <div>
              <strong>{user.fullName}</strong>
              <span>{user.role}</span>
            </div>
            <button aria-label="Sign out" className="icon-button" onClick={handleLogout} type="button">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      )}

      <main className="app-main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
