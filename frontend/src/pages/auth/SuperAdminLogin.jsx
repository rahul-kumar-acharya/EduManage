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

  const { login, logout, isAuthenticated, user, loading } = useAuth();
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
    <div className="h-screen w-screen bg-[#F7F5F0] text-[#1A1918] flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans'] p-6 lg:p-8 selection:bg-[#1B2A4A] selection:text-white">
      
      {/* Fixed Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between shrink-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0] border border-[#1B2A4A] group-hover:bg-[#5C1D24] transition-colors">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['Newsreader'] font-bold text-2xl text-[#1A1918] tracking-tight">AcharyaCampus</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20">
              Infrastructure Control
            </span>
          </div>
        </div>

        <Link 
          to="/"
          className="text-xs font-semibold text-[#1B2A4A] hover:text-[#5C1D24] transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-[#E5E0D8] shadow-sm"
        >
          View Site
        </Link>
      </header>

      {/* Main Centered Container */}
      <main className="max-w-5xl mx-auto w-full flex-1 flex items-center justify-center my-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch w-full justify-center">
          
          {/* Left Column: Streamlined Info (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white p-6 lg:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/20 text-[11px] font-bold uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5 text-[#1B2A4A]" /> System Root Gateway
                </div>
                <h2 className="text-2xl sm:text-3xl font-['Newsreader'] font-bold text-[#1A1918]">
                  Super Admin Console
                </h2>
                <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">
                  Manage multi-tenant provisioning, domain routes, and subscription billing.
                </p>
              </div>

              {/* Condensed Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <Database className="w-4 h-4 text-[#1B2A4A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-['Newsreader'] font-bold text-sm text-[#1A1918]">Tenant Orchestration</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Automated database isolation & domain aliases.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <Cpu className="w-4 h-4 text-[#1B2A4A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-['Newsreader'] font-bold text-sm text-[#1A1918]">System Metrics & Billing</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Real-time health monitoring and plan controls.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Badge */}
            <div className="pt-3 border-t border-[#F7F5F0]">
              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A1918]">System Status:</span>
                <span className="text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> 99.99% Operational
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Master Authentication Form (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white p-6 lg:p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-['Newsreader'] font-bold text-[#1A1918]">Root Access Verification</h3>
                  <p className="text-[11px] text-[#64748B]">Requires platform administrator privileges</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2.5 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                    Platform Admin Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#1B2A4A] absolute left-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@acharyacampus.com"
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                    Master Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#1B2A4A] absolute left-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-10 pr-11 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#1A1918] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1B2A4A] hover:bg-[#5C1D24] disabled:bg-[#64748B] text-white font-semibold text-sm py-3.5 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmitting ? 'Authenticating Gateway...' : 'Access Super Admin Dashboard'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Bottom Security Note */}
            <div className="pt-3 border-t border-[#F7F5F0] text-center space-y-1.5">
              <div className="text-xs text-[#64748B]">
                Not a Super Administrator?{' '}
                <Link to="/login" className="text-[#1B2A4A] hover:text-[#5C1D24] font-semibold underline">
                  Go to School User Portal
                </Link>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
                <KeyRound className="w-3.5 h-3.5 text-[#5C1D24]" />
                <span>Multi-Tenant Root Isolation Protected</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="text-center text-[11px] text-[#64748B] shrink-0 pt-2">
        © {new Date().getFullYear()} AcharyaCampus SaaS Infrastructure Platform. Restricted Administrator Operations.
      </footer>
    </div>
  );
};

export default SuperAdminLogin;