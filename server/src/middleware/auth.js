import { forbidden, unauthorized } from '../utils/errors.js';

export const authenticate = (authService) => async (request, _response, next) => {
  try {
    const authorization = request.get('authorization') ?? '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw unauthorized('A Bearer token is required');
    }

    request.user = await authService.authenticateToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => (request, _response, next) => {
  if (!request.user || !roles.includes(request.user.role)) {
    next(forbidden());
    return;
  }

  next();
};
