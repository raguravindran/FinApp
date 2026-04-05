export type Intent = 'general_search' | 'finance_account_specific' | 'calculation_heavy';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  query: string;
  userContext?: {
    goals?: string[];
    monthlyIncome?: number;
    monthlyExpenses?: number;
    riskProfile?: 'low' | 'medium' | 'high';
    notes?: string;
  };
}

export interface ChatResponse {
  ok: true;
  data: {
    answer: string;
    route: Intent;
    assumptions: string[];
  };
}
