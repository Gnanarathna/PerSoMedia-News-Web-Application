from flask import Blueprint, jsonify
from app.modules.news.controller import NewsController
from .controller import get_youtube_trending, get_saved_news, get_saved_youtube_news, analyze_saved_news, get_analyzed_news, get_platform_related_news, get_instagram_related_news, get_tiktok_related_news, get_x_related_news, track_news_view

news_bp = Blueprint("news", __name__)

@news_bp.route("/categories", methods=["GET"])
def categories():
    return jsonify({
        "categories": ["youtube", "x", "facebook", "instagram", "tiktok"]
    }), 200

news_bp.route("/trending", methods=["GET"])(NewsController.trending)
news_bp.route("/search", methods=["GET"])(NewsController.search)
news_bp.route("/watch-later", methods=["POST"])(NewsController.add_watch_later)
news_bp.route("/watch-later/<path:news_id>", methods=["DELETE"])(NewsController.remove_watch_later)
news_bp.route("/me/watch-later", methods=["GET"])(NewsController.my_watch_later)
news_bp.route("/favourites", methods=["POST"])(NewsController.add_favourite)
news_bp.route("/favourites/<path:news_id>", methods=["DELETE"])(NewsController.remove_favourite)
news_bp.route("/me/favourites", methods=["GET"])(NewsController.my_favourites)
news_bp.route("/youtube/trending", methods=["GET"])(get_youtube_trending)
news_bp.route("", methods=["GET"])(get_saved_news)
news_bp.route("/", methods=["GET"])(get_saved_news)
news_bp.route("/saved", methods=["GET"])(get_saved_news)
news_bp.route("/saved-news", methods=["GET"])(get_saved_news)
news_bp.route("/youtube/saved", methods=["GET"])(get_saved_youtube_news)
news_bp.route("/<news_id>/analyze", methods=["POST"])(analyze_saved_news)
news_bp.route("/analyzed", methods=["GET"])(get_analyzed_news)
news_bp.route("/platform/<platform>", methods=["GET"])(get_platform_related_news)
news_bp.route("/instagram/trending", methods=["GET"])(get_instagram_related_news)
news_bp.route("/tiktok/trending", methods=["GET"])(get_tiktok_related_news)
news_bp.route("/x/trending", methods=["GET"])(get_x_related_news)
news_bp.route("/events/view", methods=["POST"])(track_news_view)