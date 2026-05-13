from flask import Flask
from flask_cors import CORS
from datetime import timedelta
from app.modules.auth.routes import auth_bp
from app.core.config import Config
from app.core.extensions import mongo, bcrypt, jwt
from app.modules.system.routes import system_bp
from app.modules.news.routes import news_bp
from app.modules.fake_detection import fake_detection_bp
from app.modules.analytics import analytics_bp
from app.core.extensions import mongo, bcrypt, jwt, socketio
from app.modules.notifications import notifications_bp
from app.core.errors.logger import configure_logger
from app.core.errors.handlers import register_error_handlers
import os

def create_app():
    app = Flask(__name__, static_url_path="/uploads", static_folder=os.path.join(os.path.dirname(__file__), "../uploads"))
    app.config.from_object(Config)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    CORS(app)

    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)
    configure_logger(app)
    register_error_handlers(app)

    app.register_blueprint(system_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(news_bp, url_prefix="/api/news")
    app.register_blueprint(fake_detection_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(notifications_bp)

    return app
