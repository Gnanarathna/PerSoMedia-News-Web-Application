from app.core.extensions import mongo
from flask import current_app
from .model import build_notification_document


def save_notification(message):
    try:
        notification = build_notification_document(message)
        mongo.db.notifications.insert_one(notification)
        return notification
    except Exception as e:
        current_app.logger.exception(f"Failed to save notification: {str(e)}")
        raise