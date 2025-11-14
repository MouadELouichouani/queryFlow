import pandas as pd
from sentence_transformers import SentenceTransformer, util
import os
from random import randint
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from classification_model.classification import isTechOrNot


out_of_scope_mssgs = [
    "I am trained specifically on a large corpus of **technical data**. That means I can't provide information on subjects like world history, literature, or sports. Please ask a question related to software, networking, or systems.",
    "My specialization is in the **technology domain**. When a query falls outside this scope—for instance, asking about geography or cooking—I simply lack the required data to formulate an accurate answer.",
    "This chatbot operates exclusively within the **IT and coding sphere**. To ensure you get a quality, relevant response, please limit your questions to topics covered by our technical keyword set (e.g., Python, Kubernetes, API).",
    "I must decline that request as it is **non-technical**. My programming strictly restricts me from engaging with general knowledge, cultural, or lifestyle questions.",
    "I apologize for the inconvenience, but I can only function as a **technical expert**. Questions concerning non-tech subjects like financial markets or philosophy are beyond my current capabilities.",
    "To help me better assist you, please focus your question on **technical terminology**. I cannot search or retrieve data on general topics, such as biographies or historical time periods.",
    "I'm designed to categorize and answer technical questions. Your current query is classified as **non-technical**, which means I cannot process it. Try rephrasing with concepts like 'cloud computing' or 'encryption.'",
    "My core model is built around technical concepts. Any query about subjects like **baking, mythology, or political science** will result in an unhelpful response, as the data simply isn't there.",
    "Please note my severe limitation: **I am not a general-purpose assistant.** I can only analyze and discuss topics related to software development, DevOps, databases, and network infrastructure.",
    "I can only work with technical data. Asking me about a non-tech keyword like 'The Great Wall of China' or 'chocolate cake' means I have no context, as these terms are outside my **specialized training set**.",
]


def MiniLM(question):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    data_path = os.path.join(
        BASE_DIR, "..", "..", "data", "raw", "software_questions.csv"
    )
    data_path = os.path.normpath(data_path)

    dframe = pd.read_csv(data_path, encoding="latin-1")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    question_embeddings = model.encode(
        dframe["Question"].tolist(), convert_to_tensor=True
    )

    user_embedding = model.encode([question], convert_to_tensor=True)

    cos_scores = util.cos_sim(user_embedding, question_embeddings)
    best_index = int(cos_scores.argmax())
    best_similarity = cos_scores[0][best_index].item()
    best_answer = dframe.iloc[best_index]["Answer"]
    random_out_of_scope_mssg = out_of_scope_mssgs[randint(0, 9)]

    # check if the question is tech related or not!
    if isTechOrNot(question=question) == "Non-Tech" and best_similarity < 0.4:
        return {
            "question": question,
            "response": random_out_of_scope_mssg,
            "similarity": best_similarity,
        }
    if best_similarity < 0.7:
        # call openRouter API asking for best response
        print("calling openrouter LLM...")
        return {
            "question": question,
            "response": "NOT YET",
            "similarity": best_similarity,
        }
    else:
        return {
            "question": question,
            "response": best_answer,
            "similarity": best_similarity,
        }


# print(MiniLM("what is python"))
# this line prints result like this (IF THE QUESTION IS TECH RELATED AND SIMILARITY < 0.7)
# calling openrouter LLM...
# {'question': 'what is python', 'response': 'NOT YET', 'similarity': 0.6394509077072144}
