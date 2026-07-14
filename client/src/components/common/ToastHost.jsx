import { useEffect, useState } from 'react';
import { notifyService } from '../../services/notifyService';
import { Icon } from './Icon';

const toastIcons = {
  success: 'check',
  error: 'warning',
  warning: 'warning',
  info: 'info',
};

export function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(
    () =>
      notifyService.subscribe((toast) => {
        setToasts((current) => [...current, toast].slice(-4));
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== toast.id));
        }, toast.duration);
      }),
    [],
  );

  const dismiss = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));

  return (
    <div className="toast-region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.type}`} key={toast.id} role="status">
          <span className="toast__icon"><Icon name={toastIcons[toast.type]} size={18} /></span>
          <div>
            <strong>{toast.title ?? (toast.type === 'error' ? 'Action needed' : 'All set')}</strong>
            <p>{toast.message}</p>
          </div>
          <button aria-label="Dismiss notification" onClick={() => dismiss(toast.id)} type="button">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
