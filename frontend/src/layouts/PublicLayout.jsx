import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/navbar/PublicNavbar';
import Footer from '../components/footer/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1A1918] selection:bg-[#1B2A4A] selection:text-white font-['Plus_Jakarta_Sans'] relative">
      {/* Fixed Top Navbar */}
      <PublicNavbar />

      {/* Main Content Area - Standardized Top Padding (pt-28) */}
      <main className="flex-1 pt-28 pb-16">
        <Outlet />
      </main>

      {/* Shared Reusable Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;