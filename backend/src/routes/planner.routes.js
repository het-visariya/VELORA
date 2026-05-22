import { Router } from 'express';
import { getEvents, addEvent, deleteEvent } from '../controllers/planner.controller.js';

const router = Router();

router.get('/events', getEvents);
router.post('/events', addEvent);
router.delete('/events/:id', deleteEvent);

export default router;
