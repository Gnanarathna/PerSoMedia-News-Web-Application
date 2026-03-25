from datetime import datetime


def build_detection_document(title, content, result):
    return {
        "title": title,
        "content": content,
        "real_score": result.get("real_score"),
        "fake_score": result.get("fake_score"),
        "explanation": result.get("explanation"),
        "analyzed_at": datetime.utcnow()
    }