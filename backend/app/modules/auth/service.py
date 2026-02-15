from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from app.core.extensions import bcrypt
from app.modules.auth.repository import AuthRepository
from app.modules.auth.model import UserModel
import google.auth.transport.requests as google_requests
from app.core.config import Config


class AuthService:

    @staticmethod
    def register_user(full_name, email, password):
        # Check if user already exists
        existing_user = AuthRepository.find_by_email(email)
        if existing_user:
            return {"error": "Email already registered"}, 400

        # Hash password
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        # Create user document
        user_data = UserModel.create_local_user(
            full_name=full_name,
            email=email,
            password_hash=password_hash
        )

        # Save user
        user_id = AuthRepository.create_user(user_data)

        return {"message": "User registered successfully", "user_id": user_id}, 201

    @staticmethod
    def login_user(email, password):
        # Find user
        user = AuthRepository.find_by_email(email)

        if not user:
            return {"error": "Invalid email or password"}, 401

        if user["auth_provider"] != "local":
            return {"error": "Use Google login for this account"}, 400

        # Check password
        if not bcrypt.check_password_hash(user["password_hash"], password):
            return {"error": "Invalid email or password"}, 401

        # Generate JWT
        access_token = create_access_token(identity=str(user["_id"]))

        return {
            "message": "Login successful",
            "access_token": access_token
        }, 200

    @staticmethod
    def google_login(google_id_token):
        try:
            # Verify token
            idinfo = id_token.verify_oauth2_token(
                google_id_token,
                google_requests.Request(),
                Config.GOOGLE_CLIENT_ID
            )

            email = idinfo.get("email")
            full_name = idinfo.get("name")
            provider_id = idinfo.get("sub")
            profile_picture = idinfo.get("picture")

            # Check if user already exists by provider_id
            user = AuthRepository.find_by_provider_id(provider_id)

            if not user:
                # Create new Google user
                user_data = UserModel.create_google_user(
                    full_name=full_name,
                    email=email,
                    provider_id=provider_id,
                    profile_picture=profile_picture
                )
                user_id = AuthRepository.create_user(user_data)
            else:
                user_id = str(user["_id"])

            # Generate JWT
            access_token = create_access_token(identity=user_id)

            return {
                "message": "Google login successful",
                "access_token": access_token
            }, 200

        except ValueError:
            return {"error": "Invalid Google token"}, 401
