import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PublicNavbar = () => {
  const { isAuthenticated, user } = useAuth();
  
  const navLinkStyles = ({ isActive }) =>
    `relative py-1 text-sm transition-colors ${
      isActive
        ? 'text-indigo-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
        : 'text-slate-600 hover:text-slate-900 font-medium'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 font-['Inter'] transition-all">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-['Outfit'] font-bold text-slate-900 tracking-tight block leading-none">
              AcharyaCampus
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-indigo-600 mt-1">
              School OS Engine
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkStyles} end>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkStyles}>
            About
          </NavLink>
          <NavLink to="/features" className={navLinkStyles}>
            Features
          </NavLink>
          <NavLink to="/pricing" className={navLinkStyles}>
            Pricing
          </NavLink>
          <NavLink to="/faq" className={navLinkStyles}>
            FAQ
          </NavLink>
          <NavLink to="/contact" className={navLinkStyles}>
            Contact
          </NavLink>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                   user?.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                   user?.role === 'TEACHER' ? 'Faculty' :
                   user?.role === 'ACCOUNTANT' ? 'Billing' :
                   user?.role === 'STUDENT' ? 'Student' :
                   user?.role === 'PARENT' ? 'Parent' : user?.role}
                </div>
              </div>
              <Link to={user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'}>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.99] cursor-pointer">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin Board' : 'Go to Dashboard'}
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs">
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </button>
              </Link>

              <Link to="/register-school">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.99]">
                  
                  Register School
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default PublicNavbar;