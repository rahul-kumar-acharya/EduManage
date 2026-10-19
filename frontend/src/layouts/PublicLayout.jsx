import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/navbar/PublicNavbar';
import Footer from '../components/footer/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 selection:bg-indigo-600 selection:text-white font-['Inter'] relative">
      {/* Fixed Top Navbar */}
      <PublicNavbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16">
        <Outlet />
      </main>

      {/* Shared Reusable Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;