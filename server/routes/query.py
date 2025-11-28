from flask import Blueprint
from config.db import get_db
from controllers.query import get_queries_by_history

query = Blueprint("query", __name__)

query.get("/<history_id>/queries")(get_queries_by_history)
