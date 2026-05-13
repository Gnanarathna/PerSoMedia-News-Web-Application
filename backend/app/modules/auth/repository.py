from app.core.extensions import mongo
from bson.objectid import ObjectId
from datetime import datetime
import re


class AuthRepository:

    @staticmethod
    def get_collection():
        return mongo.cx["persomedia"]["users"]

    @staticmethod
    def create_user(user_data):
        result = AuthRepository.get_collection().insert_one(user_data)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        normalized_email = (email or "").strip()
        if not normalized_email:
            return None

        return AuthRepository.get_collection().find_one({
            "email": re.compile(f"^{re.escape(normalized_email)}$", re.IGNORECASE)
        })

    @staticmethod
    def find_by_provider_id(provider_id):
        return AuthRepository.get_collection().find_one({"provider_id": provider_id})

    @staticmethod
    def find_by_id(user_id):
        return AuthRepository.get_collection().find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def update_user(user_id, update_data):
        update_data["updated_at"] = datetime.utcnow()
        AuthRepository.get_collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        return AuthRepository.find_by_id(user_id)

    @staticmethod
    def delete_user(user_id):
        AuthRepository.get_collection().delete_one({"_id": ObjectId(user_id)})
