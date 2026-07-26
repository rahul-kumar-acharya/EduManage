import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  Building2, 
  Shield, 
  Plus, 
  ExternalLink, 
  RefreshCw,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schools/all/');
      setSchools(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch all schools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const columns = [
    {
      header: 'School Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">{row.name}</div>
            <div className="text-[10px] text-[#64748B]">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (
        <div className="text-xs text-[#64748B] font-medium">
          {row.city && row.state ? `${row.city}, ${row.state}` : 'Not Specified'}
        </div>
      )
    },
    {
      header: 'Subdomain URL',
      accessor: 'subdomain',
      render: (row) => (
        <a
          href={`http://${row.subdomain}.localhost:5173`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 hover:underline font-bold"
        >
          {row.subdomain}.edumanage.acharyaworks.in <ExternalLink className="w-3 h-3 text-blue-600" />
        </a>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.is_active 
            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
        }`}>
          {row.is_active ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: 'Registration Date',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-xs text-[#64748B] font-mono">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* SuperAdmin Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              SuperAdmin Control Board
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Global SaaS Manager
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Oversee tenant subdomain creations, manage system active quotas, and track MRR growth trends.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchSchools} 
            disabled={loading}
            className="flex-1 sm:flex-none bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#1B2A4A] ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Subdomains', value: `${schools.length} Schools`, desc: 'Registered tenants', icon: Building2 },
          { title: 'Active Tenants', value: `${schools.filter(s => s.is_active).length}`, desc: 'Active sandboxes', icon: Users },
          { title: 'Monthly Projected MRR', value: `₹${(schools.length * 4000).toLocaleString('en-IN')}`, desc: 'Projected cashflow', icon: DollarSign },
          { title: 'System SLA Uptime', value: '99.99%', desc: 'Platform response rate', icon: CreditCard },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">{m.title}</span>
                <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">{m.value}</strong>
                <span className="text-[11px] text-[#64748B] block">{m.desc}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenant table lists */}
      <div className="space-y-4">
        <h2 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">Registered Institutional Tenants ({schools.length})</h2>
        <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <Table columns={columns} data={schools} emptyMessage="No subdomains registered in database." />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
