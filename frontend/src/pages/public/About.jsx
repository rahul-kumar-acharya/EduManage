import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Cpu, Building2 } from 'lucide-react';
import { schoolService } from '../../services/schoolService';

const About = () => {
  const [stats, setStats] = useState({ total_schools: 0, total_students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await schoolService.getPublicStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load platform public stats inside About:", err);
      }
    };
    fetchStats();
  }, []);

  const values = [
    {
      icon: ShieldCheck,
      title: 'Tenant Data Isolation',
      desc: 'We enforce database query-level row security for every school instance, ensuring total privacy and zero data leakage.'
    },
    {
      icon: Heart,
      title: 'Built for Educators',
      desc: 'Interfaces crafted with quiet, high-contrast layouts to minimize cognitive load and daily fatigue for school staff.'
    },
    {
      icon: Cpu,
      title: 'Instant Cloud Scalability',
      desc: 'Automated subdomain provisioning and elastic cloud infrastructure that scales effortlessly as student enrollment grows.'
    },
  ];

  const milestones = [
    { number: stats.total_schools, label: 'Schools Onboarded' },
    { number: stats.total_students, label: 'Active Students & Parents' },
    { number: '99.99%', label: 'Uptime Reliability' },
    { number: '24/7', label: 'Dedicated Support' },
  ];

  return (
    <div className="space-y-20 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#5C1D24]" />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            About EduManage School OS
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Building modern, resilient, and intuitive software to streamline educational administration globally.
          </p>
        </div>

        {/* Story Banner Box */}
        <div className="bg-white p-8 sm:p-12 rounded-xl border border-[#E5E0D8] shadow-sm space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 border-b border-[#F7F5F0] pb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-['Newsreader'] font-bold text-[#1A1918]">
              Empowering Educational Excellence
            </h2>
          </div>
          <div className="space-y-4 text-[#64748B] text-sm sm:text-base leading-relaxed">
            <p>
              EduManage School OS was created to empower educational institutions of all sizes with enterprise-grade multi-tenant technology. We believe every school deserves a fast, secure, and dignified digital portal without the burden of maintaining servers or writing custom code.
            </p>
            <p>
              Our platform leverages strict tenant query isolation, instant subdomain provisioning, role-based security, and real-time operational tools so school administrators can focus on what matters most—delivering quality education.
            </p>
          </div>
        </div>

        {/* Impact Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {milestones.map((m, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] text-center shadow-sm">
              <p className="text-3xl sm:text-4xl font-['Newsreader'] font-bold text-[#1A1918]">
                {m.number}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#64748B] mt-1">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-['Newsreader'] font-normal text-[#1A1918]">
              Our Core Architecture Values
            </h2>
            <p className="text-[#64748B] text-sm max-w-lg mx-auto">
              Designed around trust, security, and human-centric engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-[#1A1918]">{v.title}</h3>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;