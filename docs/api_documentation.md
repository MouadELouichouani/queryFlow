# Tech FAQ Chatbot API

This is a simple REST API for a Tech FAQ Chatbot powered by a pre-trained sentence-transformer model.  
It accepts a question as input and returns the most similar answer from the dataset.

---

## Base URL

```URL
http://127.0.0.1:5000/api
```

---

## Endpoints

### 1. Authentication

- Generate token by logging in with google

- **URL**: `/auth/google`
- **Method**: `GET`

- **Response**: 
  ```json
    {
        "token": "jwt.token",
        "user": {
            "id": "h82048934975jh34u5",
            "email": "example@gmail.com",
            "name": "soufian",
            "picture": "pic.link",
        },
    } ```



- Retrieve the current user data

- **Authorization**: `Bearer token`
- **URL**: `/auth/me`
- **Method**: `GET`

- **Response**: 
  ```json
    {
      "user_id": "swefer34435",
      "email": "example@gmail.com",
      "name": "soufian",
      "picture": "pic.link",
    } ```



- Logout from application

- **Authorization**: `Bearer token`
- **URL**: `/auth/logout`
- **Method**: `POST`

- **Response**: 
  ```json
    {
      "message": "Logged out successfully"
    } ```



### 2. History

- Retrieve all user's history

- **Authorization**: `Bearer token`
- **URL**: `/history/all`
- **Method**: `GET`

- **Response**: 
  ```json
  {
    "histories": ["array of histories"]
  } ```


- Single history and it's messages by URL

- **Authorization**: `Bearer token`
- **URL**: `/history/<url>`
- **Method**: `GET`

- **Response**: 
  ```json
  {
    "history_id": "i3j4i5354fe",
    "url": "history.url",
    "messages": ["list of messages"]
  } ```


- Change history visibility

- **Authorization**: `Bearer token`
- **URL**: `/history/<id>/visibility`
- **Method**: `PUT`
- **Request** : 
```json
  {
    "visibility": "public"
  }
```

- **Response**: 
  ```json
  {
      "message": "Visibility updated successfully",
      "history_id": "history.id",
      "url": "history.url",
      "visibility": "public",
  } ```


- Change history title

- **Authorization**: `Bearer token`
- **URL**: `/history/<id>/title`
- **Method**: `PUT`
- **Request** : 
```json
  {
    "title": "new title"
  }
```

- **Response**: 
  ```json
  {
      "message": "Title updated successfully",
      "history_id": "history.id",
      "title": "new title",
  } ```


- Delete history

- **Authorization**: `Bearer token`
- **URL**: `/history/<id>/delete`
- **Method**: `DELETE`

- **Response**: 
  ```json
  {
    "message": "History deleted successfully"
  } ```




### 3. Ask a Question

Retrieve an answer for a given tech-related question.

- **URL**: `/ask`
- **Method**: `GET`
- **Query Parameters**:
  - `question` (string, required, less than 100) – The question you want to ask the chatbot.

- **Response**: JSON object

**Example Request**

```
GET /ask?question=polymorphism
```


**Example Response**

```json
{
  "question": "polymorphism",
  "response": "Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling method overriding.",
  "similarity": 0.87
}
```

**Response When No Match Found**
- If the model's similarity score is too low (<0.5), the API responds with:

```json
{
  "question": "some unknown question",
  "response": "I am trained specifically on a large corpus of **technical data**, which is the sole foundation of my knowledge base. That means I can't provide information or engage in discussions on subjects like world history, literature, or sports, as these topics fall outside my training parameters. To get a useful response, please ensure your question is clearly related to software development, networking, or systems administration. I am strictly a technical resource.",
  "similarity": 0.32
}
```



*by -soufian*