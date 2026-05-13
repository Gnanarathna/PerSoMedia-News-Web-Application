from flask import Blueprint
from .controller import (
    platform_usage,
    fake_real_stats,
    checked_news_by_platform,
    top_fake_news,
    recent_analyzed_news,
    personalized_analytics
)

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics"
)

analytics_bp.route("/platform-usage", methods=["GET"])(platform_usage)
analytics_bp.route("/fake-real-stats", methods=["GET"])(fake_real_stats)
analytics_bp.route("/checked-by-platform", methods=["GET"])(checked_news_by_platform)
analytics_bp.route("/top-fake-news", methods=["GET"])(top_fake_news)
analytics_bp.route("/recent-analyzed-news", methods=["GET"])(recent_analyzed_news)
analytics_bp.route("/personalized", methods=["GET"])(personalized_analytics)