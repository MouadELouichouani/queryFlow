import requests
from flask import request, jsonify, make_response
from config.db import get_db
from config.google_oauth import *
from utils.jwt_utils import create_token
from utils.jwt_utils import verify_token
from bson import ObjectId


def google_login():
    auth_url = GOOGLE_OAUTH_URL.format(
        client_id=GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI
    )
    return jsonify({"auth_url": auth_url})


db = get_db()
users = db["users"]


def google_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_res = requests.post(token_url, data=token_data).json()

    access_token = token_res.get("access_token")
    if not access_token:
        return jsonify({"error": "Token exchange failed"}), 400

    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    ).json()

    email = user_info.get("email")
    if not email:
        return jsonify({"error": "Google did not return an email"}), 400

    name = user_info.get("name", "")
    picture = user_info.get("picture", "")

    user = users.find_one({"email": email})

    if not user:
        result = users.insert_one(
            {
                "email": email,
                "name": name,
                "picture": picture,
                "auth_provider": "google",
            }
        )
        user_id = result.inserted_id
        user = {"_id": user_id, "email": email, "name": name, "picture": picture}
    else:
        user_id = user["_id"]

    token = create_token(str(user_id))

    return (
        jsonify(
            {
                "token": token,
                "user": {
                    "id": str(user_id),
                    "email": user["email"],
                    "name": user.get("name", ""),
                    "picture": user.get("picture", ""),
                },
            }
        ),
        200,
    )


def get_current_user():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]

    try:
        user_id_str = verify_token(token)
        user_id = ObjectId(user_id_str)
    except Exception as e:
        return jsonify({"error": str(e)}), 401

    user = users.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "picture": user.get("picture"),
        }
    )


def logout():
    response = make_response(jsonify({"message": "Logged out successfully"}))
    response.set_cookie("token", "", expires=0, path="/")
    return response
