import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('ai_twin_token'));
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage token
  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        // Token expired or invalid — clear it
        localStorage.removeItem('ai_twin_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [token]);

  const login = useCallback((tokenVal, userData) => {
    localStorage.setItem('ai_twin_token', tokenVal);
    setToken(tokenVal);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ai_twin_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
