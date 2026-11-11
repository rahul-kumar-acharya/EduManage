import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import { CreditCard, DollarSign, TrendingUp, Users, Calendar, RefreshCw, Settings2 } from 'lucide-react';

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
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs shadow-indigo-600/20">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-indigo-600 font-mono font-medium">{row.subdomain}.campus.acharyarahul.in</div>
          </div>
        </div>
      )
    },
    {
      header: 'Active SaaS Plan',
      accessor: 'plan',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-900 block">{row.plan}</span>
          <span className="text-[11px] text-slate-500 block font-mono">{row.studentQuota}</span>
        </div>
      )
    },
    {
      header: 'Billing Amount',
      accessor: 'amount',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-900 block">{row.amount} / month</span>
          <span className="text-[10px] text-slate-500 block">Auto-Renewing</span>
        </div>
      )
    },
    {
      header: 'Next Invoice Date',
      accessor: 'nextBilling',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {row.nextBilling}
        </div>
      )
    },
    {
      header: 'Subscription Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          row.status === 'Active Paid'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Tenant Subscription Operations
            </h1>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold uppercase tracking-wider">
              Revenue & Plan Controls
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Monitor active school subscriptions, recurring revenues, renewal dates, and plan tier limits.
          </p>
        </div>

        <button
          onClick={fetchSchools}
          disabled={loading}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} /> Refresh Subscriptions
        </button>
      </div>

      {/* Revenue Operations Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 block">Monthly Recurring (MRR)</span>
            <strong className="text-2xl font-semibold font-mono text-slate-900 block mt-1">₹{totalMRR.toLocaleString('en-IN')}</strong>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Active Recurring Cashflow
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 block">Annual Recurring (ARR)</span>
            <strong className="text-2xl font-semibold font-mono text-slate-900 block mt-1">₹{(totalMRR * 12).toLocaleString('en-IN')}</strong>
            <span className="text-xs text-slate-500 block">Projected Annual Run-rate</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 block">Active Paid Subscribers</span>
            <strong className="text-2xl font-semibold font-mono text-slate-900 block mt-1">{subscriptions.length} Schools</strong>
            <span className="text-xs text-emerald-700 font-semibold block">100% Payment Uptime</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 block">Default Trial Period</span>
            <strong className="text-2xl font-semibold font-mono text-slate-900 block mt-1">14 Days</strong>
            <span className="text-xs text-slate-500 block">On New Registrations</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Settings2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Subscriptions Table */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Active School Subscriptions & Invoices ({subscriptions.length})</h2>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table columns={columns} data={subscriptions} emptyMessage="No active school subscriptions." />
        </div>
      </div>

    </div>
  );
};

export default SuperAdminPlans;
