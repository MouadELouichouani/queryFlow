from flask import Blueprint
from config.db import get_db
from controllers.history import (
    get_user_histories,
    get_history_by_url,
    update_visibility,
    update_title,
    delete_history,
)

history = Blueprint("history", __name__)
db = get_db()

history.get("/all")(get_user_histories)
history.get("/<string:url>")(get_history_by_url)
history.put("/<id>/visibility")(update_visibility)
history.put("/<id>/title")(update_title)
history.delete("/<id>/delete")(delete_history)
