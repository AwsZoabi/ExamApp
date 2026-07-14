import { appConfig } from '../config';
import { storageService } from './storageService';
import { loggerService } from './loggerService';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function unwrapPayload(payload) {
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    Object.hasOwn(payload, 'data')
  ) {
    return payload.data;
  }
  return payload;
}

function errorFromPayload(payload, status) {
  const candidate = payload?.error ?? payload;
  const message =
    candidate?.message ?? payload?.message ?? `Request failed with status ${status || 'unknown'}.`;
  return new ApiError(message, {
    status,
    code: candidate?.code ?? payload?.code ?? 'REQUEST_FAILED',
    details: candidate?.details ?? payload?.details ?? null,
  });
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), appConfig.requestTimeoutMs);
  const token = storageService.getToken();
  const url = `${appConfig.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    accept: 'application/json',
    ...(options.body ? { 'content-type': 'application/json' } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body:
        options.body && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
      signal: controller.signal,
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) throw errorFromPayload(payload, response.status);
    return unwrapPayload(payload);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('The server took too long to respond. Please try again.', {
        code: 'REQUEST_TIMEOUT',
      });
    }
    if (error instanceof ApiError) throw error;

    loggerService.error('API request failed', { path, message: error.message });
    throw new ApiError('Unable to reach ExamApp. Check the server and your connection.', {
      code: 'NETWORK_ERROR',
      details: error.message,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}
