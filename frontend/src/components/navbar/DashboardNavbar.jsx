import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Shield, Search, ExternalLink, ChevronRight, School as SchoolIcon } from 'lucide-react';

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const { school } = useSchool();
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path.includes('/academics/sessions')) return 'Academic Sessions';
    if (path.includes('/academics/classes')) return 'Classes & Sections';
    if (path.includes('/academics/subjects')) return 'Subjects Management';
    if (path.includes('/teachers')) return 'Faculty Members';
    if (path.includes('/students')) return 'Students List';
    if (path.includes('/attendance')) return 'Daily Attendance';
    if (path.includes('/homework')) return 'Homework Portal';
    if (path.includes('/timetable')) return 'Class Timetables';
    if (path.includes('/exams')) return 'Exams & Marks';
    if (path.includes('/fees')) return 'Fee Structures & Collection';
    if (path.includes('/notices')) return 'Notice Board';
    if (path.includes('/reports')) return 'Analytics Reports';
    if (path.includes('/profile')) return 'Profile Settings';
    return 'Workspace';
  };

  return (
    <header className="h-16 border-b border-[#E5E0D8] bg-white px-6 flex items-center justify-between sticky top-0 z-20 w-full select-none shrink-0 shadow-xs">
      
      {/* Left: Breadcrumbs & Location */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="font-semibold text-[#1A1918]">{school?.name || 'EduManage'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[#5C1D24] font-medium">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right: Quick Search + User Profile Summary */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative w-64">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
          />
        </div>

        {/* Live Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Active Session</span>
        </div>

        {user && (
          <div className="flex items-center gap-3 border-l border-[#E5E0D8] pl-4">
            <Link to="/dashboard/profile" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer group" title="Edit Profile Settings">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-lg object-cover border border-[#E5E0D8] shadow-sm shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#5C1D24] transition-colors">
                  {user.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#1A1918]">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[10px] text-[#64748B] font-medium">
                  {user.email}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-[10px] font-bold uppercase tracking-wider">
                {user.role === 'SUPER_ADMIN' ? 'Super Admin' :
                 user.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                 user.role === 'TEACHER' ? 'Faculty' :
                 user.role === 'ACCOUNTANT' ? 'Billing' :
                 user.role === 'STUDENT' ? 'Student' :
                 user.role === 'PARENT' ? 'Parent' : user.role}
              </span>
            </Link>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#F7F5F0] transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardNavbar;
