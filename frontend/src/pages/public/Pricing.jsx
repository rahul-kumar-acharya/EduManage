import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, CreditCard } from 'lucide-react';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      id: 'starter',
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
      id: 'growth',
      name: 'Growth Plan',
      monthlyPrice: '₹2,999',
      yearlyPrice: '₹28,788',
      periodMonthly: 'per month',
      periodYearly: 'per year',
      desc: 'Ideal for growing K-12 institutions.',
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
      id: 'enterprise',
      name: 'Enterprise Plan',
      monthlyPrice: '₹8,999',
      yearlyPrice: '₹86,388',
      periodMonthly: 'per month',
      periodYearly: 'per year',
      desc: 'For large educational institutions & chains.',
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
    <div className="space-y-20 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Subscription Plans</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            Simple, Transparent SaaS Pricing
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Start with a 14-day free trial. Upgrade or cancel anytime. No hidden setup fees.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-8 bg-indigo-600 rounded-full p-1 transition-colors relative flex items-center focus:outline-none cursor-pointer"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-transform transform shadow-sm ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly Billing
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80">
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
              className={`bg-white p-8 rounded-2xl border flex flex-col justify-between transition-all relative ${
                p.highlighted
                  ? 'border-indigo-600 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-600'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-indigo-600/25">
                  <Sparkles className="w-3.5 h-3.5 text-white" /> Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{p.name}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-semibold text-slate-900 font-mono">
                    {isYearly ? p.yearlyPrice : p.monthlyPrice}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">
                    {isYearly ? p.periodYearly : p.periodMonthly}
                  </span>
                </div>

                <ul className="space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                  {p.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-slate-600 text-xs sm:text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link to={`/register-school?plan=${p.id}`}>
                  <button
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99] cursor-pointer ${
                      p.highlighted
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs'
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