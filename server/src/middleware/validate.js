import { badRequest } from '../utils/errors.js';

export const validate = (schema, target = 'body') => (request, _response, next) => {
  const result = schema.safeParse(request[target]);

  if (!result.success) {
    next(
      badRequest(
        'Validation failed',
        result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      ),
    );
    return;
  }

  request[target] = result.data;
  next();
};
