import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 font-['Inter'] text-slate-800">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Visual Badge */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm shadow-indigo-500/10">
          <Compass className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border border-slate-200">
            404 Error • Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            We Lost This Page
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            The destination URL or resource you requested does not exist or may have been relocated to another workspace.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/25 transition-all cursor-pointer">
              <Home className="w-4 h-4" /> Return to Home
            </button>
          </Link>

          {isAuthenticated && (
            <Link to={user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'}>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Go to Dashboard
              </button>
            </Link>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
          Need assistance? Contact{' '}
          <a href="mailto:support.acharyacampus@gmail.com" className="text-indigo-600 hover:underline font-medium">
            support.acharyacampus@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

