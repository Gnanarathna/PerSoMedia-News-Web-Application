from app.core.extensions import mongo
from bson.objectid import ObjectId


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
        return AuthRepository.get_collection().find_one({"email": email})

    @staticmethod
    def find_by_provider_id(provider_id):
        return AuthRepository.get_collection().find_one({"provider_id": provider_id})

    @staticmethod
    def find_by_id(user_id):
        return AuthRepository.get_collection().find_one({"_id": ObjectId(user_id)})
