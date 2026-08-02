import React, { useState } from 'react';
import { CreditCard, Check, Plus, Shield, Zap, Sparkles, Building2, TrendingUp } from 'lucide-react';

const SuperAdminPlans = () => {
  const [activeTab, setActiveTab] = useState('monthly');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Institution',
      priceMonthly: '₹2,499',
      priceAnnual: '₹24,990',
      popular: false,
      description: 'Ideal for small schools & early-stage institutions up to 500 students.',
      features: [
        'Up to 500 Students & 50 Faculty',
        'Core Academics & Attendance Management',
        'Basic Fee Collection & Digital Receipts',
        'Standard Email Notifications',
        'Subdomain SSL Security (.edumanage.com)',
        'Standard Email Support (24h SLA)',
      ]
    },
    {
      id: 'pro',
      name: 'Growth & Enterprise',
      priceMonthly: '₹4,999',
      priceAnnual: '₹49,990',
      popular: true,
      description: 'Comprehensive operating system for growing schools with up to 2,500 students.',
      features: [
        'Up to 2,500 Students & Unlimited Faculty',
        'Advanced Exam Gradebooks & Report Cards',
        'Homework & Parent Portal Mobile Support',
        'Custom Domain Binding (e.g. school.com)',
        'Automated SMS & WhatsApp Alerts',
        'Priority Phone & Email Support (2h SLA)',
        'Full Financial Reports & Due Fees Analytics',
      ]
    },
    {
      id: 'custom',
      name: 'Multi-Campus Network',
      priceMonthly: '₹9,999',
      priceAnnual: '₹99,990',
      popular: false,
      description: 'Dedicated infrastructure for large school chains & multi-branch groups.',
      features: [
        'Unlimited Students across Multiple Campuses',
        'Dedicated Isolated Database Instances',
        'Custom SSO & ERP Integrations',
        'Dedicated Account Manager & SLA Guarantee',
        'Custom Feature Development & Training',
        '24/7 Priority Emergency Support',
      ]
    }
  ];

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
              Plans & Subscription Billing
            </h1>
            <span className="px-3 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-xs font-semibold uppercase tracking-wider">
              SaaS Monetization
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Manage multi-tenant subscription tiers, pricing structures, and feature allocations.
          </p>
        </div>

        {/* Toggle Monthly / Annual */}
        <div className="flex items-center gap-2 p-1 bg-[#F7F5F0] rounded-xl border border-[#E5E0D8]">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'monthly'
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#1A1918]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setActiveTab('annual')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'annual'
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#1A1918]'
            }`}
          >
            Annual Billing <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono uppercase">2 Months Free</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 sm:p-8 border flex flex-col justify-between space-y-6 relative transition-all ${
              plan.popular
                ? 'border-[#1B2A4A] ring-2 ring-[#1B2A4A]/10 shadow-md'
                : 'border-[#E5E0D8] shadow-sm hover:border-[#1B2A4A]/40'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1B2A4A] text-white text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-300" /> Most Popular Tier
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-['Newsreader'] font-bold text-[#1A1918]">{plan.name}</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{plan.description}</p>
              </div>

              <div className="pt-2">
                <span className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
                  {activeTab === 'monthly' ? plan.priceMonthly : plan.priceAnnual}
                </span>
                <span className="text-xs text-[#64748B] font-medium ml-1">
                  /{activeTab === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#F7F5F0]">
                <div className="text-xs font-bold text-[#1A1918] uppercase tracking-wider">Features Included:</div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#64748B]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                plan.popular
                  ? 'bg-[#1B2A4A] hover:bg-[#5C1D24] text-white shadow-sm'
                  : 'bg-[#F7F5F0] hover:bg-[#1B2A4A] text-[#1B2A4A] hover:text-white border border-[#E5E0D8]'
              }`}
            >
              Configure Tier Limits
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default SuperAdminPlans;
