import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { saveTryOnSession, getLatestSession } from '../models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, '../../public/models');

/**
 * Web-ready models, generated into public/models by `npm run build:models` and
 * served by the /models static mount in app.js. They are git-ignored, so a
 * fresh clone has none until that script is run.
 *
 * `standard` carries a 2048 texture, `mobile` a 1024 one; the client picks.
 */
const MODEL_VARIANTS = {
  male: { standard: 'boy.glb', mobile: 'boy-1k.glb' },
  female: { standard: 'girl.glb', mobile: 'girl-1k.glb' },
};

/** Map whatever the client called the gender onto a model key. */
function modelKeyForGender(gender) {
  const value = String(gender || '').toLowerCase();
  const isFemale = value.includes('female') || value.includes('woman') || value === 'girl' || value === 'f';
  return isFemale ? 'female' : 'male';
}

function modelUrls() {
  const urls = {};
  const missing = [];

  for (const [key, variants] of Object.entries(MODEL_VARIANTS)) {
    urls[key] = {};
    for (const [quality, file] of Object.entries(variants)) {
      if (!existsSync(path.join(MODELS_DIR, file))) missing.push(file);
      urls[key][quality] = `/models/${file}`;
    }
  }

  return { urls, missing };
}

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

    const { urls } = modelUrls();

    res.status(201).json({
      success: true,
      data: {
        sessionId: result.rows[0].id,
        modelUrl: urls[modelKeyForGender(gender)].standard
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getModelUrls(req, res) {
  const { urls, missing } = modelUrls();

  // Say so plainly rather than handing back URLs that will 404 in the loader
  // and surface as a blank canvas with no explanation.
  if (missing.length > 0) {
    console.error(`[VELORA] missing model files in public/models: ${missing.join(', ')}`);
    return res.status(503).json({
      success: false,
      message: '3D models are not built on this server. Run `npm run build:models`.',
      code: 'MODELS_UNAVAILABLE',
    });
  }

  res.json({ success: true, data: urls });
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
