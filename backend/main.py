from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pickle
import re
import nltk
import pandas as pd
import numpy as np
from nltk.corpus import stopwords
import os

# Download stopwords
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

stop_words = set(stopwords.words('english'))

app = FastAPI(title="Twitter Sentiment Analysis API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://loop408.github.io", "https://loop408.github.io/sentiment-analysis-app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and vectorizer
model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sentiment_model.pkl")
vectorizer_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vectorizer.pkl")
datasets_path = os.path.join(os.path.dirname(__file__), "datasets")

model = pickle.load(open(model_path, "rb"))
vectorizer = pickle.load(open(vectorizer_path, "rb"))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[^a-zA-Z]", " ", text)
    words = text.split()
    words = [word for word in words if word not in stop_words]
    return " ".join(words)

def extract_keyword(text):
    """Extract the most significant word from text (excluding stopwords)"""
    words = clean_text(text).split()
    # Filter out short words and return the longest one (usually more significant)
    significant_words = [w for w in words if len(w) > 3]
    if significant_words:
        # Return the longest word as the keyword
        return max(significant_words, key=len)
    elif words:
        return words[0]
    return ""

# Pydantic models
class TweetRequest(BaseModel):
    tweet: str

class HashtagRequest(BaseModel):
    hashtag: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    probabilities: dict

class TweetAnalysis(BaseModel):
    tweet: str
    sentiment: str
    confidence: float
    keyword: str

class WordData(BaseModel):
    text: str
    value: float

class HashtagAnalysisResponse(BaseModel):
    hashtag: str
    total_tweets: int
    positive_count: int
    negative_count: int
    positive_percentage: float
    negative_percentage: float
    tweets: List[TweetAnalysis]
    word_cloud: List[WordData]

@app.get("/")
def root():
    return {"message": "Twitter Sentiment Analysis API", "status": "running"}

@app.post("/predict", response_model=SentimentResponse)
def predict_sentiment(request: TweetRequest):
    try:
        cleaned = clean_text(request.tweet)
        vector = vectorizer.transform([cleaned])
        prediction = model.predict(vector)[0]
        probabilities = model.predict_proba(vector)[0]
        
        confidence = float(max(probabilities))
        sentiment = "Positive" if prediction == 1 else "Negative"
        
        return SentimentResponse(
            sentiment=sentiment,
            confidence=round(confidence * 100, 2),
            probabilities={
                "negative": round(float(probabilities[0]) * 100, 2),
                "positive": round(float(probabilities[1]) * 100, 2)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-hashtag", response_model=HashtagAnalysisResponse)
def analyze_hashtag(request: HashtagRequest):
    try:
        # Load both train and test data
        train_data_path = os.path.join(datasets_path, "train_data.csv")
        test_data_path = os.path.join(datasets_path, "test_data.csv")
        
        dataframes = []
        
        if os.path.exists(train_data_path):
            train_data = pd.read_csv(train_data_path)
            dataframes.append(train_data)
        
        if os.path.exists(test_data_path):
            test_data = pd.read_csv(test_data_path)
            dataframes.append(test_data)
        
        if not dataframes:
            raise HTTPException(status_code=404, detail="No data files found")
        
        # Combine both datasets
        combined_data = pd.concat(dataframes, ignore_index=True)
        
        # Filter tweets containing the hashtag
        hashtag_pattern = request.hashtag.lower()
        filtered_tweets = combined_data[combined_data['sentence'].str.lower().str.contains(hashtag_pattern, na=False)]
        
        if len(filtered_tweets) == 0:
            return HashtagAnalysisResponse(
                hashtag=request.hashtag,
                total_tweets=0,
                positive_count=0,
                negative_count=0,
                positive_percentage=0,
                negative_percentage=0,
                tweets=[],
                word_cloud=[]
            )
        
        # Make predictions
        cleaned_tweets = filtered_tweets['sentence'].apply(clean_text)
        tweet_vectors = vectorizer.transform(cleaned_tweets)
        predictions = model.predict(tweet_vectors)
        probabilities = model.predict_proba(tweet_vectors)
        
        # Count sentiments
        positive_count = int(sum(predictions == 1))
        negative_count = int(sum(predictions == 0))
        total_tweets = len(filtered_tweets)
        
        positive_percentage = round((positive_count / total_tweets) * 100, 1)
        negative_percentage = round((negative_count / total_tweets) * 100, 1)
        
        # Prepare tweet analysis with keywords
        tweets_analysis = []
        for idx, (tweet, pred, prob) in enumerate(zip(filtered_tweets['sentence'], predictions, probabilities)):
            sentiment = "Positive" if pred == 1 else "Negative"
            confidence = round(float(max(prob)) * 100, 2)
            keyword = extract_keyword(str(tweet))
            tweets_analysis.append(TweetAnalysis(
                tweet=str(tweet),
                sentiment=sentiment,
                confidence=confidence,
                keyword=keyword
            ))
        
        # Build word cloud from sample tweet keywords (one from each displayed sample)
        sample_tweets = tweets_analysis[:10]  # First 10 samples
        word_cloud_data = []
        seen_words = set()
        
        for tweet in sample_tweets:
            if tweet.keyword and tweet.keyword not in seen_words:
                word_cloud_data.append(WordData(text=tweet.keyword, value=tweet.confidence))
                seen_words.add(tweet.keyword)
        
        return HashtagAnalysisResponse(
            hashtag=request.hashtag,
            total_tweets=total_tweets,
            positive_count=positive_count,
            negative_count=negative_count,
            positive_percentage=positive_percentage,
            negative_percentage=negative_percentage,
            tweets=tweets_analysis,
            word_cloud=word_cloud_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    # Get dataset counts
    train_count = 0
    test_count = 0
    
    train_path = os.path.join(datasets_path, "train_data.csv")
    test_path = os.path.join(datasets_path, "test_data.csv")
    
    if os.path.exists(train_path):
        train_df = pd.read_csv(train_path)
        train_count = len(train_df)
    
    if os.path.exists(test_path):
        test_df = pd.read_csv(test_path)
        test_count = len(test_df)
    
    return {
        "status": "healthy",
        "datasets": {
            "train_tweets": train_count,
            "test_tweets": test_count,
            "total_tweets": train_count + test_count
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
