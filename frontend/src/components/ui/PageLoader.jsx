import React from 'react';

const PageLoader = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 p-8 animate-in fade-in duration-200">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
      <span className="text-xs font-medium text-slate-400 tracking-wide">
        Loading view...
      </span>
    </div>
  );
};

export default PageLoader;

