import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, CreditCard } from 'lucide-react';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Starter Plan',
      monthlyPrice: '₹0',
      yearlyPrice: '₹0',
      periodMonthly: '14-Day Free Trial',
      periodYearly: '14-Day Free Trial',
      desc: 'Perfect for small schools getting started.',
      features: [
        'Up to 100 Students',
        'Up to 10 Teachers',
        'Attendance & Notices',
        'Basic Report Cards',
        'Custom Subdomain'
      ],
      buttonText: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Growth Plan',
      monthlyPrice: '₹2,999',
      yearlyPrice: '₹28,788',
      periodMonthly: 'per month',
      periodYearly: 'per year',
      desc: 'Ideal for growing K-12 schools.',
      features: [
        'Up to 500 Students',
        'Up to 50 Teachers',
        'Fee Collection & Receipts',
        'Exams & Gradebook',
        'Parent Portal',
        'Priority Support'
      ],
      buttonText: 'Choose Growth',
      highlighted: true,
    },
    {
      name: 'Enterprise Plan',
      monthlyPrice: '₹8,999',
      yearlyPrice: '₹86,388',
      periodMonthly: 'per month',
      periodYearly: 'per year',
      desc: 'For large educational institutions.',
      features: [
        'Up to 5,000 Students',
        'Up to 500 Teachers',
        'Custom Domain Aliases',
        'Advanced Analytics Reports',
        'Dedicated Account Manager',
        'Custom Roles'
      ],
      buttonText: 'Contact Enterprise',
      highlighted: false,
    },
  ];

  return (
    <div className="space-y-20 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-[#5C1D24]" />
            <span>Subscription Plans</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            Simple, Transparent SaaS Pricing
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Start with a 14-day free trial. Upgrade or cancel anytime. No hidden setup fees.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!isYearly ? 'text-[#1A1918]' : 'text-[#64748B]'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-8 bg-[#1B2A4A] rounded-full p-1 transition-colors relative flex items-center focus:outline-none"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-transform transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isYearly ? 'text-[#1A1918]' : 'text-[#64748B]'}`}>
                Yearly Billing
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-[#5C1D24]/10 text-[#5C1D24] rounded-md border border-[#5C1D24]/20">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`bg-white p-8 rounded-xl border flex flex-col justify-between transition-all relative ${
                p.highlighted
                  ? 'border-[#1B2A4A] shadow-md ring-1 ring-[#1B2A4A]'
                  : 'border-[#E5E0D8] shadow-sm'
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#1B2A4A] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" /> Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">{p.name}</h3>
                  <p className="text-[#64748B] text-xs mt-1 leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#1A1918] font-mono">
                    {isYearly ? p.yearlyPrice : p.monthlyPrice}
                  </span>
                  <span className="text-[#64748B] text-xs font-medium">
                    {isYearly ? p.periodYearly : p.periodMonthly}
                  </span>
                </div>

                <ul className="space-y-3 border-t border-[#F7F5F0] pt-6 text-sm text-[#1A1918]">
                  {p.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#1B2A4A] shrink-0" />
                      <span className="text-[#64748B] text-xs sm:text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link to="/register-school">
                  <button
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-xs sm:text-sm transition-colors shadow-sm ${
                      p.highlighted
                        ? 'bg-[#1B2A4A] hover:bg-[#5C1D24] text-white'
                        : 'bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8]'
                    }`}
                  >
                    {p.buttonText}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Pricing;