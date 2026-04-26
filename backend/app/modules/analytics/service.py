import os

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from app.core.extensions import mongo
from flask import current_app

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)


def get_personalized_analytics(user_id):
    rows = list(
        mongo.db.interactions.find({
            "user_id": str(user_id)
        })
    )

    count = len(rows)

    if count < 10:
        return cold_start(rows)

    return model_ready(user_id, rows)


def cold_start(rows):
    platform_count = {}

    for row in rows:
        platform = row.get("platform", "unknown")

        platform_count[platform] = (
            platform_count.get(platform, 0) + 1
        )

    preferred = "No data"

    if platform_count:
        preferred = max(
            platform_count,
            key=platform_count.get
        )

    return {
        "mode": "cold_start",
        "records": len(rows),
        "preferred_platform": preferred,
        "message": "Use the app more to unlock AI predictions"
    }


def model_ready(user_id, rows):
    df = pd.DataFrame(rows)

    if "platform" not in df or df["platform"].isna().all():
        return {
            "mode": "cold_start",
            "records": len(rows),
            "preferred_platform": "No data",
            "message": "Use the app more to unlock AI predictions"
        }

    df["platform"] = df["platform"].fillna("unknown")

    # Encode target
    encoder = LabelEncoder()
    df["target"] = encoder.fit_transform(df["platform"])

    # LogisticRegression needs at least two classes in training labels.
    if df["target"].nunique() < 2:
        return {
            "mode": "cold_start",
            "records": len(rows),
            "preferred_platform": df["platform"].iloc[0],
            "message": "Use the app more to unlock AI predictions"
        }

    # Features
    feature_columns = [
        "checked",
        "watch_later",
        "favourite",
        "real_score",
        "fake_score",
        "hour",
        "day"
    ]

    for column in feature_columns:
        if column not in df:
            df[column] = 0

    X = df[feature_columns].fillna(0)
    y = df["target"]

    # Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train Model on training data only
    model = LogisticRegression(max_iter=500)
    model.fit(X_train, y_train)

    # Calculate accuracy on test data (unseen data)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    accuracy_percent = round(accuracy * 100, 2)

    # Save files
    model_path = f"{MODEL_DIR}/user_{user_id}.pkl"
    encoder_path = f"{MODEL_DIR}/user_{user_id}_encoder.pkl"

    joblib.dump(model, model_path)
    joblib.dump(encoder, encoder_path)

    # Predict next preference using latest row
    latest = X.tail(1)
    pred = model.predict(latest)[0]
    prob = max(model.predict_proba(latest)[0])

    label = encoder.inverse_transform([pred])[0]
    confidence = round(prob * 100, 2)

    return {
        "mode": "model",
        "records": len(rows),
        "recommended_platform": label,
        "confidence": f"{confidence}%",
        "accuracy": f"{accuracy_percent}%",
        "message": "AI personalized prediction active"
    }


def get_platform_usage(user_id):
    try:
        user_filter = str(user_id)
        pipeline = [
            {
                "$match": {
                    "user_id": user_filter,
                    "platform": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": "$platform",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]

        result = list(mongo.db.platform_activity.aggregate(pipeline))

        formatted = []
        for item in result:
            formatted.append({
                "platform": item["_id"],
                "count": item["count"]
            })

        return formatted

    except Exception as e:
        current_app.logger.exception(f"Failed to compute platform usage: {str(e)}")
        return []


def get_fake_real_stats(user_id):
    try:
        checked_items = list(
            mongo.db.fake_detections.find({"user_id": str(user_id)})
        )

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

    except Exception as e:
        current_app.logger.exception(f"Failed to compute fake/real stats: {str(e)}")
        return {
            "total_checked": 0,
            "mostly_real": 0,
            "mostly_fake": 0
        }


def get_checked_news_by_platform(user_id):
    try:
        user_filter = str(user_id)
        pipeline = [
            {
                "$match": {
                    "user_id": user_filter,
                    "platform": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": "$platform",
                    "checked_count": {"$sum": 1}
                }
            },
            {
                "$sort": {"checked_count": -1}
            }
        ]

        result = list(mongo.db.platform_activity.aggregate(pipeline))

        formatted = []
        for item in result:
            formatted.append({
                "platform": item["_id"],
                "checked_count": item["checked_count"]
            })

        return formatted

    except Exception as e:
        current_app.logger.exception(
            f"Failed to compute checked-news-by-platform stats: {str(e)}"
        )
        return []


def get_top_fake_news(user_id, limit=5):
    try:
        fake_news = list(
            mongo.db.fake_detections.find({"user_id": str(user_id)})
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

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch top fake news: {str(e)}")
        return []


def get_recent_analyzed_news(user_id, limit=5):
    try:
        recent_news = list(
            mongo.db.fake_detections.find({"user_id": str(user_id)})
            .sort("analyzed_at", -1)
            .limit(limit)
        )

        result = []
        for item in recent_news:
            result.append({
                "id": str(item["_id"]),
                "title": item.get("title"),
                "platform": item.get("platform"),
                "analyzed_at": item.get("analyzed_at"),
                "fake_score": item.get("fake_score"),
                "real_score": item.get("real_score")
            })

        return result

    except Exception as e:
        current_app.logger.exception(f"Failed to fetch recent analyzed news: {str(e)}")
        return []