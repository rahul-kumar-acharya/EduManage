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
    <div className="space-y-6 font-['Inter'] text-slate-800">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your registered email and we'll send you recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-['Outfit'] font-bold text-slate-900">
              Recovery Link Sent!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please check your email inbox for further instructions to reset your password.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="user@school.com"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/25 mt-2 active:scale-[0.99] cursor-pointer"
          >
            Send Reset Instructions
          </button>

          <div className="text-center pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
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