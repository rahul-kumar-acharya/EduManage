import React, { useState } from 'react';
import { Settings, Shield, Mail, Lock, Server, Save, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

const SuperAdminSettings = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'AcharyaCampus School OS Engine',
    supportEmail: 'support.acharyacampus@gmail.com',
    defaultTrialDays: '14',
    allowPublicRegistrations: true,
    maintenanceMode: false,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpSecurity: 'TLS'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900 tracking-tight">
              Platform System Settings
            </h1>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold uppercase tracking-wider">
              Global Configuration
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Configure global SaaS branding, registration gates, SMTP mailer settings, and security parameters.
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: General Platform & Support Settings */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-['Outfit'] font-bold text-slate-900">SaaS Branding & Support Configuration</h3>
            <p className="text-xs text-slate-500">Parameters dispatched in automated admin emails & public branding.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Platform System Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Global Support Recipient Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Default Trial Duration (Days)</label>
              <input
                type="number"
                value={settings.defaultTrialDays}
                onChange={(e) => setSettings({ ...settings, defaultTrialDays: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Security & Registration Toggles */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-['Outfit'] font-bold text-slate-900">Registration Gates & Maintenance Controls</h3>
            <p className="text-xs text-slate-500">Control self-service school onboarding and maintenance gates.</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3.5 cursor-pointer p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={settings.allowPublicRegistrations}
                onChange={(e) => setSettings({ ...settings, allowPublicRegistrations: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-0 cursor-pointer accent-indigo-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block font-['Outfit']">Allow Self-Service School Registration</span>
                <span className="text-xs text-slate-500 block">When enabled, visitors can register their school on `/register-school`.</span>
              </div>
            </label>

            <label className="flex items-center gap-3.5 cursor-pointer p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded focus:ring-0 cursor-pointer accent-rose-600"
              />
              <div>
                <span className="text-xs font-bold text-rose-700 block font-['Outfit']">Enable Maintenance Mode</span>
                <span className="text-xs text-slate-500 block">Restricts tenant access while upgrading system database schemas.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-xs shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save System Configuration
          </button>
        </div>

      </form>

    </div>
  );
};

export default SuperAdminSettings;
