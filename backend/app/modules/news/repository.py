from datetime import datetime
from app.core.extensions import mongo

class NewsRepository:

    @staticmethod
    def cache_collection():
        return mongo.cx["persomedia"]["news_cache"]

    @staticmethod
    def get_cached_trending(platform: str):
        return NewsRepository.cache_collection().find_one({"type": "trending", "platform": platform})

    @staticmethod
    def save_cached_trending(platform: str, items: list):
        NewsRepository.cache_collection().update_one(
            {"type": "trending", "platform": platform},
            {"$set": {
                "type": "trending",
                "platform": platform,
                "items": items,
                "cached_at": datetime.utcnow()
            }},
            upsert=True
        )

    @staticmethod
    def watch_later_collection():
        return mongo.cx["persomedia"]["watch_later"]

    @staticmethod
    def add_watch_later(user_id: str, item: dict):
        item["user_id"] = user_id
        return NewsRepository.watch_later_collection().update_one(
            {"user_id": user_id, "news_id": item["news_id"]},
            {"$set": item},
            upsert=True
        )

    @staticmethod
    def remove_watch_later(user_id: str, news_id: str):
        return NewsRepository.watch_later_collection().delete_one(
            {"user_id": user_id, "news_id": news_id}
        )

    @staticmethod
    def list_watch_later(user_id: str):
        return list(NewsRepository.watch_later_collection().find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("saved_at", -1))
    @staticmethod
    def favourites_collection():
        return mongo.cx["persomedia"]["favourites"]

    @staticmethod
    def add_favourite(user_id: str, item: dict):
        item["user_id"] = user_id
        return NewsRepository.favourites_collection().update_one(
            {"user_id": user_id, "news_id": item["news_id"]},
            {"$set": item},
            upsert=True
        )

    @staticmethod
    def remove_favourite(user_id: str, news_id: str):
        return NewsRepository.favourites_collection().delete_one(
            {"user_id": user_id, "news_id": news_id}
        )

    @staticmethod
    def list_favourites(user_id: str):
        return list(NewsRepository.favourites_collection().find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("saved_at", -1))