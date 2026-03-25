def validate_fake_detection_request(data):
    if not data:
        return False, "Request body is required"

    title = data.get("title")
    content = data.get("content")

    if not title or not content:
        return False, "Title and content are required"

    return True, None