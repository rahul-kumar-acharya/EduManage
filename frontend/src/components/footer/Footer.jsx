import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[#E5E0D8] bg-white py-12 px-6 font-['Plus_Jakarta_Sans'] text-[#64748B]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-[#F7F5F0]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-['Newsreader'] font-bold text-xl text-[#1A1918] block leading-none">
                AcharyaCampus
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-[#5C1D24] mt-1">
                School OS Platform
              </span>
            </div>
          </Link>
          <p className="text-xs leading-relaxed text-[#64748B]">
            Next-generation multi-tenant school operating system empowering educational institutions globally.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-['Newsreader'] font-bold text-[#1A1918] text-base">Quick Links</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-[#1B2A4A] transition-colors">About Us</Link></li>
            <li><Link to="/features" className="hover:text-[#1B2A4A] transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-[#1B2A4A] transition-colors">Pricing</Link></li>
            <li><Link to="/faq" className="hover:text-[#1B2A4A] transition-colors">FAQ</Link></li>
          </ul>

        </div>

        {/* Platform Services */}
        <div className="space-y-3">
          <h4 className="font-['Newsreader'] font-bold text-[#1A1918] text-base">Portals & Legal</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/register-school" className="hover:text-[#1B2A4A] transition-colors">Register Institution</Link></li>
            <li><Link to="/login" className="hover:text-[#1B2A4A] transition-colors">Portal Sign In</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-[#1B2A4A] transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-[#1B2A4A] transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact" className="hover:text-[#1B2A4A] transition-colors">Support Desk</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-['Newsreader'] font-bold text-[#1A1918] text-base">Contact Us</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1B2A4A]" />
              <span>support.acharyacampus@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1B2A4A]" />
              <span>+91 7061638189</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1B2A4A]" />
              <span>Purnia, Bihar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#E5E0D8] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <span>&copy; {new Date().getFullYear()} AcharyaCampus Multi-Tenant School OS. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link to="/privacy-policy" className="hover:text-[#1B2A4A] transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-[#1B2A4A] transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-[#1B2A4A] transition-colors">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
