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
    'Answer with concise finance-aware guidance. State assumptions clearly and avoid legal/tax advice.',
  ].join('\n');
}
