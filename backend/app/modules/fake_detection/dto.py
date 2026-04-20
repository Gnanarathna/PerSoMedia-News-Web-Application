def validate_fake_detection_request(data):
    if not data:
        return False, "Request body is required"

    title = data.get("title")
    content = data.get("content")

    if not title:
        return False, "Title is required"

    if not content and not title.strip():
        return False, "Title is required"

    return True, None