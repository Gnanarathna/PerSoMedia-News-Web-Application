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

    @staticmethod
    @jwt_required()
    def get_current_user():
        user_id = get_jwt_identity()
        response, status = AuthService.get_current_user(user_id)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def update_profile():
        user_id = get_jwt_identity()
        data = request.get_json()

        full_name = data.get("name")

        if not full_name:
            return jsonify({"error": "Name is required"}), 400

        response, status = AuthService.update_profile(user_id, full_name)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def change_password():
        user_id = get_jwt_identity()
        data = request.get_json()

        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            return jsonify({"error": "Old and new passwords are required"}), 400

        response, status = AuthService.change_password(user_id, old_password, new_password)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def upload_profile_photo():
        user_id = get_jwt_identity()
        
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        response, status = AuthService.upload_profile_photo(user_id, file)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def delete_account():
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        password = data.get("password")
        confirmation_email = data.get("confirmation_email")
        validate_only = data.get("validate_only", False)

        response, status = AuthService.delete_account(
            user_id,
            password=password,
            confirmation_email=confirmation_email,
            validate_only=validate_only,
        )
        return jsonify(response), status

    @staticmethod
    def forgot_password():
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        response, status = AuthService.forgot_password(email)
        return jsonify(response), status

    @staticmethod
    def reset_password():
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("new_password")

        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400

        response, status = AuthService.reset_password(token, new_password)
        return jsonify(response), status

