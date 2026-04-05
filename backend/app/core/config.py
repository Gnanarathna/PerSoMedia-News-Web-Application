import os
from dotenv import load_dotenv

# Ensure .env values are used even if stale OS-level env vars are present.
load_dotenv(override=True)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")
