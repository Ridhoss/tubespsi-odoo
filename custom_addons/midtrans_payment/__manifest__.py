{
    "name": "Midtrans Payment Integration",
    "version": "1.0",
    "depends": [
        "sale_management",
        "point_of_sale"
    ],
    "data": [
        "views/sale_order_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "midtrans_payment/static/src/js/pos_midtrans_button.js",
            "midtrans_payment/static/src/xml/pos_midtrans_button.xml",
        ],
    },
    "installable": True,
}