import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { signup, signin } from '../api/authApi.js';

const NODE_API = 'http://localhost:3001';

export default function AuthPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('signin');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Sign-in state
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass]   = useState('');

  // Sign-up state
  const [suName, setSuName]       = useState('');
  const [suAge, setSuAge]         = useState('');
  const [suEmail, setSuEmail]     = useState('');
  const [suPass, setSuPass]       = useState('');
  const [suGender, setSuGender]   = useState('');
  const [suType, setSuType]       = useState('');

  // ── Handle GitHub OAuth callback (token in URL) ──
  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (error) {
      const errorMessages = {
        'github_no_code': 'GitHub did not provide an authorization code.',
        'github_token_failed': 'Failed to get access token from GitHub.',
        'github_no_email': 'Could not get email from GitHub. Make sure email is public.',
        'github_auth_failed': 'GitHub authentication failed.',
      };
      showMsg('✗ ' + (errorMessages[error] || 'Social login failed.'), 'error');
      return;
    }

    if (token && name) {
      login(token, { name: decodeURIComponent(name), email: decodeURIComponent(email || '') });
      showMsg('✓ Welcome, ' + decodeURIComponent(name) + '!', 'success');
      setTimeout(() => navigate('/'), 800);
    }
  }, [searchParams, login, navigate]);

  // ── Load Google Sign-In script ──
  useEffect(() => {
    // Only load if not already loaded
    if (document.getElementById('google-gsi-script')) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn();
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup is optional since we check by ID
    };
  }, []);

  const initializeGoogleSignIn = useCallback(() => {
    // We'll use the programmatic API rather than the rendered button
  }, []);

  // ── Google sign-in handler ──
  const handleGoogleLogin = useCallback(() => {
    if (!window.google || !window.google.accounts) {
      showMsg('⚠ Google Sign-In script not loaded. Try again.', 'error');
      return;
    }

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      showMsg('⚠ Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in frontend/.env', 'error');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        if (!response.credential) {
          showMsg('✗ Google login cancelled.', 'error');
          return;
        }
        setLoading(true);
        try {
          const res = await fetch(`${NODE_API}/auth/social/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
          });
          const data = await res.json();

          if (data.success) {
            showMsg('✓ Welcome, ' + data.user.name + '!', 'success');
            login(data.token, data.user);
            setTimeout(() => navigate('/'), 800);
          } else {
            showMsg('✗ ' + (data.error || 'Google login failed.'), 'error');
          }
        } catch (err) {
          showMsg('✗ Could not connect to server for Google auth.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });

    window.google.accounts.id.prompt();
  }, [login, navigate]);

  // ── GitHub sign-in handler ──
  const handleGithubLogin = () => {
    // Redirect to backend which will redirect to GitHub
    window.location.href = `${NODE_API}/auth/social/github`;
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  const showMsg = (text, type) => setMsg({ text, type });
  const clearMsg = () => setMsg({ text: '', type: '' });

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!siEmail || !siPass) { showMsg('⚠ Please fill in all fields.', 'error'); return; }
    setLoading(true);
    try {
      const data = await signin({ email: siEmail, password: siPass });
      if (data.success) {
        showMsg('✓ Welcome back, ' + data.user.name + '!', 'success');
        login(data.token, data.user);
        setTimeout(() => navigate('/'), 800);
      }
    } catch (err) {
      showMsg('✗ ' + (err.response?.data?.error || 'Invalid credentials.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!suName || !suAge || !suEmail || !suPass) { showMsg('⚠ Please fill in all required fields.', 'error'); return; }
    if (!suGender) { showMsg('⚠ Please select your gender.', 'error'); return; }
    if (!suType) { showMsg('⚠ Please select the type of user you are.', 'error'); return; }
    if (suPass.length < 8) { showMsg('⚠ Password must be at least 8 characters.', 'error'); return; }
    setLoading(true);
    try {
      const data = await signup({ name: suName, age: parseInt(suAge), email: suEmail, password: suPass, gender: suGender, user_type: suType });
      if (data.success) {
        showMsg('✓ Account created! Launching your Digital Twin...', 'success');
        login(data.token, data.user);
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      showMsg('✗ ' + (err.response?.data?.error || 'Registration failed.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const genders = [
    { val: 'Male',   icon: '♂️', label: 'Male' },
    { val: 'Female', icon: '♀️', label: 'Female' },
    { val: 'Other',  icon: '⚧️', label: 'Other' },
  ];

  const userTypes = [
    { val: 'Undergraduate', icon: '🎓', label: 'Undergrad' },
    { val: 'Postgraduate',  icon: '📚', label: 'Postgrad' },
    { val: 'Researcher',    icon: '🔬', label: 'Researcher' },
    { val: 'Professional',  icon: '💼', label: 'Professional' },
    { val: 'Educator',      icon: '🧑‍🏫', label: 'Educator' },
    { val: 'Other',         icon: '✨', label: 'Other' },
  ];

  return (
    <div className="auth-page">
      <div className="brand-header">
        <div className="brand-logo"><span className="logo-dot" /> Digital Twin</div>
        <p className="brand-tagline">AI-powered academic performance prediction</p>
      </div>

      <div className="auth-card">
        <div className="tab-switcher">
          <button className={`tab-btn ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); clearMsg(); }}>Sign In</button>
          <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); clearMsg(); }}>Create Account</button>
        </div>

        {msg.text && (
          <div className={`form-msg show ${msg.type}`}>{msg.text}</div>
        )}

        {/* ── Sign In ── */}
        {tab === 'signin' && (
          <>
            <h1 className="panel-title">Welcome back</h1>
            <p className="panel-subtitle">Sign in to resume your AI Twin session</p>
            <form onSubmit={handleSignIn}>
              <div className="field-group">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} placeholder="you@university.ac.in" />
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" value={siPass} onChange={e => setSiPass(e.target.value)} placeholder="Your password" />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          </>
        )}

        {/* ── Sign Up ── */}
        {tab === 'signup' && (
          <>
            <h1 className="panel-title">Create your Twin</h1>
            <p className="panel-subtitle">Set up your AI-powered student profile</p>
            <form onSubmit={handleSignUp}>
              <div className="field-row">
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="field-input" type="text" value={suName} onChange={e => setSuName(e.target.value)} placeholder="Abhay Singh" />
                </div>
                <div>
                  <label className="field-label">Age</label>
                  <input className="field-input" type="number" value={suAge} onChange={e => setSuAge(e.target.value)} placeholder="21" min={13} max={60} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} placeholder="you@university.ac.in" />
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" value={suPass} onChange={e => setSuPass(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="field-group">
                <label className="field-label">Gender</label>
                <div className="gender-grid">
                  {genders.map(g => (
                    <label key={g.val} className={`type-pill ${suGender === g.val ? 'selected' : ''}`} onClick={() => setSuGender(g.val)}>
                      <input type="radio" name="gender" value={g.val} />
                      <span>{g.icon}</span><span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">I am a...</label>
                <div className="user-type-grid">
                  {userTypes.map(t => (
                    <label key={t.val} className={`type-pill ${suType === t.val ? 'selected' : ''}`} onClick={() => setSuType(t.val)}>
                      <input type="radio" name="userType" value={t.val} />
                      <span>{t.icon}</span><span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Twin...' : 'Create My Twin →'}
              </button>
            </form>
          </>
        )}

        <div className="divider">or continue with</div>
        <div className="social-row">
          <button className="social-btn" onClick={handleGoogleLogin} disabled={loading}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button className="social-btn" onClick={handleGithubLogin} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </button>
        </div>
      </div>

      <p className="auth-footer">
        By continuing, you agree to our <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
      </p>
    </div>
  );
}
