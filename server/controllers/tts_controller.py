import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def generate_speech(text: str):
    client = Groq()
    
    try:
        response = client.audio.speech.create(
            model="canopylabs/orpheus-v1-english",
            voice="troy",
            input=text,
            response_format="wav"
        )
        
        return response.read() 
        
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        return None