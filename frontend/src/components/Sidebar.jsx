import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ activeTab, onTabChange, onUploadClick, className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'playground', icon: '✨', label: 'Playground' },
    { id: 'analytics',  icon: '📈', label: 'Analytics' },
    { id: 'settings',   icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className={`left-sidebar ${className}`}>
      <h1 className="logo">Digital Twin</h1>
      <nav className="side-nav">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <button
          className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
          onClick={() => navigate('/history')}
        >
          🕘 History
        </button>
      </nav>

      <div className="sidebar-upload-btn">
        <button className="upload-card" onClick={onUploadClick}>
          <div className="upload-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>Upload Syllabus</span>
          <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>PDF Format</span>
        </button>
      </div>
    </aside>
  );
}
