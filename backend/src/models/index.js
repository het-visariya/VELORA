import pool from '../config/db.js';

export const query = (text, params) => pool.query(text, params);

// User queries
export const createUser = (name, email, passwordHash) =>
  query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at', [name, email, passwordHash]);

export const findUserByEmail = (email) =>
  query('SELECT * FROM users WHERE email = $1', [email]);

export const findUserById = (id) =>
  query('SELECT id, name, email, profile_image, created_at FROM users WHERE id = $1', [id]);

export const updateUser = (id, fields) => {
  const setClauses = [];
  const values = [];
  let idx = 1;
  if (fields.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(fields.name); }
  if (fields.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(fields.email); }
  if (fields.profileImage !== undefined) { setClauses.push(`profile_image = $${idx++}`); values.push(fields.profileImage); }
  setClauses.push(`updated_at = NOW()`);
  values.push(id);
  return query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, name, email, profile_image, created_at`, values);
};

// Closet queries
export const getClosetItems = (userId) =>
  query('SELECT id, name, brand, category, season, image, created_at FROM closet_items WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

export const addClosetItem = (userId, { name, brand, category, season, image }) =>
  query('INSERT INTO closet_items (user_id, name, brand, category, season, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [userId, name, brand, category, season, image]);

export const deleteClosetItem = (id, userId) =>
  query('DELETE FROM closet_items WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

export const seedClosetItems = (userId, items) => {
  if (items.length === 0) return Promise.resolve({ rows: [] });
  const values = [];
  const placeholders = [];
  let idx = 1;
  for (const item of items) {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(userId, item.name, item.brand, item.category, item.season, item.image);
  }
  return query(`INSERT INTO closet_items (user_id, name, brand, category, season, image) VALUES ${placeholders.join(', ')} RETURNING id, name, brand, category, season, image`, values);
};

// Outfit queries
export const getOutfits = (userId) =>
  query(`SELECT o.id, o.name, o.created_at,
    COALESCE(
      json_agg(
        json_build_object('id', ci.id, 'name', ci.name, 'brand', ci.brand, 'category', ci.category, 'season', ci.season, 'image', ci.image)
      ) FILTER (WHERE ci.id IS NOT NULL),
      '[]'
    ) AS items
    FROM outfits o
    LEFT JOIN outfit_items oi ON oi.outfit_id = o.id
    LEFT JOIN closet_items ci ON ci.id = oi.closet_item_id
    WHERE o.user_id = $1
    GROUP BY o.id, o.name, o.created_at
    ORDER BY o.created_at DESC`, [userId]);

export const createOutfit = async (userId, name, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const outfitResult = await client.query(
      'INSERT INTO outfits (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
      [userId, name]
    );
    const outfit = outfitResult.rows[0];
    if (items && items.length > 0) {
      const values = items.map((_, i) => `($1, $${i + 2})`).join(', ');
      const itemParams = [outfit.id, ...items.map(i => i.id)];
      await client.query(
        `INSERT INTO outfit_items (outfit_id, closet_item_id) VALUES ${values}`,
        itemParams
      );
    }
    await client.query('COMMIT');
    outfit.items = items || [];
    return outfit;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteOutfit = (id, userId) =>
  query('DELETE FROM outfits WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

// Planner queries
export const getPlannerEvents = (userId) =>
  query('SELECT id, title, type, date, month, year, assigned_clothes, created_at FROM planner_events WHERE user_id = $1 ORDER BY year DESC, month DESC, date DESC', [userId]);

export const createPlannerEvent = (userId, { title, type, date, month, year, assignedClothes }) =>
  query('INSERT INTO planner_events (user_id, title, type, date, month, year, assigned_clothes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [userId, title, type, date, month, year, JSON.stringify(assignedClothes || [])]);

export const deletePlannerEvent = (id, userId) =>
  query('DELETE FROM planner_events WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

// AI Suggestions queries
export const getRecentSuggestions = (userId, type = 'general') =>
  query('SELECT id, title, description, tags, generated_at FROM ai_suggestions WHERE user_id = $1 AND suggestion_type = $2 AND generated_at > NOW() - INTERVAL \'24 hours\' ORDER BY generated_at DESC', [userId, type]);

export const saveSuggestions = (userId, suggestions, type = 'general') => {
  if (suggestions.length === 0) return Promise.resolve({ rows: [] });
  const values = [];
  const placeholders = [];
  let idx = 1;
  for (const s of suggestions) {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(userId, s.title, s.description, s.tags || [], type);
  }
  return query(`INSERT INTO ai_suggestions (user_id, title, description, tags, suggestion_type) VALUES ${placeholders.join(', ')} RETURNING id, title, description, tags`, values);
};

// Try-on queries
export const saveTryOnSession = (userId, data) =>
  query(`INSERT INTO tryon_sessions (user_id, height_cm, weight, weight_unit, gender, body_structure, skin_tone, selected_items)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [userId, data.heightCm, data.weight, data.weightUnit, data.gender, data.bodyStructure, data.skinTone, JSON.stringify(data.selectedItems || [])]);

export const getLatestSession = (userId) =>
  query('SELECT * FROM tryon_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
