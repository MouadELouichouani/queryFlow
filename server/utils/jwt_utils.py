import jwt
import datetime
import os
from datetime import timezone, datetime, timedelta

SECRET = os.getenv("JWT_SECRET", "3io4j3oij5")


def create_token(user_id):
    payload = {
        "id": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")
