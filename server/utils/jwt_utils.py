import jwt
import datetime
import os
from datetime import timezone, datetime, timedelta
from jwt import ExpiredSignatureError, InvalidTokenError

SECRET = os.getenv("JWT_SECRET", "3io4j3oij5")


def create_token(user_id):
    payload = {
        "user_id": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        print(payload)
        user_id = payload.get("user_id")
        if not user_id:
            raise InvalidTokenError("user_id not found in token")
        return user_id
    except ExpiredSignatureError:
        raise Exception("Token has expired")
    except InvalidTokenError:
        raise Exception("Invalid token")
