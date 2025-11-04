# Project Work Plan (Phases)

## Phase 1 – Data & Research

### Duration: 3 days

- Gather dataset: UTKFace Dataset
- Clean images, resize (e.g., 128×128), normalize pixel values.
- Label encode gender & age groups (age ranges: 0–12, 13–25, 26–45, 46–65, 66+)

## Phase 2 – Model Building

### Duration: 7 days

- Build CNN model from scratch (Conv2D → MaxPool → Flatten → Dense).
- Experiment with pre-trained networks (MobileNetV2, VGG16).
- Train separate heads for age and gender output.
- Save best-performing model as age_gender_model.h5.

Deliverables:

- model_training.ipynb
- Saved model in /model/
- Graphs for accuracy/loss curves

## Phase 3 – Backend API

### Duration: 2 days

- Create Flask API
- /predict → accepts image, returns {age_group, gender}
- Load trained model and preprocess input inside the API.
- Test using Postman or cURL.
- upload via a free host provider

## Phase 4 – Frontend (Optional / Parallel)

### Duration: 1 days

- Build simple NEXT UI
- Upload image → Preview → Show prediction
- Axios POST to Flask /predict endpoint.
- Display result card (gender + estimated age group).
- Deliverables:
- upload via vercel

### Future Improvements

- Add emotion detection using the same face embeddings.
- Train on custom data for better accuracy.
- Optimize inference with TensorFlow Lite or ONNX.
- Enable real-time webcam detection (OpenCV streaming).
