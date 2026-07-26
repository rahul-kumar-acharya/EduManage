import React from 'react';
import { 
  GraduationCap, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Receipt, 
  Bell, 
  Zap,
  Shield, 
  Smartphone 
} from 'lucide-react';

const Features = () => {
  const featureList = [
    { 
      icon: GraduationCap, 
      title: 'Academic Structure', 
      desc: 'Manage Sessions, Class Levels, Sections, and Subjects seamlessly.' 
    },
    { 
      icon: Users, 
      title: 'Student & Teacher Profiles', 
      desc: 'Centralized directory for admissions, documents, employee profiles, and leaves.' 
    },
    { 
      icon: CalendarCheck, 
      title: 'Smart Attendance', 
      desc: 'Daily attendance logs with monthly automated reports and parent notifications.' 
    },
    { 
      icon: FileSpreadsheet, 
      title: 'Exams & Gradebooks', 
      desc: 'Create exams, enter subject marks, auto-compute grades, and generate report cards.' 
    },
    { 
      icon: Receipt, 
      title: 'Fee Management', 
      desc: 'Custom fee structures, payment receipts, due reminders, and financial reports.' 
    },
    { 
      icon: Bell, 
      title: 'School Notices', 
      desc: 'Publish circulars, holiday notices, and event announcements across portals.' 
    },
  ];

  return (
    <div className="space-y-20 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C1D24]/10 border border-[#5C1D24]/20 text-xs font-semibold text-[#5C1D24] uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#5C1D24]" />
            <span>Platform Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Newsreader'] font-normal text-[#1A1918] tracking-tight">
            Full Feature Overview
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Built from the ground up for modern educational governance, multi-tenant isolation, and daily operational ease.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-center text-[#1B2A4A]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-['Newsreader'] font-bold text-[#1A1918]">
                  {item.title}
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Features;