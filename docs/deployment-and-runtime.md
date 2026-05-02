# Deployment and Runtime

## Netlify setup

Configured in `netlify.toml`:

- Build base: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Redirects:
  - `/api/emi/` -> `/.netlify/functions/emi`
  - `/api/chat` -> `/.netlify/functions/chat`
  - `/chat` -> `/index.html`

## Node runtime

- `NODE_VERSION = 20` in Netlify build environment.

## Environment variables

Required:
- `GEMINI_API_KEY`

Optional:
- `GEMINI_MODEL` (preferred model override)
- `PORT` (backend local runtime; defaults to `8787`)

## Local development

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Optional frontend `.env` for local backend targeting:
```bash
VITE_API_BASE_URL=http://127.0.0.1:8787
```
