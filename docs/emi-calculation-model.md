# EMI Calculation Model (Current)

## Current model type

The current EMI endpoint uses a **simple-interest** model.
It is intentionally a starter implementation, not a full reducing-balance loan engine.

## Formula

`EMI = (P + (P * R * T)) / N`

Where:
- `P` = principal
- `R` = annual rate decimal (`annual_rate / 100`)
- `T` = tenure years (`tenure_months / 12`)
- `N` = tenure months

## Output fields

The API returns:
- principal
- annual_rate
- tenure_months
- simple_interest
- total_amount
- monthly_emi
- formula

Monetary values are formatted as strings with 2 decimal places.

## Known scope boundaries

Not yet modeled:
- reducing balance interest behavior,
- amortization schedule,
- fees/charges,
- prepayment impacts,
- variable/floating rates.

## Why this is acceptable for MVP

- Easy to validate and explain.
- Deterministic and stable for baseline UX.
- Clear path to swap in a richer loan engine later.
