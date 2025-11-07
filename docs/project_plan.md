# Project Work Plan (Phases)

## Phase 1: Dataset & Retrieval Service Setup

1. Collect / download the FAQ datast. Celean it: remove duplicates, ensure question, answer, url fields, remove malformed entries.

2. Choose embedding model (e.g., Sentence-Transformer all-MiniLM-L6-v2).

3. Build ingestion script: embed all questions, build FAISS index (or similar vector store).

4. Build a Python service (FastAPI) with endpoint /search that takes a user query, embeds it, searches vector store, returns top K results with scores.

5. Test retrieval service locally with sample queries.

- Goal: retrieval service working end-to‐end before UI

## Phase 2: Backend API & Database

1. Set up backend (Node/Express or Laravel).

2. Create DB schema for user queries: id, user_id, query_text, result_id, score, timestamp, feedback.

3. Build API endpoint /ask that receives query from frontend, calls retrieval service, stores record, returns result.

4. Build endpoint /history to fetch past queries for a user (if user auth) or general analytics.
Goal: backend API ready and linked to retrieval service

## Phase 3: Frontend & UX

1. Build frontend components: input box, submit button, results panel.

2. Display top answer, source link, score.

3. Add feedback buttons (“Yes, this helped” / “No, retry”). On feedback => send to backend + retrieval service.

4. Build history page: list of user queries and results (if you implement user login) or session history.

- Goal: polished UI and UX, integrated with backend

## Phase 4: Evaluation, Refinement & Deployment

1. Offline evaluation: pick holdout set (10-20% of dataset) to test retrieval accuracy (precision@1, MRR).

2. Collect user feedback in production, analyze low-score cases, refine dataset (add paraphrases) or improve model.

3. Deploy components: containerize services (Docker), deploy to cloud (e.g., AWS/GCP/Heroku) or VPS.

4. Monitor latency, errors, usage metrics.

- Goal: fully functioning system, deployed, with monitoring and a path for improvement.
