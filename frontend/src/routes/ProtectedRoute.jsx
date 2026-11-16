import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import { getCookie } from '../utils/cookies';
import { getTenantUrl } from '../utils/subdomain';

const ProtectedRoute = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { subdomain, loading: schoolLoading } = useSchool();

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-['Inter']">
        <div className="w-9 h-9 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <span className="text-sm font-medium text-slate-500">Loading workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    if (hostname.includes('localhost') && hostname !== 'localhost') {
      window.location.href = `${window.location.protocol}//localhost${port}/login?global_logout=true`;
      return null;
    } else {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const rootDomain = parts.slice(-2).join('.');
        window.location.href = `${window.location.protocol}//${rootDomain}${port}/login?global_logout=true`;
        return null;
      }
    }
    return <Navigate to="/login" replace />;
  }

  // Super Admin redirect guard
  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin" replace />;
  }
  // School staff/students/parents redirect guard:
  // Only redirect if user is actively on another tenant's distinct subdomain
  if (subdomain && user?.school?.subdomain && subdomain !== user.school.subdomain && subdomain !== 'admin') {
    const token = localStorage.getItem('token') || getCookie('token') || '';
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    window.location.href = getTenantUrl(user.school.subdomain, `/dashboard?sso_token=${token}&sso_user=${encodedUser}`);
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
