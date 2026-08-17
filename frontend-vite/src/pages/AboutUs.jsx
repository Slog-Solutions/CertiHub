import React from 'react';
import { Target, Eye, Award, CheckCircle, ShieldCheck, Compass } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="flex-1 space-y-16 py-12 relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Title Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
          <Compass className="h-3 w-3" />
          Know Slog Solutions
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-tight">
          Pioneering <span className="gradient-text">Vocational Excellence</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          SLOG Dehradun is the trusted partner and skilled vendor of multiple IT and non-IT engineering block domains in Uttarakhand.
        </p>
      </div>

      {/* Grid Content: Profile & Accreditations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Card */}
        <div className="md:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 space-y-4 shadow-lg text-left">
          <h2 className="text-xl font-bold text-[var(--text-dark)] border-b border-[var(--border-color)] pb-3">
            Company Overview
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed justify">
            SLOG Dehradun – the premier vocational coaching block in Dehradun – provides a powerful training tool that maps industry-level coding and implementation parameters. Slog has successfully delivered thousands of skilled professionals to the digital and mechanical engineering sectors.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed justify">
            Our company focuses on providing modern lab infrastructure, project-focused courses, and real-time query support. We are a trusted academic associate of multiple local universities and corporate engineering cells. Our tracking algorithms ensure quality control and student growth profiles.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed justify">
            Whether you are a Computer Science student looking for Full-Stack React development, an Electronics enthusiast seeking embedded IoT robotics, or a Civil/Mechanical designer learning AutoCAD & Staad Pro, we have custom curriculums to accelerate your path.
          </p>
        </div>

        {/* Credentials list */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 shadow-lg text-left">
            <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-emerald-500" />
              Corporate Accreditations
            </h3>
            <ul className="space-y-3.5">
              <li className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-[var(--text-dark)]">MSME Registered</span>
                  <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">Government of India Micro enterprise tracking label.</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-[var(--text-dark)]">ISO 9001:2015 Certified</span>
                  <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">Compliance standards for standard course design and evaluations.</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-[var(--text-dark)]">MCA Approved</span>
                  <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">Approved under Ministry of Corporate Affairs, India.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-3 shadow-lg text-left flex gap-4 items-start">
            <ShieldCheck className="h-10 w-10 text-emerald-500 shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[var(--text-dark)]">Dual Certification Guarantee</h4>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                All candidates receive a verified Course Log certificate and a separate Project Accomplishment record showing real-world development credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Mission */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
            <Target className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-dark)]">Our Mission</h3>
          <p className="text-xs text-slate-400 leading-relaxed justify">
            To empower technical candidates with standard, hands-on, live-project industrial learning. We bridge the academic gap by introducing trending algorithms and frameworks to build software engineers, digital marketing advisors, and CAD designers ready for standard enterprise hiring.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
            <Eye className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-dark)]">Our Vision</h3>
          <p className="text-xs text-slate-400 leading-relaxed justify">
            To build a central block of technical experts that shapes the vocational training infrastructure in Uttarakhand. We aspire to maintain 100% transparency in placement track registries, ensuring every student has access to verified learning systems.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
