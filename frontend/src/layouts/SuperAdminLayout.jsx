import React, { useState } from 'react';
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
  Server, 
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Settings,
  Menu,
  X
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const mainNav = [
    { name: 'Tenant Schools', path: '/super-admin', icon: Building2 },
    { name: 'Plans & Subscriptions', path: '/super-admin/plans', icon: CreditCard },
  ];

  const platformNav = [
    { name: 'Global Users & Roles', path: '/super-admin/users', icon: Users },
    { name: 'Contact Inquiries', path: '/super-admin/inquiries', icon: MessageSquare },
    { name: 'System Analytics', path: '/super-admin/analytics', icon: Activity },
    { name: 'Platform Settings', path: '/super-admin/settings', icon: Settings },
  ];

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Inter'] text-slate-800 overflow-hidden selection:bg-indigo-600 selection:text-white">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      {/* 1. Left Vertical Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 border-r border-slate-200 bg-white flex flex-col justify-between transition-transform duration-300 z-50 h-screen w-64 shrink-0 shadow-lg lg:shadow-none ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top-Left Box: Logo + Brand Header */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          <div className="p-4 flex items-center justify-between border-b border-slate-200 h-16 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-['Outfit'] font-bold text-slate-900 tracking-tight">AcharyaCampus</h2>
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200/80">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" /> Super Admin
                </div>
              </div>
            </div>
            
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <div className="p-3 space-y-4 overflow-y-auto flex-1 select-none">
            
            {/* Section 1: Main Control */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-1.5 flex items-center justify-between">
                <span>Tenant Operations</span>
                <Server className="w-3 h-3 text-slate-400" />
              </div>
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Section 2: Platform Settings & Management */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-1.5 flex items-center justify-between">
                <span>Platform Governance</span>
                <ShieldCheck className="w-3 h-3 text-slate-400" />
              </div>
              {platformNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

          </div>

          {/* User Profile Footer Card */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 overflow-hidden select-none">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
                  {user?.first_name?.charAt(0) || 'A'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {user?.first_name || 'Super'} {user?.last_name || 'Admin'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@acharyacampus.com'}</div>
                  <div className="text-[9px] text-indigo-600 uppercase font-bold tracking-wider">Root Administrator</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* 2. Main Right Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 w-full shrink-0 shadow-2xs">
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 truncate">
              <span className="font-bold text-slate-900 font-['Outfit'] truncate">Super Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-indigo-600 font-medium truncate">
                {location.pathname === '/super-admin' ? 'Tenant Schools' :
                 location.pathname === '/super-admin/plans' ? 'Plans & Subscriptions' :
                 location.pathname === '/super-admin/users' ? 'Global Platform Users' :
                 location.pathname === '/super-admin/inquiries' ? 'Contact Inquiries' :
                 location.pathname === '/super-admin/analytics' ? 'System Analytics' :
                 location.pathname === '/super-admin/settings' ? 'Platform Settings' : 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SaaS Infrastructure Live</span>
            </div>

            <Link
              to="/"
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 shadow-2xs"
            >
              Public Site <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </header>

        {/* Scrollable Main Content Canvas */}
        <div className="flex-1 overflow-y-auto w-full">
          <main className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminLayout;
