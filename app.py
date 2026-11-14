from datetime import datetime, timedelta
import os
import random
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
menu_items = [
    {
        "id": 1,
        "name": "Egusi Soup & Pounded Yam",
        "price": 4000,
        "description": (
            "Rich melon seed soup with assorted meats, served with smooth"
            "Pounded Yam"
        ),
    },
    {
        "id": 2,
        "name": "Jollof Rice & Chicken",
        "price": 7500,
        "description": (
            "Spicy jollof rice served with grilled chicken, a favorite for any occasion"
        ),
    },
    {
        "id": 3,
        "name": "Special Beef Suya",
        "pice": 3000,
        "description": (
            "Tender skewers marinated in a blend of spices, perfect for meat lovers"
        ),
    },
    {
        "id": 4,
        "name": "Special Egg Moi Moi",
        "price": 3000,
        "description": (
            "Steamed beans pudding with a special egg filling, a traditional Nigerian delicacy"
        ),
    },
]
pending_payments = {}
orders = {}
@app.route("/api/menu", methods=["GET"])
def get_menu():
    return jsonify(menu_items)
#Step 1: Initialize Opay bank transfer with 30-min timer
@app.route("/api/initiate-transfer", methods=["POST"])
def initiate_tranfer():
    data = request.json
    ref_id = f"PAY-{random.randint(10000, 99999)}"
    expires_at = datetime.now() +  timedelta(minutes=30)
    pending_payments[ref_id] = {
        "ref_id": ref_id,
        "items": data.get("items", []),
        "total": data.get("total", 0),
        "expires_at": expires_at,
    }
    return jsonify({
        "success": True,
        "refId": ref_id,
        "bankName": "Opay",
        "accountNumber": "7039137433",
        "accountName": "ChopNow Foods Ltd( DEMO ACCOUNT)",
        "amount": data.get("total", 0),
        "expiresInSeconds": 1800, #30 minutes
    })
#  Step 2 Confirm transfer when user clicks the button
@app.route("/api/confirm-transfer", methods=["POST"])
def confirm_transfer():
    data = request.json or {}
    ref_id = data.get("refId")
    if ref_id not in pending_payments:
        return jsonify({"success": False, "error": "Invalid Payment Session"}), 400

    payment = pending_payments[ref_id]
    if datetime.now() > payment["expires_at"]:
        del pending_payments[ref_id]
        return (
            jsonify({
                "success": False,
                "error": "Payment window expired. Please checkout again.",
            }),
            400,
        )
    order_id = f"CHOP-{random.randint(1000, 9999)}"
    orders[order_id] = {
        "id": order_id,
        "items": payment["items"],
        "total": payment["total"],
        "paymentMethod": "Bank Transfer (Opay)",
        "status": "Payment Confirmed - Being prepared in the kitchen",
    }
    del pending_payments[ref_id]
    return jsonify({
        "success": True,
        "orderId": order_id,
        "status": orders[order_id]["status"],
    })
@app.route("/api/track/<order_id>", methods=["GET"])
def track_order(order_id):
    order_id = order_id.upper()
    if order_id in orders:
        return jsonify(orders[order_id])
    return jsonify({"error": "Order ID not found"}), 404
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
    @app.route("/")
    def index():
        return send_from_directory(".", "index.html")
    @app.route("/path:path>")
    def static_files(path):
        return send_from_directory(".", path)