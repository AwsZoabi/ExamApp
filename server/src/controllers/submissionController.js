export const createSubmissionController = (submissionService) => ({
  submit: async (request, response) => {
    response.status(201).json(
      await submissionService.submit(
        request.params.id,
        request.body.answers,
        request.user,
        { requestId: request.id },
      ),
    );
  },

  mine: async (request, response) => {
    response.json(await submissionService.mine(request.user));
  },

  forTeacher: async (request, response) => {
    response.json(await submissionService.forTeacher(request.user));
  },

  forExam: async (request, response) => {
    response.json(
      await submissionService.forExam(request.params.id, request.user),
    );
  },
});
