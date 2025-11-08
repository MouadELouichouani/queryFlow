import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def TfIdf(path, question):
    dframe = pd.read_csv(path,encoding="latin-1")

    vectorizer = TfidfVectorizer()
    tf_idf_matrix = vectorizer.fit_transform(dframe["Question"])

    user_question = question
    user_tfidf = vectorizer.transform([user_question])

    similarities = cosine_similarity(user_tfidf, tf_idf_matrix)

    best_index = np.argmax(similarities)
    best_question = dframe.iloc[best_index]["Question"]
    best_answer = dframe.iloc[best_index]["Answer"]
    best_similarity_score = similarities[0][best_index]  

    print("Asked question: ", question)
    print("Most similar question: ", best_question)
    print("Best ansewer: ",best_answer)
    print("Similarity Score: ",best_similarity_score)

    if(best_similarity_score < 0.5):
        print("I don't really know that yet!")
        return {
            "asked_question": question,
            "message" : "I don't really know that yet!",
            "Similarity Score": best_similarity_score
        }
    return {
        "asked question": question,
        "Most similar question: ": best_question,
        "Best answer": best_answer,
        "Similarity Score: ": best_similarity_score
    }


TfIdf("/home/sofyan/Documents/tech-faq-chatbot/data/raw/software_questions.csv", "polymorphism")