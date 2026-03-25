from flask import request, jsonify
from .service import analyze_news_service
from .dto import validate_fake_detection_request
from app.core.extensions import mongo


def analyze_news():
    data = request.get_json()

    is_valid, error_message = validate_fake_detection_request(data)
    if not is_valid:
        return jsonify({
            "error": error_message
        }), 400

    title = data.get("title")
    content = data.get("content")

    result = analyze_news_service(title, content)
    return jsonify(result), 200


def get_detection_history():
    try:
        detections = list(mongo.db.fake_detections.find().sort("analyzed_at", -1))

        for detection in detections:
            detection["_id"] = str(detection["_id"])

        return jsonify(detections), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch detection history"
        }), 500