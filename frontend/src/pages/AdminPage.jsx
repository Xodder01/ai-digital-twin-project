import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NODE_API = 'http://localhost:3001';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('ai_twin_admin_key') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (key) => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${NODE_API}/admin/users`, { headers: { 'x-admin-key': key } }),
        axios.get(`${NODE_API}/admin/stats`, { headers: { 'x-admin-key': key } }),
      ]);
      setUsers(usersRes.data.users || []);
      setStats(statsRes.data.stats || null);
      setAuthenticated(true);
      localStorage.setItem('ai_twin_admin_key', key);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to authenticate. Check admin key.');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    fetchData(adminKey.trim());
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their history? This cannot be undone.`)) return;
    try {
      await axios.delete(`${NODE_API}/admin/users/${id}`, { headers: { 'x-admin-key': adminKey } });
      setUsers(prev => prev.filter(u => u._id !== id));
      // Refresh stats
      const statsRes = await axios.get(`${NODE_API}/admin/stats`, { headers: { 'x-admin-key': adminKey } });
      setStats(statsRes.data.stats);
    } catch {
      alert('Failed to delete user.');
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    localStorage.removeItem('ai_twin_admin_key');
    setAuthenticated(false);
    setAdminKey('');
    setUsers([]);
    setStats(null);
  };

  // Auto-login if key is stored
  useEffect(() => {
    const saved = localStorage.getItem('ai_twin_admin_key');
    if (saved) fetchData(saved);
  }, []);

  // ── Admin Login Screen ──
  if (!authenticated) {
    return (
      <div className="auth-page">
        <div className="brand-header">
          <div className="brand-logo"><span className="logo-dot" /> Admin Panel</div>
          <p className="brand-tagline">AI Digital Twin — Platform Administration</p>
        </div>
        <div className="auth-card" style={{ maxWidth: 400 }}>
          <h1 className="panel-title">🔐 Admin Access</h1>
          <p className="panel-subtitle">Enter the admin key to view registered users</p>

          {error && <div className="form-msg show error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label">Admin Key</label>
              <input
                className="field-input"
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="Enter admin key..."
                autoFocus
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link to="/auth" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="app-shell" style={{ gridTemplateColumns: '240px 1fr' }}>
      {/* Sidebar */}
      <aside className="left-sidebar">
        <h1 className="logo">Admin Panel</h1>
        <nav className="side-nav">
          <Link to="/" className="nav-item">✨ Dashboard</Link>
          <Link to="/history" className="nav-item">🕘 History</Link>
          <span className="nav-item active">👥 Users</span>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            🚪 Logout Admin
          </button>
        </div>
      </aside>

      <main className="center-content">
        <header className="content-header">
          <h2>Platform Administration</h2>
          <div className="header-user">
            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #ff5252, #fbc02d)' }}>A</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Admin</span>
          </div>
        </header>

        <div className="tab-content">
          {/* Stats Cards */}
          {stats && (
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: 'rgba(168,199,250,0.15)', color: '#a8c7fa' }}>👥</div>
                <div>
                  <div className="admin-stat-num">{stats.totalUsers}</div>
                  <div className="admin-stat-label">Total Users</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: 'rgba(62,240,139,0.15)', color: '#3ef08b' }}>📊</div>
                <div>
                  <div className="admin-stat-num">{stats.totalPredictions}</div>
                  <div className="admin-stat-label">Total Predictions</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: 'rgba(251,192,45,0.15)', color: '#fbc02d' }}>🆕</div>
                <div>
                  <div className="admin-stat-num">{stats.recentSignups}</div>
                  <div className="admin-stat-label">This Week</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>🔑</div>
                <div>
                  <div className="admin-stat-num">{stats.byProvider?.length || 0}</div>
                  <div className="admin-stat-label">Auth Methods</div>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Cards */}
          {stats && (
            <div className="admin-breakdown-row">
              <div className="admin-breakdown-card">
                <h3 className="admin-breakdown-title">By User Type</h3>
                {stats.byType.map((t, i) => (
                  <div key={i} className="admin-breakdown-item">
                    <span>{t.type}</span>
                    <span className="admin-breakdown-count">{t.count}</span>
                  </div>
                ))}
              </div>
              <div className="admin-breakdown-card">
                <h3 className="admin-breakdown-title">By Auth Provider</h3>
                {stats.byProvider.map((p, i) => (
                  <div key={i} className="admin-breakdown-item">
                    <span>{p.provider === 'local' ? '📧 Email/Password' : p.provider === 'google' ? '🔵 Google' : '⚫ GitHub'}</span>
                    <span className="admin-breakdown-count">{p.count}</span>
                  </div>
                ))}
              </div>
              <div className="admin-breakdown-card">
                <h3 className="admin-breakdown-title">By Gender</h3>
                {stats.byGender.map((g, i) => (
                  <div key={i} className="admin-breakdown-item">
                    <span>{g.gender === 'Male' ? '♂️' : g.gender === 'Female' ? '♀️' : '⚧️'} {g.gender}</span>
                    <span className="admin-breakdown-count">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Table */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, marginTop: 8 }}>
            Registered Users ({users.length})
          </h2>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>TYPE</th>
                  <th>GENDER</th>
                  <th>AGE</th>
                  <th>PROVIDER</th>
                  <th>JOINED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className="admin-type-badge">{u.user_type}</span>
                    </td>
                    <td>{u.gender}</td>
                    <td>{u.age}</td>
                    <td>
                      <span className="admin-provider-badge" data-provider={u.auth_provider || 'local'}>
                        {u.auth_provider === 'google' ? '🔵 Google' : u.auth_provider === 'github' ? '⚫ GitHub' : '📧 Local'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td>
                      <button className="del-record-btn" onClick={() => handleDeleteUser(u._id, u.name)} title="Delete User">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
