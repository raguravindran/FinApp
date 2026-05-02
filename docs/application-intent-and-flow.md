# Application Intent and End-to-End Flow

## Why this application exists

FinApp combines:

1. **Deterministic finance calculations** (for reliable numeric outputs), and
2. **Conversational finance guidance** (for flexible user questions).

The goal is to keep core finance behavior predictable while using LLMs where language understanding is valuable.

---

## Core architecture intent

- Keep the stack lightweight and readable for MVP.
- Route user queries before invoking the LLM.
- Use deterministic logic for calculation-heavy asks.
- Enrich LLM prompts server-side so the model gets structured context.
- Keep provider API keys on the server only.

---

## Three key mechanics (facts, simple explanation)

### 1) Prompt/context enrichment (server-side)

**What happens:**
The backend builds a context envelope before calling the LLM. It includes route, goals, income, expenses, risk profile, notes, and the user query.

**Why:**
Without context, the model gives generic answers. With context, the answer is more relevant to the user profile and finance domain.

**Where in code:**
- Context assembly: `backend/src/services/context/context-builder.ts`
- Call site before LLM request: `backend/src/routes/chat.ts`

---

### 2) Intent routing

**What happens:**
The backend classifies each query into one of:
- `general_search`
- `finance_account_specific`
- `calculation_heavy`

using keyword hints.

**Why:**
Different query types need different handling. Not everything should go to LLM first.

**Where in code:**
- Router logic: `backend/src/services/router/query-router.ts`
- Router invocation: `backend/src/routes/chat.ts`

---

### 3) Deterministic calculator fallback path

**What happens:**
If a query is classified as `calculation_heavy`, the backend uses deterministic calculation/projection logic and returns that path instead of relying entirely on LLM generation.

**Why:**
Finance math must be reproducible:
- same input -> same output
- lower hallucination risk

**Where in code:**
- Conditional path: `backend/src/routes/chat.ts`
- Current calculator service: `backend/src/services/calculators/simple-projection.ts`

---

## End-to-end request flow (`/api/chat`)

1. Client sends `{ query, userContext }`.
2. Backend validates payload schema.
3. Backend routes intent from query text.
4. If `calculation_heavy`, run deterministic projection and return.
5. Otherwise, build context envelope.
6. Send enriched prompt to Gemini provider.
7. Return answer + route + assumptions to client.

---

## Why this design now

For MVP, this architecture optimizes for:
- fast iteration,
- low dependency complexity,
- clear ownership of business logic,
- secure key management,
- deterministic handling for number-heavy questions.

As requirements grow (RAG, tools, evaluations, durable memory), framework-assisted orchestration can be introduced incrementally.
