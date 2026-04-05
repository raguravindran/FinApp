const ACCOUNT_HINTS = [
  'my portfolio',
  'my goals',
  'my expenses',
  'my income',
  'my savings',
  'my debt',
  'my account',
];

const CALCULATION_HINTS = [
  'calculate',
  'projection',
  'maturity',
  'sip',
  'emi',
  'interest',
  'how much',
  'returns',
  'future value',
  'compound',
];

const DEFAULT_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

function candidateModels() {
  const preferred = String(process.env.GEMINI_MODEL || '').trim();
  return preferred ? [preferred, ...DEFAULT_MODELS.filter((model) => model !== preferred)] : DEFAULT_MODELS;
}

function routeIntent(query = '') {
  const normalized = String(query).toLowerCase();

  if (ACCOUNT_HINTS.some((hint) => normalized.includes(hint))) {
    return 'finance_account_specific';
  }

  if (CALCULATION_HINTS.some((hint) => normalized.includes(hint))) {
    return 'calculation_heavy';
  }

  return 'general_search';
}

function buildEnvelope(payload, route) {
  const goals = payload.userContext?.goals?.join(', ') || 'Not provided';
  const income = payload.userContext?.monthlyIncome ?? 'Not provided';
  const expenses = payload.userContext?.monthlyExpenses ?? 'Not provided';
  const risk = payload.userContext?.riskProfile ?? 'Not provided';

  return [
    `Route selected: ${route}`,
    `User goals: ${goals}`,
    `Monthly income: ${income}`,
    `Monthly expenses: ${expenses}`,
    `Risk profile: ${risk}`,
    `User query: ${payload.query || ''}`,
    'Answer with concise finance-aware guidance. State assumptions clearly.',
  ].join('\n');
}

async function askGemini(apiKey, prompt) {
  let lastError = '';

  for (const model of candidateModels()) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text returned by Gemini.';
    }

    const body = await response.text();
    lastError = `model=${model} status=${response.status} body=${body}`;

    if (response.status !== 404) {
      break;
    }
  }

  return `LLM provider error: ${lastError}`;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    if (!payload.query || typeof payload.query !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, errors: { query: 'Query is required.' } }),
      };
    }

    const route = routeIntent(payload.query);

    if (route === 'calculation_heavy') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          data: {
            answer:
              'Deterministic route selected. Wire dedicated finance calculators (SIP/goal maturity/debt payoff) for precise numbers.',
            route,
            assumptions: ['Calculation engine is currently a basic placeholder.'],
          },
        }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Missing GEMINI_API_KEY on Netlify environment.' }),
      };
    }

    const prompt = buildEnvelope(payload, route);
    const answer = await askGemini(apiKey, prompt);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        data: {
          answer,
          route,
          assumptions: [
            'User query is wrapped with finance context server-side before sending to the LLM provider.',
          ],
        },
      }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Internal server error.' }),
    };
  }
}
