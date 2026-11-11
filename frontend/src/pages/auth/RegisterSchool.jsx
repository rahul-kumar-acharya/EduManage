import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { schoolService } from '../../services/schoolService';
import { getTenantUrl } from '../../utils/subdomain';
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
  FileText,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';

const RegisterSchool = () => {
  const [searchParams] = useSearchParams();
  const initialSubdomain = searchParams.get('subdomain') || '';
  const initialPlan = searchParams.get('plan') || '';

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
      } catch {
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

    // 3. Pincode Validation (6 digits, not starting with 0)
    const pincodeRegex = /^[1-9]\d{5}$/;
    if (!formData.pincode || !pincodeRegex.test(formData.pincode)) {
      errors.pincode = 'Pincode must be exactly 6 digits (cannot start with 0).';
    }

    // 4. Password Strength Validation (Min 8 chars, 1 uppercase, 1 lowercase, 1 special char)
    const password = formData.admin_password;
    if (!password || password.length < 8) {
      errors.admin_password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(password)) {
      errors.admin_password = 'Password must contain at least one uppercase letter (A-Z).';
    } else if (!/[a-z]/.test(password)) {
      errors.admin_password = 'Password must contain at least one lowercase letter (a-z).';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.admin_password = 'Password must contain at least one special character (!@#$%^&* etc.).';
    }

    // 5. District Validation (Alphabets and spaces only)
    const textRegex = /^[a-zA-Z\s]+$/;
    if (formData.district && !textRegex.test(formData.district)) {
      errors.district = 'District name must contain letters only.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-flight client validations
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (subdomainStatus.available === false) {
      setError('Please choose an available subdomain before submitting.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const res = await schoolService.registerSchool(data);
      setSuccessResult(res);
    } catch (err) {
      console.error("Registration failed:", err);
      const resData = err.response?.data;
      if (resData && typeof resData === 'object') {
        const errorList = [];
        Object.keys(resData).forEach(field => {
          const val = resData[field];
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          errorList.push(`${field.replace('_', ' ').toUpperCase()}: ${msg}`);
        });
        setError(errorList.join(' | '));
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="bg-[#F8FAFC] text-slate-800 min-h-screen font-['Inter'] selection:bg-indigo-600 selection:text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">School Portal Created!</h2>
              <p className="text-sm text-slate-500">
                <strong className="text-slate-900">{successResult.name}</strong> is ready on subdomain:
              </p>
              <div className="inline-block px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-700 font-mono font-bold text-base">
                {successResult.subdomain}.campus.acharyarahul.in
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>14-Day Free Trial Activated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Administrator Email: <strong className="text-slate-900">{formData.admin_email}</strong></span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <a
                href={getTenantUrl(successResult.subdomain, '/login')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/25 cursor-pointer active:scale-[0.99]"
              >
                Launch School Portal <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-slate-400">
                Direct access URL: {getTenantUrl(successResult.subdomain, '/login')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Instant Provisioning Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            Register Your Institution
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Set up your school management workspace and dedicated subdomain portal in under 60 seconds.
          </p>
          {initialPlan && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Selected Package: {initialPlan.toUpperCase()} Plan (14-Day Free Trial)
              </span>
            </div>
          )}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Side Content Column */}
          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Why Choose AcharyaCampus?
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Joining over 500+ trusted educational institutions with dedicated multi-tenant isolation.
                </p>
              </div>

              {/* Core Feature Pillars */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Globe className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm text-slate-900">Dedicated Subdomain</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Your school gets its own unique portal URL (e.g., yourschool.campus.acharyarahul.in) for students, staff, and parents.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm text-slate-900">Query-Level Data Security</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Bank-grade data encryption and strict row-level database security guarantee complete student privacy.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm text-slate-900">Instant 14-Day Free Trial</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Full platform access with zero setup fees and no credit card required to start.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live SLA & Onboarding Steps */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-lg font-bold font-mono text-slate-900">99.99%</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Uptime SLA</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-lg font-bold font-mono text-slate-900">&lt; 60s</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Provisioning</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3-Step Onboarding Process</span>
                </div>
                <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Claim your institution's custom subdomain</li>
                  <li>Set up primary admin account credentials</li>
                  <li>Launch portal and invite teachers & staff</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Side Form Column */}
          <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Step 1: School Details */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    1. School Information
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      School Name
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        placeholder="ABC Public School"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-48 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                      />
                      <span className="absolute right-3.5 text-xs font-mono text-indigo-600 font-semibold">.campus.acharyarahul.in</span>
                    </div>

                    {formData.subdomain && (
                      <div className="mt-2 text-xs">
                        {subdomainStatus.checking ? (
                          <span className="text-slate-400">Checking availability...</span>
                        ) : subdomainStatus.available ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          placeholder="info@abcschool.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`w-full bg-white border ${validationErrors.email ? 'border-rose-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all`}
                        />
                      </div>
                      {validationErrors.email && (
                        <span className="text-[10px] text-rose-600 font-medium block mt-1">{validationErrors.email}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          name="phone"
                          placeholder="7061638189"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full bg-white border ${validationErrors.phone ? 'border-rose-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all`}
                        />
                      </div>
                      {validationErrors.phone && (
                        <span className="text-[10px] text-rose-600 font-medium block mt-1">{validationErrors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* State, District, Pincode Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        State
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          name="state"
                          placeholder="Bihar"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        District
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          name="district"
                          placeholder="Purnia"
                          value={formData.district || formData.city}
                          onChange={handleChange}
                          required
                          className={`w-full bg-white border ${validationErrors.district ? 'border-rose-400' : 'border-slate-200'} rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all`}
                        />
                      </div>
                      {validationErrors.district && (
                        <span className="text-[10px] text-rose-600 font-medium block mt-1">{validationErrors.district}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="854301"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className={`w-full bg-white border ${validationErrors.pincode ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all`}
                      />
                      {validationErrors.pincode && (
                        <span className="text-[10px] text-rose-600 font-medium block mt-1">{validationErrors.pincode}</span>
                      )}
                    </div>
                  </div>

                  {/* Document Upload Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      School Registration Document (PDF/Image)
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <FileText className="w-5 h-5 text-indigo-600 mr-2 shrink-0" />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white file:cursor-pointer hover:file:bg-indigo-700 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Admin Account */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    2. Primary Administrator Account
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Admin Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        name="admin_name"
                        placeholder="Sanjay Sinha"
                        value={formData.admin_name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Admin Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          name="admin_email"
                          placeholder="sanjaysinha@gmail.com"
                          value={formData.admin_email}
                          onChange={handleChange}
                          required
                          className={`w-full bg-white border ${validationErrors.admin_email ? 'border-rose-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all`}
                        />
                      </div>
                      {validationErrors.admin_email && (
                        <span className="text-[10px] text-rose-600 font-medium block mt-1">{validationErrors.admin_email}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="admin_password"
                          placeholder="••••••••"
                          value={formData.admin_password}
                          onChange={handleChange}
                          required
                          className={`w-full bg-white border ${validationErrors.admin_password ? 'border-rose-400' : 'border-slate-200'} rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 transition-all`}
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
                      {validationErrors.admin_password ? (
                        <span className="text-[10px] text-rose-600 font-medium block mt-1">{validationErrors.admin_password}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-1">Min 8 chars (1 upper, 1 lower, 1 special char).</span>
                      )}
                    </div>

                  </div>
                </div>

              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading || subdomainStatus.available === false}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-[0.99]"
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