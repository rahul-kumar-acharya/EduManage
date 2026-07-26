import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSchool } from '../../contexts/SchoolContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Bell
} from 'lucide-react';

const SchoolAdminDashboard = () => {
  const { school } = useSchool();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    attendance_rate: 96.2,
    total_revenue: 12500,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/reports/overview/');
        if (res.data && res.data.overview) {
          setStats({
            total_students: res.data.overview.total_students ?? 0,
            total_teachers: res.data.overview.total_teachers ?? 0,
            attendance_rate: res.data.overview.overall_attendance_rate ?? 95.0,
            total_revenue: res.data.overview.total_revenue ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">

      {/* 1. Header Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Welcome back, {user?.first_name || 'Admin'} 👋
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Phase 1 Active
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Here is what is happening at <strong className="text-[#1A1918]">{school?.name || 'Your School'}</strong> today.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/notices"
            className="flex-1 sm:flex-none bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Bell className="w-4 h-4 text-[#1B2A4A]" /> Post Notice
          </Link>
          <Link
            to="/dashboard/academics/classes"
            className="flex-1 sm:flex-none bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Plus className="w-4 h-4" /> Setup Classes
          </Link>
        </div>
      </div>

      {/* 2. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Students',
            value: stats.total_students,
            change: '+12% this month',
            icon: Users
          },
          {
            title: 'Total Teachers',
            value: stats.total_teachers,
            change: 'Active faculty',
            icon: UserCheck
          },
          {
            title: 'Attendance Rate',
            value: `${stats.attendance_rate}%`,
            change: 'Daily average',
            icon: CalendarCheck
          },
          {
            title: 'Fee Revenue',
            value: `₹${(stats.total_revenue || 0).toLocaleString('en-IN')}`,
            change: 'Current session',
            icon: Receipt
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  {card.title}
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
                  {card.value}
                </div>
                <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1B2A4A]" /> {card.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Management Modules Quick Access Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-['Newsreader'] font-bold text-[#1A1918]">
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
              className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-sm hover:border-[#1B2A4A] transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1918] group-hover:text-[#1B2A4A] transition-colors">
                    {mod.label}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1B2A4A] transition-colors" />
                </div>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] border-t border-[#F7F5F0] pt-3 font-medium">
                <span>Status</span>
                <span className="text-[#1B2A4A] font-semibold">{mod.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SchoolAdminDashboard;