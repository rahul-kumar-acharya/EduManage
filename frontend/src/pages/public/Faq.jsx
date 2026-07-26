import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck, Sparkles, Building2, CreditCard } from 'lucide-react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      category: 'General & Architecture',
      icon: Building2,
      questions: [
        {
          q: 'What is EduManage Multi-Tenant School OS?',
          a: 'EduManage is an enterprise multi-tenant SaaS platform that provides dedicated isolated portals for schools. Each school operates on its own subdomain (e.g. stmarys.xyz.com) with separate data stores, role-based access, student admissions, attendance, digital gradebooks, and online fee collection.'
        },
        {
          q: 'How does custom subdomain provisioning work?',
          a: 'When you register your school, our automated engine instantly provisions a dedicated tenant instance bound to your subdomain. All HTTP requests are automatically filtered at the database level to guarantee 100% tenant isolation.'
        },
        {
          q: 'Is there a free trial available?',
          a: 'Yes! Every newly registered school gets a 14-day full-featured free trial. No credit card is required during signup, and setup takes less than 60 seconds.'
        }
      ]
    },
    {
      category: 'Security & Data Privacy',
      icon: ShieldCheck,
      questions: [
        {
          q: 'How secure is our school and student data?',
          a: 'We implement bank-grade AES-256 data encryption and strict row-level security middleware. Data from one school cannot be accessed or viewed by users from another tenant school under any circumstances.'
        },
        {
          q: 'Are automated backups included?',
          a: 'Yes. Daily automated database snapshots are taken and encrypted. School administrators can request instant data exports at any time.'
        }
      ]
    },
    {
      category: 'Billing & Fee Collection',
      icon: CreditCard,
      questions: [
        {
          q: 'How does student fee collection work?',
          a: 'School administrators can configure custom fee structures (Tuition Fee, Transport Fee, Exam Fee). Parents and students can view pending dues online, make payments, and generate official printable PDF receipts with unique receipt tracking numbers.'
        },
        {
          q: 'What payment methods are supported?',
          a: 'We support major credit/debit cards, net banking, UPI, and manual cash receipt logging by school accountants.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-16 font-['Plus_Jakarta_Sans']">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#5C1D24]" />
            <span>Help Center & Knowledge Base</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Have questions about subdomain routing, multi-tenant security, or fee collection? Find clear answers below.
          </p>
        </div>

        {/* FAQ Accordions grouped by Category */}
        <div className="space-y-10">
          {faqCategories.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <div key={catIdx} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3">
                  <Icon className="w-5 h-5 text-[#1B2A4A]" />
                  <h2 className="text-xl font-['Newsreader'] font-bold text-[#1A1918]">
                    {cat.category}
                  </h2>
                </div>

                <div className="space-y-3">
                  {cat.questions.map((item, qIdx) => {
                    const uniqueId = `${catIdx}-${qIdx}`;
                    const isOpen = openIndex === uniqueId;
                    return (
                      <div key={qIdx} className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden transition-all">
                        <button
                          onClick={() => toggleFaq(uniqueId)}
                          className="w-full text-left p-5 flex items-center justify-between font-['Newsreader'] font-semibold text-[#1A1918] text-base sm:text-lg hover:bg-[#F7F5F0]/50 transition-colors"
                        >
                          <span>{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#F7F5F0] pt-3">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-white p-8 rounded-xl border border-[#E5E0D8] text-center space-y-4 shadow-sm">
          <h3 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">
            Still Have Questions?
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            Can't find what you're looking for? Contact our dedicated support engineering team for assistance.
          </p>
          <div className="pt-2">
            <RouterLink to="/contact">
              <button className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2">
                Contact Support Desk <ArrowRight className="w-4 h-4" />
              </button>
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Faq;
