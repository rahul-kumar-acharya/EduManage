import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import PublicNavbar from '../components/navbar/PublicNavbar';
import Footer from '../components/footer/Footer';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  const location = useLocation();
  const isWideForm = location.pathname.includes('register-school') || location.pathname.includes('login');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-['Inter'] selection:bg-indigo-600 selection:text-white relative">
      {/* Fixed Top Navbar */}
      <PublicNavbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16 flex flex-col justify-start">
        {/* Brand Sub-header for narrow card forms (Forgot/Reset Password) */}
        {!isWideForm && (
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 px-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xl font-semibold text-slate-900 tracking-tight block leading-none">
                  AcharyaCampus
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600 mt-1">
                  School OS Engine
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Dynamic Form Container */}
        <div className={`sm:mx-auto sm:w-full ${isWideForm ? 'max-w-7xl' : 'sm:max-w-md'} px-4 sm:px-6 transition-all`}>
          <div className={isWideForm ? '' : 'bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 shadow-sm'}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default AuthLayout;