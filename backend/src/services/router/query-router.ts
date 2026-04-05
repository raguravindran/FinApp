import type { Intent } from '../../types.js';

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

const ACCOUNT_HINTS = [
  'my portfolio',
  'my goals',
  'my expenses',
  'my income',
  'my savings',
  'my debt',
  'my account',
];

export function routeIntent(query: string): Intent {
  const normalized = query.toLowerCase();

  if (ACCOUNT_HINTS.some((hint) => normalized.includes(hint))) {
    return 'finance_account_specific';
  }

  if (CALCULATION_HINTS.some((hint) => normalized.includes(hint))) {
    return 'calculation_heavy';
  }

  return 'general_search';
}
