import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PublicNavbar = () => {
  const { isAuthenticated, user } = useAuth();
  // Helper function for active link styling with larger text
  const navLinkStyles = ({ isActive }) =>
    `relative py-1 transition-colors ${
      isActive
        ? 'text-[#1B2A4A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1B2A4A]'
        : 'text-[#64748B] hover:text-[#1B2A4A] font-semibold'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E5E0D8] font-['Plus_Jakarta_Sans'] transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] border border-[#1B2A4A] group-hover:bg-[#5C1D24] transition-colors">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] tracking-tight block leading-none">
              EduManage
            </span>
            <span className="block text-xs uppercase font-bold tracking-widest text-[#5C1D24] mt-1">
              SaaS Engine
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Increased to text-base) */}
        <div className="hidden md:flex items-center gap-8 text-base">
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


        {/* Action Buttons (Increased to text-sm) */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#1A1918]">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-[9px] text-[#5C1D24] uppercase font-bold tracking-wider">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                   user?.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                   user?.role === 'TEACHER' ? 'Faculty' :
                   user?.role === 'ACCOUNTANT' ? 'Billing' :
                   user?.role === 'STUDENT' ? 'Student' :
                   user?.role === 'PARENT' ? 'Parent' : user?.role}
                </div>
              </div>
              <Link to={user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'}>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B2A4A] hover:bg-[#5C1D24] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin Board' : 'Go to Dashboard'}
                </button>
              </Link>

            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E0D8] text-sm font-semibold text-[#1A1918] hover:bg-[#F7F5F0] transition-colors shadow-sm">
                  <LogIn className="w-4 h-4 text-[#1B2A4A]" />
                  Sign In
                </button>
              </Link>

              <Link to="/register-school">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B2A4A] hover:bg-[#5C1D24] text-white text-sm font-semibold transition-colors shadow-sm">
                  <Sparkles className="w-4 h-4" />
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