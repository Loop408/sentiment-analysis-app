import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Clock, X } from 'lucide-react';
import PieChart from './PieChart';
import WordCloud from './WordCloud';
import { analyzeHashtag } from '../services/api';
import './HashtagAnalyzer.css';

function HashtagAnalyzer() {
  const [hashtag, setHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!hashtag.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await analyzeHashtag(hashtag);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = (format) => {
    if (!result) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `sentiment-analysis-${result.hashtag}-${timestamp}`;
    
    if (format === 'json') {
      const dataStr = JSON.stringify(result, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['Tweet', 'Sentiment', 'Confidence'];
      const rows = result.tweets.map(t => [
        `"${t.tweet.replace(/"/g, '""')}"`,
        t.sentiment,
        t.confidence
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
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
        Discover Trends
      </motion.h2>
      
      <div className="input-group-modern">
        <div className="hashtag-input-wrapper">
          <span className="hashtag-symbol">#</span>
          <input
            type="text"
            className="input-field-modern"
            placeholder="Enter topic..."
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <div className="input-glow" />
        </div>
        
        <motion.button
          className="analyze-btn-glow"
          onClick={handleAnalyze}
          disabled={loading || !hashtag.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <div className="btn-content">
              <div className="spinner-mini" />
              <span>Scanning...</span>
            </div>
          ) : (
            <span className="btn-content">Analyze</span>
          )}
        </motion.button>
      </div>


      <AnimatePresence>
        {error && (
          <motion.div
            className="flash-error"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <span className="flash-icon">⚠</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            className="results-arena"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {result.total_tweets === 0 ? (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-icon">🔍</div>
                <p>No signals found for #{hashtag}</p>
              </motion.div>
            ) : (
              <>
                {/* Discovery Badge */}
                <motion.div 
                  className="discovery-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <span className="pulse-dot" />
                  {result.total_tweets.toLocaleString()} Signals Detected
                </motion.div>

                {/* Top Section: Pie Chart + Word Cloud Side by Side */}
                <div className="top-section">
                  <div className="chart-section">
                    <PieChart 
                      positive={result.positive_count}
                      negative={result.negative_count}
                    />
                  </div>
                  <div className="wordcloud-section">
                    <WordCloud words={result.word_cloud} title="Key Terms" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="metrics-grid">
                  <motion.div 
                    className="metric-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="metric-value">{result.total_tweets.toLocaleString()}</div>
                    <div className="metric-label">Total</div>
                    <div className="metric-bar" />
                  </motion.div>
                  
                  <motion.div 
                    className="metric-card positive-glow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="metric-value positive-text">{result.positive_count.toLocaleString()}</div>
                    <div className="metric-label">{result.positive_percentage}% Positive</div>
                    <div className="metric-bar positive-bar" style={{ width: `${result.positive_percentage}%` }} />
                  </motion.div>
                  
                  <motion.div 
                    className="metric-card negative-glow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="metric-value negative-text">{result.negative_count.toLocaleString()}</div>
                    <div className="metric-label">{result.negative_percentage}% Negative</div>
                    <div className="metric-bar negative-bar" style={{ width: `${result.negative_percentage}%` }} />
                  </motion.div>
                </div>

                {/* Export Buttons */}
                <div className="export-section">
                  <button className="export-btn" onClick={() => exportResults('json')}>
                    <Download size={14} />
                    Export JSON
                  </button>
                  <button className="export-btn" onClick={() => exportResults('csv')}>
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>

                {/* Signal Tweets - Full Width Below */}
                <div className="signals-section">
                  <div className="signals-columns">
                    <motion.div 
                      className="signal-column"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="column-title positive-title">
                        <span className="title-glow positive-glow-text" />
                        Positive Signals
                      </h4>
                      {result.tweets
                        .filter(t => t.sentiment === 'Positive')
                        .slice(0, 5)
                        .map((tweet, idx) => (
                          <motion.div
                            key={idx}
                            className="signal-bubble positive-bubble"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            whileHover={{ x: 5, scale: 1.02 }}
                          >
                            <div className="signal-confidence">{tweet.confidence}%</div>
                            <div className="signal-text">{tweet.tweet}</div>
                          </motion.div>
                        ))}
                    </motion.div>
                    
                    <motion.div 
                      className="signal-column"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="column-title negative-title">
                        <span className="title-glow negative-glow-text" />
                        Negative Signals
                      </h4>
                      {result.tweets
                        .filter(t => t.sentiment === 'Negative')
                        .slice(0, 5)
                        .map((tweet, idx) => (
                          <motion.div
                            key={idx}
                            className="signal-bubble negative-bubble"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            whileHover={{ x: -5, scale: 1.02 }}
                          >
                            <div className="signal-confidence">{tweet.confidence}%</div>
                            <div className="signal-text">{tweet.tweet}</div>
                          </motion.div>
                        ))}
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HashtagAnalyzer;
