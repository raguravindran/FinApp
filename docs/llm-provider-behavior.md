# LLM Provider Behavior (Gemini)

## Provider role

The app uses a custom Gemini provider adapter (`GeminiProvider`) with:

- model fallback,
- retry handling,
- standardized failure text.

---

## Model selection

Default model priority:
1. `gemini-2.5-flash`
2. `gemini-2.0-flash`
3. `gemini-1.5-flash-latest`
4. `gemini-1.5-flash`

If `GEMINI_MODEL` is set, it is tried first, then the remaining defaults.

---

## Retry behavior

For each model:
- Max retries per model: `2` (so up to 3 attempts total per model including first try).
- Retries happen on:
  - HTTP `429`
  - HTTP `5xx`
- Delay strategy:
  1. `retry-after` header if valid,
  2. `retryDelay` parsed from response body,
  3. default `1500ms`.
- Retry delay is capped at `15000ms`.

If response is `404`, provider stops trying that model and moves to next model.

---

## Failure behavior

- Missing API key returns a clear string message:
  - `Gemini API key is missing...`
- If all models fail, returns:
  - `LLM provider error: ...` with last status/body context.

---

## Operational notes

- Keep `GEMINI_API_KEY` only in server env.
- Use `GEMINI_MODEL` only when intentionally pinning model behavior.
