import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { setCookie, getCookie, eraseCookie } from '../utils/cookies';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Parse query parameters once synchronously at the start of the render cycle
  const params = new URLSearchParams(window.location.search);
  const ssoToken = params.get('sso_token');
  const ssoUser = params.get('sso_user');
  const isGlobalLogout = params.get('global_logout') === 'true';

  // SSO Helper: extract token and user from query parameters during cross-subdomain redirect
  if (ssoToken && ssoUser) {
    const decodedUser = decodeURIComponent(ssoUser);
    setCookie('token', ssoToken, 7);
    setCookie('user', decodedUser, 7);
    localStorage.setItem('token', ssoToken);
    localStorage.setItem('user', decodedUser);
    // Remove query parameters from address bar to keep URL clean
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const [token, setToken] = useState(() => {
    if (ssoToken) {
      return ssoToken;
    }
    if (isGlobalLogout) {
      return null;
    }
    return getCookie('token') || localStorage.getItem('token') || null;
  });

  const [user, setUser] = useState(() => {
    if (ssoUser) {
      try {
        const parsed = JSON.parse(decodeURIComponent(ssoUser));
        const localAvatar = localStorage.getItem('local_avatar');
        if (localAvatar && localAvatar !== 'null' && localAvatar !== 'undefined') {
          parsed.profile_picture = localAvatar;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse SSO user parameter:", e);
      }
    }

    if (isGlobalLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('local_avatar');
      eraseCookie('token');
      eraseCookie('user');
      // Remove query parameters from address bar to keep URL clean
      window.history.replaceState({}, document.title, window.location.pathname);
      return null;
    }

    const activeToken = getCookie('token') || localStorage.getItem('token');
    if (!activeToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('local_avatar');
      return null;
    }
    const savedUser = getCookie('user') || localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const localAvatar = localStorage.getItem('local_avatar');
      if (localAvatar && localAvatar !== 'null' && localAvatar !== 'undefined') {
        parsed.profile_picture = localAvatar;
      } else {
        parsed.profile_picture = null;
      }
      return parsed;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password, extraData = {}) => {
    const data = await authService.login(email, password, extraData);
    const userStr = JSON.stringify(data.user);
    setCookie('token', data.access, 7);
    setCookie('user', userStr, 7);
    localStorage.setItem('token', data.access);
    localStorage.setItem('user', userStr);
    setToken(data.access);
    setUser(data.user);
    return data.user;
  };



  const logout = async () => {
    try {
      if (token) {
        await authService.logout().catch(() => {});
      }
    } finally {
      eraseCookie('token');
      eraseCookie('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('local_avatar');

      // Immediate browser navigation to Home page BEFORE updating React state
      // This eliminates the microsecond flash of /super-admin/login or /login caused by route guards
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      if (hostname.includes('localhost') && hostname !== 'localhost') {
        window.location.href = `${window.location.protocol}//localhost${port}/?global_logout=true`;
      } else {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          const rootDomain = parts.slice(-2).join('.');
          window.location.href = `${window.location.protocol}//${rootDomain}${port}/?global_logout=true`;
        } else {
          window.location.href = '/';
        }
      }
    }
  };



  const refreshUser = (updatedUser) => {
    const localAvatar = localStorage.getItem('local_avatar');
    if (localAvatar && localAvatar !== 'null' && localAvatar !== 'undefined') {
      updatedUser.profile_picture = localAvatar;
    } else {
      updatedUser.profile_picture = null;
    }
    const userStr = JSON.stringify(updatedUser);
    setCookie('user', userStr, 7);
    localStorage.setItem('user', userStr);
    setUser(updatedUser);
  };

  const updateLocalAvatar = (base64) => {
    if (base64) {
      localStorage.setItem('local_avatar', base64);
    } else {
      localStorage.removeItem('local_avatar');
    }
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, profile_picture: base64 };
      setCookie('user', JSON.stringify(updated), 7);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout, refreshUser, updateLocalAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
