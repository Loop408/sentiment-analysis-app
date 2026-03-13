# Twitter Sentiment Analysis - Full Stack Application

A real-time sentiment analysis application with React frontend and FastAPI backend, featuring animated UI and pie chart visualizations.

## 🚀 Features

- **Real-time Sentiment Analysis**: Analyze tweets instantly using Machine Learning
- **Hashtag Analysis**: Analyze multiple tweets containing specific hashtags
- **Beautiful Animated UI**: Modern React interface with Framer Motion animations
- **Interactive Pie Charts**: Visual representation of sentiment distribution
- **RESTful API**: FastAPI backend with CORS support
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
tta/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── HashtagAnalyzer.js
│   │   │   ├── SingleTweetAnalyzer.js
│   │   │   └── PieChart.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── datasets/
│   ├── train_data.csv
│   └── test_data.csv
├── sentiment_model.pkl
├── vectorizer.pkl
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📊 API Endpoints

### Health Check
- **GET** `/` - API information
- **GET** `/health` - Health check

### Sentiment Analysis
- **POST** `/predict` - Analyze single tweet
  ```json
  {
    "tweet": "I love this product!"
  }
  ```

### Hashtag Analysis
- **POST** `/analyze-hashtag` - Analyze tweets by hashtag
  ```json
  {
    "hashtag": "iphone"
  }
  ```

## 🎯 Usage

1. Open your browser and navigate to `http://localhost:3000`

2. **Hashtag Analysis**:
   - Click on the "# Hashtag Analysis" tab
   - Enter a hashtag (e.g., "facebook", "iphone", "bobby")
   - Click "Analyze"
   - View the pie chart and sentiment statistics

3. **Single Tweet Analysis**:
   - Click on the "Single Tweet" tab
   - Enter a tweet text
   - Click "Analyze Sentiment"
   - View the sentiment result and probability pie chart

## 🧠 Machine Learning Model

The sentiment analysis model is trained using:
- **Algorithm**: Logistic Regression
- **Vectorization**: TF-IDF with 5000 features
- **Dataset**: Twitter sentiment dataset (0 = Negative, 1 = Positive)

## 🎨 Technologies Used

### Backend
- FastAPI
- scikit-learn
- pandas
- NLTK
- Uvicorn

### Frontend
- React 18
- Framer Motion (animations)
- Recharts (pie charts)
- Lucide React (icons)

## � Deployment

### Automatic Deployment via GitHub Actions

The app is configured for automatic deployment through GitHub Actions:

1. **Frontend** deploys to GitHub Pages
2. **Backend** deploys to Railway

#### Setup Instructions:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/sentiment-analysis.git
   git push -u origin main
   ```

2. **Configure GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `GITHUB_TOKEN`: (automatically available)
     - `RAILWAY_TOKEN`: Get from Railway dashboard → Settings → API Tokens
     - `REACT_APP_API_URL`: Your Railway backend URL
     - `CUSTOM_DOMAIN`: (optional) Your custom domain for frontend

3. **Configure Railway:**
   - Install Railway CLI: `npm install -g @railway/cli`
   - Login: `railway login`
   - Initialize: `railway init` (in backend folder)
   - Deploy: `railway deploy`

#### Manual Deployment Options:

**Frontend (GitHub Pages):**
```bash
cd frontend
npm run build
# Upload build folder to GitHub Pages
```

**Backend (Railway):**
```bash
cd backend
railway deploy
```

**Backend (Heroku):**
```bash
cd backend
heroku create your-app-name
git push heroku main
```

**Backend (PythonAnywhere):**
```bash
# Upload backend folder to PythonAnywhere
# Configure web app to run main.py
```

## 📝 Notes

- The app uses binary sentiment classification (Positive/Negative) only
- Model files and datasets should be included in deployment
- Environment variables are configured through platform-specific settings
- Backend must be running before starting the frontend
- CORS is configured to allow requests from `http://localhost:3000`

## 🔧 Development

### Backend Development
The backend uses FastAPI with automatic reload for development:
```bash
uvicorn main:app --reload
```

### Frontend Development
The frontend uses React with hot reloading:
```bash
npm start
```

## 📄 License

This project is for educational purposes.
