from flask import jsonify
from bson import ObjectId
from app.core.extensions import mongo
from .events import send_notification


def trigger_test_notification():
    send_notification("This is a test notification from PerSoMedia News")
    return jsonify({
        "message": "Test notification sent successfully"
    }), 200


def get_notifications():
    try:
        notifications = list(
            mongo.db.notifications.find().sort("created_at", -1)
        )

        for notification in notifications:
            notification["_id"] = str(notification["_id"])

        return jsonify(notifications), 200

    except Exception:
        return jsonify({
            "error": "Failed to fetch notifications"
        }), 500


def mark_notification_as_read(notification_id):
    try:
        result = mongo.db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"is_read": True}}
        )

        if result.matched_count == 0:
            return jsonify({
                "error": "Notification not found"
            }), 404

        return jsonify({
            "message": "Notification marked as read"
        }), 200

    except Exception:
        return jsonify({
            "error": "Failed to update notification"
        }), 500