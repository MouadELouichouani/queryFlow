from config.db import get_db
from bson import ObjectId
from flask import request, jsonify
from utils.jwt_utils import verify_token
from bson import ObjectId

db = get_db()


def add_query(history_id, question, answer):
    doc = {"history_id": ObjectId(history_id), "question": question, "answer": answer}
    result = db.queries.insert_one(doc)
    return str(result.inserted_id)


def get_queries_by_history(history_id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]
    try:
        user_id = ObjectId(verify_token(token))
    except:
        return jsonify({"error": "Invalid token"}), 401

    try:
        history = db.history.find_one({"_id": ObjectId(history_id)})
        if not history:
            return jsonify({"error": "History not found"}), 404
    except:
        return jsonify({"error": "Invalid history_id"}), 400

    visibility = history.get("visibility")

    if visibility == "private" and history["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403

    queries = list(db.queries.find({"history_id": ObjectId(history_id)}))

    for q in queries:
        q["_id"] = str(q["_id"])
        q["history_id"] = str(q["history_id"])

    return jsonify(queries)
