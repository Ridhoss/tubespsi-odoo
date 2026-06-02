/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useService } from "@web/core/utils/hooks";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

patch(PaymentScreen.prototype, {
  setup() {
    super.setup();

    this.dialog = useService("dialog");

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

    // Group warning per kategori
    const groupedWarnings = {
      "Mudah Pecah": [],
      "Barang Tajam": [],
      "Bahan Kimia": [],
      "Cairan Mudah Terbakar": [],
    };

    for (const line of order.lines) {
      const product = line.product_id;
      const categories = product?.pos_categ_ids || [];

      for (const category of categories) {
        const categoryName = category.name;

        switch (categoryName) {
          case "Mudah Pecah":
          case "Barang Tajam":
          case "Bahan Kimia":
          case "Cairan Mudah Terbakar":
            groupedWarnings[categoryName].push(product.display_name);
            break;
        }
      }
    }

    // Popup bertumpuk (1 kategori = 1 popup)
    for (const [category, products] of Object.entries(groupedWarnings)) {
      if (!products.length) continue;

      let description = "";

      switch (category) {
        case "Mudah Pecah":
          description =
            "Produk berikut memerlukan penanganan dan pengemasan khusus karena mudah pecah:";
          break;

        case "Barang Tajam":
          description =
            "Produk berikut memerlukan perlindungan tambahan untuk meminimalkan risiko cedera:";
          break;

        case "Bahan Kimia":
          description =
            "Produk berikut termasuk bahan kimia dan memerlukan prosedur pengemasan sesuai standar keselamatan:";
          break;

        case "Cairan Mudah Terbakar":
          description =
            "Produk berikut memiliki karakteristik mudah terbakar dan membutuhkan penanganan khusus:";
          break;
      }

      this.dialog.add(AlertDialog, {
        title: category,
        body: `${description}\n\n` + products.map((p) => `• ${p}`).join("\n"),
        confirmLabel: "OK",
        dialogClass: "midtrans-warning-dialog",
      });
    }
  },
});
