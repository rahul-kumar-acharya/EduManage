import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#1B2A4A] hover:bg-[#5C1D24] text-white focus:ring-[#1B2A4A]',
    secondary: 'bg-white hover:bg-[#F7F5F0] text-[#1A1918] border border-[#E5E0D8] focus:ring-slate-500 shadow-sm',
    danger: 'bg-[#5C1D24] hover:bg-[#5C1D24]/90 text-white focus:ring-[#5C1D24]',
    outline: 'border border-[#E5E0D8] text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0] focus:ring-[#1B2A4A]',
    glass: 'bg-transparent text-[#64748B] hover:text-[#1A1918] hover:bg-[#F7F5F0] focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
