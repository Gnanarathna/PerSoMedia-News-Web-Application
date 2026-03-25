from app.core.extensions import mongo


def get_platform_usage():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$platform",
                    "count": {"$sum": 1}
                }
            }
        ]

        result = list(mongo.db.news.aggregate(pipeline))

        formatted = []
        for item in result:
            formatted.append({
                "platform": item["_id"],
                "count": item["count"]
            })

        return formatted

    except Exception as e:
        return []


def get_fake_real_stats():
    try:
        checked_items = list(mongo.db.news.find({"is_checked": True}))

        total_checked = len(checked_items)
        real_count = 0
        fake_count = 0

        for item in checked_items:
            real_score = item.get("real_score", 0)
            fake_score = item.get("fake_score", 0)

            if real_score >= fake_score:
                real_count += 1
            else:
                fake_count += 1

        return {
            "total_checked": total_checked,
            "mostly_real": real_count,
            "mostly_fake": fake_count
        }

    except Exception:
        return {
            "total_checked": 0,
            "mostly_real": 0,
            "mostly_fake": 0
        }


def get_checked_news_by_platform():
    try:
        pipeline = [
            {
                "$match": {"is_checked": True}
            },
            {
                "$group": {
                    "_id": "$platform",
                    "checked_count": {"$sum": 1}
                }
            }
        ]

        result = list(mongo.db.news.aggregate(pipeline))

        formatted = []
        for item in result:
            formatted.append({
                "platform": item["_id"],
                "checked_count": item["checked_count"]
            })

        return formatted

    except Exception:
        return []


def get_top_fake_news(limit=5):
    try:
        fake_news = list(
            mongo.db.news.find({"is_checked": True})
            .sort("fake_score", -1)
            .limit(limit)
        )

        result = []
        for item in fake_news:
            result.append({
                "id": str(item["_id"]),
                "title": item.get("title"),
                "platform": item.get("platform"),
                "fake_score": item.get("fake_score"),
                "real_score": item.get("real_score"),
                "explanation": item.get("explanation")
            })

        return result

    except Exception:
        return []


def get_recent_analyzed_news(limit=5):
    try:
        recent_news = list(
            mongo.db.news.find({"is_checked": True})
            .sort("published_at", -1)
            .limit(limit)
        )

        result = []
        for item in recent_news:
            result.append({
                "id": str(item["_id"]),
                "title": item.get("title"),
                "platform": item.get("platform"),
                "published_at": item.get("published_at"),
                "fake_score": item.get("fake_score"),
                "real_score": item.get("real_score")
            })

        return result

    except Exception:
        return []