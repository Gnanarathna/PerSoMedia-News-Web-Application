from datetime import datetime
from bson import ObjectId


class UserModel:

    @staticmethod
    def create_local_user(full_name, email, password_hash):
        return {
            "full_name": full_name,
            "email": email,
            "password_hash": password_hash,
            "auth_provider": "local",
            "provider_id": None,
            "profile_picture": None,
            "role": "user",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }

    @staticmethod
    def create_google_user(full_name, email, provider_id, profile_picture):
        return {
            "full_name": full_name,
            "email": email,
            "password_hash": None,
            "auth_provider": "google",
            "provider_id": provider_id,
            "profile_picture": profile_picture,
            "role": "user",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
