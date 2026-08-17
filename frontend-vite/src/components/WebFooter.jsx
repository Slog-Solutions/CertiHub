import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Award, Shield, MessageSquare } from 'lucide-react';

const WebFooter = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm">
                SS
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Slog Solutions
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed justify">
              SLOG Dehradun – The reputed training institute in Dehradun provides powerful project-based internship and training tools that prepare individuals and corporate clients with top-tier skills compliance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.facebook.com/slogsolutions/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://twitter.com/IndiaSlog" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://www.instagram.com/slogsolutions" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/slogsolutions007" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* JGC Programs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-l-2 border-emerald-500 pl-2">
              Job Guaranteed Courses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/courses" className="hover:text-emerald-400 transition">Module 1 (AI + ML Package)</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-emerald-400 transition">Module 2 (Web Designing & Development)</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-emerald-400 transition">Module 3 (Digital Marketing & Networking)</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-emerald-400 transition">Module 4 (Civil CAD Package)</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-emerald-400 transition">Module 5 (Mechanical CAD Package)</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-emerald-400 transition">Module 6 (Internet of Things & Automation)</Link>
              </li>
            </ul>
          </div>

          {/* Office Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-l-2 border-emerald-500 pl-2">
              Office Address
            </h4>
            <div className="flex gap-2.5 items-start text-xs text-slate-400 leading-relaxed">
              <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                SLOG Solutions, 1st Floor, Institution of Engineers Building, Near ISBT, Dehradun, Uttarakhand, 248001
              </span>
            </div>
            <div className="pt-2">
              <Link to="/login" className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 transition">
                Employee Access Portal
              </Link>
            </div>
          </div>

          {/* Contact Helpline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-l-2 border-emerald-500 pl-2">
              Contact Helpline
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div>
                <span className="block font-bold text-slate-200 text-[10px] uppercase tracking-wide">Training Helpline:</span>
                <div className="flex gap-2 items-center mt-1">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  <a href="tel:7456000242" className="hover:text-emerald-400 transition">+(91) 7456000242, 243</a>
                </div>
              </div>
              <div>
                <span className="block font-bold text-slate-200 text-[10px] uppercase tracking-wide">WhatsApp Support:</span>
                <div className="flex gap-2 items-center mt-1">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                  <a href="https://wa.me/917456000240" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">+(91) 7456000240</a>
                </div>
              </div>
              <div>
                <span className="block font-bold text-slate-200 text-[10px] uppercase tracking-wide">E-mail:</span>
                <div className="flex gap-2 items-center mt-1">
                  <Mail className="h-3.5 w-3.5 text-emerald-500" />
                  <a href="mailto:info@slogsolutions.com" className="hover:text-emerald-400 transition">info@slogsolutions.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Slog Solutions Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/verify" className="hover:text-slate-300 transition">Verify Certificate</Link>
            <Link to="/register" className="hover:text-slate-300 transition">Student Registration</Link>
            <Link to="/login" className="hover:text-slate-300 transition">Portal Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WebFooter;
