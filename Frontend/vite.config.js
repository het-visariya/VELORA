import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Every path the backend mounts at its root (backend/src/app.js). The API has
// no /api prefix, so each mount has to be proxied by name.
const BACKEND_PATHS = [
  '/auth',
  '/closet',
  '/outfits',
  '/planner',
  '/profile',
  '/ai',
  '/tryon',
  '/models',
  '/uploads',
  '/health',
];

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://localhost:5000';

export default defineConfig({
  // @vitejs/plugin-react was a dependency but was never registered, because
  // this file did not exist. Without it there is no Fast Refresh.
  plugins: [react()],

  server: {
    // Vite's default. Not strict: if another project already holds 5173, Vite
    // moves to 5174 and the proxy follows it, and dev CORS allows any
    // localhost port anyway (isAllowedOrigin in backend/src/app.js).
    port: 5173,
    // Proxying every backend mount lets the frontend call relative paths, so
    // requests are same-origin in dev and CORS never comes into play.
    // Requires VITE_API_URL to be empty - see Frontend/.env.example.
    proxy: Object.fromEntries(
      BACKEND_PATHS.map((path) => [
        path,
        { target: BACKEND_ORIGIN, changeOrigin: true },
      ]),
    ),
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
