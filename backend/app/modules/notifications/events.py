from app.core.extensions import socketio
from .service import save_notification


def send_notification(
    message,
    user_id,
    is_test=False,
    real_score=None,
    fake_score=None,
):
    save_notification(
        message,
        user_id=user_id,
        is_test=is_test,
        real_score=real_score,
        fake_score=fake_score,
    )

    socketio.emit("new_notification", {
        "message": message,
        "user_id": str(user_id),
        "real_score": real_score,
        "fake_score": fake_score,
    })