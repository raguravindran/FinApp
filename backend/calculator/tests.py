import json

from django.test import Client, TestCase


class EmiApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/emi/"

    def test_emi_success(self):
        response = self.client.post(
            self.url,
            data=json.dumps(
                {
                    "principal": 120000,
                    "annual_rate": 10,
                    "tenure_months": 12,
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["data"]["simple_interest"], "12000.00")
        self.assertEqual(payload["data"]["total_amount"], "132000.00")
        self.assertEqual(payload["data"]["monthly_emi"], "11000.00")

    def test_emi_invalid_input(self):
        response = self.client.post(
            self.url,
            data=json.dumps(
                {
                    "principal": -1,
                    "annual_rate": "abc",
                    "tenure_months": 10.5,
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        payload = response.json()
        self.assertFalse(payload["ok"])
        self.assertIn("principal", payload["errors"])
        self.assertIn("annual_rate", payload["errors"])
        self.assertIn("tenure_months", payload["errors"])
