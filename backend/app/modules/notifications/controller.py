from flask import current_app
from bson import ObjectId
from app.core.extensions import mongo
from .events import send_notification
from app.core.response import success_response, error_response


def trigger_test_notification():
    send_notification("This is a test notification from PerSoMedia News")
    return success_response(None, "Test notification sent successfully", 200)


def get_notifications():
    try:
        notifications = list(
            mongo.db.notifications.find().sort("created_at", -1)
        )

        for notification in notifications:
            notification["_id"] = str(notification["_id"])

        return success_response(notifications, "Notifications fetched successfully", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch notifications: {str(e)}")
        return error_response("Failed to fetch notifications", 500)


def mark_notification_as_read(notification_id):
    try:
        result = mongo.db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"is_read": True}}
        )

        if result.matched_count == 0:
            return error_response("Notification not found", 404)

        return success_response(None, "Notification marked as read", 200)

    except Exception as e:
        current_app.logger.exception(f"Failed to update notification: {str(e)}")
        return error_response("Failed to update notification", 500)