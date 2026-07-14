export const createAuthController = (authService) => ({
  login: async (request, response) => {
    response.json(
      await authService.login(request.body, { requestId: request.id }),
    );
  },

  register: async (request, response) => {
    response.status(201).json(
      await authService.register(request.body, { requestId: request.id }),
    );
  },

  me: async (request, response) => {
    response.json({ user: request.user });
  },
});
