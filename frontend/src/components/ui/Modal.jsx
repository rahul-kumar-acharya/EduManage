import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl border border-[#E5E0D8]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F7F5F0]">
          <h3 className="text-lg font-['Newsreader'] font-bold text-[#1A1918]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#1A1918] p-1.5 rounded-lg hover:bg-[#F7F5F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
