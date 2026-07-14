const entries = [];
const MAX_ENTRIES = 100;

function record(level, message, context) {
  const entry = {
    level,
    message,
    context: context ?? null,
    timestamp: new Date().toISOString(),
  };
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();

  if (import.meta.env.DEV) {
    const method = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
    console[method](`[ExamApp] ${message}`, context ?? '');
  }

  return entry;
}

export const loggerService = {
  info(message, context) {
    return record('info', message, context);
  },
  warning(message, context) {
    return record('warning', message, context);
  },
  error(message, context) {
    return record('error', message, context);
  },
  history() {
    return [...entries];
  },
};
