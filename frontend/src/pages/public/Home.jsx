import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { schoolService } from '../../services/schoolService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Users, 
  Building2, 
  ChevronDown, 
  Lock, 
  Award 
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const [desiredSubdomain, setDesiredSubdomain] = useState('');
  const [activeTab, setActiveTab] = useState('admin');
  const [openFaq, setOpenFaq] = useState(null);
  const [stats, setStats] = useState({
    total_schools: 0,
    total_students: 0,
    total_sections: 0,
    total_revenue: 0,
    overall_attendance_rate: 96.4,
    sample_students: [],
    sample_fee: null,
    sample_notice: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await schoolService.getPublicStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load platform public stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleSubdomainCheck = (e) => {
    e.preventDefault();
    if (desiredSubdomain) {
      navigate(`/register-school?subdomain=${encodeURIComponent(desiredSubdomain)}`);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-20 font-['Plus_Jakarta_Sans']">
      
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, CTA & Subdomain Form */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-bold text-[#5C1D24] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#5C1D24]" />
              <span>Next-Generation Multi-Tenant School OS</span>
            </div>

            {/* Editorial Serif Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Newsreader'] font-normal text-[#1A1918] leading-tight tracking-tight">
              Manage Your Entire School System on <br />
              <span className="italic font-medium text-[#1B2A4A]">
                Your Dedicated Subdomain
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-2xl">
              Empower administrators, faculty teachers, students, and parents with an intuitive cloud platform. Streamline admissions, attendance, timetables, and fee billing effortlessly.
            </p>

            {/* Subdomain Search Form / Go to Dashboard */}
            {isAuthenticated ? (
              <div className="pt-2">
                <Link to={user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'}>
                  <button className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer">
                    {user?.role === 'SUPER_ADMIN' ? 'Go to Super Admin Board' : 'Go to Dashboard'} <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            ) : (

              <form 
                onSubmit={handleSubdomainCheck} 
                className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl border border-[#E5E0D8] shadow-sm max-w-xl"
              >
                <div className="flex-1 flex items-center px-4 bg-[#F7F5F0] rounded-xl border border-[#E5E0D8]">
                  <Globe className="w-5 h-5 text-[#1B2A4A] mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="your-school-name"
                    value={desiredSubdomain}
                    onChange={(e) => setDesiredSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-transparent py-3 text-xs text-[#1A1918] placeholder-slate-400 focus:outline-none font-medium"
                    required
                  />
                  <span className="text-xs font-mono text-[#64748B] font-bold">.edumanage.acharyaworks.in</span>
                </div>
                <button 
                  type="submit" 
                  className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                >
                  Claim Subdomain <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Trust Badges */}
            <div className="pt-2 flex items-center gap-6 text-xs text-[#64748B] font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Wildcard SSL Secured
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" /> Instant Tenant Setup
              </span>
            </div>
          </div>

          {/* Right Column: Hero Dashboard Showcase Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E0D8] bg-linear-to-b from-white to-[#F7F5F0] p-3 shadow-xl hover:shadow-2xl transition-all group">
              
              {/* Main Dashboard Image */}
              <img 
                src="/hero_dashboard.png" 
                alt="EduManage Platform Dashboard Preview" 
                className="w-full h-auto rounded-xl object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Floating Badge 1: Timetable Engine */}
              <div className="absolute top-6 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E5E0D8] shadow-lg hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] text-white flex items-center justify-center font-bold">
                  📅
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1B2A4A]">Timetable Engine</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Conflict-Free Routines</div>
                </div>
              </div>

              {/* Floating Badge 2: Multi-Tenant Active */}
              <div className="absolute -bottom-4 right-6 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E5E0D8] shadow-lg hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#5C1D24] text-white flex items-center justify-center font-bold">
                  ⭐
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1918]">Multi-Tenant Isolated</div>
                  <div className="text-[10px] text-[#64748B]">Dedicated Subdomains</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { value: stats.total_schools, label: 'Institutions Onboarded' },
            { value: stats.total_students, label: 'Active Students' },
            { value: '99.99%', label: 'Uptime SLA' },
            { value: 'Instant', label: 'Tenant Provisioning' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl text-center border border-[#E5E0D8] shadow-sm hover:border-[#1B2A4A]/30 transition-colors">
              <div className="text-3xl sm:text-4xl font-['Newsreader'] font-bold text-[#1A1918]">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-[#64748B] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>


      {/* 2. Key Features Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-['Newsreader'] font-normal text-[#1A1918]">Everything Your Institution Needs</h2>
          <p className="text-[#64748B] text-sm max-w-xl mx-auto">
            Architected specifically for high reliability, strict data privacy, and timeless elegance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Globe,
              title: 'Multi-Tenant Security',
              desc: 'Every school operates on an isolated subdomain with dedicated database-level row security.'
            },
            {
              icon: Users,
              title: 'Tailored Workspaces',
              desc: 'Dedicated portals for School Admins, Class Teachers, Students, Parents, and Financial Accountants.'
            },
            {
              icon: Zap,
              title: 'Automated Fee Billing',
              desc: 'Collect online payments, issue digital PDF receipts, and trigger polite SMS & email due alerts.'
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4"
              >
                <div className="w-12 h-12 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-['Newsreader'] font-bold text-[#1A1918]">{feat.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Workspace Preview */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-['Newsreader'] font-normal text-[#1A1918]">Designed for Every Stakeholder</h2>
          <p className="text-[#64748B] text-sm max-w-xl mx-auto">
            Clean interfaces crafted specifically for daily operational tasks without cognitive fatigue.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center border-b border-[#E5E0D8]">
          {[
            { id: 'admin', label: 'Admin Workspace' },
            { id: 'teacher', label: 'Teacher Portal' },
            { id: 'parent', label: 'Parent & Student App' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#1B2A4A] text-[#1B2A4A]'
                  : 'border-transparent text-[#64748B] hover:text-[#1A1918]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspace Display Container */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E0D8] shadow-sm max-w-5xl mx-auto">
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]">
                <h4 className="font-['Newsreader'] font-bold text-xl text-[#1A1918]">Executive Overview</h4>
                <span className="text-xs font-semibold px-3 py-1 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded-md">Live Data</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8]">
                  <p className="text-xs text-[#64748B]">Monthly Fee Collection</p>
                  <p className="text-2xl font-bold text-[#1A1918] font-mono mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.total_revenue)}
                  </p>
                </div>
                <div className="p-4 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8]">
                  <p className="text-xs text-[#64748B]">Staff Attendance</p>
                  <p className="text-2xl font-bold text-[#1A1918] font-mono mt-1">{stats.overall_attendance_rate}%</p>
                </div>
                <div className="p-4 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8]">
                  <p className="text-xs text-[#64748B]">Active Classes</p>
                  <p className="text-2xl font-bold text-[#1A1918] font-mono mt-1">{stats.total_sections} Sections</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teacher' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]">
                <h4 className="font-['Newsreader'] font-bold text-xl text-[#1A1918]">Class 10-A Gradebook & Attendance</h4>
                <span className="text-xs font-semibold px-3 py-1 bg-[#F7F5F0] text-[#1A1918] rounded-md">Period 3 • Mathematics</span>
              </div>
              <div className="divide-y divide-[#F7F5F0]">
                {stats.sample_students.map((row, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-[#1A1918]">{row.name}</p>
                      <p className="text-xs text-[#64748B]">Roll No: {row.roll_number}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1 rounded-md font-semibold ${
                        row.status === 'Present' ? 'bg-[#1B2A4A]/10 text-[#1B2A4A]' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {row.status}
                      </span>
                      <span className="font-mono font-bold text-xs bg-[#F7F5F0] px-2 py-1 rounded text-[#1A1918]">{row.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'parent' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F7F5F0]">
                <h4 className="font-['Newsreader'] font-bold text-xl text-[#1A1918]">Student Profile & Notice Feed</h4>
                <span className="text-xs text-[#64748B]">Last updated 10 mins ago</span>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-[#F7F5F0] rounded-lg border border-[#E5E0D8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#64748B]">{stats.sample_fee?.name || 'Term 2 Tuition Fee'}</p>
                    <p className="text-base font-semibold text-[#1A1918] font-mono">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.sample_fee?.amount || 1250.00)} • Due {stats.sample_fee?.due_date || 'Aug 15'}
                    </p>
                  </div>
                  <button className="bg-[#1B2A4A] text-white text-xs px-4 py-2 rounded-lg font-semibold">Pay Online</button>
                </div>
                <div className="p-4 bg-white rounded-lg border border-[#E5E0D8] space-y-1">
                  <p className="text-xs font-semibold text-[#5C1D24]">ANNOUNCEMENT</p>
                  <p className="text-base font-semibold text-[#1A1918]">
                    {stats.sample_notice?.title || 'Annual Sports Meet Registration Open'}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {stats.sample_notice?.content || 'Submit parent consent forms before Friday.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Security & Compliance Badges */}
      <section className="max-w-7xl mx-auto px-6 py-6 bg-white rounded-xl border border-[#E5E0D8] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#E5E0D8]">
          <div className="p-4 space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#1B2A4A] mx-auto" />
            <h4 className="font-['Newsreader'] font-bold text-[#1A1918] text-lg">Bank-Grade Security</h4>
            <p className="text-xs text-[#64748B]">AES-256 encrypted data stores with strict tenant isolation.</p>
          </div>
          <div className="p-4 space-y-2 pt-6 sm:pt-4">
            <Award className="w-6 h-6 text-[#1B2A4A] mx-auto" />
            <h4 className="font-['Newsreader'] font-bold text-[#1A1918] text-lg">FERPA & GDPR Compliant</h4>
            <p className="text-xs text-[#64748B]">Full compliance with global educational data protection standards.</p>
          </div>
          <div className="p-4 space-y-2 pt-6 sm:pt-4">
            <Lock className="w-6 h-6 text-[#1B2A4A] mx-auto" />
            <h4 className="font-['Newsreader'] font-bold text-[#1A1918] text-lg">Automated Backups</h4>
            <p className="text-xs text-[#64748B]">Daily automated database snapshots with instant restore capability.</p>
          </div>
        </div>
      </section>

      {/* 5. FAQs Accordion */}
      <section className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-['Newsreader'] font-normal text-[#1A1918]">Frequently Asked Questions</h2>
          <p className="text-[#64748B] text-sm">Everything you need to know about getting started.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does custom subdomain provisioning work?",
              a: "When you register your school name, our automated DNS router instantly allocates an isolated tenant instance under your chosen domain (e.g. stmarys.edumanage.acharyaworks.in)."
            },
            {
              q: "Can parents pay fees online securely?",
              a: "Yes. Our platform integrates with global payment gateways with instant digital receipt generation and automated accounting updates."
            },
            {
              q: "Is there a limit on how many students we can add?",
              a: "No. Our database scales elastically to handle everything from single-campus academies to large multi-school educational boards."
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E0D8] shadow-sm overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full text-left p-5 flex items-center justify-between font-['Newsreader'] font-semibold text-[#1A1918] text-base sm:text-lg"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#F7F5F0] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Final Call to Action Box */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-xl p-8 sm:p-14 text-center space-y-6 border border-[#E5E0D8] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F7F5F0] border border-[#E5E0D8] text-[#1B2A4A] mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-['Newsreader'] font-normal text-[#1A1918]">Ready to Modernize Your Institution?</h2>
          <p className="text-[#64748B] text-sm sm:text-base max-w-xl mx-auto">
            Start your 14-day free trial today. No credit card required. Provision your school workspace in under 2 minutes.
          </p>
          <div className="pt-2 flex justify-center">
            {isAuthenticated ? (
              <Link to={user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'}>
                <button className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white font-semibold text-sm px-8 py-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                  {user?.role === 'SUPER_ADMIN' ? 'Go to Super Admin Board' : 'Go to Dashboard'} <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (

              <Link to="/register-school">
                <button className="bg-[#1B2A4A] hover:bg-[#5C1D24] text-white font-semibold text-sm px-8 py-4 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;