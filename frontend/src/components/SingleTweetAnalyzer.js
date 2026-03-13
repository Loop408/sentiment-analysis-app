import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import PieChart from './PieChart';
import WordCloud from './WordCloud';
import { predictSentiment } from '../services/api';
import './SingleTweetAnalyzer.css';

// Common stopwords to filter out
const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
  'am', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'now', 'also', 'as', 'up', 'out', 'down', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'what', 'which', 'who', 'whom',
  'whose', 'whatever', 'whichever', 'whoever', 'whomever', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 's', 't', 'don',
  'didn', 'doesn', 'wasn', 'weren', 'won', 'wouldn', 'shouldn', 'couldn', 'can', 'cannot', 'cant',
  'isn', 'aren', 'hasn', 'haven', 'hadn', 'mustn', 'needn', 'oughtn', 'shan', 'shouldn', 'wasn',
  'weren', 'won', 'wouldn', 'didn', 'doesn', 'hasn', 'haven', 'hadn'
]);

function SingleTweetAnalyzer() {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Generate word cloud data from tweet text
  const wordCloudData = useMemo(() => {
    if (!tweet.trim()) return [];
    
    // Clean and extract words
    const words = tweet
      .toLowerCase()
      .replace(/http\S+/g, '')
      .replace(/@\w+/g, '')
      .replace(/#\w+/g, '')
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Count frequency
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    
    // Convert to array format for WordCloud
    return Object.entries(freq)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [tweet]);

  const handleAnalyze = async () => {
    if (!tweet.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await predictSentiment(tweet);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    return sentiment === 'Positive' ? '✨' : '◆';
  };

  const getSentimentColor = (sentiment) => {
    return sentiment === 'Positive' ? 'var(--positive)' : 'var(--negative)';
  };

  const exportResult = (format) => {
    if (!result) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const dataToExport = {
      tweet: tweet,
      timestamp: timestamp,
      sentiment: result.sentiment,
      confidence: result.confidence,
      probabilities: result.probabilities
    };
    
    if (format === 'json') {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tweet-analysis-${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="analyzer-container">
      <motion.h2 
        className="section-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Decode Expression
      </motion.h2>
      
      <div className="input-area-modern">
        <div className="textarea-wrapper">
          <textarea
            className="textarea-modern"
            placeholder="Share your thoughts..."
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            rows={4}
          />
          <div className="textarea-glow" />
        </div>
        
        <motion.button
          className="analyze-btn-liquid"
          onClick={handleAnalyze}
          disabled={loading || !tweet.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="liquid-btn-content">
              <div className="liquid-spinner" />
              <span>Processing...</span>
            </div>
          ) : (
            <span className="liquid-btn-content">Decode</span>
          )}
        </motion.button>
      </div>

      {/* Live Word Cloud - shows as you type */}
      {wordCloudData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <WordCloud words={wordCloudData} />
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            className="flash-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="flash-icon">⚠</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            className="decode-result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <motion.div
              className="sentiment-reveal"
              style={{ 
                borderColor: getSentimentColor(result.sentiment)
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="sentiment-emoji"
                style={{ color: getSentimentColor(result.sentiment) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {getSentimentEmoji(result.sentiment)}
              </motion.div>
              
              <motion.div 
                className="sentiment-badge"
                style={{ color: getSentimentColor(result.sentiment) }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span 
                  className="badge-glow" 
                  style={{ background: getSentimentColor(result.sentiment) }} 
                />
                {result.sentiment}
              </motion.div>
              
              <motion.div 
                className="confidence-ring"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="confidence-value">{result.confidence}%</div>
                <div className="confidence-label">Clarity</div>
              </motion.div>
            </motion.div>

            <motion.div
              className="export-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button className="export-btn" onClick={() => exportResult('json')}>
                <Download size={14} />
                Export Result
              </button>
            </motion.div>

            <motion.div
              className="probability-arena"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="arena-title">Sentiment Spectrum</h4>
              <PieChart 
                positive={result.probabilities.positive}
                negative={result.probabilities.negative}
                isProbability={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SingleTweetAnalyzer;
