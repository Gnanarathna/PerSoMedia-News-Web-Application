from datetime import datetime, timedelta
import requests
from flask import current_app
from app.modules.news.repository import NewsRepository
from .api_client import fetch_youtube_news_videos, fetch_platform_related_news
from app.core.extensions import mongo
from flask_jwt_extended import get_jwt_identity


OFFICIAL_CHANNELS = {
    "BBC News",
    "CNN",
    "Al Jazeera English",
    "Reuters",
    "NewsFirst Sri Lanka",
    "Ada Derana",
    "Sirasa TV",
    "Hiru News",
    "TV Derana",
}

BLOCKED_KEYWORDS = [
    "live",
    "livestream",
    "song",
    "music",
    "trailer",
    "teaser",
    "lyrics",
    "reaction",
    "gaming",
    "movie",
    "film",
    "official video"
]


def _is_allowed_language_text(text: str) -> bool:
    # Tamil Unicode block: U+0B80-U+0BFF
    if any("\u0B80" <= ch <= "\u0BFF" for ch in text):
        return False

    # Sinhala Unicode block: U+0D80-U+0DFF
    has_sinhala = any("\u0D80" <= ch <= "\u0DFF" for ch in text)
    has_english = any(("a" <= ch <= "z") or ("A" <= ch <= "Z") for ch in text)

    return has_sinhala or has_english


def get_platform_news(platform):
    response = fetch_platform_related_news(platform, max_results=20)
    articles = response.get("articles", [])

    normalized_news = []

    for article in articles:
        normalized_news.append({
            "title": article.get("title"),
            "content": article.get("description") or article.get("content"),
            "platform": platform.lower(),
            "image_url": article.get("urlToImage"),
            "source_url": article.get("url"),
            "published_at": article.get("publishedAt"),
            "real_score": None,
            "fake_score": None,
            "is_checked": False,
            "explanation": None,
            "source_name": article.get("source", {}).get("name")
        })

    try:
        db = mongo.db
        if db is None and getattr(mongo, "cx", None) is not None:
            db = mongo.cx.get_default_database()

        if db is None:
            current_app.logger.error("MongoDB connection not initialized")
        else:
            platform_key = platform.lower()
            inserted_count = 0
            skipped_count = 0
            failed_count = 0

            for news_item in normalized_news:
                try:
                    source_url = news_item.get("source_url")
                    if not source_url:
                        skipped_count += 1
                        continue

                    result = db.news.update_one(
                        {
                            "source_url": source_url,
                            "platform": platform_key,
                        },
                        {"$setOnInsert": news_item},
                        upsert=True,
                    )

                    if result.upserted_id is not None:
                        news_item["_id"] = str(result.upserted_id)
                        inserted_count += 1
                    else:
                        existing_doc = db.news.find_one(
                            {
                                "source_url": source_url,
                                "platform": platform_key,
                            },
                            {"_id": 1},
                        )
                        if existing_doc and existing_doc.get("_id") is not None:
                            news_item["_id"] = str(existing_doc["_id"])
                        skipped_count += 1
                except Exception:
                    failed_count += 1
                    continue

            # Optional cache for platform-based feeds (for quick reads in UI)
            db.news_cache.update_one(
                {"cache_key": f"{platform_key}_news"},
                {
                    "$set": {
                        "cache_key": f"{platform_key}_news",
                        "platform": platform_key,
                        "type": "platform_news",
                        "cached_at": datetime.utcnow(),
                        "items": normalized_news,
                    }
                },
                upsert=True,
            )

            current_app.logger.info(
                f"Saved {platform_key} news: inserted={inserted_count}, skipped={skipped_count}, failed={failed_count}"
            )
    except Exception as e:
        current_app.logger.exception(f"Failed to save {platform} news: {str(e)}")

    return normalized_news

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

    @staticmethod
    def get_youtube_trending_news():
        try:
            response = fetch_youtube_news_videos(max_results=20)
            items = response.get("items", [])
        except requests.exceptions.HTTPError as http_error:
            status_code = getattr(http_error.response, "status_code", "unknown")
            response_text = getattr(http_error.response, "text", "") or str(http_error)
            raise RuntimeError(
                f"YouTube API request failed (status {status_code}): {response_text}"
            ) from http_error

        normalized_news = []

        for item in items:
            snippet = item.get("snippet", {})
            title = snippet.get("title", "")
            description = snippet.get("description", "")
            channel_title = snippet.get("channelTitle", "")
            item_id = item.get("id")
            video_id = item_id.get("videoId") if isinstance(item_id, dict) else item_id

            if not video_id:
                continue

            combined_text = f"{title} {description}".lower()

            # Show only Sinhala and English content (exclude Tamil)
            if not _is_allowed_language_text(f"{title} {description}"):
                continue

            # Skip unwanted content
            if any(word in combined_text for word in BLOCKED_KEYWORDS):
                continue

            # Skip official channels to focus on claims from non-official sources
            if channel_title in OFFICIAL_CHANNELS:
                continue

            normalized_news.append({
                "title": title,
                "content": description,
                "platform": "youtube",
                "image_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                "source_url": f"https://www.youtube.com/watch?v={video_id}" if video_id else None,
                "published_at": snippet.get("publishedAt"),
                "real_score": None,
                "fake_score": None,
                "is_checked": False
            })

        try:
            db = mongo.db
            if db is None and getattr(mongo, "cx", None) is not None:
                db = mongo.cx.get_default_database()

            if db is not None:
                for news_item in normalized_news:
                    existing = db.news.find_one({"source_url": news_item["source_url"]})

                    if not existing:
                        db.news.insert_one(news_item)
        except Exception as e:
            print(f"Failed to save YouTube news to MongoDB: {str(e)}")

        return normalized_news

