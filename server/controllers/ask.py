from flask import request, jsonify
from models.qa_model import qa


def getAnswer():
    question = request.args.get("question")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    if len(question) > 100:
        return jsonify({"error": "Question too long"}), 400

    response = qa.MiniLM(question)
    return jsonify(response)
