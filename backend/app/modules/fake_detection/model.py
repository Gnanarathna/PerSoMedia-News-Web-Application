from datetime import datetime


def build_detection_document(title, content, result, user_id=None):
    return {
        "user_id": str(user_id) if user_id is not None else None,
        "title": title,
        "content": content,
        "real_score": result.get("real_score"),
        "fake_score": result.get("fake_score"),
        "summary": result.get("summary"),
        "details": result.get("details"),
        "explanation": result.get("explanation"),
        "analyzed_at": datetime.utcnow()
    }