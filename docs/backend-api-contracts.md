# Backend API Contracts

## Base behavior

The backend exposes JSON APIs over Express:

- `GET /api/health`
- `POST /api/chat`
- `POST /api/emi/`

Routes are registered in `backend/src/server.ts`.

---

## `GET /api/health`

### Purpose
Basic service health probe.

### Success response
```json
{
  "ok": true,
  "service": "finapp-backend"
}
```

---

## `POST /api/chat`

### Request body
```json
{
  "query": "string (min length 2)",
  "userContext": {
    "goals": ["string"],
    "monthlyIncome": 9500,
    "monthlyExpenses": 5200,
    "riskProfile": "low | medium | high",
    "notes": "optional string"
  }
}
```

### Validation
- `query` is required and must be at least 2 chars.
- `userContext` is optional.
- `riskProfile` (if provided) must be one of `low|medium|high`.

### Success response shape
```json
{
  "ok": true,
  "data": {
    "answer": "string",
    "route": "general_search | finance_account_specific | calculation_heavy",
    "assumptions": ["string"]
  }
}
```

### Error response shape
Validation failure:
```json
{
  "ok": false,
  "errors": {
    "query": "Query is required."
  }
}
```

---

## `POST /api/emi/`

### Request body
```json
{
  "principal": 120000,
  "annual_rate": 10,
  "tenure_months": 12
}
```

### Validation
- `principal`: positive number
- `annual_rate`: positive number
- `tenure_months`: positive integer

### Success response
```json
{
  "ok": true,
  "data": {
    "principal": "120000.00",
    "annual_rate": "10.00",
    "tenure_months": 12,
    "simple_interest": "12000.00",
    "total_amount": "132000.00",
    "monthly_emi": "11000.00",
    "formula": "EMI = (P + (P * R * T)) / N"
  }
}
```

### Error response
```json
{
  "ok": false,
  "errors": {
    "request": "Invalid payload."
  }
}
```
