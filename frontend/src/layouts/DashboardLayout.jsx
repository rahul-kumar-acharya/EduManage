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
  User
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { school } = useSchool();
  const location = useLocation();
  
  // Sub-menu states
  const [academicsOpen, setAcademicsOpen] = useState(true);
  const [feesOpen, setFeesOpen] = useState(true);

  const isAcademicsActive = location.pathname.startsWith('/dashboard/academics');
  const isFeesActive = location.pathname.startsWith('/dashboard/fees');

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex font-['Plus_Jakarta_Sans'] text-[#1A1918] overflow-hidden selection:bg-[#1B2A4A] selection:text-white">
      
      {/* 1. Full-Height Sidebar (Fixed w-64) */}
      <aside className="border-r border-[#E5E0D8] bg-white flex flex-col justify-between transition-all duration-300 z-30 h-screen w-64 shrink-0">
        
        {/* Sidebar Top: Logo + Navigation Links */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-[#E5E0D8] h-16 shrink-0">
            {school ? (
              <div className="flex items-center gap-3 overflow-hidden truncate">
                <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] shrink-0 border border-[#1B2A4A]">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="text-sm font-['Newsreader'] font-bold text-[#1A1918] truncate leading-tight">{school.name}</h2>
                  <p className="text-[10px] text-[#5C1D24] font-semibold tracking-wider truncate mt-0.5">{school.subdomain}.edumanage.com</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#5C1D24]">
                <Shield className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans']">SuperAdmin</span>
              </div>
            )}
          </div>

          {/* Navigation Links Area */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1 select-none">
            
            {/* Group Title: Workspace */}
            <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 mt-2 mb-2">
              School Workspace
            </div>

            <Link
              to="/dashboard"
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

            {/* Academics Group */}
            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER') && (
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
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${academicsOpen ? 'rotate-180' : ''}`} />
                </button>
                {academicsOpen && (
                  <div className="pl-6 pt-1 space-y-1">
                    {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link
                        to="/dashboard/academics/sessions"
                        className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          location.pathname === '/dashboard/academics/sessions'
                            ? 'text-[#1B2A4A] font-bold bg-[#F7F5F0]'
                            : 'text-[#64748B] hover:text-[#1A1918]'
                        }`}
                      >
                        Sessions
                      </Link>
                    )}
                    {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link
                        to="/dashboard/academics/classes"
                        className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          location.pathname === '/dashboard/academics/classes'
                            ? 'text-[#1B2A4A] font-bold bg-[#F7F5F0]'
                            : 'text-[#64748B] hover:text-[#1A1918]'
                        }`}
                      >
                        Classes & Sections
                      </Link>
                    )}
                    {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER') && (
                      <Link
                        to="/dashboard/academics/subjects"
                        className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          location.pathname === '/dashboard/academics/subjects'
                            ? 'text-[#1B2A4A] font-bold bg-[#F7F5F0]'
                            : 'text-[#64748B] hover:text-[#1A1918]'
                        }`}
                      >
                        Subjects
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER') && (
              <Link
                to="/dashboard/teachers"
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

            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <Link
                to="/dashboard/accountants"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/accountants'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Accountants"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Accountants</span>
              </Link>
            )}

            {user?.role !== 'SCHOOL_ADMIN' && user?.role !== 'ACCOUNTANT' && (
              <Link
                to="/dashboard/students"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/students'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Students"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Students</span>
              </Link>
            )}

            {/* Group Title: Operations */}
            <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 mt-4 mb-2">
              Operations
            </div>

            {user?.role !== 'SCHOOL_ADMIN' && user?.role !== 'ACCOUNTANT' && (
              <Link
                to="/dashboard/timetable"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/timetable'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Timetable"
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Timetable</span>
              </Link>
            )}

            {user?.role !== 'SCHOOL_ADMIN' && user?.role !== 'ACCOUNTANT' && (
              <Link
                to="/dashboard/attendance"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/attendance'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Attendance"
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                <span>Attendance</span>
              </Link>
            )}
            
            {user?.role !== 'SCHOOL_ADMIN' && user?.role !== 'ACCOUNTANT' && (
              <Link
                to="/dashboard/homework"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/dashboard/homework'
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Homework"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Homework</span>
              </Link>
            )}

            {user?.role !== 'SCHOOL_ADMIN' && user?.role !== 'ACCOUNTANT' && (
              <Link
                to="/dashboard/exams"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname.startsWith('/dashboard/exams')
                    ? 'bg-[#1B2A4A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                }`}
                title="Exams & Gradebook"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Exams & Gradebook</span>
              </Link>
            )}

            {/* Fees Group */}
            {(user?.role === 'ACCOUNTANT' || user?.role === 'SUPER_ADMIN') && (
              <div>
                <button
                  onClick={() => setFeesOpen(!feesOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isFeesActive
                      ? 'text-[#1B2A4A] bg-[#F7F5F0]'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Fees & Billing"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 shrink-0" />
                    <span>Fees & Billing</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${feesOpen ? 'rotate-180' : ''}`} />
                </button>
                {feesOpen && (
                  <div className="pl-6 pt-1 space-y-1">
                    <Link
                      to="/dashboard/fees/structures"
                      className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        location.pathname === '/dashboard/fees/structures' || location.pathname === '/dashboard/fees'
                          ? 'text-[#1B2A4A] font-bold bg-[#F7F5F0]'
                          : 'text-[#64748B] hover:text-[#1A1918]'
                      }`}
                    >
                      Structures
                    </Link>
                    <Link
                      to="/dashboard/fees/collection"
                      className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        location.pathname === '/dashboard/fees/collection'
                          ? 'text-[#1B2A4A] font-bold bg-[#F7F5F0]'
                          : 'text-[#64748B] hover:text-[#1A1918]'
                      }`}
                    >
                      Collect Fee
                    </Link>
                    <Link
                      to="/dashboard/fees/dues"
                      className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        location.pathname === '/dashboard/fees/dues'
                          ? 'text-[#1B2A4A] font-bold bg-[#F7F5F0]'
                          : 'text-[#64748B] hover:text-[#1A1918]'
                      }`}
                    >
                      Due Balances
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/dashboard/notices"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname === '/dashboard/notices'
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
              }`}
              title="Notices"
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notices</span>
            </Link>

            {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <>
                <Link
                  to="/dashboard/reports"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/dashboard/reports'
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                  title="Reports"
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Reports</span>
                </Link>

                <Link
                  to="/dashboard/subscription"
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
              </>
            )}

            {/* Group Title: Settings */}
            <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 mt-4 mb-2">
              Settings
            </div>

            <Link
              to="/dashboard/profile"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname === '/dashboard/profile'
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
              }`}
              title="Profile Settings"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>

        {/* 2. Sidebar Bottom Wrapper (Profile/Logout) */}
        <div className="shrink-0 bg-white border-t border-[#E5E0D8]">
          {/* Sidebar Bottom: User Profile / Log Out Block */}
          <div className="p-3 bg-[#F7F5F0] select-none">
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <Link to="/dashboard/profile" className="flex items-center gap-2 truncate hover:opacity-80 transition-opacity cursor-pointer group" title="Edit Profile Settings">
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
                     user?.role === 'ACCOUNTANT' ? 'Billing' :
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

      {/* 2. Right-Hand Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F5F0]">
        
        {/* Top Header/Navbar */}
        <DashboardNavbar />

        {/* Main Workspace Render View */}
        <div className="flex-1 overflow-y-auto w-full">
          <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;