import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import { getCookie } from '../utils/cookies';

const ProtectedRoute = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { subdomain, loading: schoolLoading } = useSchool();

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-[#1A1918]">
        Loading workspace...
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
    if (subdomain !== 'admin') {
      const port = window.location.port ? `:${window.location.port}` : '';
      const token = localStorage.getItem('token') || getCookie('token') || '';
      const encodedUser = encodeURIComponent(JSON.stringify(user));
      window.location.href = `${window.location.protocol}//admin.localhost${port}/super-admin?sso_token=${token}&sso_user=${encodedUser}`;
      return null;
    }
  } else {
    // School staff/students/parents redirect guard
    if (!subdomain || subdomain === 'admin') {
      if (user?.school?.subdomain) {
        const port = window.location.port ? `:${window.location.port}` : '';
        const token = localStorage.getItem('token') || getCookie('token') || '';
        const encodedUser = encodeURIComponent(JSON.stringify(user));
        window.location.href = `${window.location.protocol}//${user.school.subdomain}.localhost${port}/dashboard?sso_token=${token}&sso_user=${encodedUser}`;
        return null;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
