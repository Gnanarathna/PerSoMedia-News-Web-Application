from flask import Blueprint
from app.modules.auth.controller import AuthController

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

auth_bp.route("/register", methods=["POST"])(AuthController.register)
auth_bp.route("/login", methods=["POST"])(AuthController.login)
auth_bp.route("/protected", methods=["GET"])(AuthController.protected)
auth_bp.route("/google-login", methods=["POST"])(AuthController.google_login)
auth_bp.route("/me", methods=["GET"])(AuthController.get_current_user)
auth_bp.route("/update-profile", methods=["PUT"])(AuthController.update_profile)
auth_bp.route("/change-password", methods=["PUT"])(AuthController.change_password)
auth_bp.route("/upload-photo", methods=["POST"])(AuthController.upload_profile_photo)
auth_bp.route("/delete-account", methods=["DELETE"])(AuthController.delete_account)
auth_bp.route("/forgot-password", methods=["POST"])(AuthController.forgot_password)
auth_bp.route("/reset-password", methods=["POST"])(AuthController.reset_password)