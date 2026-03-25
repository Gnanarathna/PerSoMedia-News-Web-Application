from flask import Blueprint
from .controller import (
    trigger_test_notification,
    get_notifications,
    mark_notification_as_read
)

notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)

notifications_bp.route("/test", methods=["POST"])(trigger_test_notification)
notifications_bp.route("", methods=["GET"])(get_notifications)
notifications_bp.route("/<notification_id>/read", methods=["PATCH"])(mark_notification_as_read)