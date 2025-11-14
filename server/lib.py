import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")


def ask_openrouter(question):

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "kwaipilot/kat-coder-pro:free",
        "messages": [
            {
                "role": "user",
                "content": f"""
Return a CSV row with fields: Answer,Category.
Format example:
"Compilation translates source code into machine code.",General Programming
Question: {question}
Only return the CSV row.
                """,
            }
        ],
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        data = response.json()
        return data["choices"][0]["message"]["content"]
    else:
        raise Exception(f"API Error: {response.text}")


if __name__ == "__main__":
    print(ask_openrouter("What is python?"))
