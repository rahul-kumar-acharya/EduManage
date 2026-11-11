import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight, Menu } from 'lucide-react';

const DashboardNavbar = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { school } = useSchool();
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path.includes('/academics/sessions')) return 'Academic Sessions';
    if (path.includes('/academics/classes')) return 'Classes & Sections';
    if (path.includes('/academics/subjects')) return 'Subjects Management';
    if (path.includes('/teachers')) return 'Faculty Directory';
    if (path.includes('/accountants')) return 'Accountants Directory';
    if (path.includes('/students')) return 'Students List';
    if (path.includes('/attendance')) return 'Daily Attendance';
    if (path.includes('/homework')) return 'Homework Portal';
    if (path.includes('/timetable')) return 'Class Timetables';
    if (path.includes('/exams')) return 'Exams & Marks';
    if (path.includes('/fees')) return 'Fee Collection';
    if (path.includes('/notices')) return 'Notice Board';
    if (path.includes('/reports')) return 'Analytics Reports';
    if (path.includes('/profile')) return 'Profile Settings';
    return 'Workspace';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 w-full select-none shrink-0 shadow-2xs">
      
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          title="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 truncate">
          <span className="font-semibold text-slate-900 truncate max-w-30 sm:max-w-none">{school?.name || 'AcharyaCampus'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-indigo-600 font-medium truncate max-w-32.5 sm:max-w-none">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right: User Profile Summary & Live Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-4">
            <Link to="/dashboard/profile" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer group" title="Edit Profile Settings">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {user.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-slate-900 truncate max-w-35">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate max-w-35">
                  {user.email}
                </div>
              </div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-semibold tracking-normal">
                {user.role === 'SUPER_ADMIN' ? 'Super Admin' :
                 user.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                 user.role === 'TEACHER' ? 'Faculty' :
                 user.role === 'ACCOUNTANT' ? 'Accountant' :
                 user.role === 'STUDENT' ? 'Student' :
                 user.role === 'PARENT' ? 'Parent' : user.role}
              </span>
            </Link>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
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
