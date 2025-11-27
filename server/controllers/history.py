from config.db import get_db
from utils.lib import generate_url
from flask import request, jsonify
from utils.jwt_utils import verify_token
from bson import ObjectId
from datetime import datetime
from flask import request, jsonify
from bson.objectid import ObjectId

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


from flask import request, jsonify
from bson.objectid import ObjectId
from datetime import (
    datetime,
)  # Import datetime if you use it for sorting, even if it's not a direct field


# Function to handle complex serialization (useful for nested objects)
def serialize_mongo_doc(doc):
    """Converts MongoDB document types (ObjectId, datetime) to serializable strings."""
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    # If it's a list or dict, recurse
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

    except Exception:  # Keeping general Exception for token/ID parsing errors
        return jsonify({"error": "Invalid token or user ID format"}), 401

    # Fetch Histories
    # Use _id for sorting (newest first) since 'timestamp' is absent
    histories = list(db.history.find({"user_id": user_id}).sort("_id", -1))

    # Apply comprehensive serialization to all fields
    serialized_histories = []
    for h in histories:
        serialized_histories.append(serialize_mongo_doc(h))

    return jsonify({"histories": serialized_histories}), 200


def get_history_by_url(url):
    # 1. Verify Token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]
    try:
        user_id = verify_token(token)  # helper returns payload (string)
    except:
        return jsonify({"error": "Invalid token"}), 401

    history = db.history.find_one({"url": url, "user_id": ObjectId(user_id)})

    if not history:
        return jsonify({"error": "Not found"}), 404

    # 3. Find the Related Queries (Messages)
    # We search the 'queries' collection where history_id matches this history's ID
    # Sort by _id to ensure they are in chronological order
    queries_cursor = db.queries.find({"history_id": history["_id"]}).sort("_id", 1)

    messages = []

    # 4. Reconstruct the Conversation
    for q in queries_cursor:
        # Append User Question
        messages.append({"role": "user", "content": q.get("question", "")})
        # Append AI Answer
        messages.append({"role": "assistant", "content": q.get("answer", "")})

    # 5. Return the Data
    return jsonify(
        {"history_id": str(history["_id"]), "url": history["url"], "messages": messages}
    )
