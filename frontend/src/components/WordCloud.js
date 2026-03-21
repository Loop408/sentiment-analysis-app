import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './WordCloud.css';

function WordCloud({ words, title = "Key Terms" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [, setRendered] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) {
      setRendered(false);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const width = container.offsetWidth;
    const height = 380;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Vibrant colors like reference image
    const colors = [
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f59e0b', '#fbbf24', '#6366f1', '#06b6d4',
      '#10b981', '#f97316', '#3b82f6', '#ef4444'
    ];

    const sortedWords = [...words]
      .filter(w => w && w.text)
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    if (sortedWords.length === 0) {
      setRendered(false);
      return;
    }

    const maxValue = sortedWords[0].value;
    const minValue = sortedWords[sortedWords.length - 1].value;
    const range = maxValue - minValue || 1;

    const placedWords = [];
    const centerX = width / 2;
    const centerY = height / 2;

    sortedWords.forEach((word, index) => {
      const normalizedValue = (word.value - minValue) / range;
      const fontSize = Math.floor(14 + normalizedValue * 36); // 14px to 50px
      
      ctx.font = `700 ${fontSize}px Inter, -apple-system, sans-serif`;
      const metrics = ctx.measureText(word.text);
      const wordWidth = metrics.width;
      const wordHeight = fontSize;

      // Spiral placement with better distribution
      let angle = index * 1.5;
      let radius = 0;
      let placed = false;
      let x, y;
      const maxRadius = Math.min(width, height) * 0.42;

      while (!placed && radius < maxRadius) {
        x = centerX + radius * Math.cos(angle) - wordWidth / 2;
        y = centerY + radius * Math.sin(angle) * 0.8 + wordHeight / 2;

        if (x > 8 && x + wordWidth < width - 8 && y > wordHeight && y < height - 8) {
          let collision = false;
          for (const placedWord of placedWords) {
            const padding = 4;
            if (
              x < placedWord.x + placedWord.width + padding &&
              x + wordWidth > placedWord.x - padding &&
              y - wordHeight < placedWord.y + padding &&
              y > placedWord.y - placedWord.height - padding
            ) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            placed = true;
          }
        }

        angle += 0.3;
        radius += 5;
      }

      if (placed) {
        const color = colors[index % colors.length];
        placedWords.push({
          text: word.text, x, y, width: wordWidth, height: wordHeight,
          fontSize, color, index
        });

        // Draw word with shadow
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = `700 ${fontSize}px Inter, -apple-system, sans-serif`;
        ctx.textBaseline = 'alphabetic';
        
        // Add shadow for depth
        ctx.shadowColor = color + '50';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(word.text, x, y);
        ctx.restore();
      }
    });

    setRendered(placedWords.length > 0);

  }, [words]);

  if (!words || words.length === 0) {
    return (
      <div className="word-cloud-container empty">
        <h4 className="word-cloud-title">{title}</h4>
        <div className="word-cloud-placeholder">
          <span>No terms to display</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="word-cloud-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h4 className="word-cloud-title">{title}</h4>
      <div ref={containerRef} className="word-cloud-wrapper">
        <canvas ref={canvasRef} className="word-cloud-canvas" />
      </div>
    </motion.div>
  );
}

export default WordCloud;
