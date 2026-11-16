import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { schoolService } from '../../services/schoolService';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2,
  Bell
} from 'lucide-react';

const SchoolAdminDashboard = () => {
  const { user } = useAuth();
  const { school } = useSchool();
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    attendance_rate: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await schoolService.getSchoolOverview();
        const overview = data?.overview || data;
        setStats({
          total_students: overview?.total_students ?? 0,
          total_teachers: overview?.total_teachers ?? 0,
          attendance_rate: overview?.overall_attendance_rate ?? overview?.attendance_rate ?? 0,
          total_revenue: overview?.total_revenue ?? 0,
        });
      } catch (err) {
        console.error("Failed to load school overview stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const isFreshTenant = !loading && (stats.total_students === 0 || stats.total_teachers === 0);

  return (
    <div className="space-y-8 font-['Inter'] text-slate-800">

      {/* 1. Header Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || 'Admin'} 👋
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold tracking-wide">
              Active Session
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Here is what is happening at <strong className="text-slate-900">{school?.name || 'Your School'}</strong> today.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/notices"
            className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs text-center"
          >
            <Bell className="w-4 h-4 text-indigo-600" /> Post Notice
          </Link>
          <Link
            to="/dashboard/academics/classes"
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 text-center active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Setup Classes
          </Link>
        </div>
      </div>

      {/* Quick Launch Checklist for Onboarding */}
      {isFreshTenant && (
        <div className="bg-linear-to-br from-indigo-50/70 via-white to-white p-6 sm:p-7 rounded-2xl border border-indigo-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Launch Checklist: Configure Your Workspace
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete these initial steps to prepare your school portal for faculty, students, and parents.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <Link 
              to="/dashboard/academics/sessions" 
              className="p-3.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">1</div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">Academic Sessions</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link 
              to="/dashboard/academics/classes" 
              className="p-3.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">2</div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">Classes & Sections</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link 
              to="/dashboard/teachers" 
              className="p-3.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">3</div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">Add Faculty Staff</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link 
              to="/dashboard/notices" 
              className="p-3.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">4</div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">Notices</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Metric Cards Grid (Clickable to jump directly to management views) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Students',
            value: stats.total_students,
            change: 'Enrolled pupils',
            icon: Users,
            link: '/dashboard/students'
          },
          {
            title: 'Total Teachers',
            value: stats.total_teachers,
            change: 'Active faculty',
            icon: UserCheck,
            link: '/dashboard/teachers'
          },
          {
            title: 'Attendance Rate',
            value: `${stats.attendance_rate}%`,
            change: 'Daily average',
            icon: CalendarCheck,
            link: '/dashboard/attendance'
          },
          {
            title: 'Fee Revenue',
            value: `₹${(stats.total_revenue || 0).toLocaleString('en-IN')}`,
            change: 'Current session',
            icon: Receipt,
            link: '/dashboard/fees'
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-semibold text-slate-900 font-mono">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> {card.change}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Management Modules Quick Access Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">
          Management Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'Academic Classes', desc: 'Manage sessions, grades & sections', count: 'Active', link: '/dashboard/academics/classes' },
            { label: 'Faculty & Staff', desc: 'Teachers & teaching profiles', count: 'Assigned', link: '/dashboard/teachers' },
            { label: 'Accountants Management', desc: 'Manage accountants & billing profiles', count: 'Billing', link: '/dashboard/accountants' },
            { label: 'Notice Board', desc: 'Publish announcements & alerts', count: 'Live', link: '/dashboard/notices' },
          ].map((mod, i) => (
            <Link
              key={i}
              to={mod.link}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {mod.label}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 font-medium">
                <span>Status</span>
                <span className="text-indigo-600 font-semibold">{mod.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SchoolAdminDashboard;
