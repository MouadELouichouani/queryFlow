from flask import Blueprint
from config.db import get_db
from controllers.history import get_user_histories
from controllers.history import get_history_by_url

history = Blueprint("history", __name__)
db = get_db()

history.get("/all")(get_user_histories)
history.get("/<string:url>")(get_history_by_url)
