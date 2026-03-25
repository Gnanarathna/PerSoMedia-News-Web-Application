from app.core.extensions import socketio
from .service import save_notification


def send_notification(message):
    save_notification(message)

    socketio.emit("new_notification", {
        "message": message
    })