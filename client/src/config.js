const configuredSource = String(
  import.meta.env.VITE_DATA_SOURCE ?? (import.meta.env.MODE === 'test' ? 'mock' : 'api'),
)
  .trim()
  .toLowerCase();

const configuredRouterMode = String(import.meta.env.VITE_ROUTER_MODE ?? 'browser')
  .trim()
  .toLowerCase();

export const appConfig = Object.freeze({
  name: 'ExamApp',
  apiUrl: String(import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(
    /\/+$/,
    '',
  ),
  dataSource: ['api', 'mock'].includes(configuredSource) ? configuredSource : 'api',
  routerMode: configuredRouterMode === 'hash' ? 'hash' : 'browser',
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 10_000),
  mockDelayMs: import.meta.env.MODE === 'test' ? 0 : 260,
});

export const demoAccounts = Object.freeze({
  teacher: {
    email: 'teacher@examapp.local',
    password: '123456',
  },
  student: {
    email: 'student@examapp.local',
    password: '123456',
  },
});
