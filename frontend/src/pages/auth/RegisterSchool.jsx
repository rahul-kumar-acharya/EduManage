import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { schoolService } from '../../services/schoolService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { 
  Building2, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Phone,
  Clock,
  HelpCircle,
  FileText,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';


const RegisterSchool = () => {
  const [searchParams] = useSearchParams();
  const initialSubdomain = searchParams.get('subdomain') || '';

  const [formData, setFormData] = useState({
    name: '',
    subdomain: initialSubdomain,
    email: '',
    phone: '',
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    registration_document: null,
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState({ checking: false, available: null, message: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (!formData.subdomain) {
      setSubdomainStatus({ checking: false, available: null, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setSubdomainStatus({ checking: true, available: null, message: 'Checking availability...' });
      try {
        const res = await schoolService.checkSubdomain(formData.subdomain);
        if (res.available) {
          setSubdomainStatus({ checking: false, available: true, message: 'Subdomain is available!' });
        } else {
          setSubdomainStatus({ checking: false, available: false, message: 'Subdomain already taken or reserved.' });
        }
      } catch (err) {
        setSubdomainStatus({ checking: false, available: false, message: 'Unavailable or reserved subdomain.' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subdomain') {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, city: value }));
    } else if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: numeric }));
    } else if (name === 'pincode') {
      const numeric = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, pincode: numeric }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, registration_document: e.target.files[0] }));
  };

  const validateForm = () => {
    const errors = {};

    // 1. Email Validation (School Email & Admin Email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid official email address.';
    }
    if (!formData.admin_email || !emailRegex.test(formData.admin_email)) {
      errors.admin_email = 'Please enter a valid administrator email address.';
    }

    // 2. Phone Validation (10 digits starting with 6, 7, 8, 9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      errors.phone = 'Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9.';
    }

    // 3. Pincode Validation (6 digits)
    const pincodeRegex = /^[1-9]\d{5}$/;
    if (!formData.pincode || !pincodeRegex.test(formData.pincode)) {
      errors.pincode = 'Pincode must be a valid 6-digit number.';
    }

    // 4. District Validation
    const activeDistrict = formData.district || formData.city;
    if (!activeDistrict) {
      errors.district = 'District is required.';
    }

    // 5. Password Validation (min 8 chars, 1 upper, 1 lower, 1 special char)
    const pwd = formData.admin_password || '';
    const hasMinLen = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    if (!hasMinLen || !hasUpper || !hasLower || !hasSpecial) {
      errors.admin_password = 'Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 special character.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    if (subdomainStatus.available === false) {
      setError('Please choose an available subdomain.');
      return;
    }

    setLoading(true);
    setError('');

    // Compile into FormData payload for multi-part file support
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('subdomain', formData.subdomain.toLowerCase());
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('address', formData.address);
    submitData.append('state', formData.state);
    submitData.append('city', formData.district || formData.city);
    submitData.append('pincode', formData.pincode);
    
    if (formData.registration_document) {
      submitData.append('registration_document', formData.registration_document);
    }
    
    submitData.append('admin_name', formData.admin_name);
    submitData.append('admin_email', formData.admin_email);
    submitData.append('admin_password', formData.admin_password);

    try {
      const res = await schoolService.registerSchool(submitData);
      setSuccessResult(res);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errData = err.response.data;
        if (typeof errData === 'object' && errData !== null) {
          const fieldErrors = {};
          const messages = [];

          Object.entries(errData).forEach(([field, msgs]) => {
            const msgStr = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
            fieldErrors[field] = msgStr;
            messages.push(msgStr);
          });

          setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
          setError(messages.join(' '));
        } else {
          setError(String(errData));
        }
      } else {
        setError('School registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  if (successResult) {
    return (
      <div className="bg-[#F7F5F0] text-[#1A1918] min-h-screen font-['Plus_Jakarta_Sans'] selection:bg-[#1B2A4A] selection:text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-[#E5E0D8] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-[#1B2A4A]/10 border border-[#1B2A4A]/20 text-[#1B2A4A] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-['Newsreader'] font-bold text-[#1A1918]">School Portal Created!</h2>
              <p className="text-sm text-[#64748B]">
                <strong className="text-[#1A1918]">{successResult.name}</strong> is ready on subdomain:
              </p>
              <div className="inline-block px-4 py-2 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8] text-[#1B2A4A] font-mono font-bold text-base">
                {successResult.subdomain}.campus.acharyaworks.in
              </div>
            </div>

            <div className="bg-[#F7F5F0] p-4 rounded-lg border border-[#E5E0D8] text-xs text-[#64748B] text-left space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B2A4A] shrink-0" />
                <span>14-Day Free Trial Activated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B2A4A] shrink-0" />
                <span>Administrator Email: <strong className="text-[#1A1918]">{formData.admin_email}</strong></span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <a
                href={`http://${successResult.subdomain}.localhost:5173/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#1B2A4A] hover:bg-[#5C1D24] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
              >
                Launch School Portal <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-[#64748B]">
                (For dev testing, log in directly via browser at {successResult.portal_url})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#5C1D24]" />
            <span>Instant Provisioning Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            Register Your Institution
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Set up your school management workspace and dedicated subdomain portal in under 60 seconds.
          </p>
        </div>

        {/* Two-Column Layout with Equal Height Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Side Content Column (Equal Height) */}
          <div className="lg:col-span-5 bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">
                  Why Choose AcharyaCampus?
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Joining over 500+ trusted educational institutions with dedicated multi-tenant isolation.
                </p>
              </div>

              {/* Core Feature Pillars */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <Globe className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-['Newsreader'] font-bold text-base text-[#1A1918]">Dedicated Subdomain</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">Your school gets its own unique portal URL (e.g., yourschool.campus.acharyaworks.in) for students, staff, and parents.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <ShieldCheck className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-['Newsreader'] font-bold text-base text-[#1A1918]">Query-Level Data Security</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">Bank-grade data encryption and strict row-level database security guarantee complete student privacy.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8]">
                  <Zap className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-['Newsreader'] font-bold text-base text-[#1A1918]">Instant 14-Day Free Trial</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">Full platform access with zero setup fees and no credit card required to start.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enriched Content: Live SLA & Onboarding Steps */}
            <div className="pt-4 border-t border-[#F7F5F0] space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8]">
                  <p className="text-lg font-bold font-mono text-[#1A1918]">99.99%</p>
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase">Uptime SLA</p>
                </div>
                <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8]">
                  <p className="text-lg font-bold font-mono text-[#1A1918]">&lt; 60s</p>
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase">Provisioning</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#5C1D24]" />
                  <span>3-Step Onboarding Process</span>
                </div>
                <ol className="text-xs text-[#64748B] space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Claim your institution's custom subdomain</li>
                  <li>Set up primary admin account credentials</li>
                  <li>Launch portal and invite teachers & staff</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Side Form Column (Equal Height) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm flex flex-col justify-between space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Step 1: School Details */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-[#5C1D24] uppercase tracking-wider border-b border-[#F7F5F0] pb-2">
                    1. School Information
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      School Name
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                      <input
                        type="text"
                        name="name"
                        placeholder="ABC Public School"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      Subdomain URL
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name="subdomain"
                        placeholder="abcschool"
                        value={formData.subdomain}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-4 pr-44 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                      />
                      <span className="absolute right-3 text-xs font-mono text-[#64748B] font-medium">.campus.acharyaworks.in</span>
                    </div>

                    {formData.subdomain && (
                      <div className="mt-2 text-xs">
                        {subdomainStatus.checking ? (
                          <span className="text-[#64748B]">Checking availability...</span>
                        ) : subdomainStatus.available ? (
                          <span className="text-[#1B2A4A] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Subdomain is available!
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-600" /> {subdomainStatus.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        Official Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                        <input
                          type="email"
                          name="email"
                          placeholder="info@abcschool.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`w-full bg-[#F7F5F0] border ${validationErrors.email ? 'border-red-500' : 'border-[#E5E0D8]'} rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]`}
                        />
                      </div>
                      {validationErrors.email && (
                        <span className="text-[10px] text-red-600 font-bold block mt-1">{validationErrors.email}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                        <input
                          type="text"
                          name="phone"
                          placeholder="7061638189"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full bg-[#F7F5F0] border ${validationErrors.phone ? 'border-red-500' : 'border-[#E5E0D8]'} rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]`}
                        />
                      </div>
                      {validationErrors.phone && (
                        <span className="text-[10px] text-red-600 font-bold block mt-1">{validationErrors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* State, District, Pincode Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        State
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                        <input
                          type="text"
                          name="state"
                          placeholder="Bihar"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-9 pr-3 py-3 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        District
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                        <input
                          type="text"
                          name="district"
                          placeholder="Purnia"
                          value={formData.district || formData.city}
                          onChange={handleChange}
                          required
                          className={`w-full bg-[#F7F5F0] border ${validationErrors.district ? 'border-red-500' : 'border-[#E5E0D8]'} rounded-lg pl-9 pr-3 py-3 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]`}
                        />
                      </div>
                      {validationErrors.district && (
                        <span className="text-[10px] text-red-600 font-bold block mt-1">{validationErrors.district}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="854301"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className={`w-full bg-[#F7F5F0] border ${validationErrors.pincode ? 'border-red-500' : 'border-[#E5E0D8]'} rounded-lg px-3 py-3 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]`}
                      />
                      {validationErrors.pincode && (
                        <span className="text-[10px] text-red-600 font-bold block mt-1">{validationErrors.pincode}</span>
                      )}
                    </div>
                  </div>

                  {/* Document Upload Field */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      School Registration Document (PDF/Image)
                    </label>
                    <div className="relative flex items-center bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg p-2.5">
                      <FileText className="w-5 h-5 text-[#1B2A4A] mr-2 shrink-0" />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full text-xs text-[#64748B] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1B2A4A] file:text-white file:cursor-pointer hover:file:bg-[#5C1D24] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Admin Account */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-bold text-[#5C1D24] uppercase tracking-wider border-b border-[#F7F5F0] pb-2">
                    2. Primary Administrator Account
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                      Admin Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                      <input
                        type="text"
                        name="admin_name"
                        placeholder="Sanjay Sinha"
                        value={formData.admin_name}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        Admin Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                        <input
                          type="email"
                          name="admin_email"
                          placeholder="sanjaysinha@gmail.com"
                          value={formData.admin_email}
                          onChange={handleChange}
                          required
                          className={`w-full bg-[#F7F5F0] border ${validationErrors.admin_email ? 'border-red-500' : 'border-[#E5E0D8]'} rounded-lg pl-10 pr-4 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]`}
                        />
                      </div>
                      {validationErrors.admin_email && (
                        <span className="text-[10px] text-red-600 font-bold block mt-1">{validationErrors.admin_email}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1918] uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-[#1B2A4A] absolute left-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="admin_password"
                          placeholder="••••••••"
                          value={formData.admin_password}
                          onChange={handleChange}
                          required
                          className={`w-full bg-[#F7F5F0] border ${validationErrors.admin_password ? 'border-red-500' : 'border-[#E5E0D8]'} rounded-lg pl-10 pr-10 py-3 text-sm text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A]`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 text-[#64748B] hover:text-[#1B2A4A] focus:outline-none transition-colors"
                          tabIndex={-1}
                          title={showPassword ? "Hide Password" : "Show Password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.admin_password ? (
                        <span className="text-[10px] text-red-600 font-bold block mt-1">{validationErrors.admin_password}</span>
                      ) : (
                        <span className="text-[10px] text-[#64748B] block mt-1">Min 8 chars (1 upper, 1 lower, 1 special char).</span>
                      )}
                    </div>

                  </div>
                </div>


              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading || subdomainStatus.available === false}
                className="w-full bg-[#1B2A4A] hover:bg-[#5C1D24] disabled:bg-[#64748B] text-white font-semibold text-sm py-4 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Provisioning School Portal...' : 'Create School Portal'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterSchool;