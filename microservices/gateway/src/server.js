import { createGateway } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
const server = createGateway();

server.listen(port, host, () => {
  console.log(`ExamApp gateway listening on http://${host}:${port}`);
  console.log(`Scoring service: ${process.env.SCORING_SERVICE_URL ?? 'http://localhost:5002'}`);
  console.log(`Analytics service: ${process.env.ANALYTICS_SERVICE_URL ?? 'http://localhost:5001'}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing the gateway.`);
  server.close((error) => { if (error) { console.error(error); process.exitCode = 1; } });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
