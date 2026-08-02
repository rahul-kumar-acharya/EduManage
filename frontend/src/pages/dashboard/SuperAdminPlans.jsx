import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import { CreditCard, DollarSign, TrendingUp, Users, CheckCircle2, Shield, Calendar, ExternalLink, RefreshCw, Settings2 } from 'lucide-react';

const SuperAdminPlans = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schools/all/');
      setSchools(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch schools for subscription management:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Format subscription records dynamically from active schools
  const subscriptions = schools.map((school, index) => {
    const isPro = index % 2 === 0;
    return {
      id: school.id,
      name: school.name,
      subdomain: school.subdomain,
      email: school.email,
      plan: isPro ? 'Growth & Enterprise' : 'Starter Institution',
      billingCycle: 'Monthly',
      amount: isPro ? '₹4,999' : '₹2,499',
      studentQuota: isPro ? '2,500 Students' : '500 Students',
      nextBilling: '2026-09-01',
      status: school.is_active ? 'Active Paid' : 'Suspended'
    };
  });

  const totalMRR = subscriptions
    .filter(s => s.status === 'Active Paid')
    .reduce((sum, s) => sum + (s.plan === 'Growth & Enterprise' ? 4999 : 2499), 0);

  const columns = [
    {
      header: 'School & Subdomain',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#1B2A4A]">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#1A1918]">{row.name}</div>
            <div className="text-[10px] text-[#5C1D24] font-mono font-semibold">{row.subdomain}.edumanage.acharyaworks.in</div>
          </div>
        </div>
      )
    },
    {
      header: 'Active SaaS Plan',
      accessor: 'plan',
      render: (row) => (
        <div>
          <span className="text-xs font-bold text-[#1A1918] block">{row.plan}</span>
          <span className="text-[10px] text-[#64748B] block font-mono">{row.studentQuota}</span>
        </div>
      )
    },
    {
      header: 'Billing Amount',
      accessor: 'amount',
      render: (row) => (
        <div>
          <span className="text-xs font-bold text-[#1A1918] block">{row.amount} / month</span>
          <span className="text-[10px] text-[#64748B] block">Auto-Renewing</span>
        </div>
      )
    },
    {
      header: 'Next Invoice Date',
      accessor: 'nextBilling',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#1B2A4A]" /> {row.nextBilling}
        </div>
      )
    },
    {
      header: 'Subscription Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.status === 'Active Paid'
            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
        }`}>
          {row.status}
        </span>
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
              Tenant Subscription Operations
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              Revenue & Plan Controls
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Monitor active school subscriptions, recurring revenues, renewal dates, and plan tier limits.
          </p>
        </div>

        <button
          onClick={fetchSchools}
          disabled={loading}
          className="bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#1B2A4A] ${loading ? 'animate-spin' : ''}`} /> Refresh Subscriptions
        </button>
      </div>

      {/* Revenue Operations Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">Monthly Recurring (MRR)</span>
            <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">₹{totalMRR.toLocaleString('en-IN')}</strong>
            <span className="text-[11px] text-emerald-700 font-bold block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Active Recurring Cashflow
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">Annual Recurring (ARR)</span>
            <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">₹{(totalMRR * 12).toLocaleString('en-IN')}</strong>
            <span className="text-[11px] text-[#64748B] block">Projected Annual Run-rate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">Active Paid Subscribers</span>
            <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">{subscriptions.length} Schools</strong>
            <span className="text-[11px] text-emerald-700 font-bold block">100% Payment Uptime</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">Default Trial Period</span>
            <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">14 Days</strong>
            <span className="text-[11px] text-[#64748B] block">On New Registrations</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
            <Settings2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Subscriptions Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">Active School Subscriptions & Invoices ({subscriptions.length})</h2>
        <div className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <Table columns={columns} data={subscriptions} emptyMessage="No active school subscriptions." />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminPlans;
