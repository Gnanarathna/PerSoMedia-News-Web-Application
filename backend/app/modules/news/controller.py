from flask import request, jsonify
from app.modules.news.service import NewsService
from .service import get_platform_news
from app.core.extensions import mongo
from bson import ObjectId
from app.modules.fake_detection.service import analyze_news_service
from flask_jwt_extended import jwt_required, get_jwt_identity


class NewsController:

    @staticmethod
    def trending():
        platform = request.args.get("platform", "").lower()

        allowed = ["youtube", "x", "facebook", "instagram", "tiktok"]
        if platform not in allowed:
            return jsonify({"error": "Invalid platform"}), 400

        data = NewsService.get_trending(platform)
        return jsonify({"platform": platform, "items": data}), 200

    @staticmethod
    def search():
        platform = request.args.get("platform", "").lower()
        query = request.args.get("q", "")

        allowed = ["youtube", "x", "facebook", "instagram", "tiktok"]
        if platform not in allowed:
            return jsonify({"error": "Invalid platform"}), 400

        if not query.strip():
            return jsonify({"error": "Search query (q) is required"}), 400

        results = NewsService.search(platform, query)
        return jsonify({"platform": platform, "q": query, "items": results}), 200

    @staticmethod
    @jwt_required()
    def add_watch_later():
        user_id = get_jwt_identity()
        data = request.get_json()
        response, status = NewsService.add_to_watch_later(user_id, data)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def remove_watch_later(news_id):
        user_id = get_jwt_identity()
        response, status = NewsService.remove_from_watch_later(user_id, news_id)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def my_watch_later():
        user_id = get_jwt_identity()
        response, status = NewsService.get_watch_later(user_id)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def add_favourite():
        user_id = get_jwt_identity()
        data = request.get_json()
        response, status = NewsService.add_to_favourites(user_id, data)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def remove_favourite(news_id):
        user_id = get_jwt_identity()
        response, status = NewsService.remove_from_favourites(user_id, news_id)
        return jsonify(response), status

    @staticmethod
    @jwt_required()
    def my_favourites():
        user_id = get_jwt_identity()
        response, status = NewsService.get_favourites(user_id)
        return jsonify(response), status

    @staticmethod
    def get_youtube_trending():
        try:
            news = NewsService.get_youtube_trending_news()
            return jsonify(news), 200
        except Exception as e:
            return jsonify({
                "error": f"Failed to fetch YouTube trending news: {str(e)}"
            }), 500


def get_youtube_trending():
    return NewsController.get_youtube_trending()


def get_saved_news():
    try:
        news_items = list(mongo.db.news.find({}).sort("published_at", -1))

        for item in news_items:
            item["_id"] = str(item["_id"])

        return jsonify(news_items), 200

    except Exception:
        return jsonify({
            "error": "Failed to fetch saved news"
        }), 500


def get_saved_youtube_news():
    try:
        news_items = list(mongo.db.news.find({"platform": "youtube"}).sort("published_at", -1))

        for item in news_items:
            item["_id"] = str(item["_id"])

        return jsonify(news_items), 200

    except Exception:
        return jsonify({
            "error": "Failed to fetch saved YouTube news"
        }), 500


def analyze_saved_news(news_id):
    try:
        news_item = mongo.db.news.find_one({"_id": ObjectId(news_id)})

        if not news_item:
            return jsonify({
                "error": "News item not found"
            }), 404

        title = news_item.get("title", "")
        content = news_item.get("content", "")

        if not title or not content:
            return jsonify({
                "error": "News item does not contain enough content for analysis"
            }), 400

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

        return jsonify({
            "message": "News analyzed successfully",
            "news_id": news_id,
            "result": result
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to analyze selected news"
        }), 500


def get_analyzed_news():
    try:
        analyzed_items = list(
            mongo.db.news.find({"is_checked": True}).sort("published_at", -1)
        )

        for item in analyzed_items:
            item["_id"] = str(item["_id"])

        return jsonify(analyzed_items), 200

    except Exception:
        return jsonify({
            "error": "Failed to fetch analyzed news"
        }), 500


def get_platform_related_news(platform):
    try:
        news = get_platform_news(platform)
        return jsonify(news), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Failed to fetch platform-related news"}), 500


def get_instagram_related_news():
    return get_platform_related_news("instagram")


def get_tiktok_related_news():
    return get_platform_related_news("tiktok")


def get_x_related_news():
    return get_platform_related_news("x")