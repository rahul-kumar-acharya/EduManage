import React from 'react';
import { Activity, Server, Cpu, Database, HardDrive, ShieldCheck, Zap, ArrowUpRight, BarChart3 } from 'lucide-react';

const SuperAdminAnalytics = () => {
  const metrics = [
    { name: 'Database Latency', value: '1.2ms', status: 'Optimal', icon: Database, color: 'text-emerald-600' },
    { name: 'API Server Response', value: '42ms', status: 'Optimal', icon: Server, color: 'text-emerald-600' },
    { name: 'CPU Core Load', value: '14.2%', status: 'Normal', icon: Cpu, color: 'text-blue-600' },
    { name: 'Storage Capacity Used', value: '8.4 GB / 500 GB', status: '1.68%', icon: HardDrive, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900 tracking-tight">
              System Infrastructure Analytics
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> 99.99% SLA Live
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Real-time server metrics, database throughput, storage utilization, and API diagnostics.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block">{m.name}</span>
                <strong className="text-2xl font-['Outfit'] font-bold text-slate-900 block mt-1">{m.value}</strong>
                <span className={`text-[11px] font-semibold block ${m.color}`}>{m.status}</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Infrastructure Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Domain Routing Node Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-['Outfit'] font-bold text-slate-900">Subdomain Routing Engine</h3>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Active Node</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">Primary Edge Host:</span>
              <span className="font-mono text-indigo-600 font-semibold">campus.acharyarahul.in</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">Local Sandbox Alias:</span>
              <span className="font-mono text-slate-800 font-semibold">*.localhost:5173</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">SSL Certificate:</span>
              <span className="font-semibold text-emerald-700">Valid Auto-Renewing TLS v1.3</span>
            </div>
          </div>
        </div>

        {/* Database & Mail Server Diagnostic */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-['Outfit'] font-bold text-slate-900">SMTP Mail Transport & Queues</h3>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Gmail SMTP Live</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">Outbound Address:</span>
              <span className="font-mono text-slate-800 font-semibold">support.acharyacampus@gmail.com</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">SMTP Port & Security:</span>
              <span className="font-mono text-slate-800 font-semibold">587 TLS (smtp.gmail.com)</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">Automated Registration Emails:</span>
              <span className="font-semibold text-emerald-700">Dispatched Live</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminAnalytics;
