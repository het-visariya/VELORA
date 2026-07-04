import { Router } from 'express';
import { getOutfitsHandler, saveOutfit, deleteOutfitHandler } from '../controllers/outfits.controller.js';

const router = Router();

router.get('/', getOutfitsHandler);
router.post('/', saveOutfit);
router.delete('/:id', deleteOutfitHandler);

export default router;
