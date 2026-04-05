import type { ChatRequest, Intent } from '../../types.js';

export function buildContextEnvelope(payload: ChatRequest, route: Intent): string {
  const goals = payload.userContext?.goals?.join(', ') || 'Not provided';
  const income = payload.userContext?.monthlyIncome ?? 'Not provided';
  const expenses = payload.userContext?.monthlyExpenses ?? 'Not provided';
  const risk = payload.userContext?.riskProfile ?? 'Not provided';
  const notes = payload.userContext?.notes ?? 'None';

  return [
    `Route selected: ${route}`,
    `User goals: ${goals}`,
    `Monthly income: ${income}`,
    `Monthly expenses: ${expenses}`,
    `Risk profile: ${risk}`,
    `Additional notes: ${notes}`,
    `User query: ${payload.query}`,
    'Default to India-first personal finance context unless the user explicitly asks for another country.',
    'For taxes, reference Indian tax concepts (old vs new regime, section 80C, 80D, HRA, capital gains, and relevant cess/surcharge context) at a high level.',
    'Answer with concise finance-aware guidance. State assumptions clearly and avoid legal/tax advice; suggest consulting a SEBI-registered advisor or qualified Indian CA for binding advice.',
  ].join('\n');
}
