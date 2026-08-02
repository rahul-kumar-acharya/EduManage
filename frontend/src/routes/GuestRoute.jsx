import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-[#1A1918]">
        Loading...
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
