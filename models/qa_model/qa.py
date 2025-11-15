import pandas as pd
from sentence_transformers import SentenceTransformer, util
import os
from random import randint
import sys
from server import lib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from classification_model.classification import isTechOrNot


out_of_scope_mssgs = [
    "I am trained specifically on a large corpus of **technical data**, which is the sole foundation of my knowledge base. That means I can't provide information or engage in discussions on subjects like world history, literature, or sports, as these topics fall outside my training parameters. To get a useful response, please ensure your question is clearly related to software development, networking, or systems administration. I am strictly a technical resource.",
    "My specialization is firmly rooted in the **technology domain**, focusing on concepts like coding, cloud infrastructure, and data science principles. When a query falls outside this defined scope—for instance, asking about geography, current events, or cooking recipes—I simply lack the required data to formulate an accurate and detailed answer. I am unable to retrieve or generate content for general knowledge questions. Please restrict your queries to my area of expertise.",
    "This chatbot operates exclusively within the **IT and coding sphere**, and its vocabulary and knowledge are limited to technical terminology and concepts. To ensure you receive a quality, relevant response that utilizes my specialized training, please limit your questions to topics covered by our technical keyword set (e.g., Python, Kubernetes, API, SQL). Any query that deviates into areas like the arts, philosophy, or personal finance will not yield an informative result. Focus on technical questions for the best assistance.",
    "I must decline that request as it is categorized as **non-technical**. My core programming strictly restricts me from engaging with general knowledge, cultural, or lifestyle questions that require information from non-tech corpora. This limitation is in place to maintain the precision of my technical expertise. Questions outside the realm of software, hardware, or network architecture are unfortunately beyond my current capabilities. Thank you for understanding this constraint.",
    "I apologize for the inconvenience, but I can only function as a **technical expert** and not as a general-purpose assistant. My database is not equipped to handle information concerning non-tech subjects like financial markets, political science, or philosophy. Attempting to process these queries would result in either a decline or an unhelpful, inaccurate answer. If you can rephrase your question using technical terminology, I would be happy to assist you.",
    "To help me better assist you, please focus your question exclusively on **technical terminology and concepts**. I cannot search or retrieve data on general topics, such as biographies, historical time periods, or general health advice. My entire training focus was on maximizing knowledge density in the computer science and engineering fields. Any keyword outside of this specialized set will result in a message indicating a lack of data. Consider terms like 'virtualization' or 'data structure' instead.",
    "I'm designed to categorize and answer questions that align with the computer science curriculum and industry standards. Your current query is classified as **non-technical**, which means I cannot process it or provide any relevant information. This is a strict boundary imposed by my training set. Try rephrasing your question with concepts like 'cloud computing,' 'encryption,' 'algorithm complexity,' or specific programming languages. I am solely an expert in technology.",
    "My core model is built around detailed technical concepts from various engineering disciplines. Any query about subjects like **baking, mythology, or political science** will regrettably result in an unhelpful response, as the necessary contextual data is absent from my specialized knowledge base. I am unable to generate meaningful or factual content on non-technical themes. To receive assistance, please ensure your question is within the domain of IT, software, or systems.",
    "Please note my severe limitation: **I am not a general-purpose assistant** capable of handling diverse topics. I can only analyze and discuss topics related to software development, DevOps practices, databases, and network infrastructure. Asking me about an unrelated subject will force me to respond with this exclusion message. For best results, keep your questions technical and domain-specific.",
    "I can only work with technical data derived from my specialized training corpus. Asking me about a non-tech keyword like 'The Great Wall of China' or 'chocolate cake' means I have no context, as these terms are outside my **specialized training set**. My scope is strictly limited to providing expert-level information on IT subjects. Any attempt to process non-technical general knowledge will result in a failure to generate a coherent response."
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
    best_similar_question = dframe.iloc[best_index]["Question"]
    random_out_of_scope_mssg = out_of_scope_mssgs[randint(0, 9)]

    # check if the question is tech related or not!
    if isTechOrNot(question=question) == "Non-Tech" or best_similarity < 0.4:
        return {
            "question": question,
            "response": random_out_of_scope_mssg,
            "best similar queston": best_similar_question,
            "similarity": best_similarity,
        }
    if best_similarity < 0.6:
        # call openRouter API asking for best response
        response_from_OPENROUTER = lib.getResponse(question)

        return {
            "question": question,
            "response": response_from_OPENROUTER,
            "best similar queston": best_similar_question,
            "similarity": best_similarity,
        }
    else:
        return {
            "question": question,
            "response": best_answer,
            "best similar queston": best_similar_question,
            "similarity": best_similarity,
        }
