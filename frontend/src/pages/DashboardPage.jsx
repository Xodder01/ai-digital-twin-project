import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { runSimulate } from '../api/mlApi.js';
import { saveHistory } from '../api/authApi.js';
import { uploadSyllabus } from '../api/mlApi.js';
import Sidebar from '../components/Sidebar.jsx';
import MetricsGrid from '../components/MetricsGrid.jsx';
import SimulationPanel from '../components/SimulationPanel.jsx';
import TrendChart from '../components/TrendChart.jsx';
import HabitImpact from '../components/HabitImpact.jsx';
import ChatDock from '../components/ChatDock.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('playground');
  const [simLoading, setSimLoading] = useState(false);
  const [persona, setPersona] = useState('student');
  const fileInputRef = useRef(null);

  // Mobile sidebar toggles
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [simPanelOpen, setSimPanelOpen] = useState(false);
  const closePanels = () => { setSidebarOpen(false); setSimPanelOpen(false); };

  // Simulation results
  const [metrics, setMetrics] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [habitImpact, setHabitImpact] = useState({});
  const [aiAdvice, setAiAdvice] = useState('');
  const [lastInputs, setLastInputs] = useState({ sleep_hours: 7, study_hours: 5, screen_time_hours: 4, stress_level: 5 });
  const [simError, setSimError] = useState('');

  // Todo
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');

  // Dates
  const [dates, setDates] = useState([]);
  const [dateName, setDateName] = useState('');
  const [dateDate, setDateDate] = useState('');

  const handleSimulate = useCallback(async (payload) => {
    setSimLoading(true);
    setSimError('');
    setLastInputs(payload);
    try {
      const data = await runSimulate(payload);
      if (data.error) { setSimError(data.error); return; }

      const newMetrics = {
        productivity_score: data.new_productivity_score,
        burnout_risk: data.new_burnout_risk,
        exam_score: data.exam_score,
        focus_index: data.focus_index,
        goal_probability: data.goal_probability,
      };
      setMetrics(newMetrics);
      setTrendData(data.weekly_trend || []);
      setHabitImpact(data.habit_impact || {});
      setAiAdvice(data.ai_advice || '');

      // Save to history (non-blocking)
      saveHistory('simulate', payload, { ...newMetrics, ai_advice: data.ai_advice || '' });
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('429') || msg.includes('Quota')) {
        setSimError('⚠️ Simulation Rate Limit Exceeded. Google Free Tier needs 10 seconds to cool down.');
      } else {
        setSimError('Failed to connect to Flask ML backend. Make sure it is running on port 5000.');
      }
    } finally {
      setSimLoading(false);
    }
  }, []);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadSyllabus(file);
      alert(res.message || 'Syllabus uploaded!');
    } catch {
      alert('Failed to upload syllabus.');
    }
  };

  const addTodo = () => {
    if (!todoInput.trim()) return;
    setTodos(p => [...p, { text: todoInput.trim(), done: false }]);
    setTodoInput('');
  };
  const toggleTodo = (i) => setTodos(p => p.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  const removeTodo = (i) => setTodos(p => p.filter((_, idx) => idx !== i));

  const addDate = () => {
    if (!dateName.trim() || !dateDate) return;
    setDates(p => [...p, { name: dateName.trim(), date: dateDate }]);
    setDateName(''); setDateDate('');
  };
  const removeDate = (i) => setDates(p => p.filter((_, idx) => idx !== i));

  // Settings – voice
  const [voices, setVoices] = useState([]);
  React.useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const tabTitles = { playground: 'Explore Digital Twin Models', analytics: 'Deep Analytics Engine', settings: 'Twin Configuration' };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {(sidebarOpen || simPanelOpen) && <div className="sidebar-overlay visible" onClick={closePanels} />}

      <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} onUploadClick={handleUploadClick} className={sidebarOpen ? 'open' : ''} />
      <input type="file" ref={fileInputRef} accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />

      <main className="center-content">
        <header className="content-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h2>{tabTitles[activeTab]}</h2>
          </div>
          <div className="header-user">
            <button className="mobile-menu-btn sim-toggle" onClick={() => setSimPanelOpen(true)}>⚙</button>
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
            <button className="signout-btn" onClick={logout}>Sign Out</button>
          </div>
        </header>

        {/* ── PLAYGROUND ── */}
        {activeTab === 'playground' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="tab-content">
              <MetricsGrid data={metrics} persona={persona} />

              <div className="bento-grid">
                <div className="bento-card">
                  <h3 className="bento-title">Weekly Performance Trend</h3>
                  <TrendChart trendData={trendData} />
                </div>
                <div className="bento-card">
                  <h3 className="bento-title">Habit Impact Analysis</h3>
                  <HabitImpact impactData={habitImpact} />
                </div>
                <div className="bento-card">
                  <h3 className="bento-title">Daily Planner</h3>
                  <div className="todo-input-area">
                    <input value={todoInput} onChange={e => setTodoInput(e.target.value)} placeholder="What needs to be done?" onKeyDown={e => e.key === 'Enter' && addTodo()} />
                    <button className="add-btn" onClick={addTodo}>+</button>
                  </div>
                  <ul className="task-list">
                    {todos.map((t, i) => (
                      <li className={`task-item ${t.done ? 'completed' : ''}`} key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={t.done} onChange={() => toggleTodo(i)} style={{ cursor: 'pointer', accentColor: 'var(--accent)' }} />
                          <span className="task-text" style={t.done ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}>{t.text}</span>
                        </div>
                        <button className="del-btn" onClick={() => removeTodo(i)}>✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bento-card">
                  <h3 className="bento-title">Important Dates</h3>
                  <div className="date-input-area">
                    <input value={dateName} onChange={e => setDateName(e.target.value)} placeholder="Event Name" />
                    <input type="date" value={dateDate} onChange={e => setDateDate(e.target.value)} />
                    <button className="add-btn" onClick={addDate}>+</button>
                  </div>
                  <ul className="task-list">
                    {dates.map((d, i) => (
                      <li className="task-item" key={i}><span>{d.name} — {d.date}</span><button className="del-btn" onClick={() => removeDate(i)}>✕</button></li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Advice */}
              {(aiAdvice || simError) && (
                <div className="ai-advice-card">
                  <h3 className="ai-advice-title">✨ {simError ? 'Error' : 'Personalized Twin Recommendation'}</h3>
                  <div className="ai-advice-text" style={simError ? { color: 'var(--danger)' } : undefined}>
                    {simError || aiAdvice}
                  </div>
                </div>
              )}

              <div style={{ height: 200 }} />
            </div>
            <ChatDock metrics={lastInputs} />
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h1>Deep Analytics Engine</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Longitudinal insights and machine learning model validation parameters.</p>
            <div className="stat-card">
              <h3 className="bento-title">Model R² Confidence Log</h3>
              <div className="stat-num">83.78%</div>
              <p>Productivity Random Forest Regressor accuracy across 2000 simulated student days.</p>
            </div>
            <div className="stat-card">
              <h3 className="bento-title">Classification Accuracy Log</h3>
              <div className="stat-num">100.00%</div>
              <p>Burnout Logistic Regression classifier accuracy.</p>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h1>Twin Configuration</h1>
            <div className="settings-card">
              <label>Digital Twin Voice</label>
              <p>Select a natural-sounding voice installed on your OS.</p>
              <select>
                {voices.length > 0 ? voices.map((v, i) => (
                  <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                )) : <option>Loading voices...</option>}
              </select>
            </div>
            <div className="settings-card">
              <label>Upload Course Syllabus (PDF)</label>
              <p>Upload study materials so your Digital Twin can quiz you about your coursework.</p>
              <div className="upload-drop-zone" onClick={handleUploadClick}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Click to Browse or Drag PDF Here</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Max file size: 10MB</div>
              </div>
            </div>
            <div className="settings-card">
              <label>Override Local API Key</label>
              <p>If you want to use a different Gemini API key temporarily, paste it here.</p>
              <input type="password" placeholder="AIzaSy..." />
              <button className="save-btn" onClick={() => alert('API Key mechanism wired for frontend UI demonstrator.')}>Save Configuration</button>
            </div>
          </div>
        )}
      </main>

      <SimulationPanel onSimulate={handleSimulate} loading={simLoading} persona={persona} onPersonaChange={setPersona} className={simPanelOpen ? 'open' : ''} />
    </div>
  );
}
