/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useService } from "@web/core/utils/hooks";

patch(PaymentScreen.prototype, {
  setup() {
    super.setup();

    this.notification = useService("notification");

    this.orm = useService("orm");
  },

  async onMidtransClick() {
    try {
      const order = this.pos.get_order();

      const amount = order.get_total_with_tax();

      const partner = order.get_partner();

      const customerName = partner?.name || "Customer";

      const result = await this.orm.call(
        "pos.order",
        "create_midtrans_transaction",
        [[]],
        {
          amount,
          customer_name: customerName,
        },
      );

      window.open(result.redirect_url, "_blank");

      this.notification.add("Menunggu pembayaran Midtrans...", {
        type: "info",
      });

      this.pollMidtransStatus(result.order_id);
    } catch (error) {
      console.error(error);

      this.notification.add("Gagal membuat transaksi Midtrans", {
        type: "danger",
      });
    }
  },

  async pollMidtransStatus(orderId) {
    const interval = setInterval(async () => {
      try {
        const result = await this.orm.call(
          "pos.order",
          "check_midtrans_status",
          [[[]], orderId],
        );

        if (result.status === "settlement") {
          clearInterval(interval);

          this.notification.add("Pembayaran berhasil!", {
            type: "success",
            sticky: true,
          });

          const order = this.pos.get_order();

          const paymentMethod = this.pos.config.payment_method_ids[0];

          if (!paymentMethod) {
            throw new Error("Payment method tidak ditemukan");
          }

          await order.add_paymentline(paymentMethod);
          const line = order.payment_ids[order.payment_ids.length - 1];

          if (!line) {
            throw new Error("Payment line gagal dibuat");
          }

          line.set_amount(order.get_total_with_tax());

          await this.validateOrder(false);
        }

        if (result.status === "expire" || result.status === "cancel") {
          clearInterval(interval);

          this.notification.add(`Pembayaran ${result.status}`, {
            type: "warning",
          });
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  },
});
