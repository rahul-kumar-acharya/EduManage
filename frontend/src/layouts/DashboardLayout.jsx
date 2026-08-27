import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import DashboardNavbar from '../components/navbar/DashboardNavbar';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  FileSpreadsheet,
  Receipt,
  Bell,
  BarChart3,
  CreditCard,
  ChevronDown,
  LogOut,
  School as SchoolIcon,
  Shield,
  X
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { school } = useSchool();
  const location = useLocation();
  
  // Sub-menu & Mobile Sidebar state
  const [academicsOpen, setAcademicsOpen] = useState(true);
  const [feesOpen, setFeesOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAcademicsActive = location.pathname.startsWith('/dashboard/academics');
  const isFeesActive = location.pathname.startsWith('/dashboard/fees');

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex font-['Plus_Jakarta_Sans'] text-[#1A1918] overflow-hidden selection:bg-[#1B2A4A] selection:text-white">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      {/* 1. Sidebar (Fixed Drawer on Mobile, Static w-64 on Desktop) */}
      <aside className={`fixed lg:static inset-y-0 left-0 border-r border-[#E5E0D8] bg-white flex flex-col justify-between transition-transform duration-300 z-50 h-screen w-64 shrink-0 shadow-lg lg:shadow-none ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Sidebar Top: Logo + Navigation Links */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Logo Bar */}
          <div className="p-4 flex items-center justify-between border-b border-[#E5E0D8] h-16 shrink-0 bg-white">
            {school ? (
              <div className="flex items-center gap-3 overflow-hidden truncate">
                <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] shrink-0 border border-[#1B2A4A]">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="text-sm font-['Newsreader'] font-bold text-[#1A1918] truncate leading-tight">{school.name}</h2>
                  <p className="text-[9px] text-[#5C1D24] font-semibold tracking-wider truncate mt-0.5">{school.subdomain}.campus.acharyaworks.in</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#5C1D24]">
                <Shield className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans']">School Portal</span>
              </div>
            )}
            
            {/* Mobile Close Button */}
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Area */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1 select-none">
            
            {/* Group Title: Workspace */}
            <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 mt-2 mb-2">
              School Workspace
            </div>

            <Link
              to="/dashboard"
              onClick={closeMobileSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            {/* Academics Group (School Admin & Teacher) */}
            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'TEACHER') && (
              <div>
                <button
                  onClick={() => setAcademicsOpen(!academicsOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isAcademicsActive
                      ? 'text-[#1B2A4A] bg-[#F7F5F0]'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Academics"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>Academics</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${academicsOpen ? 'rotate-180' : ''}`} />
                </button>

                {academicsOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {user?.role === 'SCHOOL_ADMIN' && (
                      <Link
                        to="/dashboard/academics/sessions"
                        onClick={closeMobileSidebar}
                        className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          location.pathname === '/dashboard/academics/sessions'
                            ? 'text-[#1B2A4A] bg-[#1B2A4A]/10 font-bold'
                            : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        Sessions
                      </Link>
                    )}
                    {user?.role === 'SCHOOL_ADMIN' && (
                      <Link
                        to="/dashboard/academics/classes"
                        onClick={closeMobileSidebar}
                        className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          location.pathname === '/dashboard/academics/classes'
                            ? 'text-[#1B2A4A] bg-[#1B2A4A]/10 font-bold'
                            : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        Classes & Sections
                      </Link>
                    )}
                    <Link
                      to="/dashboard/academics/subjects"
                      onClick={closeMobileSidebar}
                      className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        location.pathname === '/dashboard/academics/subjects'
                          ? 'text-[#1B2A4A] bg-[#1B2A4A]/10 font-bold'
                          : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      Subjects
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Teachers Directory (School Admin Only) */}
            {user?.role === 'SCHOOL_ADMIN' && (
              <Link
                to="/dashboard/teachers"
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/teachers'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Teachers"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Teachers</span>
              </Link>
            )}

            {/* Accountants Directory (School Admin Only) */}
            {user?.role === 'SCHOOL_ADMIN' && (
              <Link
                to="/dashboard/accountants"
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/accountants'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Accountants"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Accountants</span>
              </Link>
            )}

            {/* Students Directory (Teacher & Accountant Only) */}
            {(user?.role === 'TEACHER' || user?.role === 'ACCOUNTANT') && (
              <Link
                to="/dashboard/students"
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/students'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Students Directory"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Students</span>
              </Link>
            )}

            {/* Operations Group (Teacher, Student & Parent) */}
            {(user?.role === 'TEACHER' || user?.role === 'STUDENT' || user?.role === 'PARENT') && (
              <>
                <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 pt-4 mb-2">
                  Class Operations
                </div>

                {/* Attendance */}
                <Link
                  to="/dashboard/attendance"
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/dashboard/attendance')
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Daily Attendance"
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" />
                  <span>Attendance</span>
                </Link>

                {/* Timetable */}
                <Link
                  to="/dashboard/timetable"
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/dashboard/timetable')
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Timetable"
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Timetable</span>
                </Link>

                {/* Homework */}
                <Link
                  to="/dashboard/homework"
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/dashboard/homework')
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Homework"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Homework</span>
                </Link>

                {/* Exams */}
                <Link
                  to="/dashboard/exams"
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/dashboard/exams')
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Exams & Marks"
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>Exams & Marks</span>
                </Link>
              </>
            )}

            {/* Fees Group (Accountant, Student & Parent) */}
            {(user?.role === 'ACCOUNTANT' || user?.role === 'STUDENT' || user?.role === 'PARENT') && (
              <div>
                <button
                  onClick={() => setFeesOpen(!feesOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isFeesActive
                      ? 'text-[#1B2A4A] bg-[#F7F5F0]'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Fees"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 shrink-0" />
                    <span>Fees Management</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${feesOpen ? 'rotate-180' : ''}`} />
                </button>

                {feesOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {user?.role === 'ACCOUNTANT' && (
                      <Link
                        to="/dashboard/fees/structure"
                        onClick={closeMobileSidebar}
                        className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          location.pathname === '/dashboard/fees/structure'
                            ? 'text-[#1B2A4A] bg-[#1B2A4A]/10 font-bold'
                            : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        Fee Structure
                      </Link>
                    )}
                    <Link
                      to="/dashboard/fees/collection"
                      onClick={closeMobileSidebar}
                      className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        location.pathname === '/dashboard/fees/collection'
                          ? 'text-[#1B2A4A] bg-[#1B2A4A]/10 font-bold'
                          : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      {user?.role === 'ACCOUNTANT' ? 'Fee Collection' : 'My Fee Receipts'}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Notice Board (All User Roles) */}
            <Link
              to="/dashboard/notices"
              onClick={closeMobileSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname.startsWith('/dashboard/notices')
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
              }`}
              title="Notices"
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notices</span>
            </Link>

            {/* Analytics & Reports (School Admin & Accountant) */}
            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'ACCOUNTANT') && (
              <Link
                to="/dashboard/reports"
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname.startsWith('/dashboard/reports')
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Reports"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Reports</span>
              </Link>
            )}

            {/* Subscription (School Admin Only) */}
            {user?.role === 'SCHOOL_ADMIN' && (
              <Link
                to="/dashboard/subscription"
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/subscription'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Subscription"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Subscription</span>
              </Link>
            )}

            {/* Settings (All User Roles) */}
            <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 pt-4 mb-2">
              Settings
            </div>
            <Link
              to="/dashboard/profile"
              onClick={closeMobileSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname === '/dashboard/profile'
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
              }`}
              title="Profile Settings"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Profile Settings</span>
            </Link>

          </div>
        </div>

        {/* Sidebar Bottom: User Profile Info Card */}
        <div className="border-t border-[#E5E0D8] p-3 bg-white shrink-0">
          <div className="p-3 bg-[#F7F5F0] rounded-xl select-none">
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <Link to="/dashboard/profile" onClick={closeMobileSidebar} className="flex items-center gap-2 truncate hover:opacity-80 transition-opacity cursor-pointer group" title="Edit Profile Settings">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Avatar"
                    className="w-9 h-9 rounded-lg object-cover border border-[#E5E0D8] shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] border border-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] font-bold text-xs shrink-0 group-hover:bg-[#5C1D24] group-hover:border-[#5C1D24] transition-colors">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="truncate">
                  <div className="text-xs font-bold text-[#1A1918] truncate group-hover:text-[#1B2A4A] transition-colors">{user?.first_name} {user?.last_name}</div>
                  <div className="text-[10px] text-[#64748B] truncate">{user?.email}</div>
                  <div className="text-[9px] text-[#5C1D24] uppercase font-bold tracking-wider truncate">
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                     user?.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                     user?.role === 'TEACHER' ? 'Faculty' :
                     user?.role === 'ACCOUNTANT' ? 'Accountant' :
                     user?.role === 'STUDENT' ? 'Student' :
                     user?.role === 'PARENT' ? 'Parent' : user?.role}
                  </div>
                </div>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-white transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F5F0]">
        
        {/* Top Header/Navbar */}
        <DashboardNavbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Main Workspace Render View */}
        <div className="flex-1 overflow-y-auto w-full">
          <main className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;