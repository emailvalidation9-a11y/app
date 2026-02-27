# TrueValidator — Frontend (app)

React + Vite + TypeScript frontend. Use this as the **root** when this folder is its own repo.

## Repo config (standalone repo)

| Config | Purpose |
|--------|---------|
| `.github/workflows/ci.yml` | CI: lint + build on push/PR to `main` or `develop`. |
| `vercel.json` | Vercel: Vite build, SPA rewrites, security headers. |

## Setup

```bash
npm ci
cp .env.example .env   # if present; set VITE_API_URL to your backend API URL
npm run dev
```

## Deploy (Vercel)

1. New project → Import this repo (or use this folder as root).
2. **Root Directory:** leave as `.` (this folder is the repo root).
3. **Environment variables:** `VITE_API_URL` = backend API base URL (e.g. `https://api.yourdomain.com/api`).
4. Deploy; `vercel.json` is used automatically.

## Scripts

- `npm run dev` — dev server (port 5173)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview production build
