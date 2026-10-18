import { getValidStoredToken } from '../lib/token';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Dispatched when the API says this session is finished, so AuthContext can
 * sign the user out. A plain window event keeps the API layer and the React
 * tree decoupled - no circular import, no context access outside a component.
 */
export const UNAUTHORIZED_EVENT = 'velora:unauthorized';

/**
 * Codes authMiddleware returns for a dead session (backend/src/middleware/
 * auth.middleware.js). Deliberately NOT the credential-failure codes:
 * /auth/login answers a wrong password with 401 INVALID_CREDENTIALS and
 * /auth/verify a bad code with 401 INVALID_CODE. Treating those as expiry
 * would sign the user out every time they mistyped a password.
 */
const SESSION_DEAD_CODES = new Set(['UNAUTHORIZED', 'TOKEN_INVALID']);

/** Public endpoints, where a 401 is about the credentials just submitted. */
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/google', '/auth/apple', '/auth/verify'];

function isPublicPath(endpoint) {
  return PUBLIC_PATHS.some((path) => endpoint.startsWith(path));
}

/** An Error that keeps the HTTP status and the API's error code for callers. */
export class ApiError extends Error {
  constructor(message, { status, code, endpoint } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.endpoint = endpoint;
  }
}

export async function apiRequest(method = 'GET', endpoint, body = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  // getValidStoredToken rather than a raw read: an already-expired token is
  // swept here instead of being spent on a round trip that must fail.
  const token = getValidStoredToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    // An error page or a proxy failure is not JSON, so never assume it is.
    const payload = await response.json().catch(() => null);
    const message = payload?.message || `API Error: ${response.status}`;
    const code = payload?.code;

    const sessionDead = response.status === 401
      && !isPublicPath(endpoint)
      && (code === undefined || SESSION_DEAD_CODES.has(code));

    if (sessionDead && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, {
        detail: { endpoint, code },
      }));
    }

    throw new ApiError(message, { status: response.status, code, endpoint });
  }

  return response.json();
}

export default apiRequest;
