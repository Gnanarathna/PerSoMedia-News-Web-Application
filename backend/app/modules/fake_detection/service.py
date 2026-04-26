import json
import openai
from flask import current_app
from openai import OpenAI
from app.core.extensions import mongo
from .model import build_detection_document


DEFAULT_DETAILS = {
    "source_reliability": "Source reliability could not be confidently verified from available context.",
    "language_analysis": "Language patterns suggest mixed signals; additional context is required.",
    "evidence_check": "Evidence is limited or not explicitly verifiable in the provided content.",
    "recommendation": "Cross-check this claim with multiple trusted outlets before sharing.",
}


def _sanitize_scores(real_score, fake_score):
    real_score = max(0, min(int(real_score), 100))
    fake_score = max(0, min(int(fake_score), 100))

    if real_score + fake_score != 100:
        fake_score = 100 - real_score

    return real_score, fake_score


def _build_default_result(title, summary_message):
    real_score, fake_score = _sanitize_scores(50, 50)
    details = {
        **DEFAULT_DETAILS,
        "recommendation": "Try again shortly and verify key claims using trusted sources.",
    }

    return {
        "title": title,
        "real_score": real_score,
        "fake_score": fake_score,
        "summary": summary_message,
        "details": details,
        "explanation": summary_message,
    }


def analyze_news_service(title, content, user_id=None, platform=None):
    client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
    content_text = (content or "").strip() or "Not provided by the user. Analyze primarily from the title and any URL cues."

    prompt = f"""
You are a fake news detection assistant.

Analyze the following news article and return ONLY valid JSON.

News Title:
{title}

News Content:
{content_text}

Return in exactly this format:
{{
  "real_score": 0,
  "fake_score": 0,
  "summary": "Likely real with some uncertainty",
  "details": {{
    "source_reliability": "...",
    "language_analysis": "...",
    "evidence_check": "...",
    "recommendation": "..."
  }}
}}

Rules:
- Return JSON only
- Do not include markdown
- Do not include extra text
- real_score and fake_score must be integers
- real_score + fake_score must equal 100
- summary must be concise and clear (1 sentence)
- each details field must be practical and specific (1-2 sentences)
"""

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )

        output_text = response.output_text.strip()
        ai_result = json.loads(output_text)

        real_score = ai_result.get("real_score", 50)
        fake_score = ai_result.get("fake_score", 50)
        summary = ai_result.get("summary") or ai_result.get("explanation") or "No summary provided."

        real_score, fake_score = _sanitize_scores(real_score, fake_score)

        details = ai_result.get("details") if isinstance(ai_result.get("details"), dict) else {}
        details = {
            **DEFAULT_DETAILS,
            "source_reliability": details.get("source_reliability") or DEFAULT_DETAILS["source_reliability"],
            "language_analysis": details.get("language_analysis") or DEFAULT_DETAILS["language_analysis"],
            "evidence_check": details.get("evidence_check") or DEFAULT_DETAILS["evidence_check"],
            "recommendation": details.get("recommendation") or DEFAULT_DETAILS["recommendation"],
        }

        result = {
            "title": title,
            "real_score": real_score,
            "fake_score": fake_score,
            "summary": summary,
            "details": details,
            "explanation": summary,
        }

    except openai.APIConnectionError:
        current_app.logger.exception("OpenAI connection error")
        result = _build_default_result(
            title,
            "AI service connection failed. Default analysis returned.",
        )

    except openai.RateLimitError:
        current_app.logger.exception("OpenAI rate limit reached")
        result = _build_default_result(
            title,
            "AI service is busy right now. Default analysis returned.",
        )

    except openai.APIStatusError as e:
        current_app.logger.exception(f"OpenAI API status error: {e.status_code}")
        result = _build_default_result(
            title,
            "AI service returned an error. Default analysis returned.",
        )

    except Exception as e:
        current_app.logger.exception(f"Unexpected AI parsing error: {str(e)}")
        result = _build_default_result(
            title,
            "AI response could not be processed correctly.",
        )

    detection_document = build_detection_document(
        title,
        content,
        result,
        user_id=user_id,
        platform=platform,
    )

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