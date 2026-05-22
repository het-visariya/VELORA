import { Router } from 'express';
import { getSuggestions, analyzeStyleHandler } from '../controllers/ai.controller.js';

const router = Router();

router.get('/suggestions', getSuggestions);
router.post('/analyze', analyzeStyleHandler);

export default router;
