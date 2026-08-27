import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import PublicNavbar from '../components/navbar/PublicNavbar';
import Footer from '../components/footer/Footer';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  const location = useLocation();
  const isWideForm = location.pathname.includes('register-school') || location.pathname.includes('login');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1A1918] font-['Plus_Jakarta_Sans'] selection:bg-[#1B2A4A] selection:text-white relative">
      {/* Fixed Top Navbar */}
      <PublicNavbar />

      {/* Main Content Area - Standardized Top Padding (pt-28) matching PublicLayout */}
      <main className="flex-1 pt-28 pb-16 flex flex-col justify-start">
        {/* Brand Sub-header for narrow card forms (Forgot/Reset Password) */}
        {!isWideForm && (
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 px-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] border border-[#1B2A4A] group-hover:bg-[#5C1D24] transition-colors shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] tracking-tight block leading-none">
                  AcharyaCampus
                </span>
                <span className="block text-xs uppercase font-bold tracking-widest text-[#5C1D24] mt-1">
                  School OS Engine
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Dynamic Form Container */}
        <div className={`sm:mx-auto sm:w-full ${isWideForm ? 'max-w-7xl' : 'sm:max-w-md'} px-4 sm:px-6 transition-all`}>
          <div className={isWideForm ? '' : 'bg-white py-8 px-6 sm:px-10 rounded-xl border border-[#E5E0D8] shadow-sm'}>
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