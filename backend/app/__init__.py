from flask import Flask
from app.modules.auth.routes import auth_bp
from app.core.config import Config
from app.core.extensions import mongo, bcrypt, jwt
from app.modules.system.routes import system_bp
from app.modules.news.routes import news_bp
from app.modules.fake_detection import fake_detection_bp
from app.modules.analytics import analytics_bp
from app.core.extensions import mongo, bcrypt, jwt, socketio
from app.modules.notifications import notifications_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)

    app.register_blueprint(system_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(news_bp, url_prefix="/api/news")
    app.register_blueprint(fake_detection_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(notifications_bp)

    return app
