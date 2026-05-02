# Query Routing Rules

## Purpose

Routing classifies each chat query before invoking downstream logic.

Current outputs:
- `general_search`
- `finance_account_specific`
- `calculation_heavy`

## Current heuristic model

### Account-specific hints
If query contains any of these (case-insensitive), route is `finance_account_specific`:
- my portfolio
- my goals
- my expenses
- my income
- my savings
- my debt
- my account

### Calculation hints
Else, if query contains these, route is `calculation_heavy`:
- calculate
- projection
- maturity
- sip
- emi
- interest
- how much
- returns
- future value
- compound

### Fallback
If no hints match, route is `general_search`.

## Important behavior detail

Routing checks account hints first, then calculation hints.
So a query containing both categories will be treated as `finance_account_specific`.

## Limitations

- Keyword matching may miss semantic intent.
- Possible false positives on generic finance terms.
- No language-localization or embedding-based routing yet.
