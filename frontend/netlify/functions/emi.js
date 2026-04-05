const toNumber = (value, name) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${name} must be a valid number.` };
  }
  if (parsed <= 0) {
    return { value: null, error: `${name} must be greater than 0.` };
  }
  return { value: parsed, error: null };
};

const roundMoney = (value) => Number(value.toFixed(2)).toFixed(2);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, errors: { method: 'Method not allowed.' } }),
    };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, errors: { body: 'Invalid JSON payload.' } }),
    };
  }

  const principalResult = toNumber(payload.principal, 'principal');
  const annualRateResult = toNumber(payload.annual_rate, 'annual_rate');
  const tenureResult = toNumber(payload.tenure_months, 'tenure_months');

  const errors = {};
  if (principalResult.error) errors.principal = principalResult.error;
  if (annualRateResult.error) errors.annual_rate = annualRateResult.error;
  if (tenureResult.error) errors.tenure_months = tenureResult.error;
  if (!tenureResult.error && !Number.isInteger(tenureResult.value)) {
    errors.tenure_months = 'tenure_months must be a whole number of months.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, errors }),
    };
  }

  const principal = principalResult.value;
  const annualRate = annualRateResult.value;
  const tenureMonths = tenureResult.value;

  const years = tenureMonths / 12;
  const simpleInterest = principal * (annualRate / 100) * years;
  const totalAmount = principal + simpleInterest;
  const monthlyEmi = totalAmount / tenureMonths;

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      data: {
        principal: roundMoney(principal),
        annual_rate: roundMoney(annualRate),
        tenure_months: tenureMonths,
        simple_interest: roundMoney(simpleInterest),
        total_amount: roundMoney(totalAmount),
        monthly_emi: roundMoney(monthlyEmi),
        formula: 'EMI = (P + (P * R * T)) / N',
      },
    }),
  };
};
