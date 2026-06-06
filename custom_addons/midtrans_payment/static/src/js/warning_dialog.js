/** @odoo-module */

import { Component } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";

export class WarningDialog extends Component {
    static template = "midtrans_payment.WarningDialog";

    static components = { Dialog };

    static props = {
        close: Function,
        warnings: Array,
    };

    setup() {
        console.log("WarningDialog loaded");
        console.log("Props:", this.props);
    }
}