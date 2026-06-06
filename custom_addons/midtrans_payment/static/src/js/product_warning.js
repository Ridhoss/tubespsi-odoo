/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { WarningDialog } from "./warning_dialog";

patch(PosStore.prototype, {
  async addLineToCurrentOrder(...args) {
    const result = await super.addLineToCurrentOrder(...args);

    const product = args[0]?.product_id;

    if (!product) {
      return result;
    }

    const categoriesConfig = {
      "Mudah Pecah": {
        icon: "fa fa-cube",
        color: "#0d6efd",
        description: "Produk rentan terhadap benturan dan kerusakan fisik.",
      },

      "Barang Tajam": {
        icon: "fa fa-scissors",
        color: "#dc3545",
        description:
          "Produk memiliki sisi tajam yang dapat menyebabkan cedera.",
      },

      "Bahan Kimia": {
        icon: "fa fa-flask",
        color: "#fd7e14",
        description:
          "Produk termasuk bahan kimia yang memerlukan perhatian khusus.",
      },

      "Mudah Terbakar": {
        icon: "fa fa-fire",
        color: "#ffc107",
        description:
          "Produk mudah terbakar dan berisiko terhadap sumber panas.",
      },
    };

    const warnings = [];

    const categories = product.pos_categ_ids || [];

    for (const category of categories) {
      const config = categoriesConfig[category.name];

      if (!config) {
        continue;
      }

      warnings.push({
        category: category.name,
        products: [product.display_name],
        icon: config.icon,
        color: config.color,
        description: config.description,
      });
    }

    if (warnings.length) {
      warnings.forEach((warning) => {
        this.env.services.dialog.add(WarningDialog, {
          warnings: [warning],
        });
      });
    }

    return result;
  },
});
