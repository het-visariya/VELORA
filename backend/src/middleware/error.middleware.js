export function errorMiddleware(err, req, res, next) {
  console.error('[VELORA ERROR]', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
}
