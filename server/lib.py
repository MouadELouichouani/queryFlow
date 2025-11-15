import os
import json
import requests
import csv
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
Return a CSV row with fields: Answer.
Format example:
"Compilation translates source code into machine code."
Question: {question}
Only return the CSV row and give details.
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


def get_next_question_index(filepath):
    if not os.path.exists(filepath):
        return 1

    with open(filepath, mode="r", newline="", encoding="utf-8") as file:
        reader = csv.reader(file)
        row_count = sum(1 for row in reader)
        return row_count


def ensure_header_and_write(filepath, index, question, csv_row):

    reader = csv.reader([csv_row])
    answer_category_fields = next(reader)

    full_row = [question] + answer_category_fields

    file_exists = os.path.exists(filepath)

    parent_dir = os.path.dirname(filepath)
    if parent_dir and not os.path.exists(parent_dir):
        os.makedirs(parent_dir, exist_ok=True)

    with open(filepath, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        if not file_exists:
            writer.writerow(["Question", "Answer"])
            print(f"CSV file updated successfully : {filepath}")

        writer.writerow(full_row)

    print(f" Question #{index} add at : {filepath}")


def getResponse(question):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_PATH_PARTS = ["..", "data", "raw", "software_questions.csv"]
    CSV_PATH = os.path.join(BASE_DIR, *CSV_PATH_PARTS)
    CSV_PATH = os.path.normpath(CSV_PATH)

    try:
        next_index = get_next_question_index(CSV_PATH)
        csv_response = ask_openrouter(question)
        ensure_header_and_write(CSV_PATH, next_index, question, csv_response)

        return csv_response

    except Exception as e:
        print(f"An error occured : {e}")
