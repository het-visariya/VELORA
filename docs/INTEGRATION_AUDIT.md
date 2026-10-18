# Velora integration audit

Audited 2026-10-18 against `601b3b2`. Fixes landed on `fix/integration`.

The brief was "both halves work but aren't connected". The cause was not CORS,
not a base URL and not a route mismatch — the frontend's API paths already
matched the backend exactly. It was that **the UI decided whether you were
signed in from a different source of truth than the one the API used**, so the
two could disagree, and when they did the user got a signed-in shell full of
empty data and no error.

## Endpoint match table

Every frontend call against the route that serves it. The `src/api/*` paths
carry no `/api` prefix, and neither do the backend mounts, so all of them line
up.

| Frontend call | Backend route | Method | Auth | Match |
|---|---|---|---|---|
| `auth.api.js` login | `/auth/login` | POST | public (rate-limited) | Y |
| `auth.api.js` register | `/auth/register` | POST | public (rate-limited) | Y |
| `auth.api.js` sendGoogleCode | `/auth/google` | POST | public | Y |
| `auth.api.js` sendAppleCode | `/auth/apple` | POST | public | Y |
| `auth.api.js` verifySocialCode | `/auth/verify` | POST | public | Y |
| `closet.api.js` getItems / addItem / deleteItem | `/closet`, `/closet/:id` | GET/POST/DELETE | Bearer | Y |
| `outfits.api.js` getSaved / saveOutfit / deleteOutfit | `/outfits`, `/outfits/:id` | GET/POST/DELETE | Bearer | Y |
| `planner.api.js` getEvents / addEvent / deleteEvent | `/planner/events`, `/planner/events/:id` | GET/POST/DELETE | Bearer | Y |
| `ai.api.js` analyze | `/ai/analyze` | POST | Bearer | Y |
| `ai.api.js` getSuggestions | `/ai/suggestions` | GET | Bearer | Y — **never called** |
| `profile.api.js` getProfile / updateProfile | `/profile` | GET/PUT | Bearer | Y — **never called**; ProfilePage is localStorage-only |
| `tryon.api.js` saveTryOnSession | `/tryon/session` | POST | Bearer | Y — return value discarded |
| `tryon.api.js` getLatestSession | `/tryon/session/latest` | GET | Bearer | Y — **never called** |
| `tryon.api.js` getModelUrls | `/tryon/models` | GET | Bearer | Y — **never called** |
| — | `/health` | GET | public | added in A5 |

The envelope is consistent throughout: `{success: true, data}` and
`{success: false, message, code}`. Auth is a JWT in the response body, sent
back as `Authorization: Bearer <token>`. There are no cookies, so the absence
of `credentials: 'include'` is correct rather than a bug.

## Findings

### P0

| # | Finding | Fix | Commit |
|---|---|---|---|
| 1 | `.gitignore` deleted from the working tree but still tracked, so git applied **no** ignore rules: `node_modules/` (10.7k files) and both `.env` files showed as untracked, and one `git add -A` would have committed them. | Restored from HEAD. Also dropped its blanket `*.png`/`*.jpg` rules and hardened the env patterns to `.env.*` and `**/.env*`, with `.env.example` re-admitted. | `9ea5899`, `60466a0` |
| 2 | `Frontend/vite.config.js` did not exist. `@vitejs/plugin-react` was a dependency but was never registered — so no Fast Refresh — and there was no dev proxy, so every call went cross-origin. | Created: registers `react()`, proxies all ten backend mounts to `:5000`, and `VITE_API_URL` is now empty so requests are same-origin and CORS stops being involved. | `e5d74a3` |
| 3 | **The integration defect.** `AuthContext.isAuthenticated` came from `localStorage.velora_authenticated`, written by `login(name, email)` which never saw a token. The token lived in `velora_token`, written separately by `auth.api.js`. `App.jsx:169` fires its loaders on `isAuthenticated`, so with a stale flag and no token every loader ran and then silently returned at `if (!localStorage.getItem('velora_token')) return;`. Result: a signed-in shell with an empty closet, planner and outfits, and nothing logged. | `isAuthenticated` is now derived from a valid, unexpired JWT. `login(user, token)` returns false when no usable token came back. `velora_authenticated` retired and swept. Redundant token guards removed. | `60466a0` |

Cleared during the audit: **no `.env` and no `node_modules` exists in any
pushed commit** (`a9ae072`, `b08e55e` and `601b3b2` hold 81–83 files each). The
`node_modules` hits from `git log --all` came from local `refs/sessions/*`
checkpoints, which are never pushed. No secret leaked, and no history rewrite
is needed.

