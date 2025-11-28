# Tech FAQ Chatbot (all-MiniLM-L6-v2, TF-IDF Models)

This project implements a Question–Answer retrieval models using all-MiniLM-L6-v2 & tf-idf and Cosine Similarity.
Given a user’s question, the model finds the most semantically similar question from a dataset and returns the corresponding best-matching answer.

<img width="2048" height="1032" alt="Screenshot from 2025-11-28 21-00-29" src="https://github.com/user-attachments/assets/494fb3ff-a910-4130-bcfc-bafee145e9e3" />

## Code Explanation

## 1- Question classification model (tech/ non-tech) `/server/models/classification_model/classification.py`

### Import necessary libraries 

```py
    from sklearn.model_selection import train_test_split
    from sklearn.svm import LinearSVC
    from sklearn.feature_extraction.text import TfidfVectorizer
    import pandas as pd
    import os
```

### Load dataset and encode questions using all-MiniLM-L6-v2

```py
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_PATH = os.path.join(BASE_DIR, "..", "..", "data", "raw", "tech_classification.csv")
    CSV_PATH = os.path.normpath(CSV_PATH)
    
    data_frame = pd.read_csv(CSV_PATH)


```

- Dynamically constructs the CSV path relative to the script location.
- Loads the CSV into a pandas DataFrame data_frame

### Preparing Features and Labels

```py
    x = data_frame["Question"]
    y = data_frame["Category"]
```

- x: The questions from the dataset.
- y: The target labels ("Tech" or "Non-Tech").

### Vectorizing, Splitting Data & Training the Model

```py
    vecotrizer = TfidfVectorizer()
    x_vec = vecotrizer.fit_transform(x)
    
    x_train, x_test, y_train, y_test = train_test_split(x_vec, y, test_size=0.2)
    
    model = LinearSVC()
    model.fit(x_train, y_train)
```

- `TfidfVectorizer` converts text into a numerical matrix that represents the importance of each word in the dataset.
- `fit_transform` learns the vocabulary and creates the TF-IDF representation.
- 80% of the data is used for training, 20% for testing.
- Ensures the model can be evaluated on unseen questions.
- LinearSVC is a Support Vector Machine optimized for linear classification.
- The model learns to separate Tech vs Non-Tech questions based on TF-IDF features.

### Example

```py
    def isTechOrNot(question):
        prediction = model.predict(vecotrizer.transform([question]))
        return prediction[0]  # returns "Tech" or "Non-Tech"

    question = "hello, what is OOP in Python?"
    print(isTechOrNot(question))  # Output: "Tech"
```

- question is first converted into TF-IDF vector using the same vectorizer.
- The trained SVM model predicts whether it belongs to the "Tech" or "Non-Tech" category.


### Example

```py
    def isTechOrNot(question):
        prediction = model.predict(vecotrizer.transform([question]))
        return prediction[0]  # returns "Tech" or "Non-Tech"

    question = "hello, what is OOP in Python?"
    print(isTechOrNot(question))  # Output: "Tech"
```

- question is first converted into TF-IDF vector using the same vectorizer.
- The trained SVM model predicts whether it belongs to the "Tech" or "Non-Tech" category.


<br/>

## 2- Question answer model`/server/models/qa_model/qa.py`

### Import necessary libraries 

```py
    fimport pandas as pd
    from sentence_transformers import SentenceTransformer, util
    import os
    from random import randint
    import sys
    from utils import lib
    
    from classification_model.classification import isTechOrNot
```

### Out-of-Scope Responses

```py
    out_of_scope_mssgs = [
        "I am trained specifically on a large corpus of **technical data**...",
        ...
    ]
```

- A list of predefined messages for questions outside the technical domain.
- Randomly selected if the question is non-technical or has low similarity.

### MiniLM Function

```py
    def MiniLM(question):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    data_path = os.path.join(BASE_DIR, "..", "..", "data", "raw", "software_questions.csv")
    data_path = os.path.normpath(data_path)

    dframe = pd.read_csv(data_path, encoding="latin-1")
```

- Loads the dataset containing technical questions and answers.
- Encodes the file path relative to the script location for portability.

### VEmbedding Questions & Semantic Similarity Search

```py
    vmodel = SentenceTransformer("all-MiniLM-L6-v2")
    question_embeddings = model.encode(dframe["Question"].tolist(), convert_to_tensor=True)
    user_embedding = model.encode([question], convert_to_tensor=True)

    cos_scores = util.cos_sim(user_embedding, question_embeddings)
    best_index = int(cos_scores.argmax())
    best_similarity = cos_scores[0][best_index].item()
    best_answer = dframe.iloc[best_index]["Answer"]
    best_similar_question = dframe.iloc[best_index]["Question"]
```

- Pre-trained MiniLM model converts text to dense vectors.
- Both dataset questions and user input are encoded for semantic comparison.
- Computes cosine similarity between user question and dataset questions.
- Retrieves the most similar question and its corresponding answer.

### Tech/Non-Tech Classification

```py
    if isTechOrNot(question=question) == "Non-Tech" or best_similarity < 0.4:
    return {
        "question": question,
        "response": random_out_of_scope_mssg,
        "best similar queston": best_similar_question,
        "similarity": best_similarity,
    }

```
- Uses the classifier to ensure only technical questions are answered.
- If the question is non-technical or similarity is low, returns a random out-of-scope message.

### Optional API Fallback
```py
    if best_similarity < 0.6:
    response_from_OPENROUTER = lib.getResponse(question)
    return {
        "question": question,
        "response": response_from_OPENROUTER,
        "best similar queston": best_similar_question,
        "similarity": best_similarity,
    }
```
- For questions that are moderately similar but not a confident match, the system can query an external API for a better response.


### Returning the answer

```py
    else:
        return {
            "question": question,
            "response": best_answer,
            "best similar queston": best_similar_question,
            "similarity": best_similarity,
        }
```



### Example
```py
    from miniLM import MiniLM

    question = "What is polymorphism in Python?"
    response = MiniLM(question)
    
    print(response["response"])
```

- The function returns a dictionary

```py
    {
        "question": "What is polymorphism in Python?",
        "response": "Polymorphism allows objects of different classes to be treated as a common superclass...",
        "best similar queston": "What is polymorphism in Python?",
        "similarity": 0.87
    }
```

### Response Behavior

- High similarity (>0.6) & Tech → Return dataset answer.
- Moderate similarity (<0.6) & Tech → Call external API for response.
- Low similarity (<0.4) or Non-Tech → Return random out-of-scope message.


### Installation

1. Clone the repo
   ```
       git clone https://github.com/soufianboukir/queryFlow.git
       cd queryFlow
   ```

2. Create a Virtual Environment (Optional but Recommended)
    ```
        python -m venv venv
        source venv/bin/activate      # Linux / macOS
        venv\Scripts\activate         # Windows
    ```

3. Configure `.env` on client & server
   - you will find .env.example in client & server
   - create .env file on client, and past .env.example content with real values 
   - create .env file on server, and past .env.example content with real values
   
5. Install Python Dependencies and run server
   ```
       cd server
       pip install -r requirements.txt
       python server.py
   ```
   
6. Install Next.js and its dependencies and run client side
   ```
       cd ../client
       npm install
       npm run dev
   ```

- This setup ensures everything needed to run the MiniLM-based Tech FAQ Chatbot is ready.

By **soufian** & **mohamed** & **mouad**
