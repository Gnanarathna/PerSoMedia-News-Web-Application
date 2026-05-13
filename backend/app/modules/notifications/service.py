from app.core.extensions import mongo
from flask import current_app
from .model import build_notification_document


def save_notification(
    message,
    user_id,
    is_test=False,
    real_score=None,
    fake_score=None,
):
    try:
        notification = build_notification_document(
            message,
            user_id,
            is_test=is_test,
            real_score=real_score,
            fake_score=fake_score,
        )
        mongo.db.notifications.insert_one(notification)
        return notification
    except Exception as e:
        current_app.logger.exception(f"Failed to save notification: {str(e)}")
        raise