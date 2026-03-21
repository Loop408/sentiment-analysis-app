from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import re
import os

app = Flask(__name__)

# Simple CORS - allow all origins
CORS(app, origins="*")

# Static stopwords
STOP_WORDS = {'i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','through','during','before','after','above','below','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','should','now'}

# Load models
current_dir = os.path.dirname(os.path.abspath(__file__))
model = pickle.load(open(os.path.join(current_dir, "sentiment_model.pkl"), "rb"))
vectorizer = pickle.load(open(os.path.join(current_dir, "vectorizer.pkl"), "rb"))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)
    words = text.split()
    words = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    return " ".join(words)

@app.route('/')
def root():
    return jsonify({"message": "Twitter Sentiment Analysis API", "status": "running"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/predict', methods=['POST'])
def predict_sentiment():
    try:
        data = request.get_json()
        tweet = data.get("tweet", "")
        
        cleaned = clean_text(tweet)
        vector = vectorizer.transform([cleaned])
        prediction = model.predict(vector)[0]
        probabilities = model.predict_proba(vector)[0]
        
        return jsonify({
            "sentiment": "Positive" if prediction == 1 else "Negative",
            "confidence": round(float(max(probabilities)) * 100, 2),
            "probabilities": {
                "negative": round(float(probabilities[0]) * 100, 2),
                "positive": round(float(probabilities[1]) * 100, 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-hashtag', methods=['POST'])
def analyze_hashtag():
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
        probs = model.predict_proba(vectors)
        
        pos_count = int(sum(preds == 1))
        neg_count = int(sum(preds == 0))
        total = len(sample_tweets)
        
        tweets = []
        for i, (tweet, pred, prob) in enumerate(zip(sample_tweets, preds, probs)):
            tweets.append({
                "tweet": tweet,
                "sentiment": "Positive" if pred == 1 else "Negative",
                "confidence": round(float(max(prob)) * 100, 2),
                "keyword": hashtag
            })
        
        return jsonify({
            "hashtag": hashtag,
            "total_tweets": total,
            "positive_count": pos_count,
            "negative_count": neg_count,
            "positive_percentage": round((pos_count / total) * 100, 1),
            "negative_percentage": round((neg_count / total) * 100, 1),
            "tweets": tweets,
            "word_cloud": [{"text": hashtag, "value": 50}]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
