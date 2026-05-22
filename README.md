# VELORA — AI-Powered Luxury Fashion Platform

> *AI-powered luxury fashion SPA — digital wardrobe management, outfit building, event planning, AI style suggestions, and 3D virtual try-on.*

![Velora Preview](screenshot_demo.png)

---

## ✨ Features

### 👗 Digital Closet
Manage your entire wardrobe digitally — categorize items by type, season, and brand. Upload images or link from URLs.

### 🧥 Outfit Builder
Mix and match items from your closet to create curated outfits. Save and organize your favorite looks.

### 📅 Event Planner
Plan outfits for upcoming events. Assign specific clothing items to calendar dates with ease.

### 🤖 AI Style Suggestions
Get intelligent outfit recommendations powered by AI (OpenAI GPT-4o or Google Gemini). The AI analyzes your wardrobe, saved outfits, and upcoming events to generate personalized style advice.

### 🧍 3D Virtual Try-On
See how clothes look on a 3D avatar! Select your gender (male/female), adjust body measurements, and try on items from your closet on a realistic 3D model.

- **Male model:** `boy3D.fbx`
- **Female model:** `girl3D.fbx`
- Controls: Click-and-drag to rotate, scroll to zoom, auto-rotate mode, reset view button

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling |
| **Three.js** | 3D rendering & FBX model viewer |
| **PostgreSQL** | Database (via backend API) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **PostgreSQL** | Relational database |
| **JWT + bcrypt** | Authentication |
| **OpenAI / Gemini** | AI style suggestions |
| **Multer / Cloudinary** | Image upload & management |

### Database Tables
- `users` — User accounts & profiles
- `closet_items` — Wardrobe items with categories
- `outfits` / `outfit_items` — Saved outfits (M:N mapping)
- `planner_events` — Calendar events with assigned clothes
- `ai_suggestions` — Cached AI style recommendations
- `tryon_sessions` — 3D try-on session history

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** 14+
- **npm** or **pnpm**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/velora.git
cd velora
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create your environment file
cp .env.example .env
# Edit .env with your database credentials and API keys

# Create the database
node create_db.js

# Run migrations
npm run migrate

# (Optional) Seed with sample data
node seed_db.js

# Start the backend
npm run dev
```

### 3. Setup Frontend

```bash
cd Frontend
npm install

# Create your environment file
cp .env.example .env
# Edit .env if your backend runs on a different URL

# Start the dev server
npm run dev
```

### 4. Open the App
Visit **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
velora/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & env validation
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, error handling, uploads
│   │   ├── migrations/      # SQL schema files
│   │   ├── models/          # Database query helpers
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # AI & image processing
│   │   └── app.js           # Express app setup
│   ├── public/
│   │   ├── models/          # 3D FBX files (add your own)
│   │   └── uploads/         # User-uploaded images
│   ├── server.js            # Entry point
│   ├── .env.example         # Environment template
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── api/             # API client modules
│   │   ├── assets/          # Static images
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   ├── App.jsx          # Main app with routing
│   │   ├── main.jsx         # Entry point
│   │   └── styles.css       # Global styles
│   ├── .env.example         # Environment template
│   └── package.json
├── .gitignore
├── README.md
├── 3DTURN_FEATURE_PROMPT.md
└── VELORA_BACKEND_AGENT_PROMPT_v1.1.md
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (`Frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login user |
| `GET` | `/closet` | Get user's closet items |
| `POST` | `/closet` | Add item to closet |
| `DELETE` | `/closet/:id` | Remove closet item |
| `GET` | `/outfits` | Get saved outfits |
| `POST` | `/outfits` | Save a new outfit |
| `DELETE` | `/outfits/:id` | Delete outfit |
| `GET` | `/planner/events` | Get planner events |
| `POST` | `/planner/events` | Create event |
| `DELETE` | `/planner/events/:id` | Delete event |
| `GET` | `/profile` | Get user profile |
| `PUT` | `/profile` | Update profile |
| `GET` | `/ai/suggestions` | Get AI style suggestions |
| `POST` | `/ai/analyze` | Run style analysis |
| `POST` | `/tryon/session` | Save try-on session |
| `GET` | `/tryon/models` | Get model URLs |
| `GET` | `/tryon/session/latest` | Get latest session |

---

## 🧪 Running the App

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd Frontend
npm run dev
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens with **7-day expiry**
- **Rate limiting** on auth endpoints (10 req/15min)
- **Input validation** on all POST/PUT endpoints
- **IDOR prevention** — ownership checks on all data operations
- Parameterized SQL queries — **no SQL injection**
- CORS restricted to configured frontend URL
- Environment variables for all secrets — **never commit `.env`**

---

## 📄 License

This project is for personal/portfolio use. All rights reserved.

---

*Built with ❤️ using AI agents*
