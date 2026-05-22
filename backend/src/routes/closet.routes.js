import { Router } from 'express';
import { getItems, addItem, deleteItem } from '../controllers/closet.controller.js';

const router = Router();

router.get('/', getItems);
router.post('/', addItem);
router.delete('/:id', deleteItem);

export default router;
