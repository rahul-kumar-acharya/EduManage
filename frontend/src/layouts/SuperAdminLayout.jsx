import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import DashboardNavbar from '../components/navbar/DashboardNavbar';
import { Building2, CreditCard, Users, Settings, Activity } from 'lucide-react';

const SuperAdminLayout = () => {
  const location = useLocation();

  const superAdminNav = [
    { name: 'All Schools', path: '/super-admin', icon: Building2 },
    { name: 'Plans & Billing', path: '/super-admin/plans', icon: CreditCard },
    { name: 'Global Users', path: '/super-admin/users', icon: Users },
    { name: 'System Analytics', path: '/super-admin/analytics', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-1">
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 hidden md:flex flex-col gap-1">
          <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider px-3 mb-2">
            SuperAdmin Control Panel
          </div>
          {superAdminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/10 text-purple-300 border border-purple-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
