# Tech FAQ Chatbot (all-MiniLM-L6-v2, TF-IDF Models)

This project implements a Question–Answer retrieval models using all-MiniLM-L6-v2 & tf-idf and Cosine Similarity.
Given a user’s question, the model finds the most semantically similar question from a dataset and returns the corresponding best-matching answer.

<img width="2048" height="1032" alt="Screenshot from 2025-11-28 21-00-29" src="https://github.com/user-attachments/assets/494fb3ff-a910-4130-bcfc-bafee145e9e3" />

## How it works

### Import necessary libraries such as `pandas`, `SentenceTransformer`

```py
    import pandas as pd
    from sentence_transformers import SentenceTransformer, util
```

### Load dataset and encode questions using all-MiniLM-L6-v2

```py
    dframe = pd.read_csv(path, encoding="latin-1")

    model = SentenceTransformer('all-MiniLM-L6-v2')
    question_embeddings = model.encode(dframe["Question"].tolist(), convert_to_tensor=True)

```

- Loads the pre-trained Sentence-BERT model all-MiniLM-L6-v2.
- This model converts sentences into 384-dimensional semantic vectors.
- It’s a smaller and faster version of BERT, designed for sentence similarity tasks.

### User query processing

```py
    user_embedding = model.encode([question], convert_to_tensor=True)
```

- Encodes the user’s question into a vector (same dimensionality: 384).

### Cosine similarity

```py
    cos_scores = util.cos_sim(user_embedding, question_embeddings)
    best_index = int(cos_scores.argmax())

    best_question = dframe.iloc[best_index]["Question"]
    best_answer = dframe.iloc[best_index]["Answer"]
    best_similarity = cos_scores[0][best_index].item()
```

- Cosine similarity is computed between the user question and all dataset questions.
- The question with the highest similarity score is selected as the best match.
- Also the best question and & it's answer and best similarity is stored in each var

### Output

```py
    print("Asked question: ",question)
    print("Most similar question:", best_question)
    print("Best answer:", best_answer)
    print("Similarity score:", best_similarity)
```

- The most similar question.
- Its corresponding answer.
- The similarity score (a value between 0 and 1).

### Example

#### Example of `similarity > 0.5`

- Input

```json
    "question": "polymorphism"
```

- Output

```json
    "Asked question": "polymorphism",
    "Most similar question: ": "Explain the concept of polymorphism.",
    "Best answer": "Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling method overriding.",
    "Similarity Score: ": 0.8301754593849182
```

#### Example of `similarity < 0.5`

- Input

```json
    "question": "who is messi"
```

- Output

```json
    "message": "I don't really know that yet!"
    "Similarity Score: ": 0.17830440402030945
```
