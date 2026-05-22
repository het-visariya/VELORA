import { getRecentSuggestions, saveSuggestions } from '../models/index.js';
import { generateStyleSuggestions, analyzeStyle } from '../services/ai.service.js';
import { getClosetItems, getPlannerEvents, getOutfits } from '../models/index.js';

export async function getSuggestions(req, res, next) {
  try {
    const cached = await getRecentSuggestions(req.user.userId, 'general');
    if (cached.rows.length > 0) {
      return res.json({ success: true, data: cached.rows });
    }

    const suggestions = await generateStyleSuggestions();
    const saved = await saveSuggestions(req.user.userId, suggestions, 'general');
    res.json({ success: true, data: saved.rows });
  } catch (err) {
    next(err);
  }
}

export async function analyzeStyleHandler(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required', code: 'VALIDATION_ERROR' });
    }

    const closetResult = await getClosetItems(req.user.userId);
    const eventsResult = await getPlannerEvents(req.user.userId);
    const outfitsResult = await getOutfits(req.user.userId);

    const analysis = await analyzeStyle(
      closetResult.rows,
      eventsResult.rows,
      outfitsResult.rows
    );

    // Cache the analysis results
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      await saveSuggestions(req.user.userId, analysis.suggestions, 'analyze');
    }

    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
}
