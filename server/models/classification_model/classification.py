from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
import os

# tech or non using TF-TDF

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "..", "data", "raw", "tech_classification.csv")
CSV_PATH = os.path.normpath(CSV_PATH)

data_frame = pd.read_csv(CSV_PATH)


x = data_frame["Question"]
y = data_frame["Category"]

vecotrizer = TfidfVectorizer()
x_vec = vecotrizer.fit_transform(x)

x_train, x_test, y_train, y_test = train_test_split(x_vec, y, test_size=0.2)

model = LinearSVC()
model.fit(x_train, y_train)

# question = "hello, what is oop in python"
# prediction = model.predict(vecotrizer.transform([question]))
# print(prediction[0])


def isTechOrNot(question):
    prediction = model.predict(vecotrizer.transform([question]))
    return prediction[0]  # this returns "Tech" OR "Non-Tech"
