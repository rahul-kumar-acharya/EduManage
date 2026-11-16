import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { schoolService } from '../../services/schoolService';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await schoolService.submitContactForm(formData);
      setResponseMsg(res.message || 'Message sent successfully!');
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit contact message:", err);
      setErrorMsg(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            Have questions about our multi-tenant SaaS platform? Our support engineering team is here to help.
          </p>
        </div>

        {/* Grid Section with Equal Height Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Contact Information Card */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                  Contact Information
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Reach out to our dedicated team for platform onboarding, technical support, or custom domain routing assistance.
                </p>
              </div>

              {/* Direct Channels */}
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                  <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 break-all sm:break-normal">support.acharyacampus@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Phone className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-900">+91 7061638189</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-900">Purnia, Bihar</span>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Support Availability: Mon – Sat (24/6 SLA)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Need instant setup? Claiming a subdomain takes under 2 minutes through our automated registration portal.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            {submitted ? (
              <div className="text-center py-12 space-y-4 my-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  {responseMsg || 'Thank you for reaching out. Our support team will respond shortly at support.acharyacampus@gmail.com.'}
                </p>
                <button 
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Rahul Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rahul@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Inquiry about AcharyaCampus Multi-Tenant School OS"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="How can we help your school?"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold py-3 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 mt-4 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? 'Sending Message...' : 'Send Message'} <Send className="w-4 h-4" />
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