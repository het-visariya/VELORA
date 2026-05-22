import { getPlannerEvents, createPlannerEvent, deletePlannerEvent } from '../models/index.js';

export async function getEvents(req, res, next) {
  try {
    const result = await getPlannerEvents(req.user.userId);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function addEvent(req, res, next) {
  try {
    const { title, type, date, month, year, assignedClothes } = req.body;
    if (!title || date === undefined || month === undefined || year === undefined) {
      return res.status(400).json({ success: false, message: 'Title, date, month, and year are required', code: 'VALIDATION_ERROR' });
    }
    const result = await createPlannerEvent(req.user.userId, { title, type, date, month, year, assignedClothes });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await deletePlannerEvent(id, req.user.userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found or not authorized', code: 'NOT_FOUND' });
    }
    res.json({ success: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
}
