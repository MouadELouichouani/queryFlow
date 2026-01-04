import io
from flask import Blueprint, request, send_file, jsonify
from controllers.tts_controller import generate_speech

tts_bp = Blueprint("tts", __name__)

@tts_bp.route("/speak", methods=["POST"])
def speak():
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    audio_bytes = generate_speech(text)

    if audio_bytes:
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype="audio/wav",
            as_attachment=False
        )
    else:
        return jsonify({"error": "Failed to generate speech"}), 500