import React, { useState } from 'react';
import { Users, Shield, Plus, Mail, CheckCircle2, UserCheck, ShieldAlert, KeyRound, Search, Lock } from 'lucide-react';
import Table from '../../components/ui/Table';

const SuperAdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Platform Root Administrators List
  const adminUsers = [
    {
      id: 1,
      name: 'Rahul Kumar Acharya',
      email: 'admin@gmail.com',
      role: 'SUPER_ADMIN',
      status: 'Active',
      lastLogin: '2026-08-01 21:07:21',
      accessLevel: 'Root Owner / Infrastructure Control'
    },
    {
      id: 2,
      name: 'EduManage Support Desk',
      email: 'support.edumanage@gmail.com',
      role: 'SUPER_ADMIN',
      status: 'Active',
      lastLogin: '2026-07-30 18:04:12',
      accessLevel: 'System Operations & Ticketing'
    }
  ];

  const columns = [
    {
      header: 'Administrator Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#1B2A4A]">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">{row.name}</div>
            <div className="text-[10px] text-[#64748B] font-mono">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'System Privileges',
      accessor: 'accessLevel',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#5C1D24]" />
          <span className="text-xs font-semibold text-[#1A1918]">{row.accessLevel}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {row.status}
        </span>
      )
    },
    {
      header: 'Last Portal Access',
      accessor: 'lastLogin',
      render: (row) => (
        <span className="text-xs text-[#64748B] font-mono">{row.lastLogin}</span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Global Platform Users & Roles
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Root Access Control
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Manage super administrative personnel, security permissions, and audit logs.
          </p>
        </div>

        <button className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Provision Admin User
        </button>
      </div>

      {/* Users List Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">Active Platform Administrators ({adminUsers.length})</h2>
          
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admin user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E0D8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <Table columns={columns} data={adminUsers} emptyMessage="No administrative users found." />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminUsers;
