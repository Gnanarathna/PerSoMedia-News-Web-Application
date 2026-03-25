import requests
from flask import current_app
from datetime import datetime, timedelta, timezone


def fetch_youtube_news_videos(max_results=None):
    api_key = current_app.config.get("YOUTUBE_API_KEY")

    # Fetch only recent videos (last 7 days)
    published_after = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    url = "https://www.googleapis.com/youtube/v3/search"
    collected_items = []
    next_page_token = None

    while True:
        per_page = 50
        if max_results is not None:
            target = max(1, int(max_results))
            remaining = target - len(collected_items)
            if remaining <= 0:
                break
            per_page = min(50, remaining)

        params = {
            "part": "snippet",
            "q": "Sri Lanka latest news OR Sri Lanka breaking news OR Sri Lanka current affairs",
            "type": "video",
            "regionCode": "LK",
            "relevanceLanguage": "en",
            "order": "date",
            "publishedAfter": published_after,
            "maxResults": per_page,
            "key": api_key
        }

        if next_page_token:
            params["pageToken"] = next_page_token

        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        items = data.get("items", [])
        if not items:
            break

        collected_items.extend(items)
        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

    if max_results is not None:
        return {"items": collected_items[:target]}

    return {"items": collected_items}


def fetch_platform_related_news(platform, page_size=100, max_results=None):
    api_key = current_app.config.get("NEWS_API_KEY")

    query_map = {
        "facebook": '"Facebook" AND ("news" OR "viral" OR "misinformation" OR "claim")',
        "instagram": '"Instagram" AND ("news" OR "viral" OR "misinformation" OR "claim")',
        "tiktok": '"TikTok" AND ("news" OR "viral" OR "misinformation" OR "claim")',
        "x": '("X" OR "Twitter") AND ("news" OR "viral" OR "misinformation" OR "claim")'
    }

    q = query_map.get(platform.lower())
    if not q:
        raise ValueError("Unsupported platform")

    url = "https://newsapi.org/v2/everything"
    per_page_default = max(1, min(100, int(page_size)))
    collected_articles = []
    total_results = 0
    page = 1

    while True:
        per_page = per_page_default
        if max_results is not None:
            target = max(1, int(max_results))
            remaining = target - len(collected_articles)
            if remaining <= 0:
                break
            per_page = min(per_page, remaining)

        params = {
            "q": q,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": per_page,
            "page": page,
            "apiKey": api_key
        }

        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        total_results = int(data.get("totalResults", 0) or 0)
        articles = data.get("articles", [])
        if not articles:
            break

        collected_articles.extend(articles)

        if len(articles) < per_page:
            break

        if total_results and len(collected_articles) >= total_results:
            break

        page += 1

    if max_results is not None:
        return {
            "totalResults": total_results,
            "articles": collected_articles[:target]
        }

    return {
        "totalResults": total_results,
        "articles": collected_articles
    }