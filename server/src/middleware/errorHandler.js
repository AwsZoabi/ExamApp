import { AppError } from '../utils/errors.js';

export const notFoundHandler = (request, _response, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${request.method} ${request.path} was not found`));
};

export const errorHandler = (logger) => (error, request, response, _next) => {
  let appError = error;

  if (!(error instanceof AppError)) {
    if (error?.code === '23505') {
      appError = new AppError(409, 'CONFLICT', 'A record with that value already exists');
    } else if (error?.code === '23503') {
      appError = new AppError(400, 'INVALID_REFERENCE', 'A referenced record does not exist');
    } else {
      appError = new AppError(500, 'INTERNAL_ERROR', 'Internal server error');
    }
  }

  const logPayload = {
    requestId: request.id,
    code: appError.code,
    status: appError.status,
    err: error,
  };

  if (appError.status >= 500) {
    logger.error(logPayload, 'Request failed');
  } else {
    logger.warn(logPayload, 'Request rejected');
  }

  response.status(appError.status).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      requestId: request.id,
    },
  });
};
