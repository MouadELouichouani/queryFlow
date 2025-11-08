import pandas as pd
from sentence_transformers import SentenceTransformer, util

def MiniLM(path, question):
    dframe = pd.read_csv(path, encoding="latin-1")

    model = SentenceTransformer('all-MiniLM-L6-v2')
    question_embeddings = model.encode(dframe["Question"].tolist(), convert_to_tensor=True)

    user_embedding = model.encode([question], convert_to_tensor=True)

    cos_scores = util.cos_sim(user_embedding, question_embeddings)
    best_index = int(cos_scores.argmax())

    best_question = dframe.iloc[best_index]["Question"]
    best_answer = dframe.iloc[best_index]["Answer"]
    best_similarity = cos_scores[0][best_index].item()

    print("Asked question: ",question)
    print("Most similar question:", best_question)
    print("Best answer:", best_answer)
    print("Similarity score:", best_similarity)

    if(best_similarity < 0.5):
        print("I don't really know that yet!")


MiniLM("/home/sofyan/Documents/tech-faq-chatbot/data/raw/software_questions.csv", "polymorphism")