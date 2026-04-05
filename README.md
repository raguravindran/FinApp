# FinApp EMI Calculator (Django + Lit)

This repository contains a full-stack EMI calculator package:

- **Backend:** Django API for simple-interest EMI calculation.
- **Frontend:** Lit web component served with Vite.

## Formula

Simple-interest EMI formula used by the API:

`EMI = (P + (P × R × T)) / N`

Where:

- `P` = principal amount
- `R` = annual interest rate in decimal (`annual_rate / 100`)
- `T` = tenure in years (`tenure_months / 12`)
- `N` = tenure in months

## One-command local setup (macOS)

From repository root, run:

```bash
./setup_mac.sh
```

This script creates `backend/.venv`, installs backend dependencies, runs migrations, and installs frontend dependencies.

## Backend setup (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend will run at `http://127.0.0.1:8000`.

### API endpoint

- **Method:** `POST`
- **URL:** `/api/emi/`
- **Content-Type:** `application/json`

Request payload:

```json
{
  "principal": 120000,
  "annual_rate": 10,
  "tenure_months": 12
}
```

Success response (example):

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

Validation errors return `400` with `ok: false` and field-level `errors`.

### Run backend tests

```bash
cd backend
python manage.py test
```

## Frontend setup (Lit + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173` and calls backend API at `http://127.0.0.1:8000/api/emi/`.

## Build frontend

```bash
cd frontend
npm run build
```
