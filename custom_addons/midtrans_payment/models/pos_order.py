import base64
import os
import requests
import uuid

from odoo import models
from odoo.exceptions import UserError


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _get_headers(self):
        server_key = os.getenv("MIDTRANS_SERVER_KEY")

        if not server_key:
            raise UserError(
                "MIDTRANS_SERVER_KEY belum di-set."
            )

        encoded_key = base64.b64encode(
            f"{server_key}:".encode()
        ).decode()

        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization":
                f"Basic {encoded_key}",
        }

    def create_midtrans_transaction(
        self,
        amount,
        customer_name="Customer"
    ):
        headers = self._get_headers()

        order_id = (
            f"POS-{uuid.uuid4().hex[:12]}"
        )

        payload = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": int(amount),
            },
            "customer_details": {
                "first_name":
                    customer_name,
            },
        }

        response = requests.post(
            "https://app.sandbox.midtrans.com/"
            "snap/v1/transactions",
            json=payload,
            headers=headers,
            timeout=20,
        )

        if response.status_code != 201:
            raise UserError(response.text)

        result = response.json()

        return {
            "redirect_url":
                result.get("redirect_url"),
            "order_id":
                order_id,
        }
        
    def check_midtrans_status(self, order_id):
        headers = self._get_headers()

        response = requests.get(
            f"https://api.sandbox.midtrans.com/v2/"
            f"{order_id}/status",
            headers=headers,
            timeout=20,
        )

        if response.status_code != 200:
            raise UserError(response.text)

        result = response.json()

        return {
            "status": result.get(
                "transaction_status",
                "unknown"
            )
        }