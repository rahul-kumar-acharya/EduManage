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
    <div className="space-y-16 sm:space-y-20 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            About AcharyaCampus School OS
          </h1>
          <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            Building the world's most elegant multi-tenant operating system for schools, academies, and educational groups.
          </p>
        </div>

        {/* Story & Vision */}
        <div className="bg-white p-6 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Empowering Modern Educational Institutions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            AcharyaCampus School OS was created to empower educational institutions of all sizes with enterprise-grade multi-tenant technology. We believe every school deserves a fast, secure, and dignified digital portal without the burden of maintaining servers or writing custom code.
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Our platform leverages strict tenant query isolation, instant subdomain provisioning, role-based security, and real-time operational tools so school administrators can focus on what matters most—delivering quality education.
          </p>
        </div>

        {/* Impact Numbers Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
          {milestones.map((m, idx) => (
            <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 text-center shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all">
              <p className="text-xl sm:text-3xl font-semibold text-slate-900">
                {m.number}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Our Core Architecture Values
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Designed around trust, security, and human-centric engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-md transition-all space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">{v.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
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