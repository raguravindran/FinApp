# FinApp Technical Documentation

This folder is the canonical technical documentation hub for FinApp.

## Purpose

This is a structured documentation dump to capture product and engineering intent **inch by inch**, so the team can understand the application end-to-end.

## Documentation strategy

- Keep one markdown file per major concern.
- Prefer factual descriptions tied directly to implementation.
- Update docs whenever behavior or architecture changes.

## Suggested doc map

- `application-intent-and-flow.md` (core intent, request lifecycle, routing and orchestration)
- `frontend-chat-ui.md` (chat UX, local/session storage behavior, markdown rendering)
- `backend-api-contracts.md` (API endpoints, payload schemas, response formats)
- `llm-provider-behavior.md` (provider selection, retries, failure modes)
- `query-routing-rules.md` (intent classification heuristics and limitations)
- `deployment-and-runtime.md` (Netlify setup, env vars, local dev runtime)
- `emi-calculation-model.md` (formula, assumptions, scope boundaries)
- `data-and-persistence.md` (current storage model and future DB roadmap)

> Start from `application-intent-and-flow.md` first; it explains the "why" and "how" at system level.
