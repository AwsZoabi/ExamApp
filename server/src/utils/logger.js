import pino from 'pino';

export const createLogger = ({ level = 'info' } = {}) =>
  pino({
    level,
    base: { service: 'examapp-api' },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'password',
        '*.password',
        'token',
        '*.token',
        'req.headers.authorization',
        'request.headers.authorization',
      ],
      censor: '[REDACTED]',
    },
  });
