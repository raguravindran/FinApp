import json
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def _to_decimal(value: object, name: str) -> tuple[Decimal | None, str | None]:
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, TypeError):
        return None, f"{name} must be a valid number."
    if parsed <= 0:
        return None, f"{name} must be greater than 0."
    return parsed, None


def _round_money(value: Decimal) -> str:
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


@csrf_exempt
@require_POST
def emi_view(request):
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"ok": False, "errors": {"body": "Invalid JSON payload."}}, status=400
        )

    principal, principal_error = _to_decimal(payload.get("principal"), "principal")
    annual_rate, rate_error = _to_decimal(payload.get("annual_rate"), "annual_rate")
    tenure_months, tenure_error = _to_decimal(payload.get("tenure_months"), "tenure_months")

    field_errors = {}
    for key, error in (
        ("principal", principal_error),
        ("annual_rate", rate_error),
        ("tenure_months", tenure_error),
    ):
        if error:
            field_errors[key] = error

    if tenure_months is not None and tenure_months % 1 != 0:
        field_errors["tenure_months"] = "tenure_months must be a whole number of months."

    if field_errors:
        return JsonResponse({"ok": False, "errors": field_errors}, status=400)

    years = tenure_months / Decimal("12")
    simple_interest = principal * (annual_rate / Decimal("100")) * years
    total_amount = principal + simple_interest
    monthly_emi = total_amount / tenure_months

    return JsonResponse(
        {
            "ok": True,
            "data": {
                "principal": _round_money(principal),
                "annual_rate": _round_money(annual_rate),
                "tenure_months": int(tenure_months),
                "simple_interest": _round_money(simple_interest),
                "total_amount": _round_money(total_amount),
                "monthly_emi": _round_money(monthly_emi),
                "formula": "EMI = (P + (P * R * T)) / N",
            },
        }
    )
