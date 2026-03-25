from datetime import datetime


def build_notification_document(message):
    return {
        "message": message,
        "is_read": False,
        "created_at": datetime.utcnow()
    }