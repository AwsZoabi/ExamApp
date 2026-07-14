import { createServer } from 'node:http';

const GATEWAY_VERSION = '1.1.0';
const DEFAULT_TIMEOUT_MS = 4_000;

class ClientError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClientError';
  }
}

class UpstreamError extends Error {
  constructor(service, message, details = null) {
    super(message);
    this.name = 'UpstreamError';
    this.service = service;
    this.details = details;
  }
}

const dashboardHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ExamApp Microservices Gateway</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #07111f; color: #e8f0ff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 12% 5%, rgba(27,123,255,.22), transparent 30rem), radial-gradient(circle at 92% 12%, rgba(37,211,159,.15), transparent 28rem), #07111f; }
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0 64px; }
    .eyebrow { color: #77d6ff; font-size: .78rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    h1 { max-width: 780px; margin: 12px 0; font-size: clamp(2.2rem, 6vw, 4.8rem); line-height: .98; letter-spacing: -.055em; }
    .lead { max-width: 720px; color: #aebdd3; font-size: 1.08rem; line-height: 1.7; }
    .topology, .grid { display: grid; gap: 16px; }
    .topology { grid-template-columns: repeat(3, 1fr); margin: 34px 0; }
    .service, .card { border: 1px solid rgba(151,181,222,.18); border-radius: 18px; background: rgba(12,28,48,.82); box-shadow: 0 18px 50px rgba(0,0,0,.18); }
    .service { padding: 18px; position: relative; overflow: hidden; }
    .service::after { content: ""; position: absolute; inset: auto 0 0; height: 3px; background: var(--accent); }
    .service strong { display: block; margin-bottom: 6px; font-size: 1.04rem; }
    .service span { color: #93a7c2; font-size: .9rem; }
    .gateway { --accent: #4d9dff; } .scoring { --accent: #25d39f; } .analytics { --accent: #b993ff; }
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card { padding: 22px; }
    .card h2 { margin: 0 0 8px; font-size: 1.2rem; }
    .card p { min-height: 44px; margin: 0 0 18px; color: #9fb0c8; line-height: 1.5; }
    button, a.button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border: 0; border-radius: 11px; padding: 0 15px; background: #2580ee; color: white; font: inherit; font-weight: 750; text-decoration: none; cursor: pointer; }
    button:hover, a.button:hover { background: #4194f6; }
    pre { min-height: 118px; margin: 16px 0 0; border: 1px solid rgba(140,174,218,.14); border-radius: 12px; padding: 14px; overflow: auto; background: #050d17; color: #a9e5cf; font: .82rem/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; }
    footer { margin-top: 28px; color: #7186a3; font-size: .88rem; } code { color: #8ed6ff; }
    @media (max-width: 760px) { .topology, .grid { grid-template-columns: 1fr; } main { padding-top: 30px; } }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">Docker Compose · Internal Network · CI/CD</div>
    <h1>ExamApp microservices, through one gateway.</h1>
    <p class="lead">This dashboard is served by the native Node.js gateway on port 3000. Every action travels through the gateway to a focused service on the private Docker network.</p>
    <section class="topology" aria-label="Service topology">
      <article class="service gateway"><strong>Node.js Gateway</strong><span>Public entry point · :3000</span></article>
      <article class="service scoring"><strong>Python Scoring</strong><span>Exam score calculation · :5002</span></article>
      <article class="service analytics"><strong>.NET 9 Analytics</strong><span>Exam performance summary · :5001</span></article>
    </section>
    <section class="grid">
      <article class="card"><h2>Service health</h2><p>Ask both downstream services for their health through Docker DNS.</p><button type="button" data-endpoint="/api/services" data-target="services-output">Check all services</button><pre id="services-output">Ready.</pre></article>
      <article class="card"><h2>Score an exam</h2><p>Send 4 correct answers out of 5 to the Flask scoring service.</p><button type="button" data-endpoint="/api/score?correct=4&amp;total=5&amp;passingScore=60" data-target="score-output">Calculate score</button><pre id="score-output">Ready.</pre></article>
      <article class="card"><h2>Exam analytics</h2><p>Retrieve a deterministic overview from the .NET analytics service.</p><button type="button" data-endpoint="/api/analytics" data-target="analytics-output">Load analytics</button><pre id="analytics-output">Ready.</pre></article>
      <article class="card"><h2>End-to-end demo</h2><p>Run scoring and analytics concurrently and return one aggregate response.</p><button type="button" data-endpoint="/api/demo" data-target="demo-output">Run full demo</button><pre id="demo-output">Ready.</pre></article>
    </section>
    <footer>Gateway health: <a class="button" href="/health">Open JSON</a> &nbsp; Internal routes use <code>scoring-service:5002</code> and <code>analytics-service:5001</code>.</footer>
  </main>
  <script>
    async function run(endpoint, targetId) {
      const target = document.getElementById(targetId);
      target.textContent = 'Loading ' + endpoint + ' ...';
      try {
        const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
        const body = await response.json();
        target.textContent = JSON.stringify(body, null, 2);
        if (!response.ok) target.textContent = 'HTTP ' + response.status + '\\n' + target.textContent;
      } catch (error) { target.textContent = 'Request failed: ' + error.message; }
    }
    document.querySelectorAll('[data-endpoint]').forEach((button) => button.addEventListener('click', () => run(button.dataset.endpoint, button.dataset.target)));
  </script>
</body>
</html>`;

function applyCommonHeaders(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self';");
}

function writeJson(response, statusCode, body) {
  applyCommonHeaders(response);
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body, null, 2));
}

function writeHtml(response, statusCode, body) {
  applyCommonHeaders(response);
  response.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(body);
}

function normalizeBaseUrl(value) { return value.replace(/\/+$/, ''); }

function readInteger(searchParams, name, defaultValue = null) {
  const rawValue = searchParams.get(name);
  if (rawValue === null && defaultValue !== null) return defaultValue;
  const value = Number(rawValue);
  if (rawValue === null || rawValue.trim() === '' || !Number.isInteger(value)) throw new ClientError(`Query parameter "${name}" must be an integer.`);
  return value;
}

async function fetchJson(fetchImpl, service, url, options, timeoutMs) {
  let response;
  try {
    response = await fetchImpl(url, { ...options, headers: { accept: 'application/json', ...(options?.headers ?? {}) }, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    throw new UpstreamError(service, `${service} is unavailable.`, error.message);
  }
  const rawBody = await response.text();
  let body;
  try { body = rawBody ? JSON.parse(rawBody) : null; } catch { body = { raw: rawBody }; }
  if (!response.ok) throw new UpstreamError(service, `${service} returned HTTP ${response.status}.`, body);
  return body;
}

function scoreInputFrom(searchParams) {
  const correctAnswers = readInteger(searchParams, 'correct');
  const totalQuestions = readInteger(searchParams, 'total');
  const passingScore = readInteger(searchParams, 'passingScore', 60);
  if (totalQuestions <= 0) throw new ClientError('"total" must be greater than zero.');
  if (correctAnswers < 0 || correctAnswers > totalQuestions) throw new ClientError('"correct" must be between zero and "total".');
  if (passingScore < 0 || passingScore > 100) throw new ClientError('"passingScore" must be between 0 and 100.');
  return { correctAnswers, totalQuestions, passingScore };
}

export function createGateway(options = {}) {
  const scoringBaseUrl = normalizeBaseUrl(options.scoringBaseUrl ?? process.env.SCORING_SERVICE_URL ?? 'http://localhost:5002');
  const analyticsBaseUrl = normalizeBaseUrl(options.analyticsBaseUrl ?? process.env.ANALYTICS_SERVICE_URL ?? 'http://localhost:5001');
  const timeoutMs = Number(options.timeoutMs ?? process.env.UPSTREAM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const logger = options.logger ?? console;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('UPSTREAM_TIMEOUT_MS must be a positive number.');

  return createServer(async (request, response) => {
    const startedAt = Date.now();
    const url = new URL(request.url ?? '/', 'http://gateway.local');
    response.once('finish', () => logger.info?.(`${request.method} ${url.pathname} ${response.statusCode} ${Date.now() - startedAt}ms`));
    try {
      if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');
        writeJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'The gateway accepts GET requests only.' } });
        return;
      }
      if (url.pathname === '/') { writeHtml(response, 200, dashboardHtml); return; }
      if (url.pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
      if (url.pathname === '/health') {
        writeJson(response, 200, { service: 'examapp-gateway', status: 'ok', version: GATEWAY_VERSION, port: Number(process.env.PORT ?? 3000) });
        return;
      }
      if (url.pathname === '/api/services') {
        const probe = async (name, endpoint, port) => {
          try { return { service: name, status: 'ok', port, details: await fetchJson(fetchImpl, name, endpoint, undefined, timeoutMs) }; }
          catch (error) { return { service: name, status: 'unavailable', port, error: error.message }; }
        };
        const [scoring, analytics] = await Promise.all([
          probe('examapp-scoring', `${scoringBaseUrl}/health`, 5002),
          probe('examapp-analytics', `${analyticsBaseUrl}/health`, 5001),
        ]);
        const healthy = scoring.status === 'ok' && analytics.status === 'ok';
        writeJson(response, healthy ? 200 : 503, { status: healthy ? 'ok' : 'degraded', gateway: { service: 'examapp-gateway', status: 'ok', port: 3000 }, services: { scoring, analytics } });
        return;
      }
      if (url.pathname === '/api/score') {
        const input = scoreInputFrom(url.searchParams);
        const result = await fetchJson(fetchImpl, 'examapp-scoring', `${scoringBaseUrl}/api/score`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }, timeoutMs);
        writeJson(response, 200, { via: 'examapp-gateway', data: result });
        return;
      }
      if (url.pathname === '/api/analytics') {
        const result = await fetchJson(fetchImpl, 'examapp-analytics', `${analyticsBaseUrl}/api/analytics/overview`, undefined, timeoutMs);
        writeJson(response, 200, { via: 'examapp-gateway', data: result });
        return;
      }
      if (url.pathname === '/api/demo') {
        const sampleScore = { correctAnswers: 4, totalQuestions: 5, passingScore: 60 };
        const [score, analytics] = await Promise.all([
          fetchJson(fetchImpl, 'examapp-scoring', `${scoringBaseUrl}/api/score`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sampleScore) }, timeoutMs),
          fetchJson(fetchImpl, 'examapp-analytics', `${analyticsBaseUrl}/api/analytics/overview`, undefined, timeoutMs),
        ]);
        writeJson(response, 200, { status: 'ok', via: 'examapp-gateway', score, analytics });
        return;
      }
      writeJson(response, 404, { error: { code: 'NOT_FOUND', message: `No gateway route exists at ${url.pathname}.` } });
    } catch (error) {
      if (error instanceof ClientError) { writeJson(response, 400, { error: { code: 'INVALID_QUERY', message: error.message } }); return; }
      if (error instanceof UpstreamError) {
        logger.error?.(error);
        writeJson(response, 502, { error: { code: 'UPSTREAM_FAILURE', service: error.service, message: error.message, details: error.details } });
        return;
      }
      logger.error?.(error);
      writeJson(response, 500, { error: { code: 'INTERNAL_ERROR', message: 'The gateway could not complete the request.' } });
    }
  });
}
