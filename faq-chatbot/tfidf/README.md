# Tech FAQ Chatbot (TF-IDF Model)

This project implements a Question–Answer retrieval model using TF-IDF and Cosine Similarity.
Given a user’s question, the model finds the most semantically similar question from a dataset and returns the corresponding best-matching answer.

## How it works

### Import necessary libraries such as `pandas`, `numpy`, `sklearn`

```py
    import pandas as pd
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
```

### Load dataset and vectorize data with tfidf model**

```py
    def TfIdf(path, question):
        dframe = pd.read_csv(path,encoding="latin-1")

        vectorizer = TfidfVectorizer()
        tf_idf_matrix = vectorizer.fit_transform(dframe["Question"])
```

- Each question in the dataset is transformed into a TF-IDF vector, representing how important each word is within the corpus.

### User query processing

```py
    user_question = question
    user_tfidf = vectorizer.transform([user_question])
```

- The user’s input question is converted to a TF-IDF vector using the same fitted vectorizer.

### Cosine similarity

```py
    similarities = cosine_similarity(user_tfidf, tf_idf_matrix)

    best_index = np.argmax(similarities)
    best_question = dframe.iloc[best_index]["Question"]
    best_answer = dframe.iloc[best_index]["Answer"]
    best_similarity_score = similarities[0][best_index] 
```

- Cosine similarity is computed between the user question and all dataset questions.
- The question with the highest similarity score is selected as the best match.

### Output

```py
    print("Most similar question: ", best_question)
    print("Best ansewer: ",best_answer)
    print("Similarity Score: ",best_similarity_score)
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
    "Most similar question: ": "Explain the concept of polymorphism.",
    "Best answer": "Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling method overriding.",
    "Similarity Score: ": 0.7239253062221057
```

#### Example of `similarity < 0.5`

- Input

```json
    "question": "who is messi"
```

- Output

```json
    "message": "I don't really know that yet!"
    "Similarity Score: ": 0.39288585871825427
```
