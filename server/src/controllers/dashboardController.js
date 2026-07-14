export const createDashboardController = (dashboardService) => ({
  teacher: async (request, response) => {
    response.json(await dashboardService.teacher(request.user));
  },

  student: async (request, response) => {
    response.json(await dashboardService.student(request.user));
  },
});
