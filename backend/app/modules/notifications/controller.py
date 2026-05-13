from flask import current_app
from bson import ObjectId
from app.core.extensions import mongo
from .events import send_notification
from app.core.response import success_response, error_response
from flask_jwt_extended import jwt_required, get_jwt_identity


@jwt_required()
def trigger_test_notification():
    user_id = get_jwt_identity()
    send_notification(
        "This is a test notification from PerSoMedia News",
        user_id=user_id,
        is_test=True,
    )
    return success_response(None, "Test notification sent successfully", 200)


@jwt_required()
def get_notifications():
    try:
        user_id = get_jwt_identity()
        notifications = list(
            mongo.db.notifications.find(
                {
                    "user_id": str(user_id),
                    "is_test": {"$ne": True},
                }
            ).sort("created_at", -1)
        )

        for notification in notifications:
            notification["_id"] = str(notification["_id"])

        return success_response(notifications, "Notifications fetched successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch notifications: {str(e)}")
        return error_response("Failed to fetch notifications", 500)


@jwt_required()
def mark_notification_as_read(notification_id):
    try:
        user_id = get_jwt_identity()
        result = mongo.db.notifications.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": str(user_id),
            },
            {"$set": {"is_read": True}}
        )

        if result.matched_count == 0:
            return error_response("Notification not found", 404)

        return success_response(None, "Notification marked as read", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to update notification: {str(e)}")
        return error_response("Failed to update notification", 500)


@jwt_required()
def delete_notification(notification_id):
    try:
        user_id = get_jwt_identity()
        result = mongo.db.notifications.delete_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": str(user_id),
            }
        )

        if result.deleted_count == 0:
            return error_response("Notification not found", 404)

        return success_response(None, "Notification removed", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to remove notification: {str(e)}")
        return error_response("Failed to remove notification", 500)


@jwt_required()
def clear_notifications():
    try:
        user_id = get_jwt_identity()
        mongo.db.notifications.delete_many(
            {
                "user_id": str(user_id),
                "is_test": {"$ne": True},
            }
        )

        return success_response(None, "All notifications cleared", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to clear notifications: {str(e)}")
        return error_response("Failed to clear notifications", 500)