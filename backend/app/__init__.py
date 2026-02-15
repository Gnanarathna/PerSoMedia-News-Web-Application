from flask import Flask
from .config import Config
from .extensions import mongo, bcrypt, jwt
from .routes.health_routes import health_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(health_bp)

    return app
