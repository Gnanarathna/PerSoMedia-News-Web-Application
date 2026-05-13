from flask import Blueprint
from .controller import (
    analyze_news,
    clear_detection_history,
    delete_detection_history_item,
    get_detection_history,
)

fake_detection_bp = Blueprint(
    "fake_detection",
    __name__,
    url_prefix="/api/fake-detection"
)

fake_detection_bp.route("/analyze", methods=["POST"])(analyze_news)
fake_detection_bp.route("/history", methods=["GET"])(get_detection_history)
fake_detection_bp.route("/history", methods=["DELETE"])(clear_detection_history)
fake_detection_bp.route("/history/<history_id>", methods=["DELETE"])(delete_detection_history_item)