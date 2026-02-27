from flask import Blueprint, jsonify
from app.modules.news.controller import NewsController

news_bp = Blueprint("news", __name__)

@news_bp.route("/categories", methods=["GET"])
def categories():
    return jsonify({
        "categories": ["youtube", "x", "facebook", "instagram", "tiktok"]
    }), 200

news_bp.route("/trending", methods=["GET"])(NewsController.trending)
news_bp.route("/search", methods=["GET"])(NewsController.search)
news_bp.route("/watch-later", methods=["POST"])(NewsController.add_watch_later)
news_bp.route("/watch-later/<news_id>", methods=["DELETE"])(NewsController.remove_watch_later)
news_bp.route("/me/watch-later", methods=["GET"])(NewsController.my_watch_later)
news_bp.route("/favourites", methods=["POST"])(NewsController.add_favourite)
news_bp.route("/favourites/<news_id>", methods=["DELETE"])(NewsController.remove_favourite)
news_bp.route("/me/favourites", methods=["GET"])(NewsController.my_favourites)