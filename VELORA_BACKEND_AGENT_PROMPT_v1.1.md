# VELORA — Full Backend, Database & 3D Try-On Integration Prompt
## For: Backend Agent (MERN Stack + PostgreSQL + GLB 3D Model Rendering)

---

## ⚠️ CRITICAL CONSTRAINT — READ FIRST

**DO NOT change, modify, refactor, or re-style ANY part of the existing frontend.**
This includes:
- All JSX component files (`App.jsx`, all pages, all components)
- All CSS / Tailwind classes in any `.jsx` file
- `styles.css`
- `main.jsx`, `index.html`
- The routing logic (view-based SPA using React state, not React Router)
- The `AuthContext.jsx` and all hooks

The frontend is **complete, production-ready, and locked.** Your only job is to wire the backend endpoints, database, and 3D rendering logic so the existing API layer (`src/api/*.js`) works correctly, and to inject the Three.js/GLB 3D viewer into the existing `TryOnPage.jsx` canvas container — **without changing TryOnPage's layout, structure, or styling.**

---

## 1. PROJECT OVERVIEW

**App Name:** Velora  
**Nature:** AI-powered luxury fashion SPA — digital wardrobe management, outfit building, event planning, AI style suggestions, and 3D virtual try-on.  
**Frontend Stack:** React 18 + Vite + Tailwind CSS (no React Router — view state managed in `App.jsx`)  
**Backend Stack:** Node.js + Express.js  
**Database:** PostgreSQL (already in use — extend it, do not replace it)  
**3D Assets:** Two GLB files — `boy3D.glb` (male, ~15.7 MB) and `girl3D.glb` (female, ~12.8 MB), both glTF 2.0 binary format  

---

## 2. EXISTING FRONTEND API LAYER (READ-ONLY REFERENCE)

The frontend already has these API modules. Build all backend routes to match these **exactly**. Do not rename or restructure any endpoint.

### `src/api/client.js`
```js
const API_BASE = import.meta.env.VITE_API_URL || '';
// All requests go to: ${API_BASE}${endpoint}
// Auth token must be sent as: Authorization: Bearer <token>
// All requests/responses are JSON
```

### `src/api/auth.api.js`
```
POST /auth/login        { email, password }
POST /auth/register     { name, email, password }
// logout is client-side only (clears localStorage)
```

### `src/api/closet.api.js`
```
GET    /closet          → returns array of closet items for authenticated user
POST   /closet          → adds a new closet item
DELETE /closet/:id      → deletes an item by id
```

### `src/api/outfits.api.js`
```
GET    /outfits         → returns saved outfits for authenticated user
POST   /outfits         → saves a new outfit
DELETE /outfits/:id     → deletes an outfit
```

### `src/api/planner.api.js`
```
GET    /planner/events          → returns events for authenticated user
POST   /planner/events          → creates a new event
DELETE /planner/events/:id      → deletes an event
```

### `src/api/profile.api.js`
```
GET  /profile    → returns user profile data
PUT  /profile    → updates profile (name, email, profileImage as base64 or URL)
```

### `src/api/ai.api.js`
```
GET  /ai/suggestions          → returns AI outfit suggestions for authenticated user
POST /ai/analyze   { email }  → runs a style analysis and returns result
```

---

## 3. POSTGRESQL DATABASE SCHEMA

Design and implement the following tables. Use `node-postgres` (`pg`) or `Sequelize` (your choice). Use migrations (e.g. with `node-postgres` + raw SQL migration files, or Sequelize CLI).

### Table: `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  profile_image   TEXT,                        -- base64 data URI or CDN URL
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Table: `closet_items`
```sql
CREATE TABLE closet_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  brand       VARCHAR(100),
  category    VARCHAR(100),                    -- e.g. "Women Tops", "Men Outerwear"
  season      VARCHAR(50),                     -- "All", "Spring", "Summer", "Autumn", "Winter"
  image       TEXT,                            -- URL or base64
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_closet_user ON closet_items(user_id);
```

