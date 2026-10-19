import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Scale, ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="space-y-16 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Legal Framework & SLA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-['Outfit'] font-bold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Agreement governing your institution's subscription and use of the AcharyaCampus OS platform.
          </p>
          <div className="text-xs text-slate-400 font-mono">
            Effective Date: July 22, 2026
          </div>
        </div>

        {/* Content Body Card */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-2xs space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-['Outfit'] font-bold text-slate-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 1. Acceptance & Tenant Registration
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              By registering your school on AcharyaCampus OS, you agree to these Terms of Service. As an authorized school administrator, you represent that you have legal authority to bind your educational institution to this agreement.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-['Outfit'] font-bold text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> 2. Platform Usage & Acceptable Conduct
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Subdomains allocated to institutions (e.g. `your-school.campus.acharyarahul.in`) are for exclusive educational administration. Institutions are responsible for managing access credentials for teachers, students, parents, and financial accountants, and preventing unauthorized system access.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-['Outfit'] font-bold text-slate-900 flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-indigo-600" /> 3. Subscriptions & Billing
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              AcharyaCampus offers a 14-day free trial. Following trial expiration, continued service requires selection of a paid subscription plan (Starter, Growth, or Enterprise). Subscriptions renew automatically per monthly or annual billing cycles unless cancelled prior to renewal.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-['Outfit'] font-bold text-slate-900 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-indigo-600" /> 4. Service Availability & Support SLA
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We target a 99.99% system availability SLA for tenant subdomains. Scheduled maintenance windows are announced at least 48 hours in advance. Support inquiries are responded to within 24 hours via our support engineering team.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
