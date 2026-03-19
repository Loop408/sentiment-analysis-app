from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import pickle
import re
import os

app = Flask(__name__)

# Simple and correct CORS setup
CORS(app)

# Stopwords
STOP_WORDS = {
    'i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves',
    'he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their',
    'theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are',
    'was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an',
    'the','and','but','if','or','because','as','until','while','of','at','by','for','with','through',
    'during','before','after','above','below','up','down','in','out','on','off','over','under','again',
    'further','then','once','here','there','when','where','why','how','all','any','both','each','few',
    'more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very',
    'can','will','just','should','now'
}

# Load model
current_dir = os.path.dirname(os.path.abspath(__file__))
model = pickle.load(open(os.path.join(current_dir, "sentiment_model.pkl"), "rb"))
vectorizer = pickle.load(open(os.path.join(current_dir, "vectorizer.pkl"), "rb"))

# Text cleaning
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)
    words = text.split()
    words = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    return " ".join(words)

# Handle OPTIONS (global helper)
def handle_options():
    response = make_response('', 200)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Root
@app.route("/", methods=["GET", "OPTIONS"])
def home():
    if request.method == "OPTIONS":
        return handle_options()
    return jsonify({
        "message": "Twitter Sentiment Analysis API",
        "status": "running"
    })

# Health
@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return handle_options()
    return jsonify({"status": "healthy"})

# Predict
@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return handle_options()

    try:
        data = request.get_json()
        tweet = data.get("tweet", "")

        cleaned = clean_text(tweet)
        vector = vectorizer.transform([cleaned])
        pred = model.predict(vector)[0]
        probs = model.predict_proba(vector)[0]

        return jsonify({
            "sentiment": "Positive" if pred == 1 else "Negative",
            "confidence": round(float(max(probs)) * 100, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Analyze Hashtag
@app.route("/analyze-hashtag", methods=["POST", "OPTIONS"])
def analyze():
    if request.method == "OPTIONS":
        return handle_options()

    try:
        data = request.get_json()
        hashtag = data.get("hashtag", "")

        sample_tweets = [
            f"I love {hashtag}! This is amazing!",
            f"{hashtag} is the best thing ever",
            f"Not happy with {hashtag} today",
            f"{hashtag} is terrible and disappointing",
            f"Great experience with {hashtag}!"
        ]

        cleaned = [clean_text(t) for t in sample_tweets]
        vectors = vectorizer.transform(cleaned)
        preds = model.predict(vectors)

        pos = int(sum(preds == 1))
        neg = int(sum(preds == 0))
        total = len(sample_tweets)

        return jsonify({
            "hashtag": hashtag,
            "positive": pos,
            "negative": neg,
            "positive_percentage": round((pos / total) * 100, 1),
            "negative_percentage": round((neg / total) * 100, 1)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500