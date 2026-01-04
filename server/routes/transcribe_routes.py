import os
import uuid
from flask import Blueprint, request, jsonify
from controllers.transcribe_controller import transcribe_audio

transcribe_bp = Blueprint("transcribe", __name__)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@transcribe_bp.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio = request.files["audio"]
    filename = f"{uuid.uuid4()}.webm"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        audio.save(file_path)
        text = transcribe_audio(file_path)
        return jsonify({"text": text})
    
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)