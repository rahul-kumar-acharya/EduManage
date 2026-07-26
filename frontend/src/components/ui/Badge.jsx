import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    info: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/20',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-[#5C1D24]/10 text-[#5C1D24] border-[#5C1D24]/20',
    danger: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    purple: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
