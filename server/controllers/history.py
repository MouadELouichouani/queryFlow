from config.db import get_db
from utils.lib import generate_url
from flask import request, jsonify
from utils.jwt_utils import verify_token
from bson import ObjectId
from datetime import datetime
from flask import request, jsonify
from bson.objectid import ObjectId
from datetime import datetime

db = get_db()


def create_history(user_id, title, visibility="private"):
    current_time_utc = datetime.utcnow()
    doc = {
        "user_id": user_id,
        "title": title,
        "created_at": current_time_utc,
        "last_updated": current_time_utc,
        "url": generate_url(),
        "visibility": visibility,
    }

    result = db.history.insert_one(doc)
    return str(result.inserted_id), doc["url"]


def serialize_mongo_doc(doc):
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    if isinstance(doc, dict):
        return {k: serialize_mongo_doc(v) for k, v in doc.items()}
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    return doc


def get_user_histories():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or malformed Authorization header"}), 401

    token = auth_header.split(" ")[1]

    user_id_str = None
    try:
        user_id_str = verify_token(token)

        if not user_id_str:
            return jsonify({"error": "Invalid token payload"}), 401

        user_id = ObjectId(user_id_str)

    except Exception:
        return jsonify({"error": "Invalid token or user ID format"}), 401

    histories = list(db.history.find({"user_id": user_id}).sort("last_updated", -1))

    serialized_histories = []
    for h in histories:
        serialized_histories.append(serialize_mongo_doc(h))

    return jsonify({"histories": serialized_histories}), 200


def get_history_by_url(url):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]
    try:
        user_id = verify_token(token)
    except:
        return jsonify({"error": "Invalid token"}), 401

    history = db.history.find_one({"url": url, "user_id": ObjectId(user_id)})

    if not history:
        return jsonify({"error": "Not found"}), 404

    queries_cursor = db.queries.find({"history_id": history["_id"]}).sort("_id", 1)

    messages = []

    for q in queries_cursor:
        messages.append({"role": "user", "content": q.get("question", "")})
        messages.append({"role": "assistant", "content": q.get("answer", "")})

    return jsonify(
        {"history_id": str(history["_id"]), "url": history["url"], "messages": messages}
    )


def update_visibility(id):
    try:
        data = request.get_json()
        visibility = data.get("visibility")

        if visibility not in ["public", "private"]:
            return jsonify({"error": "visibility must be 'public' or 'private'"}), 400

        result = db.history.update_one(
            {"_id": ObjectId(id)}, {"$set": {"visibility": visibility}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "History not found"}), 404

        # Fetch the updated document to return URL
        history = db.history.find_one({"_id": ObjectId(id)}, {"url": 1})
        url = history.get("url") if history else None

        return (
            jsonify(
                {
                    "message": "Visibility updated successfully",
                    "history_id": id,
                    "url": url,
                    "visibility": visibility,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_title(id):
    try:
        data = request.get_json()
        title = data.get("title")

        if not title:
            return jsonify({"error": "title is required"}), 400

        result = db.history.update_one(
            {"_id": ObjectId(id)}, {"$set": {"title": title}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "History not found"}), 404

        return (
            jsonify(
                {
                    "message": "Title updated successfully",
                    "history_id": id,
                    "title": title,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def delete_history(id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]

    try:
        user_id = ObjectId(verify_token(token))
    except:
        return jsonify({"error": "Invalid token"}), 401

    try:
        history_id = ObjectId(id)
    except:
        return jsonify({"error": "Invalid history_id"}), 400

    history = db.history.find_one({"_id": history_id, "user_id": user_id})
    if not history:
        return jsonify({"error": "History not found or unauthorized"}), 404

    db.history.delete_one({"_id": history_id})
    db.queries.delete_many({"history_id": history_id})

    return jsonify({"message": "History deleted successfully"})
