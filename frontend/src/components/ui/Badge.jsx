import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-normal ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
