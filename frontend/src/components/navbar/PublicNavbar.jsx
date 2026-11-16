import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PublicNavbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinkStyles = ({ isActive }) =>
    `relative py-1 text-sm transition-colors ${
      isActive
        ? 'text-indigo-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
        : 'text-slate-600 hover:text-slate-900 font-medium'
    }`;

  const mobileNavLinkStyles = ({ isActive }) =>
    `block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 font-['Inter'] transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 tracking-tight block leading-none">
              AcharyaCampus
            </span>
            <span className="block text-[8px] sm:text-[10px] uppercase font-semibold tracking-wider text-indigo-600 mt-0.5 sm:mt-1">
              School OS Engine
            </span>
          </div>
        </Link>

        {/* Desktop Center Navigation Links */}
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

        {/* Action Buttons & Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
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
                <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.99] cursor-pointer">
                  {user?.role === 'SUPER_ADMIN' ? 'Admin Board' : 'Dashboard'}
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex">
                <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer">
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </button>
              </Link>

              <Link to="/register-school">
                <button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.99] cursor-pointer">
                  <span className="hidden sm:inline">Register School</span>
                  <span className="inline sm:hidden">Register</span>
                </button>
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <NavLink to="/" onClick={closeMenu} className={mobileNavLinkStyles} end>
            Home
          </NavLink>
          <NavLink to="/about" onClick={closeMenu} className={mobileNavLinkStyles}>
            About
          </NavLink>
          <NavLink to="/features" onClick={closeMenu} className={mobileNavLinkStyles}>
            Features
          </NavLink>
          <NavLink to="/pricing" onClick={closeMenu} className={mobileNavLinkStyles}>
            Pricing
          </NavLink>
          <NavLink to="/faq" onClick={closeMenu} className={mobileNavLinkStyles}>
            FAQ
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu} className={mobileNavLinkStyles}>
            Contact
          </NavLink>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={closeMenu} className="w-full">
                <button className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In to Portal
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
