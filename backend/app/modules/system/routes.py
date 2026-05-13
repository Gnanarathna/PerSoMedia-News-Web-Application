from flask import Blueprint, jsonify, send_file
from app.core.extensions import mongo
import os
from pathlib import Path
import mimetypes

system_bp = Blueprint("system", __name__)

@system_bp.route("/health", methods=["GET"])
def health_check():
    try:
        mongo.cx.admin.command("ping")
        return jsonify({"status": "MongoDB Atlas connected successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@system_bp.route("/uploads/test", methods=["GET"])
def test_uploads():
    """Test endpoint to verify uploads directory exists and contains files"""
    try:
        uploads_dir = os.path.join(os.path.dirname(__file__), "../../uploads/profile_pictures")
        
        if not os.path.exists(uploads_dir):
            return jsonify({"error": "Uploads directory does not exist", "path": uploads_dir}), 404
        
        files = os.listdir(uploads_dir)
        return jsonify({
            "status": "success",
            "uploads_dir": uploads_dir,
            "files_count": len(files),
            "files": files
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@system_bp.route("/uploads/profile_pictures/<filename>", methods=["GET"])
def serve_profile_picture(filename):
    """Serve uploaded profile pictures"""
    try:
        # Construct the file path
        uploads_dir = os.path.join(os.path.dirname(__file__), "../../uploads/profile_pictures")
        file_path = os.path.join(uploads_dir, filename)
        
        # Security: ensure the file path is within the uploads directory
        real_path = os.path.realpath(file_path)
        real_uploads_dir = os.path.realpath(uploads_dir)
        
        if not real_path.startswith(real_uploads_dir):
            return jsonify({"error": "Invalid file path"}), 403
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        # Determine MIME type from file extension
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        # Serve the file
        return send_file(file_path, mimetype=mime_type)
    except Exception as e:
        return jsonify({"error": f"Failed to serve file: {str(e)}"}), 500
