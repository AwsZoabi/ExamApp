export const createExamController = (examService) => ({
  list: async (request, response) => {
    response.json(await examService.list(request.user));
  },

  get: async (request, response) => {
    response.json(await examService.get(request.params.id, request.user));
  },

  create: async (request, response) => {
    response.status(201).json(
      await examService.create(request.body, request.user, {
        requestId: request.id,
      }),
    );
  },

  update: async (request, response) => {
    response.json(
      await examService.update(request.params.id, request.body, request.user, {
        requestId: request.id,
      }),
    );
  },

  delete: async (request, response) => {
    const exam = await examService.delete(request.params.id, request.user, {
      requestId: request.id,
    });
    response.json({ deleted: true, id: exam.id });
  },
});
