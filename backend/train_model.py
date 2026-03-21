import pandas as pd
import re
import nltk
import pickle

from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

nltk.download('stopwords')

stop_words = set(stopwords.words('english'))

def clean_text(text):

    text = str(text).lower()

    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)

    words = text.split()

    words = [word for word in words if word not in stop_words]

    return " ".join(words)


# LOAD DATA
train = pd.read_csv("datasets/train_data.csv")
test = pd.read_csv("datasets/test_data.csv")

# CLEAN TEXT
train["sentence"] = train["sentence"].apply(clean_text)
test["sentence"] = test["sentence"].apply(clean_text)

X_train = train["sentence"]
y_train = train["sentiment"]

X_test = test["sentence"]
y_test = test["sentiment"]


# TF-IDF
vectorizer = TfidfVectorizer(max_features=5000)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)


# MODEL
model = LogisticRegression()

model.fit(X_train_vec, y_train)


# PREDICTION
pred = model.predict(X_test_vec)

print(classification_report(y_test, pred))


# SAVE MODEL
pickle.dump(model, open("sentiment_model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("Model saved successfully!")

