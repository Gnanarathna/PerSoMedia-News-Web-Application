from datetime import datetime, timedelta
from app.modules.news.repository import NewsRepository
from flask_jwt_extended import get_jwt_identity

class NewsService:

    CACHE_MINUTES = 15

    @staticmethod
    def _mock_trending(platform: str):
        now = datetime.utcnow().isoformat() + "Z"
        return [
            {
                "news_id": f"{platform}-001",
                "platform": platform,
                "title": f"Trending {platform} news 1",
                "url": "https://example.com/1",
                "thumbnail_url": "https://picsum.photos/300/200",
                "published_at": now
            },
            {
                "news_id": f"{platform}-002",
                "platform": platform,
                "title": f"Trending {platform} news 2",
                "url": "https://example.com/2",
                "thumbnail_url": "https://picsum.photos/300/200",
                "published_at": now
            },
            {
                "news_id": f"{platform}-003",
                "platform": platform,
                "title": f"Trending {platform} news 3",
                "url": "https://example.com/3",
                "thumbnail_url": "https://picsum.photos/300/200",
                "published_at": now
            }
        ]

    @staticmethod
    def get_trending(platform: str):
        cached = NewsRepository.get_cached_trending(platform)

        if cached and cached.get("cached_at"):
            cached_at = cached["cached_at"]
            if datetime.utcnow() - cached_at < timedelta(minutes=NewsService.CACHE_MINUTES):
                return cached["items"]

        # Not cached or expired → generate (mock now, API later)
        items = NewsService._mock_trending(platform)

        # Save to cache
        NewsRepository.save_cached_trending(platform, items)

        return items

    @staticmethod
    def search(platform: str, query: str):
        items = NewsService.get_trending(platform)  # uses cache
        q = query.lower().strip()

        results = []
        for item in items:
            title = (item.get("title") or "").lower()
            if q in title:
                results.append(item)

        return results
    
    @staticmethod
    def add_to_watch_later(user_id: str, item: dict):
        # Basic validation
        required = ["news_id", "platform", "title", "url", "thumbnail_url"]
        for r in required:
            if r not in item or not str(item[r]).strip():
                return {"error": f"{r} is required"}, 400

        item["saved_at"] = datetime.utcnow()
        NewsRepository.add_watch_later(user_id, item)
        return {"message": "Added to watch later"}, 200

    @staticmethod
    def remove_from_watch_later(user_id: str, news_id: str):
        NewsRepository.remove_watch_later(user_id, news_id)
        return {"message": "Removed from watch later"}, 200

    @staticmethod
    def get_watch_later(user_id: str):
        items = NewsRepository.list_watch_later(user_id)
        return {"items": items}, 200

    @staticmethod
    def add_to_favourites(user_id: str, item: dict):
        required = ["news_id", "platform", "title", "url", "thumbnail_url"]
        for r in required:
            if r not in item or not str(item[r]).strip():
                return {"error": f"{r} is required"}, 400

        item["saved_at"] = datetime.utcnow()
        NewsRepository.add_favourite(user_id, item)
        return {"message": "Added to favourites"}, 200

    @staticmethod
    def remove_from_favourites(user_id: str, news_id: str):
        NewsRepository.remove_favourite(user_id, news_id)
        return {"message": "Removed from favourites"}, 200

    @staticmethod
    def get_favourites(user_id: str):
        items = NewsRepository.list_favourites(user_id)
        return {"items": items}, 200

