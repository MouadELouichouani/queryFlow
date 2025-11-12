from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("index.html")


app.route("/ask",methods=['GET'])
def answer():
    question = request.args.get("question")
    
    if not question:
        return jsonify({"message": "No question provided"}), 400
    
    return jsonify({"question": question})

if __name__ == "__main__":
    app.run(debug=True)

