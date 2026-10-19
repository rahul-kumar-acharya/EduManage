import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-['Inter']">
        <div className="w-9 h-9 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <span className="text-sm font-medium text-slate-500">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};


export default GuestRoute;
