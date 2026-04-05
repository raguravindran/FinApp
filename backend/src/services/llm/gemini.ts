import type { LlmProvider } from './provider.js';

const DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
];
const MAX_RETRIES_PER_MODEL = 2;
const DEFAULT_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 15_000;

function candidateModels(): string[] {
  const preferred = (process.env.GEMINI_MODEL || '').trim();
  return preferred ? [preferred, ...DEFAULT_MODELS.filter((model) => model !== preferred)] : DEFAULT_MODELS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseRetryAfterMs(retryAfterHeader: string | null): number | null {
  if (!retryAfterHeader) {
    return null;
  }

  const asSeconds = Number.parseFloat(retryAfterHeader);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.min(asSeconds * 1000, MAX_RETRY_DELAY_MS);
  }

  const asDate = Date.parse(retryAfterHeader);
  if (Number.isNaN(asDate)) {
    return null;
  }

  const delay = asDate - Date.now();
  return delay > 0 ? Math.min(delay, MAX_RETRY_DELAY_MS) : null;
}

function parseRetryInfoMs(errorText: string): number | null {
  const match = errorText.match(/"retryDelay"\s*:\s*"(\d+)(?:\.\d+)?s"/i);
  if (!match) {
    return null;
  }

  const seconds = Number.parseInt(match[1] || '', 10);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);
}

export class GeminiProvider implements LlmProvider {
  constructor(private readonly apiKey: string) {}

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      return 'Gemini API key is missing. Set GEMINI_API_KEY on the backend environment.';
    }

    let lastError = '';

    for (const model of candidateModels()) {
      for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt += 1) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };

          return (
            data.candidates?.[0]?.content?.parts?.[0]?.text ??
            'No response text returned by Gemini for this request.'
          );
        }

        const body = await response.text();
        lastError = `model=${model} attempt=${attempt + 1} status=${response.status} body=${body}`;

        const shouldRetry = response.status === 429 || response.status >= 500;
        if (shouldRetry && attempt < MAX_RETRIES_PER_MODEL) {
          const delay =
            parseRetryAfterMs(response.headers.get('retry-after')) ??
            parseRetryInfoMs(body) ??
            DEFAULT_RETRY_DELAY_MS;
          await sleep(delay);
          continue;
        }

        if (response.status === 404 || shouldRetry) {
          break;
        }
      }
    }

    return `LLM provider error: ${lastError}`;
  }
}
