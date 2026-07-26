import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-20 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <Mail className="w-4 h-4 text-[#5C1D24]" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            Get in Touch
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Have questions about our multi-tenant SaaS platform? Our support engineering team is here to help.
          </p>
        </div>

        {/* Grid Section with Equal Height Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Contact Information Card (Equal Height) */}
          <div className="bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">
                  Contact Information
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Reach out to our dedicated team for platform onboarding, technical support, or custom domain routing assistance.
                </p>
              </div>

              {/* Direct Channels */}
              <div className="space-y-3 text-sm text-[#1A1918]">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <Mail className="w-5 h-5 text-[#1B2A4A] shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">support@xyz.com</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <Phone className="w-5 h-5 text-[#1B2A4A] shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">+1 (800) 555-EDU1</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <MapPin className="w-5 h-5 text-[#1B2A4A] shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">100 SaaS Way, San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Added Content: Support Hours & Rapid Onboarding Note */}
            <div className="pt-4 border-t border-[#F7F5F0] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1B2A4A]">
                <Clock className="w-4 h-4 text-[#5C1D24]" />
                <span>Support Availability: Mon – Sat (24/6 SLA)</span>
              </div>
              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8] flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#1B2A4A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Need instant setup? Claiming a subdomain takes under 2 minutes through our automated registration portal.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Card (Equal Height) */}
          <div className="bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between">
            {submitted ? (
              <div className="text-center py-12 space-y-4 my-auto">
                <div className="w-12 h-12 rounded-full bg-[#1B2A4A]/10 border border-[#1B2A4A]/20 text-[#1B2A4A] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-[#64748B] max-w-xs mx-auto">
                  Thank you for reaching out. Our support engineering team will get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-[#1B2A4A] hover:text-[#5C1D24] underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help your school?"
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1B2A4A] hover:bg-[#5C1D24] text-white text-sm font-semibold py-3.5 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;