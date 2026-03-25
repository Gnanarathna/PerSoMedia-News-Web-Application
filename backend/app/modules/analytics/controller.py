from flask import jsonify
from .service import get_platform_usage, get_fake_real_stats, get_checked_news_by_platform
from .service import get_top_fake_news, get_recent_analyzed_news


def platform_usage():
    data = get_platform_usage()
    return jsonify(data), 200


def fake_real_stats():
    data = get_fake_real_stats()
    return jsonify(data), 200


def checked_news_by_platform():
    data = get_checked_news_by_platform()
    return jsonify(data), 200


def top_fake_news():
    data = get_top_fake_news()
    return jsonify(data), 200


def recent_analyzed_news():
    data = get_recent_analyzed_news()
    return jsonify(data), 200