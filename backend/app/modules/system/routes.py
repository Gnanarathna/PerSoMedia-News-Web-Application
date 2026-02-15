from flask import Blueprint, jsonify
from app.core.extensions import mongo

system_bp = Blueprint("system", __name__)

@system_bp.route("/health", methods=["GET"])
def health_check():
    try:
        mongo.cx.admin.command("ping")
        return jsonify({"status": "MongoDB Atlas connected successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
