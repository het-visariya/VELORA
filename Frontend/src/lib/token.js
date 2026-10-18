/**
 * JWT storage and inspection.
 *
 * The backend issues a JWT in the response body (backend/src/controllers/
 * auth.controller.js) and authMiddleware expects it back as
 * `Authorization: Bearer <token>`. There is no cookie and no refresh token,
 * so the token in localStorage is the single piece of evidence that the user
 * is signed in. AuthContext derives its state from it rather than from a
 * separate "am I logged in" flag, so the UI can never claim to be signed in
 * while the API rejects every request.
 */

export const TOKEN_KEY = 'velora_token';
export const USER_KEY = 'velora_user';
export const VIEW_KEY = 'velora_view';

/** Pre-A3 flag that duplicated auth state. Only cleared, never written. */
const LEGACY_AUTH_FLAG = 'velora_authenticated';

/** Treat a token as expired slightly early, so it cannot die mid-request. */
const EXPIRY_SKEW_MS = 10_000;

function safeLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Access throws in private-mode / blocked-cookie browsers.
    return null;
  }
}

/** Decode a JWT's payload without verifying it. Signature checks are the API's job. */
export function decodeJwtPayload(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);
    // Rebuild UTF-8 so non-ASCII names in the payload survive the decode.
    const json = decodeURIComponent(
      Array.from(binary, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    const payload = JSON.parse(json);
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

/** Expiry as epoch milliseconds, or null when the token carries no `exp`. */
export function getTokenExpiry(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

/** Milliseconds until expiry; 0 when already expired, Infinity when no `exp`. */
export function getTokenRemainingMs(token) {
  const expiresAt = getTokenExpiry(token);
  if (expiresAt === null) return Number.POSITIVE_INFINITY;
  return Math.max(0, expiresAt - EXPIRY_SKEW_MS - Date.now());
}

/** True only for a well-formed, unexpired token. */
export function isTokenValid(token) {
  if (!token) return false;
  if (!decodeJwtPayload(token)) return false;
  return getTokenRemainingMs(token) > 0;
}

export function getStoredToken() {
  const store = safeLocalStorage();
  return store ? store.getItem(TOKEN_KEY) : null;
}

/** The stored token, but only if it is still usable. Expired tokens are swept. */
export function getValidStoredToken() {
  const token = getStoredToken();
  // No token means no session, so sweep anything left over - including the
  // legacy velora_authenticated flag, which used to be the sole basis for
  // "am I signed in" and would otherwise outlive the account it belonged to.
  if (!token || !isTokenValid(token)) {
    clearAuthStorage();
    return null;
  }
  return token;
}

export function storeToken(token) {
  const store = safeLocalStorage();
  if (store && token) store.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  const store = safeLocalStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  const store = safeLocalStorage();
  if (store) {
    try {
      store.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Quota or private mode; in-memory state still holds for this session.
    }
  }
}

/** Remove every auth key, including the legacy flag A3 retired. */
export function clearAuthStorage() {
  const store = safeLocalStorage();
  if (!store) return;
  for (const key of [TOKEN_KEY, USER_KEY, VIEW_KEY, LEGACY_AUTH_FLAG]) {
    store.removeItem(key);
  }
}

/** Identity claims the API put in the token, for display before /profile loads. */
export function getTokenIdentity(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return { userId: payload.userId ?? null, email: payload.email ?? null };
}
