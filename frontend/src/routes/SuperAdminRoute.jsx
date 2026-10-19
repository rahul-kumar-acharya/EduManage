import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-['Inter']">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wide uppercase">Verifying Super Admin Session...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users are redirected to Super Admin Login
  if (!isAuthenticated) {
    return <Navigate to="/super-admin/login" replace />;
  }

  // 2. Non-Super Admin users are redirected to regular school dashboard
  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
