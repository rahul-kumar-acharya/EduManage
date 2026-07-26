import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Scale, ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="space-y-16 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#5C1D24]" />
            <span>Legal Framework & SLA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Agreement governing your institution's subscription and use of the EduManage SaaS platform.
          </p>
          <div className="text-xs text-[#64748B] font-mono">
            Effective Date: July 22, 2026
          </div>
        </div>

        {/* Content Body Card */}
        <div className="bg-white p-8 sm:p-12 rounded-xl border border-[#E5E0D8] shadow-sm space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1B2A4A]" /> 1. Acceptance & Tenant Registration
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              By registering your school on EduManage SaaS, you agree to these Terms of Service. As an authorized school administrator, you represent that you have legal authority to bind your educational institution to this agreement.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[#F7F5F0]">
            <h2 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1B2A4A]" /> 2. Platform Usage & Acceptable Conduct
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Subdomains allocated to institutions (e.g. `your-school.edumanage.acharyaworks.in`) are for exclusive educational administration. Institutions are responsible for managing access credentials for teachers, students, parents, and financial accountants, and preventing unauthorized system access.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[#F7F5F0]">
            <h2 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1B2A4A]" /> 3. Subscriptions & Billing
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              EduManage offers a 14-day free trial. Following trial expiration, continued service requires selection of a paid subscription plan (Starter, Growth, or Enterprise). Subscriptions renew automatically per monthly or annual billing cycles unless cancelled prior to renewal.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[#F7F5F0]">
            <h2 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#1B2A4A]" /> 4. Service Availability & Support SLA
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              We target a 99.99% system availability SLA for tenant subdomains. Scheduled maintenance windows are announced at least 48 hours in advance. Support inquiries are responded to within 24 hours via our support engineering team.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
