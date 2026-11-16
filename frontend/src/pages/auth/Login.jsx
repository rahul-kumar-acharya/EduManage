import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { getSubdomain, getTenantUrl } from '../../utils/subdomain';
import { Mail, Lock, Globe, UserCheck, ShieldCheck, HelpCircle, ShieldAlert, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  const [error, setError] = useState('');
  const sessionNotice = new URLSearchParams(window.location.search).get('session_expired') === 'true';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { subdomain } = useSchool();
  const navigate = useNavigate();

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password, {
        portal_type: 'school',
        selected_role: selectedRole
      });

      // Redirect to correct subdomain if user is already on a different tenant subdomain
      const currentSub = getSubdomain();
      const userSub = user.school?.subdomain;
      
      if (userSub && currentSub && currentSub !== userSub) {
        const currentToken = localStorage.getItem('token');
        const encodedUser = encodeURIComponent(JSON.stringify(user));
        window.location.href = getTenantUrl(userSub, `/dashboard?sso_token=${currentToken}&sso_user=${encodedUser}`);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
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
            setError('Unable to authenticate. Please check your credentials.');
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
    <div className="space-y-10 font-['Inter'] text-slate-800">
      
      {/* Page Title & Context Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>Security Gateway Access</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Sign In to Your Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your authorized credentials to access your administrative dashboard.
        </p>
      </div>

      {/* Two-Column Equal Height Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Feature Column */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                Welcome Back to AcharyaCampus
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Access your institution's central operating system for attendance, gradebooks, fees, and circulars.
              </p>
            </div>

            {/* Security & Access Pillars */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <Globe className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-sm text-slate-900">Tenant Domain Lock</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Your session is automatically isolated to your school's subdomain environment.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <UserCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-sm text-slate-900">Role-Based Dashboards</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Dedicated interfaces for School Admins, Class Teachers, Students, Parents, and Accountants.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-sm text-slate-900">Bank-Grade Security</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">256-bit encrypted credentials with automated JWT token authentication.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Note */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Forgot your password or need assistance? Contact your school administrator or our 24/6 support desk.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            
            {/* Role Quick Selector Segment */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
                {[
                  { id: 'ADMIN', label: 'School Admin' },
                  { id: 'TEACHER', label: 'Faculty' },
                  { id: 'ACCOUNTANT', label: 'Accountant' },
                  { id: 'STUDENT', label: 'Student / Parent' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleRoleChange(type.id)}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      selectedRole === type.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {sessionNotice && !error && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2.5 font-medium">
                <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="leading-relaxed">
                  Your session has expired. Please sign in again to access your authorized workspace.
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed">
                  {error}{' '}
                  {error.includes('Super Admin') && (
                    <Link to="/super-admin/login" className="text-indigo-600 font-bold underline hover:text-indigo-700 ml-1">
                      Go to Super Admin Portal →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Input Form Fields */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer" 
                  />
                  <span>Remember me on this device</span>
                </label>
                <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 mt-2 active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>

          {/* Bottom Banner Note */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            {!subdomain && (
              <div className="text-xs text-slate-500 space-y-1">
                <div>
                  Want to register a new school?{' '}
                  <Link to="/register-school" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                    Register School Portal
                  </Link>
                </div>
                <div>
                  Platform Super Admin?{' '}
                  <Link to="/super-admin/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                    Super Admin Portal →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Protected by Row-Level Security & Encrypted Auth</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;