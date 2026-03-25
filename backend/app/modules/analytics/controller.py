from .service import get_platform_usage, get_fake_real_stats, get_checked_news_by_platform
from .service import get_top_fake_news, get_recent_analyzed_news
from app.core.response import success_response


def platform_usage():
    data = get_platform_usage()
    return success_response(data, "Platform usage fetched successfully", 200)


def fake_real_stats():
    data = get_fake_real_stats()
    return success_response(data, "Fake/real stats fetched successfully", 200)


def checked_news_by_platform():
    data = get_checked_news_by_platform()
    return success_response(data, "Checked news by platform fetched successfully", 200)


def top_fake_news():
    data = get_top_fake_news()
    return success_response(data, "Top fake news fetched successfully", 200)


def recent_analyzed_news():
    data = get_recent_analyzed_news()
    return success_response(data, "Recent analyzed news fetched successfully", 200)