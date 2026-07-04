import { getClosetItems, addClosetItem, deleteClosetItem } from '../models/index.js';

export async function getItems(req, res, next) {
  try {
    const result = await getClosetItems(req.user.userId);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function addItem(req, res, next) {
  try {
    const { name, brand, category, season, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Item name is required', code: 'VALIDATION_ERROR' });
    }
    const result = await addClosetItem(req.user.userId, { name, brand, category, season, image });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const { id } = req.params;
    const result = await deleteClosetItem(id, req.user.userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found or not authorized', code: 'NOT_FOUND' });
    }
    res.json({ success: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
}