### P1

| # | Finding | Fix | Commit |
|---|---|---|---|
| 4 | `client.js` had no 401 handling, so an expired token threw a bare `Error` from whichever loader hit it first and left the UI signed in with no data. | Dispatches `velora:unauthorized`, which `AuthContext` acts on. Narrowed to `authMiddleware`'s own codes, because `/auth/login` answers a wrong password with 401 `INVALID_CREDENTIALS` and a blanket rule would sign the user out on every typo. Errors now carry `status` and `code` via `ApiError`. | `76177a9` |
| 5 | `error.middleware.js` returned `err.code` and `err.message` verbatim, leaking raw Postgres SQLSTATE codes and connection details. An unreachable database answered a signup with `{"code":"ENOTFOUND","message":"getaddrinfo ENOTFOUND db.<ref>.supabase.co"}`. | Only deliberate application codes are echoed; 5xx details stay in the server log. | `5787bac` |
| 6 | `backend/.env.example` did not exist, and `FRONTEND_URL` was read by the CORS allow-list but absent from `.env` — in production that allows no cross-origin request at all, since the localhost escape hatch is disabled there. | Template covering all 23 referenced variables, cross-checked against every `process.env.*` in the tree. `FRONTEND_URL` set. | `5787bac` |
| 7 | `react`, `react-dom`, `vite` and `@vitejs/plugin-react` were all on `"latest"`. Any fresh install could pull a different major. | Pinned to the installed 19.2.6 / 19.2.6 / 8.0.13 / 6.0.1. | `5787bac` |
| 8 | No health endpoint, so "the API is up" and "the API can reach its database" were indistinguishable. | `GET /health`. | `5787bac` |
| 9 | No root script to run both apps. | Root `package.json` with `concurrently`; `npm run dev`. | `5787bac` |
| 10 | The configured database host `db.wrbtnnsdzibsaycylkvx.supabase.co` no longer resolves (NXDOMAIN) — that Supabase project is gone, and the only project on the account is unrelated. Nothing could read or write. | Repointed `backend/.env` at the local Postgres 17 on `:5432`, which already had an empty `velora_db`, then ran `npm run migrate`. Old values kept as comments. **Not committed — `.env` is git-ignored.** | (local only) |

### Deferred, with reasons

| Finding | Why it is not fixed here |
|---|---|
| `ModelViewer.jsx` is dead code using `FBXLoader`, with `mixer` never declared (an implicit global that throws under ESM strict mode) and `fbxLoaded` read before assignment. | Rewritten wholesale in phase B2; fixing it twice is waste. |
| `backend/public/models/` is empty, so the `/models` static mount 404s despite being correctly configured with permissive CORS and a preflight handler. | Phase B1 generates the optimized GLBs into it. |
| `slotForCategory` in `TryOnPage.jsx` maps both `'accessor'` and `'shoe'` to `Footwear`, so bags and jewellery land on the feet slot. | Phase B2, with the rest of that page. |
| Google/Apple sign-in is not OAuth: it emails a 6-digit code held in an in-process `Map`, lost on restart and not safe across instances, and returns the code to the client as `debugCode` when SMTP is unconfigured. | Out of scope, and a rework rather than a fix. Must not reach production as-is. |
| `express-validator`, `openai`, `@google/generative-ai` and `uuid` are declared but never imported; `upload.middleware.js` and `image.service.js` are complete but unused; `check_db.js`, `create_db.js` and `seed_db.js` sit outside both `src/` and `scripts`. | Dead weight rather than a defect. Worth a cleanup pass of its own. |
| `ai.service.js` endpoint URLs look stale (`openrouter.ai/v1/...` rather than `/api/v1/...`, `api.groq.ai`, and the retired `text-bison-1`), so the hardcoded defaults are probably what every caller receives. | Needs live keys to confirm, and none are configured. |
| No tests anywhere, in either app. | Phase B3 introduces the first ones, for `measurementsToParams`. |

## Verifying the fix

With `npm run dev` up:

```
curl localhost:5000/health      # {"success":true,"data":{"status":"ok","db":"up"}}
```

Then in the browser: register, and the closet fills with the 18 seeded items
while the planner and outfits load. Reload and you are still signed in. Delete
`velora_token` in devtools and reload, and you get the sign-in modal rather
than a blank shell. Mistype a password and you get an inline error while
staying signed in.

Measured against the running API during the audit: register returns a 244-char
JWT, an authed `GET /closet` returns 18 items, and `/planner/events` and
`/outfits` return `[]` for a new user. 12/12 checks pass on the 401 logic and
8/8 on the token helpers.
