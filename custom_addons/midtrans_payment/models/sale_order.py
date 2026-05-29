import base64
import requests
import os

from odoo import fields, models
from odoo.exceptions import UserError

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    midtrans_status = fields.Char(
        string="Midtrans Status",
        readonly=True
    )

    midtrans_order_id = fields.Char(
        string="Midtrans Order ID",
        readonly=True
    )

    midtrans_payment_url = fields.Char(
        string="Payment URL",
        readonly=True
    )

    def _get_headers(self):
        server_key = os.getenv("MIDTRANS_SERVER_KEY")

        encoded_key = base64.b64encode(
            f"{server_key}:".encode()
        ).decode()

        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {encoded_key}"
        }

    def action_dummy_midtrans(self):
        self.ensure_one()

        # Sudah dibayar
        if self.midtrans_status == 'settlement':
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Midtrans',
                    'message': 'Order ini sudah dibayar.',
                    'type': 'warning',
                    'sticky': False,
                }
            }

        # Jika payment link sudah ada, buka lagi
        if self.midtrans_payment_url:
            return {
                'type': 'ir.actions.act_url',
                'url': self.midtrans_payment_url,
                'target': 'new',
            }

        headers = self._get_headers()

        unique_order_id = (
            f"{self.name}-{self.id}"
        )

        payload = {
            "transaction_details": {
                "order_id": unique_order_id,
                "gross_amount": int(self.amount_total)
            },
            "customer_details": {
                "first_name":
                    self.partner_id.name or "Customer"
            }
        }

        response = requests.post(
            "https://app.sandbox.midtrans.com/snap/v1/transactions",
            json=payload,
            headers=headers,
            timeout=20
        )

        if response.status_code != 201:
            raise UserError(response.text)

        result = response.json()

        self.midtrans_status = "pending"
        self.midtrans_order_id = unique_order_id
        self.midtrans_payment_url = result.get(
            "redirect_url"
        )

        return {
            'type': 'ir.actions.act_url',
            'url': self.midtrans_payment_url,
            'target': 'new',
        }

    def action_check_midtrans_status(self):
        self.ensure_one()

        if not self.midtrans_order_id:
            raise UserError(
                "Belum ada transaksi Midtrans."
            )

        headers = self._get_headers()

        response = requests.get(
            f"https://api.sandbox.midtrans.com/v2/"
            f"{self.midtrans_order_id}/status",
            headers=headers,
            timeout=20
        )

        if response.status_code != 200:
            raise UserError(response.text)

        result = response.json()

        self.midtrans_status = result.get(
            "transaction_status",
            "unknown"
        )

        # AUTO CONFIRM + CREATE INVOICE
        if self.midtrans_status == "settlement":

            if self.state in ['draft', 'sent']:
                self.action_confirm()

            if not self.invoice_ids:
                self._create_invoices()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Midtrans Status',
                'message':
                    f'Status sekarang: '
                    f'{self.midtrans_status}',
                'type': 'success',
                'sticky': False,
            }
        }