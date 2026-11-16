import React from 'react';
import { 
  GraduationCap, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Receipt, 
  Bell, 
  Zap 
} from 'lucide-react';

const Features = () => {
  const featureList = [
    { 
      icon: GraduationCap, 
      title: 'Academic Structure', 
      desc: 'Manage Sessions, Class Levels, Sections, and Subjects seamlessly in one unified interface.' 
    },
    { 
      icon: Users, 
      title: 'Student & Teacher Profiles', 
      desc: 'Centralized directory for admissions, documents, employee profiles, and leave allocations.' 
    },
    { 
      icon: CalendarCheck, 
      title: 'Smart Attendance', 
      desc: 'Daily digital attendance logs with automated monthly calculations and parent notification records.' 
    },
    { 
      icon: FileSpreadsheet, 
      title: 'Exams & Gradebooks', 
      desc: 'Configure exam terms, enter subject marks, auto-compute GPAs/grades, and generate PDF report cards.' 
    },
    { 
      icon: Receipt, 
      title: 'Fee Management', 
      desc: 'Custom class fee structures, digital payment receipts, balance tracking, and audit ledgers.' 
    },
    { 
      icon: Bell, 
      title: 'School Notices', 
      desc: 'Publish official circulars, holiday calendars, and event bulletins across dedicated role portals.' 
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 font-['Inter'] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 tracking-wide">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Platform Capabilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            Full Feature Overview
          </h1>
          <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
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
                className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-lg transition-all space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
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