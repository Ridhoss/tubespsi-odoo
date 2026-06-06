/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useService } from "@web/core/utils/hooks";
import { WarningDialog } from "./warning_dialog";

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

    const categoriesConfig = {
      "Mudah Pecah": {
        icon: "fa fa-cube",
        color: "#3b82f6",
        description: "Produk rentan terhadap benturan dan kerusakan fisik.",
      },

      "Barang Tajam": {
        icon: "fa fa-scissors",
        color: "#ef4444",
        description:
          "Produk memiliki sisi tajam yang perlu penanganan hati-hati.",
      },

      "Bahan Kimia": {
        icon: "fa fa-flask",
        color: "#8b5cf6",
        description:
          "Produk termasuk bahan kimia yang memerlukan perhatian khusus.",
      },

      "Mudah Terbakar": {
        icon: "fa fa-fire",
        color: "#f97316",
        description:
          "Produk mudah terbakar dan harus dijauhkan dari sumber panas.",
      },
    };

    const groupedWarnings = {
      "Mudah Pecah": [],
      "Barang Tajam": [],
      "Bahan Kimia": [],
      "Mudah Terbakar": [],
    };

    for (const line of order.lines) {
      const product = line.product_id;

      if (!product) continue;

      const categories = product.pos_categ_ids || [];

      for (const category of categories) {
        const categoryName = category.name;

        if (groupedWarnings[categoryName]) {
          groupedWarnings[categoryName].push(product.display_name);
        }
      }
    }

    console.log("GROUPED WARNINGS", groupedWarnings);

    const warnings = [];

    for (const [category, products] of Object.entries(groupedWarnings)) {
      if (!products.length) continue;

      const config = categoriesConfig[category];

      warnings.push({
        category,
        products,
        icon: config.icon,
        level: config.level,
        color: config.color,
        description: config.description,
        instructions: config.instructions,
      });
    }

    console.log("FINAL WARNINGS", warnings);

    if (!warnings.length) {
      return;
    }

    for (const w of warnings) {
      this.dialog.add(WarningDialog, {
        warnings: [w],
      });
    }
  },
});
