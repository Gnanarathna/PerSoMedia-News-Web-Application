from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from app.core.extensions import bcrypt
from app.modules.auth.repository import AuthRepository
from app.modules.auth.model import UserModel
import google.auth.transport.requests as google_requests
from app.core.config import Config
import os
import uuid
from werkzeug.utils import secure_filename
import secrets
from datetime import datetime, timedelta
import requests


class AuthService:

    @staticmethod
    def _normalize_email(email):
        return (email or "").strip().lower()

    @staticmethod
    def _send_reset_email(email, reset_link):
        if not Config.SENDGRID_API_KEY:
            return {"error": "Email service is not configured"}, 500

        if not Config.SENDGRID_FROM_EMAIL:
            return {"error": "Sender email is not configured"}, 500

        reply_to = Config.SENDGRID_REPLY_TO_EMAIL or None

        response = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {Config.SENDGRID_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "personalizations": [
                    {
                        "to": [{"email": email}],
                        "subject": "Reset your PerSoMedia News password",
                    }
                ],
                "from": {
                    "email": Config.SENDGRID_FROM_EMAIL,
                    "name": "PerSoMedia News",
                },
                **({"reply_to": {"email": reply_to}} if reply_to else {}),
                "content": [
                    {
                        "type": "text/plain",
                        "value": (
                            "You requested a password reset for your PerSoMedia News account.\n\n"
                            f"Reset your password here: {reset_link}\n\n"
                            "If you did not request this, you can ignore this email. The link expires in 1 hour."
                        ),
                    },
                    {
                        "type": "text/html",
                        "value": (
                            "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#0f172a'>"
                            "<h2 style='margin:0 0 12px'>Reset your PerSoMedia News password</h2>"
                            "<p>You requested a password reset for your account.</p>"
                            f"<p><a href='{reset_link}' style='display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px'>Reset Password</a></p>"
                            f"<p style='word-break:break-all'>If the button does not work, copy this link:<br>{reset_link}</p>"
                            "<p>If you did not request this, you can ignore this email. The link expires in 1 hour.</p>"
                            "</div>"
                        ),
                    }
                ],
            },
            timeout=15,
        )

        if response.status_code not in (200, 202):
            if response.status_code == 403 and "verified Sender Identity" in response.text:
                raise RuntimeError(
                    "SendGrid rejected the from address because it is not a verified Sender Identity. "
                    "Verify the sender in SendGrid or use a verified from address."
                )

            raise RuntimeError(f"SendGrid error: {response.status_code} {response.text}")

        return None

    @staticmethod
    def register_user(full_name, email, password):
        email = AuthService._normalize_email(email)

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
        email = AuthService._normalize_email(email)

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

    @staticmethod
    def get_current_user(user_id):
        user = AuthRepository.find_by_id(user_id)
        
        if not user:
            return {"error": "User not found"}, 404
        
        return {
            "id": str(user["_id"]),
            "name": user.get("full_name"),
            "email": user.get("email"),
            "image": user.get("profile_picture"),
            "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
            "auth_provider": user.get("auth_provider", "local"),
        }, 200

    @staticmethod
    def update_profile(user_id, full_name, email=None):
        user = AuthRepository.find_by_id(user_id)
        
        if not user:
            return {"error": "User not found"}, 404

        full_name = (full_name or "").strip()

        if not full_name:
            return {"error": "Name is required"}, 400

        if len(full_name) > 20:
            return {"error": "Name must be 20 characters or fewer including spaces"}, 400
        
        # Only update the full_name, email cannot be changed
        updated_user = AuthRepository.update_user(user_id, {
            "full_name": full_name,
        })
        
        return {
            "id": str(updated_user["_id"]),
            "name": updated_user.get("full_name"),
            "email": updated_user.get("email"),
            "image": updated_user.get("profile_picture"),
            "created_at": updated_user.get("created_at").isoformat() if updated_user.get("created_at") else None,
        }, 200

    @staticmethod
    def change_password(user_id, old_password, new_password):
        user = AuthRepository.find_by_id(user_id)
        
        if not user:
            return {"error": "User not found"}, 404
        
        # Check if user is using Google login
        if user.get("auth_provider") == "google":
            return {"error": "Google users must change password through Google Account settings"}, 400
        
        # Check if password is set (local auth)
        if not user.get("password_hash"):
            return {"error": "This account uses social login"}, 400
        
        # Verify old password
        if not bcrypt.check_password_hash(user["password_hash"], old_password):
            return {"error": "Current password is incorrect"}, 401
        
        # Hash new password
        new_password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        
        AuthRepository.update_user(user_id, {
            "password_hash": new_password_hash
        })
        
        return {"message": "Password changed successfully"}, 200

    @staticmethod
    def upload_profile_photo(user_id, file):
        user = AuthRepository.find_by_id(user_id)
        
        if not user:
            return {"error": "User not found"}, 404
        
        # Validate file
        if not file or file.filename == "":
            return {"error": "No file selected"}, 400
        
        # Allowed extensions
        ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
        
        # Check file extension
        if "." not in file.filename:
            return {"error": "Invalid file format"}, 400
        
        file_ext = file.filename.rsplit(".", 1)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return {"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}, 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return {"error": f"File size exceeds maximum allowed size of 5MB"}, 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(__file__), "../../uploads/profile_pictures")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"{user_id}_{uuid.uuid4().hex}.{file_ext}"
        filepath = os.path.join(upload_dir, filename)
        
        # Save file
        try:
            file.save(filepath)
            print(f"✓ File saved successfully: {filepath}")
        except Exception as e:
            print(f"✗ Failed to save file: {str(e)}")
            return {"error": f"Failed to save file: {str(e)}"}, 500
        
        # Create file URL (relative path from Flask root)
        file_url = f"/uploads/profile_pictures/{filename}"
        
        # Update user in database
        updated_user = AuthRepository.update_user(user_id, {
            "profile_picture": file_url
        })
        
        return {
            "image_url": file_url,
            "id": str(updated_user["_id"]),
            "name": updated_user.get("full_name"),
            "email": updated_user.get("email"),
            "image": updated_user.get("profile_picture")
        }, 200

    @staticmethod
    def delete_account(user_id, password=None, confirmation_email=None, validate_only=False):
        user = AuthRepository.find_by_id(user_id)
        
        if not user:
            return {"error": "User not found"}, 404

        auth_provider = user.get("auth_provider", "local")

        if auth_provider == "google":
            normalized_confirmation_email = AuthService._normalize_email(confirmation_email)
            user_email = AuthService._normalize_email(user.get("email"))

            if not normalized_confirmation_email:
                return {
                    "error": "Please enter your Google account email to confirm deletion"
                }, 400

            if normalized_confirmation_email != user_email:
                return {
                    "error": "Confirmation email does not match your Google account email"
                }, 401
        else:
            if not password:
                return {"error": "Password is required to delete your account"}, 400

            if not user.get("password_hash"):
                return {"error": "This account uses social login"}, 400

            if not bcrypt.check_password_hash(user["password_hash"], password):
                return {"error": "Incorrect password"}, 401
        
        # If validate_only is True, just validate without deleting
        if validate_only:
            return {"message": "Password validated successfully"}, 200
        
        AuthRepository.delete_user(user_id)
        
        return {"message": "Account deleted successfully"}, 200

    @staticmethod
    def forgot_password(email):
        """Generate a password reset token and send reset link via email"""
        email = AuthService._normalize_email(email)
        user = AuthRepository.find_by_email(email)
        
        if not user:
            return {"error": "No account found with this email"}, 404
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store reset token in user document with expiry (1 hour)
        from bson import ObjectId
        AuthRepository.update_user(str(user["_id"]), {
            "reset_token": reset_token,
            "reset_token_expiry": datetime.utcnow() + timedelta(hours=1)
        })
        
        reset_link = f"{Config.FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"

        try:
            AuthService._send_reset_email(email, reset_link)
        except Exception as exc:
            # If email sending fails (for example SendGrid sender not verified),
            # log the reset link to a local file for development/testing and
            # return a successful response so users can continue testing.
            current_error = str(exc)

            # Write the reset link to a server-side log for testing
            try:
                log_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'reset_links.log'))
                os.makedirs(os.path.dirname(log_path), exist_ok=True)
                with open(log_path, 'a', encoding='utf-8') as f:
                    f.write(f"{datetime.utcnow().isoformat()} | email={email} | link={reset_link} | error={current_error}\n")
            except Exception as log_exc:
                return {"error": f"Failed to send password reset email and failed to log link: {str(log_exc)}"}, 500

            return {"message": "Password reset link could not be emailed; it was logged on the server for testing."}, 200

        return {"message": "Password reset link has been sent to your email"}, 200

    @staticmethod
    def reset_password(token, new_password):
        """Reset password using valid reset token"""
        from bson import ObjectId
        
        if not token or not new_password:
            return {"error": "Token and new password are required"}, 400
        
        # Find user with valid reset token
        from app.core.extensions import mongo
        users = mongo.db.users
        user = users.find_one({
            "reset_token": token,
            "reset_token_expiry": {"$gt": datetime.utcnow()}
        })
        
        if not user:
            return {"error": "Invalid or expired reset token"}, 400
        
        # Hash new password
        password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        
        # Update password and clear reset token
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "password_hash": password_hash,
                "reset_token": None,
                "reset_token_expiry": None,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": "Password has been reset successfully"}, 200
