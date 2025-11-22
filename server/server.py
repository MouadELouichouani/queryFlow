from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
from routes.auth import auth
from routes.ask_route import askQue

CORS(app, supports_credentials=True)

app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(askQue, url_prefix="/api/ask")


if __name__ == "__main__":
    app.run(debug=True)
