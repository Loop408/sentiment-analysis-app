import React from 'react';
import { motion } from 'framer-motion';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './PieChart.css';

function PieChart({ positive, negative, isProbability = false }) {
  const data = [
    { name: 'Positive', value: positive, color: '#10b981' },
    { name: 'Negative', value: negative, color: '#ef4444' }
  ];

  const total = positive + negative;

  // Custom label renderer for pie slices
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = isProbability ? item.value : ((item.value / total) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <div 
            className="tooltip-dot" 
            style={{ background: item.payload.color }}
          />
          <span className="tooltip-label">{item.name}</span>
          <span className="tooltip-value">{percentage}%</span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="chart-container-advanced"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="chart-glow" />
      
      <ResponsiveContainer width="100%" height={350}>
        <RePieChart>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
                filter="url(#glow)"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RePieChart>
      </ResponsiveContainer>

      {/* Center decoration */}
      <div className="chart-center">
        <motion.div 
          className="center-pulse"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Legend with animated bars */}
      <div className="chart-legend">
        {data.map((item, index) => {
          const percentage = isProbability ? item.value : ((item.value / total) * 100).toFixed(1);
          return (
            <motion.div 
              key={index}
              className="legend-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
            >
              <div className="legend-header">
                <div 
                  className="legend-dot" 
                  style={{ background: item.color }}
                />
                <span className="legend-name">{item.name}</span>
                <span className="legend-percentage">{percentage}%</span>
              </div>
              <div className="legend-bar-container">
                <motion.div 
                  className="legend-bar"
                  style={{ background: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default PieChart;
