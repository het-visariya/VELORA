import { Router } from 'express';
import { createSession, getModelUrls, getLatest } from '../controllers/tryon.controller.js';

const router = Router();

router.post('/session', createSession);
router.get('/models', getModelUrls);
router.get('/session/latest', getLatest);

export default router;
