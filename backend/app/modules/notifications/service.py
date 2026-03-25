from app.core.extensions import mongo
from .model import build_notification_document


def save_notification(message):
    notification = build_notification_document(message)
    mongo.db.notifications.insert_one(notification)
    return notification