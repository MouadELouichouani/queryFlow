from flask import request, jsonify
from models.qa_model import qa
from controllers.history import create_history
from controllers.query import add_query
from utils.jwt_utils import verify_token
from bson import ObjectId
from config.db import get_db

db = get_db()


def getAnswer():
    # -------------------------
    # 1. Validate token
    # -------------------------
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]

    try:
        user_id = ObjectId(verify_token(token))
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    # -------------------------
    # 2. Validate question
    # -------------------------
    question = request.args.get("question")
    if not question:
        return jsonify({"error": "No question provided"}), 400
    if len(question) > 1000:
        return jsonify({"error": "Question too long"}), 400

    # -------------------------
    # 3. Get history_url (NOT history_id)
    # -------------------------
    history_url = request.args.get("history_url")
    history_doc = None
    url = None

    # If URL exists → check if it belongs to this user
    if history_url:
        history_doc = db.history.find_one({"url": history_url, "user_id": user_id})

    # If no valid history found → create a new one
    if not history_doc:
        history_id, url = create_history(
            user_id=user_id, title=question, visibility="private"
        )

        history_doc = db.history.find_one({"_id": ObjectId(history_id)})

    else:
        history_id = history_doc["_id"]
        url = history_doc["url"]

    # -------------------------
    # 4. Generate response
    # -------------------------
    model_res = qa.MiniLM(question)
    answer = model_res["response"]

    # -------------------------
    # 5. Create query document
    # -------------------------
    add_query(history_id=history_id, question=question, answer=answer)

    return jsonify({"history_id": str(history_id), "url": url, "response": answer})
