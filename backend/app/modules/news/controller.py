from flask import request, jsonify
from app.modules.news.service import NewsService
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

