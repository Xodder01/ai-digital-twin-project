import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, deleteHistory } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function HistoryPage() {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | low | medium | high

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getHistory(1, 100);
      setRecords(data.records || []);
    } catch {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistory(id);
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch {
      alert('Failed to delete record.');
    }
  };

  // Classify burnout risk
  const getRiskLevel = (record) => {
    const burnout = record.outputs?.burnout_risk;
    const prod = record.outputs?.productivity_score;
    if (burnout === 1) return 'high';
    if (prod != null && prod < 60) return 'medium';
    return 'low';
  };

  const getRiskLabel = (record) => {
    const level = getRiskLevel(record);
    if (level === 'high') return 'High';
    if (level === 'medium') return 'Medium';
    return 'Low';
  };

  const getRiskColor = (level) => {
    if (level === 'high') return '#ff5252';
    if (level === 'medium') return '#fbc02d';
    return '#3ef08b';
  };

  // Filtered records
  const filtered = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter(r => getRiskLevel(r) === filter);
  }, [records, filter]);

  // Summary stats
  const totalPredictions = records.length;
  const avgScore = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.outputs?.productivity_score || 0), 0) / records.length)
    : 0;
  const lowRiskDays = records.filter(r => getRiskLevel(r) === 'low').length;
  const medRiskDays = records.filter(r => getRiskLevel(r) === 'medium').length;
  const highRiskDays = records.filter(r => getRiskLevel(r) === 'high').length;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filters = [
    { key: 'all',    label: 'All' },
    { key: 'low',    label: 'Low' },
    { key: 'medium', label: 'Medium' },
    { key: 'high',   label: 'High' },
  ];

  return (
    <div className="app-shell" style={{ gridTemplateColumns: '240px 1fr' }}>
      {/* Left Sidebar — same as dashboard */}
      <aside className="left-sidebar">
        <h1 className="logo">Digital Twin</h1>
        <nav className="side-nav">
          <Link to="/" className="nav-item">✨ Playground</Link>
          <Link to="/" className="nav-item">📈 Analytics</Link>
          <Link to="/" className="nav-item">⚙️ Settings</Link>
          <Link to="/history" className="nav-item active">🕘 History</Link>
        </nav>
      </aside>

      {/* Center Content */}
      <main className="center-content">
        <header className="content-header">
          <h2>Prediction History</h2>
          <div className="header-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
            <button className="signout-btn" onClick={logout}>Sign Out</button>
          </div>
        </header>

        <div className="tab-content">
          {/* Title row + Filters */}
          <div className="history-title-row">
            <div>
              <h1 className="history-heading">Prediction History</h1>
              <p className="history-sub">Review your past productivity analyses</p>
            </div>
            <div className="filter-pills">
              {filters.map(f => (
                <button
                  key={f.key}
                  className={`filter-pill ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="history-stats-grid">
            <div className="history-stat-card">
              <div className="history-stat-num" style={{ color: 'var(--text-primary)' }}>{totalPredictions}</div>
              <div className="history-stat-label">Total Predictions</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-num" style={{ color: '#3ef08b' }}>{avgScore}%</div>
              <div className="history-stat-label">Average Score</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-num" style={{ color: '#3ef08b' }}>{lowRiskDays}</div>
              <div className="history-stat-label">Low Risk Days</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-num" style={{ color: '#fbc02d' }}>{medRiskDays}</div>
              <div className="history-stat-label">Medium Risk Days</div>
            </div>
          </div>

          {/* Records Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">📊</div>
              <h3>No predictions yet</h3>
              <p>Run your first simulation from the Dashboard to see records here.</p>
            </div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table-v2">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>PRODUCTIVITY</th>
                    <th>BURNOUT RISK</th>
                    <th>WORK HOURS</th>
                    <th>SLEEP</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const prod = r.outputs?.productivity_score ?? 0;
                    const riskLevel = getRiskLevel(r);
                    const riskLabel = getRiskLabel(r);
                    const riskColor = getRiskColor(riskLevel);
                    const study = r.inputs?.study_hours ?? '-';
                    const sleep = r.inputs?.sleep_hours ?? '-';

                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="date-cell">
                            <span className="date-icon">📅</span>
                            <span>{formatDate(r.timestamp)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="prod-cell">
                            <div className="prod-bar-bg">
                              <div
                                className="prod-bar-fill"
                                style={{ width: `${Math.min(prod, 100)}%` }}
                              />
                            </div>
                            <span className="prod-pct">{Math.round(prod)}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="risk-badge" style={{
                            background: riskColor + '22',
                            color: riskColor,
                            border: `1px solid ${riskColor}44`
                          }}>
                            {riskLabel}
                          </span>
                        </td>
                        <td className="hours-cell">{study}h</td>
                        <td className="hours-cell">{sleep}h</td>
                        <td>
                          <button className="del-record-btn" onClick={() => handleDelete(r._id)} title="Delete">🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
