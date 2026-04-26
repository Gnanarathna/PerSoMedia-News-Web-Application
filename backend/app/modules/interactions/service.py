from datetime import datetime

from app.core.extensions import mongo


_INDEX_READY = False


def _ensure_indexes():
    global _INDEX_READY

    if _INDEX_READY:
        return

    mongo.db.interactions.create_index("user_id")
    _INDEX_READY = True


def save_interaction(
    user_id,
    news_id,
    platform,
    action_type,
    checked=0,
    watch_later=0,
    favourite=0,
    real_score=0,
    fake_score=0,
):
    if not user_id or not action_type:
        return

    _ensure_indexes()

    now = datetime.utcnow()
    mongo.db.interactions.insert_one({
        "user_id": str(user_id),
        "news_id": str(news_id) if news_id else None,
        "platform": str(platform).strip().lower() if platform else None,
        "action_type": str(action_type).strip().lower(),
        "checked": int(bool(checked)),
        "watch_later": int(bool(watch_later)),
        "favourite": int(bool(favourite)),
        "real_score": real_score,
        "fake_score": fake_score,
        "hour": now.hour,
        "day": now.weekday(),
        "created_at": now,
    })