### Table: `outfits`
```sql
CREATE TABLE outfits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_outfits_user ON outfits(user_id);
```

### Table: `outfit_items` (junction — outfit → closet items)
```sql
CREATE TABLE outfit_items (
  outfit_id       UUID REFERENCES outfits(id) ON DELETE CASCADE,
  closet_item_id  UUID REFERENCES closet_items(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, closet_item_id)
);
```

### Table: `planner_events`
```sql
CREATE TABLE planner_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  type             VARCHAR(100),               -- "Casual", "Formal", "Party", etc.
  date             INTEGER NOT NULL,           -- day of month (1–31)
  month            INTEGER NOT NULL,           -- 0-indexed (0=Jan … 11=Dec)
  year             INTEGER NOT NULL,
  assigned_clothes JSONB DEFAULT '[]',         -- snapshot of closet items at time of creation
  created_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_planner_user ON planner_events(user_id);
```

### Table: `ai_suggestions`
```sql
CREATE TABLE ai_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255),
  description   TEXT,
  tags          TEXT[],
  generated_at  TIMESTAMP DEFAULT NOW()
);
```

### Table: `tryon_sessions`
```sql
CREATE TABLE tryon_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  height_cm       NUMERIC(5,1),
  weight          NUMERIC(6,1),
  weight_unit     VARCHAR(10) DEFAULT 'kgs',
  gender          VARCHAR(50),
  body_structure  VARCHAR(255),
  skin_tone       VARCHAR(50),
  selected_items  JSONB DEFAULT '[]',          -- snapshot of items user tried on
  created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tryon_user ON tryon_sessions(user_id);
```

---

