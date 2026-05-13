from .service import get_platform_usage, get_fake_real_stats, get_checked_news_by_platform
from .service import get_top_fake_news, get_recent_analyzed_news, get_personalized_analytics
from app.core.response import success_response
from flask_jwt_extended import jwt_required, get_jwt_identity


@jwt_required()
def platform_usage():
    user_id = get_jwt_identity()
    data = get_platform_usage(user_id)
    return success_response(data, "Platform usage fetched successfully", 200)


@jwt_required()
def fake_real_stats():
    user_id = get_jwt_identity()
    data = get_fake_real_stats(user_id)
    return success_response(data, "Fake/real stats fetched successfully", 200)


@jwt_required()
def checked_news_by_platform():
    user_id = get_jwt_identity()
    data = get_checked_news_by_platform(user_id)
    return success_response(data, "Checked news by platform fetched successfully", 200)


@jwt_required()
def top_fake_news():
    user_id = get_jwt_identity()
    data = get_top_fake_news(user_id)
    return success_response(data, "Top fake news fetched successfully", 200)


@jwt_required()
def recent_analyzed_news():
    user_id = get_jwt_identity()
    data = get_recent_analyzed_news(user_id)
    return success_response(data, "Recent analyzed news fetched successfully", 200)


@jwt_required()
def personalized_analytics():
    user_id = get_jwt_identity()

    data = get_personalized_analytics(user_id)

    return success_response(
        data,
        "Personalized analytics fetched",
        200,
    )