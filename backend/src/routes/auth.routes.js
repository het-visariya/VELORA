import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, googleOAuth, appleOAuth, verifySocialCode } from '../controllers/auth.controller.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests, please try again later', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleOAuth);
router.post('/apple', appleOAuth);
router.post('/verify', verifySocialCode);

export default router;
