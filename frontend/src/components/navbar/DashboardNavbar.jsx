import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { Link } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const { school } = useSchool();

  return (
    <header className="h-16 border-b border-[#E5E0D8] bg-white px-6 flex items-center justify-between sticky top-0 z-20 w-full select-none">
      {/* Left: Context Indicator */}
      <div className="flex items-center gap-3">
        {school ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
              Institutional Workspace
            </span>
            <span className="text-xs text-[#E5E0D8] font-mono hidden sm:inline">•</span>
            <span className="text-sm font-['Newsreader'] font-bold text-[#1A1918] hidden sm:inline">
              {school.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#5C1D24]" />
            <span className="text-[10px] font-bold text-[#5C1D24] uppercase tracking-wider">
              SuperAdmin Portal
            </span>
          </div>
        )}
      </div>

      {/* Right: User profile summary */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 border-l border-[#E5E0D8] pl-4">
            <Link to="/dashboard/profile" className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer" title="Edit Profile Settings">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-[#E5E0D8] shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-xs">
                  {user.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#1A1918]">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[10px] text-[#64748B] font-medium">
                  {user.email}
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20 text-[10px] font-bold uppercase tracking-wider">
                {user.role === 'SUPER_ADMIN' ? 'Super Admin' :
                 user.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                 user.role === 'TEACHER' ? 'Faculty' :
                 user.role === 'ACCOUNTANT' ? 'Billing' :
                 user.role === 'STUDENT' ? 'Student' :
                 user.role === 'PARENT' ? 'Parent' : user.role}
              </span>
            </Link>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#5C1D24] hover:bg-[#F7F5F0] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardNavbar;
