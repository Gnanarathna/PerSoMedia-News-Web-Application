from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.auth.service import AuthService


class AuthController:

    @staticmethod
    def register():
        data = request.get_json()

        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")

        if not full_name or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        response, status = AuthService.register_user(full_name, email, password)
        return jsonify(response), status

    @staticmethod
    def login():
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        response, status = AuthService.login_user(email, password)
        return jsonify(response), status

    @staticmethod
    def google_login():
        data = request.get_json()
        google_token = data.get("id_token")

        if not google_token:
            return jsonify({"error": "Google ID token required"}), 400

        response, status = AuthService.google_login(google_token)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def protected():
        user_id = get_jwt_identity()
        return jsonify({
            "message": "Protected route accessed",
            "user_id": user_id
        }), 200
