/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useService } from "@web/core/utils/hooks";

patch(PaymentScreen.prototype, {
  setup() {
    super.setup();

    this.notification = useService("notification");

    console.log("MIDTRANS PAYMENT SCREEN PATCH LOADED");
  },

  async onMounted() {
    if (super.onMounted) {
      await super.onMounted();
    }

    const order = this.pos.get_order();

    if (!order) {
      return;
    }

    const warnings = [];

    for (const line of order.lines) {
      const product = line.product_id;

      const categories = product?.pos_categ_ids || [];

      for (const category of categories) {
        const categoryName = category.name;

        console.log("POS CATEGORY:", categoryName);

        switch (categoryName) {
          case "Mudah Pecah":
            warnings.push(
              `• ${product.display_name}\n` +
                `Produk memerlukan penanganan dan pengemasan khusus karena memiliki karakteristik mudah pecah.`,
            );
            break;

          case "Barang Tajam":
            warnings.push(
              `• ${product.display_name}\n` +
                `Produk memerlukan perlindungan tambahan guna meminimalkan risiko cedera selama proses pengemasan dan distribusi.`,
            );
            break;

          case "Bahan Kimia":
            warnings.push(
              `• ${product.display_name}\n` +
                `Produk termasuk bahan kimia yang memerlukan prosedur pengemasan sesuai standar keselamatan.`,
            );
            break;

          case "Cairan Mudah Terbakar":
            warnings.push(
              `• ${product.display_name}\n` +
                `Produk memiliki karakteristik mudah terbakar sehingga membutuhkan penanganan dan penyimpanan khusus.`,
            );
            break;
        }
      }
    }

    if (warnings.length) {
      this.notification.add(warnings.join("\n\n"), {
        type: "warning",
        sticky: true,
      });
    }
  },
});
