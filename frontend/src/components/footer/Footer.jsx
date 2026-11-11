import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 px-6 font-['Inter'] text-slate-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg text-slate-900 block leading-none">
                AcharyaCampus
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600 mt-1">
                School OS Platform
              </span>
            </div>
          </Link>
          <p className="text-xs leading-relaxed text-slate-500">
            Next-generation multi-tenant school operating system empowering modern educational institutions with isolated cloud workspaces.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
            <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
            <li><Link to="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link></li>
          </ul>
        </div>

        {/* Platform Services */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 text-sm">Portals & Legal</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link to="/register-school" className="hover:text-indigo-600 transition-colors">Register Institution</Link></li>
            <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Portal Sign In</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Support Desk</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 text-sm">Contact Us</h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>support.acharyacampus@gmail.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>+91 7061638189</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Purnia, Bihar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <span>&copy; {new Date().getFullYear()} AcharyaCampus Multi-Tenant School OS. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link to="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
