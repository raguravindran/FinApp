import type { Request, Response } from 'express';
import { z } from 'zod';

const EmiPayload = z.object({
  principal: z.number().positive(),
  annual_rate: z.number().positive(),
  tenure_months: z.number().int().positive(),
});

function toMoney(value: number): string {
  return value.toFixed(2);
}

export function emiRoute(req: Request, res: Response): void {
  const parsed = EmiPayload.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: { request: 'Invalid payload.' } });
    return;
  }

  const { principal, annual_rate, tenure_months } = parsed.data;
  const rateDecimal = annual_rate / 100;
  const tenureYears = tenure_months / 12;
  const simpleInterest = principal * rateDecimal * tenureYears;
  const totalAmount = principal + simpleInterest;
  const monthlyEmi = totalAmount / tenure_months;

  res.json({
    ok: true,
    data: {
      principal: toMoney(principal),
      annual_rate: toMoney(annual_rate),
      tenure_months,
      simple_interest: toMoney(simpleInterest),
      total_amount: toMoney(totalAmount),
      monthly_emi: toMoney(monthlyEmi),
      formula: 'EMI = (P + (P * R * T)) / N',
    },
  });
}
