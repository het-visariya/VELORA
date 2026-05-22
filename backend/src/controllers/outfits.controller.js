import { getOutfits, createOutfit, deleteOutfit } from '../models/index.js';

export async function getOutfitsHandler(req, res, next) {
  try {
    const result = await getOutfits(req.user.userId);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function saveOutfit(req, res, next) {
  try {
    const { name, items } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Outfit name is required', code: 'VALIDATION_ERROR' });
    }
    const outfit = await createOutfit(req.user.userId, name, items || []);
    res.status(201).json({ success: true, data: outfit });
  } catch (err) {
    next(err);
  }
}

export async function deleteOutfitHandler(req, res, next) {
  try {
    const { id } = req.params;
    const result = await deleteOutfit(id, req.user.userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outfit not found or not authorized', code: 'NOT_FOUND' });
    }
    res.json({ success: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
}
