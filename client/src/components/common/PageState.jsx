import { Icon } from './Icon';

export function LoadingState({ label = 'Loading your workspace…' }) {
  return (
    <div className="page-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <strong>{label}</strong>
      <span>Just a moment while we prepare everything.</span>
    </div>
  );
}

export function EmptyState({ icon = 'exam', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <span className="empty-state__icon empty-state__icon--error">
        <Icon name="warning" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="button button--secondary" onClick={onRetry} type="button">
          <Icon name="refresh" size={17} /> Try again
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status ?? 'draft').toLowerCase();
  return <span className={`status-badge status-badge--${normalized}`}>{normalized}</span>;
}

export function MetricCard({ icon, label, value, detail, tone = 'violet' }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__icon"><Icon name={icon} size={21} /></span>
      <div>
        <span className="metric-card__label">{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </article>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
