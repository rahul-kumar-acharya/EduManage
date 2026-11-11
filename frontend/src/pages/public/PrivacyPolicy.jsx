import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Server } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="space-y-16 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Data Privacy & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            How AcharyaCampus safeguards multi-tenant student records, staff details, and financial data.
          </p>
          <div className="text-xs text-slate-400 font-mono">
            Last Updated: August 16, 2026
          </div>
        </div>

        {/* Content Body Card */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-2xs space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-indigo-600" /> 1. Multi-Tenant Data Isolation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              AcharyaCampus operates on a strict multi-tenant architecture. Every registered educational institution is assigned an isolated database tenant scope bound to its specific subdomain. Data belonging to your school is strictly segregated and cannot be queried or viewed by users from other institutions.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-indigo-600" /> 2. Information We Collect
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We collect information necessary to deliver educational administration services, including:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1.5 pl-2">
              <li>School administrative contact details and subdomain preferences</li>
              <li>Teacher, student, and parent profile information (names, emails, admission IDs)</li>
              <li>Academic marks, daily attendance records, and fee payment receipts</li>
              <li>Technical usage logs for security auditing and diagnostic performance</li>
            </ul>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-600" /> 3. Data Storage & Encryption
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              All student records and administrative credentials are encrypted at rest using AES-256 standards and in transit using TLS 1.3 encryption. Database backups are snapshot automated daily and stored in secure, redundant cloud vaults.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <Server className="w-4 h-4 text-indigo-600" /> 4. Data Ownership & Export
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your institution retains full ownership of all uploaded academic and financial data. School administrators may request full JSON/CSV data exports or complete account deletion at any time by contacting support.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
