import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#08080f' }}>
        <div className="spinner" style={{ width:32, height:32 }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}
