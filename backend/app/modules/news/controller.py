from flask import request, current_app
from app.modules.news.service import NewsService
from .service import get_platform_news
from app.core.extensions import mongo
from bson import ObjectId
from app.modules.fake_detection.service import analyze_news_service
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.response import success_response, error_response


def _service_response(response, status):
    if status >= 400:
        return error_response(
            response.get("error") or response.get("message", "Request failed"),
            status,
        )

    message = response.get("message", "Success")
    data = response.get("items")
    if data is None:
        data = response.get("result")
    if data is None:
        data = {k: v for k, v in response.items() if k != "message"}
        if not data:
            data = None

    return success_response(data, message, status)


def _dedupe_news_items(items):
    seen = set()
    unique_items = []

    for item in items or []:
        source_url = (item.get("source_url") or "").strip().lower()
        title = (item.get("title") or "").strip().lower()
        platform = (item.get("platform") or "").strip().lower()
        published_at = (item.get("published_at") or "").strip()

        key = source_url or f"{platform}|{title}|{published_at}"
        if not key or key in seen:
            continue

        seen.add(key)
        unique_items.append(item)

    return unique_items


class NewsController:

    @staticmethod
    def trending():
        platform = request.args.get("platform", "").lower()

        allowed = ["youtube", "x", "facebook", "instagram", "tiktok"]
        if platform not in allowed:
            return error_response("Invalid platform", 400)

        data = NewsService.get_trending(platform)
        return success_response(
            {"platform": platform, "items": data},
            "Trending news fetched successfully",
            200,
        )

    @staticmethod
    def search():
        platform = request.args.get("platform", "").lower()
        query = request.args.get("q", "")

        allowed = ["youtube", "x", "facebook", "instagram", "tiktok"]
        if platform not in allowed:
            return error_response("Invalid platform", 400)

        if not query.strip():
            return error_response("Search query (q) is required", 400)

        results = NewsService.search(platform, query)
        return success_response(
            {"platform": platform, "q": query, "items": results},
            "Search results fetched successfully",
            200,
        )

    @staticmethod
    @jwt_required()
    def add_watch_later():
        user_id = get_jwt_identity()
        data = request.get_json()
        response, status = NewsService.add_to_watch_later(user_id, data)
        return _service_response(response, status)

    @staticmethod
    @jwt_required()
    def remove_watch_later(news_id):
        user_id = get_jwt_identity()
        response, status = NewsService.remove_from_watch_later(user_id, news_id)
        return _service_response(response, status)

    @staticmethod
    @jwt_required()
    def my_watch_later():
        user_id = get_jwt_identity()
        response, status = NewsService.get_watch_later(user_id)
        return _service_response(response, status)

    @staticmethod
    @jwt_required()
    def add_favourite():
        user_id = get_jwt_identity()
        data = request.get_json()
        response, status = NewsService.add_to_favourites(user_id, data)
        return _service_response(response, status)

    @staticmethod
    @jwt_required()
    def remove_favourite(news_id):
        user_id = get_jwt_identity()
        response, status = NewsService.remove_from_favourites(user_id, news_id)
        return _service_response(response, status)

    @staticmethod
    @jwt_required()
    def my_favourites():
        user_id = get_jwt_identity()
        response, status = NewsService.get_favourites(user_id)
        return _service_response(response, status)

    @staticmethod
    def get_youtube_trending():
        try:
            news = NewsService.get_youtube_trending_news()
            return success_response(news, "YouTube trending news fetched successfully", 200)
        except Exception as e:
            current_app.logger.exception(f"Failed to fetch YouTube trending news: {str(e)}")
            return error_response(
                f"Failed to fetch YouTube trending news: {str(e)}",
                500,
            )


def get_youtube_trending():
    return NewsController.get_youtube_trending()


def get_saved_news():
    try:
        platform = (request.args.get("platform") or "").strip().lower()
        allowed = ["youtube", "facebook", "instagram", "tiktok", "x"]

        if platform and platform not in allowed:
            return error_response("Invalid platform", 400)

        if platform == "youtube":
            news_items = _dedupe_news_items(NewsService.get_youtube_trending_news())
            return success_response(news_items, "YouTube news fetched successfully", 200)

        if platform in {"facebook", "instagram", "tiktok", "x"}:
            news_items = _dedupe_news_items(get_platform_news(platform))
            return success_response(news_items, f"{platform.capitalize()} news fetched successfully", 200)

        all_news = []
        all_news.extend(NewsService.get_youtube_trending_news())
        all_news.extend(get_platform_news("facebook"))
        all_news.extend(get_platform_news("instagram"))
        all_news.extend(get_platform_news("tiktok"))
        all_news.extend(get_platform_news("x"))

        all_news = _dedupe_news_items(all_news)

        all_news.sort(
            key=lambda item: item.get("published_at") or "",
            reverse=True,
        )

        return success_response(all_news, "Live news fetched successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch live news: {str(e)}")
        return error_response("Failed to fetch live news", 500)


def get_saved_youtube_news():
    try:
        news_items = _dedupe_news_items(NewsService.get_youtube_trending_news())
        return success_response(news_items, "YouTube news fetched successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch YouTube news: {str(e)}")
        return error_response("Failed to fetch YouTube news", 500)


def analyze_saved_news(news_id):
    try:
        news_item = mongo.db.news.find_one({"_id": ObjectId(news_id)})

        if not news_item:
            return error_response("News item not found", 404)

        title = news_item.get("title", "")
        content = news_item.get("content", "")

        if not title or not content:
            return error_response("News item does not contain enough content for analysis", 400)

        result = analyze_news_service(title, content)

        mongo.db.news.update_one(
            {"_id": ObjectId(news_id)},
            {
                "$set": {
                    "real_score": result.get("real_score"),
                    "fake_score": result.get("fake_score"),
                    "is_checked": True,
                    "explanation": result.get("explanation")
                }
            }
        )

        return success_response(
            {"news_id": news_id, "result": result},
            "News analyzed successfully",
            200,
        )

    except Exception as e:
        current_app.logger.exception(f"Failed to analyze selected news: {str(e)}")
        return error_response("Failed to analyze selected news", 500)


def get_analyzed_news():
    try:
        analyzed_items = list(
            mongo.db.news.find({"is_checked": True}).sort("published_at", -1)
        )

        for item in analyzed_items:
            item["_id"] = str(item["_id"])

        return success_response(analyzed_items, "Analyzed news fetched successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch analyzed news: {str(e)}")
        return error_response("Failed to fetch analyzed news", 500)


def get_platform_related_news(platform):
    try:
        normalized_platform = (platform or "").strip().lower()

        if normalized_platform == "youtube":
            youtube_api_news = NewsService.get_youtube_trending_news()
            news_api_news = get_platform_news("youtube")
            news = _dedupe_news_items([*youtube_api_news, *news_api_news])
        else:
            news = get_platform_news(normalized_platform)

        return success_response(news, f"{platform.capitalize()} news fetched successfully", 200)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        current_app.logger.exception(
            f"Failed to fetch platform-related news for '{platform}': {str(e)}"
        )
        return error_response("Failed to fetch platform-related news", 500)


def get_instagram_related_news():
    return get_platform_related_news("instagram")


def get_tiktok_related_news():
    return get_platform_related_news("tiktok")


def get_x_related_news():
    return get_platform_related_news("x")