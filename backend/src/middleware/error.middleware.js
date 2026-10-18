/**
 * Codes the application sets deliberately are safe to return. Anything else -
 * notably a `pg` error - is not: its `code` is a raw SQLSTATE (23505, 42P01)
 * and its `message` can name columns, constraints, the database host or the
 * connection user. Those were being passed straight to the client; an
 * unreachable database answered a signup with
 * `{"code":"ENOTFOUND","message":"getaddrinfo ENOTFOUND db.<ref>.supabase.co"}`.
 */
const APP_ERROR_CODES = new Set([
  'VALIDATION_ERROR',
  'EMAIL_EXISTS',
  'INVALID_CREDENTIALS',
  'INVALID_CODE',
  'UNAUTHORIZED',
  'TOKEN_INVALID',
  'RATE_LIMIT',
  'NOT_FOUND',
  'IMAGE_TOO_LARGE',
  'DB_UNAVAILABLE',
]);

export function errorMiddleware(err, req, res, next) {
  // The full error, including the stack, still goes to the server log.
  console.error('[VELORA ERROR]', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const isAppError = typeof err.code === 'string' && APP_ERROR_CODES.has(err.code);

  // A 4xx is the caller's own mistake, so its message is useful to them.
  // A 5xx is ours, and its details stay on the server.
  const exposeMessage = isAppError || (statusCode >= 400 && statusCode < 500 && err.expose !== false);

  res.status(statusCode).json({
    success: false,
    message: exposeMessage && err.message ? err.message : 'Internal server error',
    code: isAppError ? err.code : 'INTERNAL_ERROR',
  });
}