## 4. BACKEND PROJECT STRUCTURE

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # pg Pool setup using env vars
│   │   └── env.js             # dotenv validation
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verify → req.user
│   │   ├── error.middleware.js # Global error handler
│   │   └── upload.middleware.js# Multer for image/GLB uploads
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── closet.routes.js
│   │   ├── outfits.routes.js
│   │   ├── planner.routes.js
│   │   ├── profile.routes.js
│   │   ├── ai.routes.js
│   │   └── tryon.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── closet.controller.js
│   │   ├── outfits.controller.js
│   │   ├── planner.controller.js
│   │   ├── profile.controller.js
│   │   ├── ai.controller.js
│   │   └── tryon.controller.js
│   ├── services/
│   │   ├── ai.service.js       # OpenAI / Gemini integration
│   │   └── image.service.js    # Cloudinary or local storage
│   ├── models/
│   │   └── index.js            # SQL query helpers (raw pg or Sequelize)
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── app.js                  # Express app setup (no listen here)
├── public/
│   └── models/
│       ├── boy3D.glb           # ← PLACE THE MALE GLB HERE
│       └── girl3D.glb          # ← PLACE THE FEMALE GLB HERE
├── server.js                   # Entry point (app.listen)
├── .env.example
└── package.json
```

---

## 5. AUTHENTICATION — FULL IMPLEMENTATION

### POST `/auth/register`
- Validate: `name`, `email` (unique check), `password` (min 8 chars, 1 uppercase, 1 number, 1 special char — matching frontend validation)
- Hash password with `bcrypt` (saltRounds: 12)
- Insert into `users` table
- Return: `{ token, user: { id, name, email } }`

### POST `/auth/login`
- Find user by email, compare with `bcrypt.compare`
- If valid, issue JWT (payload: `{ userId, email }`, expiry: `7d`)
- Return: `{ token, user: { id, name, email, profileImage } }`

### JWT Middleware (`auth.middleware.js`)
- Extract `Bearer` token from `Authorization` header
- Verify with `jsonwebtoken`
- Attach decoded user to `req.user`
- Applied to ALL routes except `/auth/*`

**Important:** The frontend's `AuthContext.jsx` currently stores auth in `localStorage` and does NOT automatically attach JWT to API calls. You must update `src/api/client.js` ONLY (this file is not a UI file, purely utility) to:
```js
// In client.js - ADD ONLY THIS to the existing apiRequest function:
const token = localStorage.getItem('velora_token');
if (token) config.headers['Authorization'] = `Bearer ${token}`;
```
And update `src/api/auth.api.js` — on login/register success, save: `localStorage.setItem('velora_token', data.token)`.  
Also update `AuthContext.jsx` `logout` to also remove `velora_token`.  
**These are the only three files you are permitted to touch on the frontend side — and only to wire the JWT token flow. Do not touch any UI logic, styles, or component structure.**

---

## 6. ROUTE & CONTROLLER IMPLEMENTATIONS

### `/closet` routes (all protected by JWT)

**GET `/closet`**
- Query `closet_items WHERE user_id = req.user.userId ORDER BY created_at DESC`
- Return array: `[{ id, name, brand, category, season, image }]`
- Seed with default 12 items (from `useCloset.js` defaults) on first user registration

**POST `/closet`**
- Body: `{ name, brand, category, season, image }`
- Insert into `closet_items` with `user_id`
- Return the inserted item

**DELETE `/closet/:id`**
- Verify `user_id` ownership before deletion (prevent IDOR)
- Return `{ success: true }`

---

### `/outfits` routes (all protected)

**GET `/outfits`**
- Join `outfits` with `outfit_items` and `closet_items`
- Return: `[{ id, name, createdAt, items: [{ id, name, brand, category, season, image }] }]`

**POST `/outfits`**
- Body: `{ name, items: [{ id, ...itemData }] }`
- Insert into `outfits`, then `outfit_items` for each item
- Wrap in a transaction

**DELETE `/outfits/:id`**
- Ownership check, then cascade delete (outfit_items auto-delete via FK)

---

### `/planner/events` routes (all protected)

**GET `/planner/events`**
- Return all events for `req.user.userId`

**POST `/planner/events`**
- Body: `{ title, type, date, month, year, assignedClothes }`
- `assignedClothes` stored as JSONB snapshot

**DELETE `/planner/events/:id`**
- Ownership check, then delete

---

### `/profile` routes (protected)

**GET `/profile`**
- Return `{ id, name, email, profileImage, createdAt }`

**PUT `/profile`**
- Body: `{ name?, email?, profileImage? }`
- If `profileImage` is a base64 string > 1MB, compress or reject with helpful message
- For production: upload to Cloudinary and store URL instead of raw base64

---

### `/ai` routes (protected)

**GET `/ai/suggestions`**
- Check `ai_suggestions` table for recent suggestions (within last 24h) for the user
- If found, return cached suggestions
- If not, call the AI API (see Section 7) to generate new ones, cache in DB, return result
- Response shape: `[{ id, title, description, tags }]`

**POST `/ai/analyze`**
- Body: `{ email }` (email is used to identify the user's style history)
- Fetch user's closet items, planner events, and saved outfits from DB
- Send as context to AI API
- Return: `{ analysis: "...", suggestions: [...] }`

---

### `/tryon` routes (protected)

**POST `/tryon/session`**
- Body: `{ heightCm, weight, weightUnit, gender, bodyStructure, skinTone, selectedItems }`
- Save to `tryon_sessions` table
- Return: `{ sessionId, modelUrl }` where `modelUrl` is `/models/boy3D.glb` or `/models/girl3D.glb` based on `gender`

**GET `/tryon/models`**
- Returns: `{ male: '/models/boy3D.glb', female: '/models/girl3D.glb' }`
- These are served as static files from `backend/public/models/`

**GET `/tryon/session/latest`**
- Returns the most recent try-on session for the authenticated user

---

## 7. AI API INTEGRATION

Use **OpenAI GPT-4o** (or **Google Gemini 1.5 Flash** as a cost-effective alternative).

### Setup
```
npm install openai
# OR
npm install @google/generative-ai
```

### `services/ai.service.js` — Core Logic

```js
// Build a context prompt from user's closet + planner data
// Send to GPT-4o or Gemini
// Parse response into structured suggestion objects
// Example prompt template:

const buildStylePrompt = (closetItems, plannerEvents, savedOutfits) => `
You are a luxury fashion AI stylist for the brand Velora.
The user's wardrobe contains: ${JSON.stringify(closetItems.map(i => ({ name: i.name, category: i.category, season: i.season })))}
Their upcoming events: ${JSON.stringify(plannerEvents.slice(0, 5))}
Their saved outfits: ${JSON.stringify(savedOutfits.slice(0, 3).map(o => o.name))}

Generate 3 distinct outfit suggestions. For each, provide:
- title (evocative, editorial-style, max 5 words)
- description (2 sentences, style-forward)
- tags (array of 3-5 keywords)

Respond ONLY in JSON format:
[{ "title": "...", "description": "...", "tags": ["...", "..."] }]
`;
```

### AI Providers to integrate:
1. **Primary: OpenAI GPT-4o** — `POST https://api.openai.com/v1/chat/completions`
2. **Fallback: Google Gemini 1.5 Flash** — via `@google/generative-ai` SDK
3. **Style Analysis Enhancement: DeepFashion API** (optional) — for garment classification if user uploads an image of a clothing item to the closet

### Environment Variables Required:
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...       # fallback
```

---

## 8. 3D TRY-ON FEATURE — GLB RENDERING INTEGRATION

### Context
- The `TryOnPage.jsx` middle column (`Step 2`) currently shows a placeholder with a `solar:user-bold` icon and text "Your digital twin will appear here"
- The middle column container has: `border border-white/10 bg-neutral-950/50 relative flex items-center justify-center overflow-hidden group`
- **Do NOT change any of this layout or styling**

### What you must do:
1. Serve `boy3D.glb` and `girl3D.glb` as **static files** from `backend/public/models/`
2. Configure Express static serving: `app.use('/models', express.static(path.join(__dirname, '../public/models')))`
3. Add CORS headers so the frontend can fetch the GLB files
4. In `TryOnPage.jsx` — **replace only the inner content of the placeholder div** (the div with the `solar:user-bold` icon) with a Three.js canvas, while keeping all outer div structure/classes identical

### Three.js GLB Renderer Component
Create a new file: `src/components/ModelViewer.jsx`

```jsx
// src/components/ModelViewer.jsx
// This is the ONLY new frontend file you are creating
// Drop-in 3D viewer using Three.js + GLTFLoader
// Must be self-contained and not affect any other component

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ModelViewer({ modelUrl, skinTone, heightCm }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !modelUrl) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent — preserves TryOnPage's dark bg

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3);

    // Renderer — transparent background to match existing dark bg
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting — cinematic, matches Velora's dark luxury aesthetic
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.8); // warm key light
    keyLight.position.set(2, 5, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xC5A880, 0.6); // matches Velora's gold accent
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(0, 3, -4);
    scene.add(fillLight);

    // OrbitControls — limited to vertical rotation only for try-on context
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.target.set(0, 1, 0);
    controls.update();

    // Load GLB model
    const loader = new GLTFLoader();
    let mixer;
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and scale model to fit viewport
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += 0.1;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Animations (if the GLB has idle animations)
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const idleClip = gltf.animations[0];
          const action = mixer.clipAction(idleClip);
          action.play();
        }
      },
      (progress) => {
        // Loading progress — can be exposed via callback if needed
      },
      (error) => console.error('GLB load error:', error)
    );

    // Animation loop
    const clock = new THREE.Clock();
    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}
```

### Installing Three.js in the Frontend
```bash
cd Frontend
npm install three
```

### Integration into TryOnPage.jsx — SURGICAL EDIT ONLY

In `TryOnPage.jsx`, make these **minimal, surgical changes only**:

1. Add import at the top:
```jsx
import ModelViewer from '../components/ModelViewer';
```

2. Add state for model configuration (alongside existing `formData` state):
```jsx
const [modelConfig, setModelConfig] = useState({ url: null, applied: false });
```

3. Update the `Apply Configuration` button's `onSubmit` handler on the form — currently it has `onSubmit={(e) => e.preventDefault()}`. Change ONLY this to:
```jsx
onSubmit={async (e) => {
  e.preventDefault();
  // POST to backend to save session, get modelUrl back
  const res = await fetch('/tryon/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('velora_token')}`
    },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  setModelConfig({ url: data.modelUrl, applied: true });
}}
```

4. In the center column (middle panel), locate the **inner content div** that currently renders the `solar:user-bold` icon placeholder (the div with `text-center` inside the `aspect-[3/4]` container). Replace ONLY its inner content with:
```jsx
{modelConfig.applied && modelConfig.url ? (
  <ModelViewer modelUrl={modelConfig.url} skinTone={formData.skinTone} heightCm={formData.heightCm} />
) : (
  // existing placeholder content — keep it identical
  <div className="text-center">
    <Icon icon="solar:user-bold" className="text-neutral-800 text-6xl mb-4 mx-auto" />
    <p className="text-[0.6rem] tracking-[0.4em] uppercase text-neutral-600">3D Model</p>
    <p className="text-[0.5rem] text-neutral-700 mt-2">Your digital twin will appear here</p>
  </div>
)}
```

**All outer divs, grid layout, class names, and structure of TryOnPage.jsx must remain byte-for-byte identical to the original.**

---

## 9. IMAGE HANDLING STRATEGY

The frontend allows both URL-based and file upload (`FileReader` → base64) images for closet items and profile pictures.

### Recommended Setup: Cloudinary
```
npm install cloudinary multer multer-storage-cloudinary
```

### Flow:
1. Frontend sends base64 or URL in the request body
2. Backend's `image.service.js` detects if it's a base64 string
3. If base64: upload to Cloudinary → get CDN URL → store URL in DB
4. If URL: store as-is (optionally validate it's a real image URL)
5. Return the Cloudinary CDN URL back to the client

### Alternative (local dev without Cloudinary):
- Use Multer to save uploaded files to `backend/public/uploads/`
- Serve via `app.use('/uploads', express.static(...))`
- Store relative path in DB

---

## 10. ENVIRONMENT VARIABLES

Create `.env` (and `.env.example`) in the backend root:

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=velora_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# AI
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# CORS
FRONTEND_URL=http://localhost:5173
```

In the Frontend, create/update `.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## 11. EXPRESS APP SETUP (`src/app.js`)

```js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import closetRoutes from './routes/closet.routes.js';
import outfitsRoutes from './routes/outfits.routes.js';
import plannerRoutes from './routes/planner.routes.js';
import profileRoutes from './routes/profile.routes.js';
import aiRoutes from './routes/ai.routes.js';
import tryonRoutes from './routes/tryon.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Security & parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' })); // 10MB limit for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve GLB models as static files with long-lived cache headers (~28MB total)
app.use('/models', express.static(path.join(__dirname, '../../public/models'), {
  maxAge: '1d',                        // Cache-Control: max-age=86400
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/closet', authMiddleware, closetRoutes);
app.use('/outfits', authMiddleware, outfitsRoutes);
app.use('/planner', authMiddleware, plannerRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/ai', authMiddleware, aiRoutes);
app.use('/tryon', authMiddleware, tryonRoutes);

// Global error handler
app.use(errorMiddleware);

export default app;
```

---

## 12. PACKAGE.JSON DEPENDENCIES

```json
{
  "name": "velora-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node src/migrations/run.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1",
    "openai": "^4.20.1",
    "@google/generative-ai": "^0.2.1",
    "cloudinary": "^1.41.3",
    "uuid": "^9.0.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 13. SECURITY REQUIREMENTS

1. **Rate Limiting** — apply `express-rate-limit` to `/auth/*` (max 10 req/15min per IP)
2. **Input Validation** — use `express-validator` on all POST/PUT routes
3. **IDOR Prevention** — always check `user_id = req.user.userId` before any read/write/delete
4. **Password Security** — bcrypt with saltRounds 12, never return `password_hash` in any response
5. **JWT** — short-lived tokens (7d), consider refresh token pattern for production
6. **SQL Injection** — use parameterized queries at ALL times (never string-concatenate SQL)
7. **File Upload** — validate MIME types for images, max size 5MB per image
8. **CORS** — restrict to `FRONTEND_URL` only, no wildcard in production

---

## 14. DATA SEEDING — DEFAULT CLOSET ITEMS

When a new user registers, automatically seed their closet with these default items (matching `useCloset.js` defaults):

```json
[
  { "name": "Wool Overcoat", "brand": "Velora", "category": "Women Outerwear", "season": "Winter", "image": "https://..." },
  { "name": "Silk Shirt", "brand": "Maison", "category": "Women Tops", "season": "All", "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop" },
  { "name": "Tailored Trousers", "brand": "Velora", "category": "Women Bottoms", "season": "Spring", "image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop" },
  { "name": "Cashmere Knitwear", "brand": "Velora", "category": "Women Tops", "season": "Autumn", "image": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800&auto=format&fit=crop" },
  { "name": "Minimalist Boots", "brand": "Maison", "category": "Women Accessories", "season": "Winter", "image": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop" },
  { "name": "Structured Blazer", "brand": "Velora", "category": "Women Outerwear", "season": "All", "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" },
  { "name": "Elegant Maxi Dress", "brand": "Aura", "category": "Women Tops", "season": "Summer", "image": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop" },
  { "name": "Floral Summer Skirt", "brand": "Maison", "category": "Women Bottoms", "season": "Summer", "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" },
  { "name": "Tailored Suit Jacket", "brand": "Velora", "category": "Men Tops", "season": "All", "image": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop" },
  { "name": "Slim Fit Chinos", "brand": "Maison", "category": "Men Bottoms", "season": "Spring", "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop" },
  { "name": "Leather Biker Jacket", "brand": "Velora", "category": "Men Outerwear", "season": "Autumn", "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop" },
  { "name": "Classic Oxford Shoes", "brand": "Maison", "category": "Men Accessories", "season": "Winter", "image": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop" }
]
```

---

## 15. GOOGLE / APPLE OAUTH (FUTURE-READY STUBS)

The `SignInPage.jsx` has Google and Apple sign-in buttons (currently non-functional). Prepare stub routes:

```
POST /auth/google   — stub for Google OAuth2 (use passport-google-oauth20 when ready)
POST /auth/apple    — stub for Apple Sign In (use passport-apple when ready)
```

Both should currently return `{ message: 'OAuth coming soon', status: 501 }` with a `501 Not Implemented` status — so the frontend doesn't crash if these buttons are clicked.

---

## 16. DEPLOYMENT NOTES

- Frontend `dist/` (built with `vite build`) can be served by Express in production:
  ```js
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../Frontend/dist/index.html')));
  }
  ```
- GLB files (~15MB + ~12MB) should be served with `Cache-Control: max-age=86400` headers
- Configure PostgreSQL `pg` pool with `max: 10` connections minimum for production

---

## 17. COMPLETE API RESPONSE CONTRACT

All API responses must follow this envelope:

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Human-readable error", "code": "ERROR_CODE" }
```

HTTP status codes:
- `200` — OK
- `201` — Created
- `400` — Validation error
- `401` — Unauthenticated
- `403` — Forbidden (IDOR attempt)
- `404` — Not found
- `500` — Internal server error

---

## 18. SUMMARY CHECKLIST (v1.0 — original items)

- [ ] PostgreSQL schema with all 7 tables created via migration
- [ ] Auth (register + login) with JWT and bcrypt
- [ ] JWT middleware protecting all non-auth routes
- [ ] `/closet` CRUD with default seed on registration
- [ ] `/outfits` CRUD with transaction-based save
- [ ] `/planner/events` CRUD
- [ ] `/profile` GET + PUT with image handling
- [ ] `/ai/suggestions` with OpenAI/Gemini integration + DB caching
- [ ] `/ai/analyze` with wardrobe context sent to AI
- [ ] `/tryon/session` POST + GET latest + model URL routing by gender
- [ ] GLB files served as static files at `/models/boy3D.glb` and `/models/girl3D.glb`
- [ ] `src/components/ModelViewer.jsx` created (Three.js GLTFLoader + OrbitControls)
- [ ] Three.js installed in Frontend (`npm install three`)
- [ ] `TryOnPage.jsx` surgically updated (form submit handler + conditional ModelViewer render only)
- [ ] `client.js` updated to attach JWT Bearer token
- [ ] `auth.api.js` updated to save/clear `velora_token` in localStorage
- [ ] `AuthContext.jsx` `logout` updated to clear `velora_token`
- [ ] All routes secured against IDOR
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all POST/PUT endpoints
- [ ] CORS configured for frontend URL
- [ ] `.env.example` provided
- [ ] **Frontend layout, structure, and theme: UNCHANGED**

---

---

## 19. MISSING IMPLEMENTATIONS — COMPLETE THESE FILES

### `server.js` — Entry Point (REQUIRED, not shown elsewhere)

```js
import app from './src/app.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Velora backend running on port ${PORT}`);
  console.log(`📦 GLB models served at /models/boy3D.glb and /models/girl3D.glb`);
});
```

---

### `src/config/db.js` — PostgreSQL Pool (REQUIRED)

```js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:      10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(-1);
});

export default pool;
```

---

### `src/config/env.js` — Startup Env Validation (REQUIRED)

```js
const REQUIRED_VARS = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
  'JWT_SECRET', 'PORT'
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

Call `validateEnv()` at the very top of `server.js` (before `app.listen`).

---

### `src/middleware/auth.middleware.js` — JWT Guard (REQUIRED)

```js
import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided', code: 'UNAUTHORIZED' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'TOKEN_INVALID' });
  }
}
```

---

### `src/middleware/error.middleware.js` — Global Error Handler (REQUIRED)

```js
export function errorMiddleware(err, req, res, next) {
  console.error('[VELORA ERROR]', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
}
```

---

### `src/migrations/run.js` — Migration Runner (REQUIRED — referenced in package.json scripts)

```js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(__dirname, '001_initial_schema.sql'), 'utf-8');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Velora migrations ran successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
```

---

### `nodemon.json` — Prevent Nodemon from restarting on GLB file access (REQUIRED for dev)

```json
{
  "watch": ["src", "server.js"],
  "ext": "js,json",
  "ignore": ["public/models/**", "public/uploads/**"],
  "exec": "node server.js"
}
```

---

## 20. TRYON API FRONTEND MODULE (MISSING FROM SECTION 2)

The following API module was not documented in Section 2 but **must exist in the frontend** to wire the try-on feature. Create `src/api/tryon.api.js`:

```js
// src/api/tryon.api.js
import { apiRequest } from './client.js';

export const saveTryOnSession = (sessionData) =>
  apiRequest('POST', '/tryon/session', sessionData);

export const getLatestSession = () =>
  apiRequest('GET', '/tryon/session/latest');

export const getModelUrls = () =>
  apiRequest('GET', '/tryon/models');
```

And update `TryOnPage.jsx`'s `onSubmit` handler (the surgical edit in Section 8, Step 3) to use this module instead of raw `fetch`:

```jsx
import { saveTryOnSession } from '../api/tryon.api';
// ...
onSubmit={async (e) => {
  e.preventDefault();
  const data = await saveTryOnSession(formData);
  setModelConfig({ url: data.modelUrl, applied: true });
}}
```

---

## 21. GLB FILE PLACEMENT INSTRUCTION (EXPLICIT)

You have been provided with two GLB files:
- `boy3D.glb` — male 3D model (~15.7 MB)
- `girl3D.glb` — female 3D model (~12.8 MB)

**You must copy these files into the backend project at exactly these paths:**
```
backend/public/models/boy3D.glb
backend/public/models/girl3D.glb
```

Create the directory if it does not exist:
```bash
mkdir -p backend/public/models
```

These are served as static files via Express at `/models/boy3D.glb` and `/models/girl3D.glb`. The `POST /tryon/session` endpoint returns the correct URL based on the `gender` field in the request body:
```js
const modelUrl = gender?.toLowerCase().includes('female') || gender?.toLowerCase() === 'woman'
  ? '/models/girl3D.glb'
  : '/models/boy3D.glb';
```

---

## 22. MODELVIEWER LOADING STATE (REQUIRED — smooth UX)

The `ModelViewer.jsx` in Section 8 has a placeholder comment for loading progress. Replace the component to include a loading spinner so the user sees feedback while the ~15MB GLB file streams:

```jsx
// Add this state inside ModelViewer:
const [loading, setLoading] = useState(true);

// In the loader.load() onLoad callback, add:
setLoading(false);

// In the JSX return, wrap:
return (
  <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
    {loading && (
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', zIndex: 10
      }}>
        {/* Velora gold spinner — matches the app's luxury aesthetic */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid #C5A880',
          borderTopColor: 'transparent',
          animation: 'spin 0.9s linear infinite'
        }} />
        <p style={{ marginTop: 12, fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: '#6b6b6b' }}>
          Loading model
        </p>
      </div>
    )}
  </div>
);
```

Also inject the keyframe in the component (or in `styles.css` if preferred):
```jsx
// Inject once at top of component via useEffect or as a <style> tag:
// @keyframes spin { to { transform: rotate(360deg); } }
```

---

## 23. AI SUGGESTIONS TABLE — ADD `suggestion_type` COLUMN

Add a `suggestion_type` column to `ai_suggestions` to differentiate between general wardrobe suggestions and event-specific suggestions (used by `/ai/analyze`):

```sql
-- Add to 001_initial_schema.sql:
ALTER TABLE ai_suggestions ADD COLUMN IF NOT EXISTS suggestion_type VARCHAR(50) DEFAULT 'general';
-- Values: 'general' | 'event' | 'analyze'
```

When caching results from `POST /ai/analyze`, set `suggestion_type = 'analyze'`.
When caching from `GET /ai/suggestions`, set `suggestion_type = 'general'`.
The 24-hour cache check in `GET /ai/suggestions` must filter by `suggestion_type = 'general'`.

---

## 24. UPDATED SUMMARY CHECKLIST (v1.1 — additions only)

Items added over v1.0:

- [ ] `server.js` created with `app.listen()` and `validateEnv()` call
- [ ] `src/config/db.js` created with pg Pool (max: 10)
- [ ] `src/config/env.js` created with startup validation
- [ ] `src/middleware/auth.middleware.js` — full JWT verify implementation
- [ ] `src/middleware/error.middleware.js` — global error handler implementation
- [ ] `src/migrations/run.js` — migration runner created (matches `npm run migrate`)
- [ ] `nodemon.json` created with GLB/uploads ignore patterns
- [ ] `src/api/tryon.api.js` created in frontend (3 functions)
- [ ] `TryOnPage.jsx` onSubmit uses `saveTryOnSession` from `tryon.api.js`
- [ ] GLB files physically placed at `backend/public/models/boy3D.glb` and `backend/public/models/girl3D.glb`
- [ ] `ModelViewer.jsx` includes loading spinner state with Velora gold aesthetic
- [ ] `ai_suggestions` table has `suggestion_type` column
- [ ] `/ai/suggestions` cache query filters by `suggestion_type = 'general'`
- [ ] `/models` static serving uses `maxAge: '1d'` Cache-Control header

---

*End of Velora Backend Agent Prompt — v1.1*
*v1.0: Generated from full frontend analysis: App.jsx, all 7 pages, 7 components, 6 API modules, 2 hooks, AuthContext, styles.css, and GLB file inspection.*
*v1.1: Gaps filled — server.js, db.js, env.js, auth middleware, error middleware, migration runner, nodemon config, tryon.api.js, GLB placement instructions, ModelViewer loading state, ai_suggestions type column, Cache-Control for static GLB serving.*
