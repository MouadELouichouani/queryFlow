from flask import Flask, request, jsonify
from models.qa_model import qa

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"message": "hiii!"})


@app.route("/ask", methods=["GET"])
def answer():
    question = request.args.get("question")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    if len(question) > 100:
        return jsonify({"error": "Question too long"}), 400

    response = qa.MiniLM(question)
    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
