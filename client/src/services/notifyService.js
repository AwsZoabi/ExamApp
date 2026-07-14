const listeners = new Set();

function publish(type, message, options = {}) {
  const notification = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    message,
    title: options.title,
    duration: options.duration ?? 4200,
  };
  listeners.forEach((listener) => listener(notification));
  return notification;
}

export const notifyService = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  success(message, options) {
    return publish('success', message, options);
  },
  error(message, options) {
    return publish('error', message, options);
  },
  info(message, options) {
    return publish('info', message, options);
  },
  warning(message, options) {
    return publish('warning', message, options);
  },
};
