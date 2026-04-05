import type { LlmProvider } from './provider.js';

export class GeminiProvider implements LlmProvider {
  constructor(private readonly apiKey: string) {}

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      return 'Gemini API key is missing. Set GEMINI_API_KEY on the backend environment.';
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      return `LLM provider error: ${response.status} ${body}`;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No response text returned by Gemini for this request.'
    );
  }
}
