from flask import request, current_app
from bson import ObjectId
from bson.errors import InvalidId
from .service import analyze_news_service
from .dto import validate_fake_detection_request
from app.core.extensions import mongo
from app.core.response import success_response, error_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.notifications.events import send_notification


@jwt_required()
def analyze_news():
    user_id = get_jwt_identity()
    data = request.get_json()

    is_valid, error_message = validate_fake_detection_request(data)
    if not is_valid:
        return error_response(error_message, 400)

    title = data.get("title")
    content = data.get("content")

    result = analyze_news_service(title, content, user_id=user_id)

    short_title = (title or "news").strip()
    if len(short_title) > 70:
        short_title = f"{short_title[:67]}..."

    send_notification(
        f"Fake detection result is ready for: {short_title}",
        user_id=user_id,
        is_test=False,
        real_score=result.get("real_score"),
        fake_score=result.get("fake_score"),
    )

    return success_response(result, "News analyzed successfully", 200)


@jwt_required()
def get_detection_history():
    user_id = get_jwt_identity()

    try:
        detections = list(
            mongo.db.fake_detections
            .find({"user_id": str(user_id)})
            .sort("analyzed_at", -1)
        )

        for detection in detections:
            detection["_id"] = str(detection["_id"])

        return success_response(detections, "Detection history fetched successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch detection history: {str(e)}")
        return error_response("Failed to fetch detection history", 500)


@jwt_required()
def delete_detection_history_item(history_id):
    user_id = get_jwt_identity()

    try:
        try:
            history_object_id = ObjectId(history_id)
        except (InvalidId, TypeError):
            return error_response("Invalid detection entry id", 400)

        result = mongo.db.fake_detections.delete_one({
            "_id": history_object_id,
            "user_id": str(user_id),
        })

        if result.deleted_count == 0:
            return error_response("Detection entry not found", 404)

        return success_response({"deleted_id": history_id}, "Detection entry deleted successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to delete detection entry: {str(e)}")
        return error_response("Failed to delete detection entry", 500)


@jwt_required()
def clear_detection_history():
    user_id = get_jwt_identity()

    try:
        result = mongo.db.fake_detections.delete_many({"user_id": str(user_id)})
        return success_response({"deleted_count": result.deleted_count}, "Detection history cleared successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to clear detection history: {str(e)}")
        return error_response("Failed to clear detection history", 500)