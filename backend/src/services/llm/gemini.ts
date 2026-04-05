import type { LlmProvider } from './provider.js';

const DEFAULT_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

function candidateModels(): string[] {
  const preferred = (process.env.GEMINI_MODEL || '').trim();
  return preferred ? [preferred, ...DEFAULT_MODELS.filter((model) => model !== preferred)] : DEFAULT_MODELS;
}

export class GeminiProvider implements LlmProvider {
  constructor(private readonly apiKey: string) {}

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      return 'Gemini API key is missing. Set GEMINI_API_KEY on the backend environment.';
    }

    let lastError = '';

    for (const model of candidateModels()) {
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
      lastError = `model=${model} status=${response.status} body=${body}`;

      if (response.status !== 404) {
        break;
      }
    }

    return `LLM provider error: ${lastError}`;
  }
}
