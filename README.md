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

## Implementation summary

Current implementation is intentionally lightweight and custom:

- **Frontend:** Lit app (Vite) renders EMI and chat experiences.
- **Backend:** Express + TypeScript handles validation, routing, deterministic calculator paths, and LLM orchestration.
- **LLM provider layer:** Custom Gemini adapter with model fallback + retry handling.
- **Runtime routing:** Keyword-based intent router selects deterministic calculations for numeric asks and LLM guidance for general/account-specific asks.
- **Persistence approach:** Browser storage (`sessionStorage`/`localStorage`) for MVP chat continuity.

This design keeps the architecture easy to reason about while avoiding framework lock-in at MVP stage.

## Why no LangChain (yet)?

LangChain and similar OSS orchestration frameworks are great when you need advanced pipelines, but this app currently covers its core requirements with focused custom code.

### Current needs already covered

- Prompt/context enrichment server-side
- Intent routing
- Deterministic calculator fallback path
- Provider retries and model fallback
- Secure API-key handling (no client-side exposure)

### When to consider LangChain (or similar)

Adopt a framework once one or more of these become priorities:

1. **RAG at scale** (chunking, retrieval, vector DB abstractions)
2. **Multi-step agent/tool chains** with richer orchestration
3. **Standardized evaluation/tracing** across prompts/tools
4. **Rapid experimentation** with interchangeable model/tool components

### Suggested migration path

1. Keep current architecture for stability and speed.
2. Add durable storage/auth for production-grade history.
3. Introduce framework components incrementally (e.g., only retrieval or only chain orchestration) where they reduce complexity.

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

## Chat history and context retention

If you want a true ChatGPT-style experience (conversation history that survives refreshes and new requests), you should persist chat messages outside of memory.

### Do you need a database?

- **For production-quality chat memory:** yes, recommended.
- **For quick prototype only:** you can start with browser storage or short-lived sessions, but it is not reliable for long-term continuity.

### What Netlify supports for persistence

Netlify Functions are stateless between invocations, so in-memory variables are not durable chat storage. Common options:

- **External DB (most common):** Supabase/Postgres, Neon, PlanetScale, MongoDB Atlas, etc.
- **Netlify Blobs:** good for lightweight keyed storage and prototypes.
- **Netlify Connect / external backends:** for syncing or integrating other data sources.

### Can we store in session for now?

Yes, for an MVP:

- **Client-side sessionStorage/localStorage:** easiest, no backend DB required.
- **Server-side session in function memory:** **not recommended**, because cold starts and scaling lose state.

Suggested phased rollout:

1. Start with `sessionStorage` (or `localStorage`) + send recent messages with each `/api/chat` call.
2. Move to DB-backed conversation tables (`conversations`, `messages`) once multi-device/history is required.
3. Add user auth and load conversation history on login.

## Secrets and security

- Never expose provider keys in frontend code.
- Store `GEMINI_API_KEY` in backend `.env` (local) and Netlify environment vars (deploy).
- Optionally set `GEMINI_MODEL` to force a specific model; otherwise fallback models are tried automatically.
- All prompt enrichment and tool routing are done server-side.
