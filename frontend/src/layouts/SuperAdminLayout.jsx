import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  CreditCard, 
  Users, 
  Activity, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  Search, 
  Bell, 
  Server, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const superAdminNav = [
    { name: 'Tenant Schools', path: '/super-admin', icon: Building2 },
    { name: 'Plans & Subscriptions', path: '/super-admin/plans', icon: CreditCard },
    { name: 'Global Users & Roles', path: '/super-admin/users', icon: Users },
    { name: 'System Analytics', path: '/super-admin/analytics', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex font-['Plus_Jakarta_Sans'] text-[#1A1918] overflow-hidden selection:bg-[#1B2A4A] selection:text-white">
      
      {/* 1. Left Vertical Sidebar (w-64) matching Sketch Column */}
      <aside className="border-r border-[#E5E0D8] bg-white flex flex-col justify-between transition-all duration-300 z-30 h-screen w-64 shrink-0 shadow-sm">
        
        {/* Top-Left Box: Logo + Brand Header (Sketch Top-Left Box) */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          <div className="p-4 flex items-center justify-between border-b border-[#E5E0D8] h-16 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] shrink-0 border border-[#1B2A4A] shadow-sm">
                <GraduationCap className="w-5 h-5 text-[#F7F5F0]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-['Newsreader'] font-bold text-[#1A1918] tracking-tight">EduManage</h2>
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#5C1D24]/10 text-[#5C1D24] text-[9px] font-bold uppercase tracking-wider border border-[#5C1D24]/20">
                  <ShieldCheck className="w-2.5 h-2.5" /> Super Admin
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Nav Items (Sketch Navigation Middle Box) */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1 select-none">
            <div className="text-[10px] uppercase font-bold text-[#5C1D24] tracking-wider px-3 mt-3 mb-2 flex items-center justify-between">
              <span>Platform Control</span>
              <Server className="w-3 h-3 text-[#5C1D24]" />
            </div>

            {superAdminNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1B2A4A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Sidebar Pinned Card (Sketch Bottom Left User Card) */}
          <div className="p-3 border-t border-[#E5E0D8] bg-[#F7F5F0] select-none">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] border border-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] font-bold text-xs shrink-0 shadow-sm">
                  {user?.first_name?.charAt(0) || 'A'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#1A1918] truncate">
                    {user?.first_name || 'Super'} {user?.last_name || 'Admin'}
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">{user?.email || 'admin@edumanage.com'}</div>
                  <div className="text-[9px] text-[#5C1D24] uppercase font-bold tracking-wider">Root Administrator</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-white transition-colors shrink-0 border border-transparent hover:border-[#E5E0D8]"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* 2. Main Right Container (Header + Canvas) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F5F0]">
        
        {/* Top Navigation Header Bar (Sketch Top Header Bar) */}
        <header className="h-16 border-b border-[#E5E0D8] bg-white px-6 flex items-center justify-between sticky top-0 z-20 w-full shrink-0 shadow-xs">
          
          {/* Header Title & Context Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="font-semibold text-[#1A1918]">Super Admin Control</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[#5C1D24] font-medium">
                {location.pathname === '/super-admin' ? 'Tenant Schools' :
                 location.pathname === '/super-admin/plans' ? 'Plans & Subscriptions' :
                 location.pathname === '/super-admin/users' ? 'Global Platform Users' :
                 location.pathname === '/super-admin/analytics' ? 'System Analytics' : 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>SaaS Infrastructure Live</span>
            </div>

            <Link
              to="/"
              className="text-xs font-semibold text-[#1B2A4A] hover:text-[#5C1D24] transition-colors flex items-center gap-1.5 bg-[#F7F5F0] px-3.5 py-1.5 rounded-lg border border-[#E5E0D8]"
            >
              Public Site <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </header>

        {/* Scrollable Main Content Canvas (Sketch Main Canvas Area) */}
        <div className="flex-1 overflow-y-auto w-full">
          <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminLayout;
