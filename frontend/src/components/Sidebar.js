import React from 'react';
import { motion } from 'framer-motion';
import { Hash, MessageSquare, BarChart3 } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    {
      id: 'explore',
      label: 'Explore',
      icon: Hash,
      description: 'Hashtag Analysis'
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: MessageSquare,
      description: 'Single Tweet'
    }
  ];

  return (
    <motion.aside 
      className="sidebar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <BarChart3 size={28} />
          <span>Pulse</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="nav-icon-wrapper">
                <Icon size={20} />
              </div>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
              {isActive && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-badge">
          <span className="status-dot" />
          <span className="status-text">System Active</span>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
