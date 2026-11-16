import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert, 
  KeyRound, 
  Server, 
  Database, 
  Cpu,
  GraduationCap
} from 'lucide-react';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    if (user?.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password, { portal_type: 'super_admin' });
      navigate('/super-admin');
    } catch (err) {
      console.error('Super Admin login failed:', err);
      const resData = err?.response?.data;
      if (resData) {
        if (typeof resData === 'string') {
          setError(resData);
        } else if (resData.detail) {
          setError(String(resData.detail));
        } else if (resData.non_field_errors) {
          setError(Array.isArray(resData.non_field_errors) ? resData.non_field_errors.join(' ') : String(resData.non_field_errors));
        } else if (resData.error) {
          setError(String(resData.error));
        } else if (resData.message) {
          setError(String(resData.message));
        } else {
          const firstKey = Object.keys(resData)[0];
          if (firstKey && resData[firstKey]) {
            const val = resData[firstKey];
            setError(Array.isArray(val) ? val.join(' ') : String(val));
          } else {
            setError('Unable to authenticate Super Admin.');
          }
        }
      } else {
        setError('Connection error. Unable to reach authentication server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-['Inter'] p-4 sm:p-6 lg:p-8 selection:bg-indigo-600 selection:text-white">
      
      {/* Fixed Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between shrink-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-slate-900 tracking-tight">AcharyaCampus</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Infrastructure Control
            </span>
          </div>
        </div>

        <Link 
          to="/"
          className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50"
        >
          View Site
        </Link>
      </header>

      {/* Main Centered Container */}
      <main className="max-w-5xl mx-auto w-full flex-1 flex items-center justify-center my-4 sm:my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch w-full justify-center">
          
          {/* Left Column: Streamlined Info */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-semibold tracking-wide">
                  <Server className="w-3.5 h-3.5 text-indigo-600" /> System Root Gateway
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Super Admin Console
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Manage multi-tenant provisioning, domain routes, and subscription billing.
                </p>
              </div>

              {/* Condensed Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Tenant Orchestration</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Automated database isolation & domain aliases.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Cpu className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">System Metrics & Billing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time health monitoring and plan controls.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Badge */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">System Status:</span>
                <span className="text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 99.99% Operational
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Master Authentication Form */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Root Access Verification</h3>
                  <p className="text-xs text-slate-500">Requires platform administrator privileges</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Platform Admin Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Master Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? 'Authenticating Gateway...' : 'Access Super Admin Dashboard'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Bottom Security Note */}
            <div className="pt-3 border-t border-slate-100 text-center space-y-1.5">
              <div className="text-xs text-slate-500">
                Not a Super Administrator?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                  Go to School User Portal
                </Link>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multi-Tenant Root Isolation Protected</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="text-center text-[11px] text-slate-400 shrink-0 pt-2">
        © {new Date().getFullYear()} AcharyaCampus SaaS Infrastructure Platform. Restricted Administrator Operations.
      </footer>
    </div>
  );
};

export default SuperAdminLogin;