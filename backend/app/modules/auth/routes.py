from flask import Blueprint
from app.modules.auth.controller import AuthController

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

auth_bp.route("/register", methods=["POST"])(AuthController.register)
auth_bp.route("/login", methods=["POST"])(AuthController.login)
auth_bp.route("/protected", methods=["GET"])(AuthController.protected)
auth_bp.route("/google-login", methods=["POST"])(AuthController.google_login)