import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import closetRoutes from './routes/closet.routes.js';
import outfitsRoutes from './routes/outfits.routes.js';
import plannerRoutes from './routes/planner.routes.js';
import profileRoutes from './routes/profile.routes.js';
import aiRoutes from './routes/ai.routes.js';
import tryonRoutes from './routes/tryon.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return true;
  }
  return false;
};

// Security & parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve 3D models as static files with proper CORS
app.use('/models', express.static(path.join(__dirname, '../public/models'), {
  maxAge: '1d',
  setHeaders: (res, req) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Handle CORS preflight for models
app.options('/models/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/closet', authMiddleware, closetRoutes);
app.use('/outfits', authMiddleware, outfitsRoutes);
app.use('/planner', authMiddleware, plannerRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/ai', authMiddleware, aiRoutes);
app.use('/tryon', authMiddleware, tryonRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../Frontend/dist/index.html')));
}

// Global error handler
app.use(errorMiddleware);

export default app;
