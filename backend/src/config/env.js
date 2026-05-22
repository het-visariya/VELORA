const commonVars = ['JWT_SECRET', 'PORT'];
const dbVars = process.env.DATABASE_URL
  ? []
  : ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

export function validateEnv() {
  const missing = [...commonVars, ...dbVars].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
