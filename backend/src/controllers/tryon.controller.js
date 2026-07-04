import { saveTryOnSession, getLatestSession } from '../models/index.js';

const optionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function createSession(req, res, next) {
  try {
    const { heightCm, weight, weightUnit, gender, bodyStructure, skinTone, selectedItems } = req.body;

    const result = await saveTryOnSession(req.user.userId, {
      heightCm: optionalNumber(heightCm),
      weight: optionalNumber(weight),
      weightUnit,
      gender,
      bodyStructure,
      skinTone,
      selectedItems
    });

    const isFemale = gender?.toLowerCase().includes('female') || gender?.toLowerCase() === 'woman';
    const modelUrl = isFemale ? '/models/girl3D.fbx' : '/models/boy3D.fbx';

    res.status(201).json({
      success: true,
      data: {
        sessionId: result.rows[0].id,
        modelUrl
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getModelUrls(req, res) {
  res.json({
    success: true,
    data: {
      male: '/models/boy3D.fbx',
      female: '/models/girl3D.fbx'
    }
  });
}

export async function getLatest(req, res, next) {
  try {
    const result = await getLatestSession(req.user.userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No try-on sessions found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
