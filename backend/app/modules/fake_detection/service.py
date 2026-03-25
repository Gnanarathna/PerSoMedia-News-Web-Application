import json
import openai
from flask import current_app
from openai import OpenAI
from app.core.extensions import mongo
from .model import build_detection_document


def analyze_news_service(title, content):
    client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

    prompt = f"""
You are a fake news detection assistant.

Analyze the following news article and return ONLY valid JSON.

News Title:
{title}

News Content:
{content}

Return in exactly this format:
{{
  "real_score": 0,
  "fake_score": 0,
  "explanation": "short explanation"
}}

Rules:
- Return JSON only
- Do not include markdown
- Do not include extra text
- real_score and fake_score must be integers
- real_score + fake_score must equal 100
- explanation must be short and clear
"""

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )

        output_text = response.output_text.strip()
        ai_result = json.loads(output_text)

        real_score = int(ai_result.get("real_score", 0))
        fake_score = int(ai_result.get("fake_score", 0))
        explanation = ai_result.get("explanation", "No explanation provided.")

        total = real_score + fake_score
        if total != 100:
            real_score = max(0, min(real_score, 100))
            fake_score = 100 - real_score

    except openai.APIConnectionError:
        current_app.logger.exception("OpenAI connection error")
        real_score = 50
        fake_score = 50
        explanation = "AI service connection failed. Default analysis returned."

    except openai.RateLimitError:
        current_app.logger.exception("OpenAI rate limit reached")
        real_score = 50
        fake_score = 50
        explanation = "AI service is busy right now. Default analysis returned."

    except openai.APIStatusError as e:
        current_app.logger.exception(f"OpenAI API status error: {e.status_code}")
        real_score = 50
        fake_score = 50
        explanation = "AI service returned an error. Default analysis returned."

    except Exception as e:
        current_app.logger.exception(f"Unexpected AI parsing error: {str(e)}")
        real_score = 50
        fake_score = 50
        explanation = "AI response could not be processed correctly."

    result = {
        "title": title,
        "real_score": real_score,
        "fake_score": fake_score,
        "explanation": explanation
    }

    detection_document = build_detection_document(title, content, result)

    try:
        db = mongo.db
        if db is None and getattr(mongo, "cx", None) is not None:
            db = mongo.cx.get_default_database()

        if db is None:
            current_app.logger.error("MongoDB connection not initialized")
        else:
            db.fake_detections.insert_one(detection_document)
    except Exception as e:
        current_app.logger.exception(f"Failed to save detection result: {str(e)}")

    return result