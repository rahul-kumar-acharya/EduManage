import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || props.name;
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-bold text-[#1A1918] uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={effectiveType}
          className={`w-full bg-[#F7F5F0] border border-[#E5E0D8] rounded-lg px-4 py-2.5 text-xs text-[#1A1918] placeholder-[#64748B] focus:outline-none focus:border-[#1B2A4A] transition-colors ${
            Icon ? 'pl-9' : ''
          } ${isPasswordType ? 'pr-10' : ''} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 text-[#64748B] hover:text-[#1B2A4A] focus:outline-none transition-colors"
            tabIndex={-1}
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;

