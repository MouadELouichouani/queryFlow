import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def transcribe_audio(file_path: str) -> str:
    client = Groq()
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found at: {file_path}")

    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=(os.path.basename(file_path), audio_file.read()), 
            model="whisper-large-v3-turbo",
            response_format="json",
            language="en"
        )

    return transcription.text