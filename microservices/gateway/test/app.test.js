import assert from 'node:assert/strict';
import test from 'node:test';
import { createGateway } from '../src/app.js';

const quietLogger = { info() {}, error() {} };

async function withGateway(options, callback) {
  const server = createGateway({ ...options, logger: quietLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try { await callback(baseUrl); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

function jsonResponse(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }); }

function healthyDownstreams() {
  return async (input, options = {}) => {
    const url = String(input);
    if (url === 'http://scoring.test/health') return jsonResponse({ service: 'examapp-scoring', status: 'ok', port: 5002 });
    if (url === 'http://analytics.test/health') return jsonResponse({ service: 'examapp-analytics', status: 'ok', port: 5001 });
    if (url === 'http://scoring.test/api/score') {
      const payload = JSON.parse(options.body);
      const score = (payload.correctAnswers / payload.totalQuestions) * 100;
      return jsonResponse({ service: 'examapp-scoring', ...payload, score, passed: score >= payload.passingScore });
    }
    if (url === 'http://analytics.test/api/analytics/overview') return jsonResponse({ service: 'examapp-analytics', summary: { totalAttempts: 5, averageScore: 74.8, passRate: 80 } });
    throw new Error(`Unexpected downstream URL: ${url}`);
  };
}

const options = { scoringBaseUrl: 'http://scoring.test', analyticsBaseUrl: 'http://analytics.test', fetchImpl: healthyDownstreams() };

test('dashboard is browser-ready', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/`); const body = await response.text();
  assert.equal(response.status, 200); assert.match(body, /ExamApp microservices/); assert.match(body, /Check all services/);
  const script = body.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'dashboard must include its interaction script');
  assert.doesNotThrow(() => new Function(script), 'dashboard interaction script must parse');
}));

test('health identifies gateway', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/health`); const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.service, 'examapp-gateway'); assert.equal(body.status, 'ok');
}));

test('service health is aggregated', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/api/services`); const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.status, 'ok'); assert.equal(body.services.scoring.status, 'ok'); assert.equal(body.services.analytics.status, 'ok');
}));

test('score request is validated and proxied', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/api/score?correct=4&total=5&passingScore=60`); const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.data.score, 80); assert.equal(body.data.passed, true);
}));

test('impossible score input is rejected', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/api/score?correct=6&total=5`); const body = await response.json();
  assert.equal(response.status, 400); assert.equal(body.error.code, 'INVALID_QUERY');
}));

test('demo combines both domain services', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/api/demo`); const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.score.score, 80); assert.equal(body.analytics.summary.totalAttempts, 5);
}));

test('unknown route is structured JSON', async () => withGateway(options, async (base) => {
  const response = await fetch(`${base}/missing`); const body = await response.json();
  assert.equal(response.status, 404); assert.equal(body.error.code, 'NOT_FOUND');
}));
