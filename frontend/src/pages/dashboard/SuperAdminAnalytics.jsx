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
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              System Infrastructure Analytics
            </h1>
            <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> 99.99% SLA Live
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Real-time server metrics, database throughput, storage utilization, and API diagnostics.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">{m.name}</span>
                <strong className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] block mt-1">{m.value}</strong>
                <span className={`text-[11px] font-bold block ${m.color}`}>{m.status}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Infrastructure Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Domain Routing Node Health */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F7F5F0] pb-3">
            <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918]">Subdomain Routing Engine</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Active Node</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-semibold text-[#1A1918]">Primary Edge Host:</span>
              <span className="font-mono text-[#5C1D24] font-bold">edumanage.acharyaworks.in</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-semibold text-[#1A1918]">Local Sandbox Alias:</span>
              <span className="font-mono text-[#1B2A4A] font-bold">*.localhost:5173</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-semibold text-[#1A1918]">SSL Certificate:</span>
              <span className="font-bold text-emerald-700">Valid Auto-Renewing TLS v1.3</span>
            </div>
          </div>
        </div>

        {/* Database & Mail Server Diagnostic */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F7F5F0] pb-3">
            <h3 className="text-base font-['Newsreader'] font-bold text-[#1A1918]">SMTP Mail Transport & Queues</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Gmail SMTP Live</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-semibold text-[#1A1918]">Outbound Address:</span>
              <span className="font-mono text-[#1A1918] font-bold">support.edumanage@gmail.com</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-semibold text-[#1A1918]">SMTP Port & Security:</span>
              <span className="font-mono text-[#1A1918] font-bold">587 TLS (smtp.gmail.com)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
              <span className="font-semibold text-[#1A1918]">Automated Registration Emails:</span>
              <span className="font-bold text-emerald-700">Dispatched Live</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminAnalytics;
