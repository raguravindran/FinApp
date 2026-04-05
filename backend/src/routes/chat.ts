import type { Request, Response } from 'express';
import { z } from 'zod';
import { buildContextEnvelope } from '../services/context/context-builder.js';
import { GeminiProvider } from '../services/llm/gemini.js';
import { runSimpleProjection } from '../services/calculators/simple-projection.js';
import { routeIntent } from '../services/router/query-router.js';
import type { ChatRequest } from '../types.js';

const ChatPayload = z.object({
  query: z.string().min(2),
  userContext: z
    .object({
      goals: z.array(z.string()).optional(),
      monthlyIncome: z.number().optional(),
      monthlyExpenses: z.number().optional(),
      riskProfile: z.enum(['low', 'medium', 'high']).optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export async function chatRoute(req: Request, res: Response): Promise<void> {
  const parsed = ChatPayload.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: { query: 'Query is required.' } });
    return;
  }

  const payload = parsed.data as ChatRequest;
  const route = routeIntent(payload.query);

  if (route === 'calculation_heavy') {
    const deterministicAnswer = runSimpleProjection(payload.query);
    res.json({
      ok: true,
      data: {
        answer: deterministicAnswer,
        route,
        assumptions: ['Deterministic route is currently a placeholder implementation.'],
      },
    });
    return;
  }

  const envelope = buildContextEnvelope(payload, route);
  const provider = new GeminiProvider(process.env.GEMINI_API_KEY || '');
  const answer = await provider.generate(envelope);

  res.json({
    ok: true,
    data: {
      answer,
      route,
      assumptions: [
        'This answer is context-enriched on the server before sending to the LLM provider.',
        'Account-specific responses are only as accurate as the supplied user context.',
      ],
    },
  });
}
