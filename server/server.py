from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
from routes.auth import auth
from routes.ask_route import askQue
from routes.history import history
from routes.query import query

CORS(app, supports_credentials=True)

app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(askQue, url_prefix="/api/ask")
app.register_blueprint(history, url_prefix="/api/history")
app.register_blueprint(query, url_prefix="/api/query")


if __name__ == "__main__":
    app.run(debug=True)
