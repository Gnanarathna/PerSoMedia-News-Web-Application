from flask import jsonify


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({
            "error": "Bad request"
        }), 400

    @app.errorhandler(401)
    def unauthorized_error(error):
        return jsonify({
            "error": "Unauthorized access"
        }), 401

    @app.errorhandler(403)
    def forbidden_error(error):
        return jsonify({
            "error": "Forbidden access"
        }), 403

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Route not found"
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "error": "Internal server error"
        }), 500