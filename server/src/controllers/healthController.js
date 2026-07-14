export const createHealthController = ({ repository, config }) => ({
  health: async (request, response) => {
    try {
      const storage = await repository.health();
      response.json({
        status: 'ok',
        ready: true,
        service: 'examapp-api',
        dataSource: config.dataSource,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        storage,
      });
    } catch (error) {
      response.status(503).json({
        status: 'error',
        ready: false,
        service: 'examapp-api',
        dataSource: config.dataSource,
        timestamp: new Date().toISOString(),
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: error.message,
          requestId: request.id,
        },
      });
    }
  },
});
