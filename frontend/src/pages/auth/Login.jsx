import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { getSubdomain } from '../../utils/subdomain';
import { Mail, Lock, Globe, UserCheck, ShieldCheck, HelpCircle, ShieldAlert, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const { school, subdomain } = useSchool();
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

      // Redirect to correct subdomain if not already on it
      const currentSub = getSubdomain();
      const userSub = user.school?.subdomain;
      
      if (userSub && currentSub !== userSub) {
        const port = window.location.port ? `:${window.location.port}` : '';
        const hostParts = window.location.hostname.split('.');
        let targetHost = '';
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          targetHost = `${userSub}.localhost${port}`;
        } else {
          const rootDomain = hostParts.slice(-2).join('.');
          targetHost = `${userSub}.${rootDomain}${port}`;
        }
        
        const currentToken = localStorage.getItem('token');
        const encodedUser = encodeURIComponent(JSON.stringify(user));
        
        window.location.href = `http://${targetHost}/dashboard?sso_token=${currentToken}&sso_user=${encodedUser}`;
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


    <div className="space-y-10 font-['Plus_Jakarta_Sans'] text-[#1A1918]">
      
      {/* Page Title & Context Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
          <KeyRound className="w-4 h-4 text-[#5C1D24]" />
          <span>Security Gateway Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-['Newsreader'] font-normal text-[#1A1918]">
          Sign In to Your Workspace
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Enter your authorized credentials to access your administrative dashboard.
        </p>
      </div>

      {/* Two-Column Equal Height Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Feature Column */}
        <div className="lg:col-span-5 bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">
                Welcome Back to AcharyaCampus
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Access your institution's central operating system for attendance, gradebooks, fees, and circulars.
              </p>
            </div>

            {/* Security & Access Pillars */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                <Globe className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-['Newsreader'] font-bold text-base text-[#1A1918]">Tenant Domain Lock</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">Your session is automatically isolated to your school's subdomain environment.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                <UserCheck className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-['Newsreader'] font-bold text-base text-[#1A1918]">Role-Based Dashboards</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">Dedicated interfaces for School Admins, Class Teachers, Students, Parents, and Accountants.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                <ShieldCheck className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-['Newsreader'] font-bold text-base text-[#1A1918]">Bank-Grade Security</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">256-bit encrypted credentials with automated JWT token authentication.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Note */}
          <div className="pt-4 border-t border-[#F7F5F0]">
            <div className="p-3.5 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8] flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#1B2A4A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#64748B] leading-relaxed">
                Forgot your password or need assistance? Contact your school administrator or our 24/6 support desk.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Column (Fully Balanced Layout) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            

            {/* Role Quick Selector Segment */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider">
                Select Account Type
              </label>
              <div className="grid grid-cols-4 gap-2 p-1 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8]">
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

                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-all ${
                      selectedRole === type.id
                        ? 'bg-[#1B2A4A] text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#1A1918]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2.5 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed">
                  {error}{' '}
                  {error.includes('Super Admin') && (
                    <Link to="/super-admin/login" className="text-[#5C1D24] font-bold underline hover:text-[#1B2A4A] ml-1">
                      Go to Super Admin Portal →
                    </Link>
                  )}
                </div>
              </div>
            )}


            {/* Input Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4.5 h-4.5 text-[#1B2A4A] absolute left-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="user@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-11 pr-4 py-3.5 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4.5 h-4.5 text-[#1B2A4A] absolute left-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-11 pr-10 py-3.5 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 text-[#64748B] hover:text-[#1B2A4A] focus:outline-none transition-colors"
                    tabIndex={-1}
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>


              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#64748B] cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#E5E0D8] text-[#1B2A4A] focus:ring-0 cursor-pointer" 
                  />
                  <span>Remember me on this device</span>
                </label>
                <Link to="/forgot-password" className="text-[#1B2A4A] hover:text-[#5C1D24] font-semibold underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1B2A4A] hover:bg-[#5C1D24] disabled:bg-[#64748B] text-white font-semibold text-sm py-4 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>

          {/* Bottom Banner Note */}
          <div className="pt-4 border-t border-[#F7F5F0] text-center space-y-2">
            {!subdomain && (
              <div className="text-xs text-[#64748B] space-y-1">
                <div>
                  Want to register a new school?{' '}
                  <Link to="/register-school" className="text-[#1B2A4A] hover:text-[#5C1D24] font-semibold underline">
                    Register School Portal
                  </Link>
                </div>
                <div>
                  Platform Super Admin?{' '}
                  <Link to="/super-admin/login" className="text-[#5C1D24] hover:text-[#1B2A4A] font-semibold underline">
                    Super Admin Portal →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
              <KeyRound className="w-3.5 h-3.5 text-[#5C1D24]" />
              <span>Protected by Row-Level Security & Encrypted Auth</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;