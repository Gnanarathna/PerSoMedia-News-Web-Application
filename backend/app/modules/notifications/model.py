from datetime import datetime


def build_notification_document(
    message,
    user_id,
    is_test=False,
    real_score=None,
    fake_score=None,
):
    document = {
        "message": message,
        "user_id": str(user_id),
        "is_test": bool(is_test),
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    if real_score is not None:
        document["real_score"] = int(real_score)

    if fake_score is not None:
        document["fake_score"] = int(fake_score)

    return document