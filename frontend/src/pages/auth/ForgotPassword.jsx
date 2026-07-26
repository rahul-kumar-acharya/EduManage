import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Enter your registered email and we'll send you recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1B2A4A]/10 border border-[#1B2A4A]/20 text-[#1B2A4A] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">
              Recovery Link Sent!
            </h3>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              Please check your email inbox for further instructions to reset your password.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B2A4A] hover:text-[#5C1D24] underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
              <input
                type="email"
                required
                placeholder="user@school.com"
                className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B2A4A] hover:bg-[#5C1D24] text-white font-semibold text-sm py-3.5 px-6 rounded-lg transition-colors shadow-sm mt-2"
          >
            Send Reset Instructions
          </button>

          <div className="text-center pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#1B2A4A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}

    </div>
  );
};

export default ForgotPassword;