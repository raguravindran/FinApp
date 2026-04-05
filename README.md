# FinApp (Lit + Node/TypeScript)

FinApp now uses a JavaScript-first stack end-to-end:

- **Frontend:** Lit web components served by Vite.
- **Backend:** Node.js + TypeScript API for EMI and LLM chat orchestration.
- **Netlify:** Static frontend + serverless functions for `/api/emi/` and `/api/chat`.

## Features

- Simple-interest EMI calculator API.
- Conversational chat UI at `/chat`.
- Finance-aware backend routing (general vs account-specific vs calculation-heavy).
- Server-side context wrapping before LLM calls (no direct client-to-LLM key exposure).

## Formula

Simple-interest EMI formula used by the API:

`EMI = (P + (P × R × T)) / N`

Where:

- `P` = principal amount
- `R` = annual interest rate in decimal (`annual_rate / 100`)
- `T` = tenure in years (`tenure_months / 12`)
- `N` = tenure in months

## Local setup

From repository root:

```bash
./setup_mac.sh
```

Or manually:

### Backend (Node + TypeScript)

```bash
cd backend
npm install
cp .env.example .env
# add GEMINI_API_KEY in .env
# optional: set GEMINI_MODEL (default: gemini-2.0-flash, with fallback list)
npm run dev
```

Backend runs at `http://127.0.0.1:8787`.

### Frontend (Lit + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

To target local backend from frontend dev, set:

```bash
# frontend/.env
VITE_API_BASE_URL=http://127.0.0.1:8787
```

## API endpoints

### POST `/api/emi/`

Request:

```json
{
  "principal": 120000,
  "annual_rate": 10,
  "tenure_months": 12
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "principal": "120000.00",
    "annual_rate": "10.00",
    "tenure_months": 12,
    "simple_interest": "12000.00",
    "total_amount": "132000.00",
    "monthly_emi": "11000.00",
    "formula": "EMI = (P + (P * R * T)) / N"
  }
}
```

### POST `/api/chat`

Request:

```json
{
  "query": "How should I plan for a house down payment in 5 years?",
  "userContext": {
    "goals": ["house down payment"],
    "monthlyIncome": 9500,
    "monthlyExpenses": 5200,
    "riskProfile": "medium"
  }
}
```

Response includes:

- `answer`
- `route` (`general_search`, `finance_account_specific`, or `calculation_heavy`)
- `assumptions`

## Netlify deploy

`netlify.toml` is configured for:

- build base `frontend`
- static publish from `frontend/dist`
- function directory `frontend/netlify/functions`
- API redirects:
  - `/api/emi/` -> `/.netlify/functions/emi`
  - `/api/chat` -> `/.netlify/functions/chat`
- `/chat` -> SPA shell (`/index.html`)

## Secrets and security

- Never expose provider keys in frontend code.
- Store `GEMINI_API_KEY` in backend `.env` (local) and Netlify environment vars (deploy).
- Optionally set `GEMINI_MODEL` to force a specific model; otherwise fallback models are tried automatically.
- All prompt enrichment and tool routing are done server-side.
