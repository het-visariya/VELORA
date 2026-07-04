-- Velora Database Schema v1.1

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  profile_image   TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS closet_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  brand       VARCHAR(100),
  category    VARCHAR(100),
  season      VARCHAR(50),
  image       TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_closet_user ON closet_items(user_id);

CREATE TABLE IF NOT EXISTS outfits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_outfits_user ON outfits(user_id);

CREATE TABLE IF NOT EXISTS outfit_items (
  outfit_id       UUID REFERENCES outfits(id) ON DELETE CASCADE,
  closet_item_id  UUID REFERENCES closet_items(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, closet_item_id)
);

CREATE TABLE IF NOT EXISTS planner_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  type             VARCHAR(100),
  date             INTEGER NOT NULL,
  month            INTEGER NOT NULL,
  year             INTEGER NOT NULL,
  assigned_clothes JSONB DEFAULT '[]',
  created_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_planner_user ON planner_events(user_id);

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255),
  description   TEXT,
  tags          TEXT[],
  suggestion_type VARCHAR(50) DEFAULT 'general',
  generated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tryon_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  height_cm       NUMERIC(5,1),
  weight          NUMERIC(6,1),
  weight_unit     VARCHAR(10) DEFAULT 'kgs',
  gender          VARCHAR(50),
  body_structure  VARCHAR(255),
  skin_tone       VARCHAR(50),
  selected_items  JSONB DEFAULT '[]',
  created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tryon_user ON tryon_sessions(user_id);
