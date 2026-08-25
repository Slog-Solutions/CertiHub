import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  Award,
  CheckCircle,
  PhoneCall,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  Zap,
  ArrowRight,
  Loader,
  BookOpen
} from 'lucide-react';

const Home = () => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 15000));
    const connectionDistance = 110;
    const mouse = { x: null, y: null, radius: 140 };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1
      });
    }

    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const parent = heroRef.current;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('resize', handleResize);

    const colorPrimary = theme === 'dark' ? '16, 185, 129' : '5, 150, 105';

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorPrimary}, ${theme === 'dark' ? 0.35 : 0.2})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * (theme === 'dark' ? 0.2 : 0.12);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${colorPrimary}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * (theme === 'dark' ? 0.3 : 0.18);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${colorPrimary}, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    courseInterested: '',
    message: ''
  });
  const [technologies, setTechnologies] = useState([]);
  const [loadingTech, setLoadingTech] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch active technologies from the public API for the Enquiry dropdown
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const res = await axios.get('/api/masters/technology/public');
        setTechnologies(res.data || []);
      } catch (err) {
        console.error('Failed to fetch public technologies:', err.message);
      } finally {
        setLoadingTech(false);
      }
    };
    fetchTechnologies();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    if (!formData.name || !formData.phone) {
      setSubmitError('Name and phone number are required.');
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setSubmitError('Phone number must be exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('/api/enquiry/public', formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        courseInterested: '',
        message: ''
      });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Enquiry submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accreditations = [
    { title: 'MSME Authorized', desc: 'Recognized under Ministry of Micro, Small & Medium Enterprises.', icon: Award },
    { title: 'ISO 9001:2015', desc: 'Certified quality management systems for vocational training.', icon: CheckCircle },
    { title: 'MCA Approved', desc: 'Government registered training and corporate solutions provider.', icon: GraduationCap },
    { title: '100% Practical', desc: 'Project-focused labs, live application coding, and real-time support.', icon: Zap },
    { title: 'Dual Certificate', desc: 'Receive both training program logs & project work completion certs.', icon: Briefcase }
  ];

  const tickerItems = [
    "🔥 Special Discounts on all technical vocational courses",
    "🎓 You can always start TODAY, there is no TOMORROW!",
    "🚀 100% Practical project-oriented internships & training logs",
    "🛡️ Ministry of Corporate Affairs (MCA) approved corporate standard training",
    "💎 Dual Certifications: receive both course log & project logs"
  ];

  const [activeTab, setActiveTab] = useState(0);

  const programData = [
    {
      code: "JGC",
      title: "Job Guaranteed Courses",
      badge: "6-Month Specialization",
      desc: "Rigorous industry-aligned certification modules designed to guarantee entry-level roles. Features intensive coding, system design, and placement support.",
      features: [
        "100% Placement Assurance",
        "Full-Stack Web Engineering",
        "Artificial Intelligence & ML",
        "Mechanical & Civil CAD Packages"
      ]
    },
    {
      code: "VOC",
      title: "Summer & Vocational Internship",
      badge: "4 to 6 Weeks Track",
      desc: "Project-oriented bootcamp designed for B.Tech, MCA, BCA, and Diploma students. Build live application logs and obtain practical lab exposure.",
      features: [
        "Python & Data Science Labs",
        "AutoCAD, Revit & SolidWorks",
        "IoT & Cyber Security Basics",
        "Academic Project Logs"
      ]
    },
    {
      code: "SCH",
      title: "School Programming Tracks",
      badge: "Fundamental Coding",
      desc: "Nurturing early logical capabilities and computational thinking for school-level students through interactive, beginner-friendly coding blocks.",
      features: [
        "Java & C++ Foundations",
        "Python Logic Building",
        "Basic Web Design & HTML",
        "Robotics & IoT Basics"
      ]
    }
  ];

  return (
    <div className="flex-1 pb-24 relative overflow-hidden bg-[var(--bg-cream)] transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

      {/* 1. HERO SECTION */}
      <div ref={heroRef} className="relative min-h-[550px] md:min-h-[700px] flex flex-col justify-center items-center overflow-hidden -mt-16 pt-24 md:pt-32 pb-16 bg-dot-grid border-b border-[var(--border-color)]">
        {/* Interactive canvas background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" 
        />

        {/* Glow backdrop layer matching guilds.work style */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none z-0" />

        {/* Background Image watermark restricted to Hero */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" 
          style={{ 
            backgroundImage: "url('/6233042254801080167.jpg')", 
            opacity: theme === 'dark' ? 0.20 : 0.12,
            mixBlendMode: theme === 'dark' ? 'normal' : 'multiply',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)'
          }} 
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
          {/* Pulse Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] mx-auto animate-pulse">
            <Compass className="h-4.5 w-4.5" />
            Slog Solutions Pvt. Ltd. Dehradun
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[var(--text-dark)] tracking-tight leading-[1.02] text-balance">
            Accelerate Your <br />
            <span className="gradient-text">Technical Career.</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-xl text-[13px] sm:text-[15px] leading-relaxed text-[var(--text-muted)] text-balance">
            SLOG is a premium vocational training and corporate coaching vendor. We offer project-based internships, dual certifications, and placement assistance designed to match high-demand software engineering roles.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="#programs-matrix" 
              className="w-full sm:w-auto inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Courses
            </a>
            <Link 
              to="/verify" 
              className="w-full sm:w-auto inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 text-xs font-bold text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] transition-all duration-200 hover:-translate-y-0.5"
            >
              Verify Credentials
            </Link>
          </div>

          {/* Program tracks selectors */}
          <div className="pt-12 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] p-1 backdrop-blur-sm shadow-md">
              {programData.map((p, i) => (
                <button
                  key={p.code}
                  onClick={() => {
                    setActiveTab(i);
                    document.getElementById('programs-matrix')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex px-4 py-1.5 rounded-full text-[10px] font-extrabold transition-all duration-200 ${
                    i === activeTab 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-[var(--text-muted)] hover:bg-[var(--primary-subtle)] hover:text-emerald-500'
                  }`}
                >
                  {p.code} Track
                </button>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">
              Click a track to explore the curriculum
            </p>
          </div>
        </div>
      </div>

      {/* Ticker marquee */}
      <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border-color)] overflow-hidden py-3 flex relative z-10">
        <div className="flex select-none overflow-hidden w-full">
          <div className="animate-marquee-scroll flex items-center gap-16 whitespace-nowrap min-w-full shrink-0">
            {tickerItems.map((text, i) => (
              <div key={i} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-3 text-[var(--text-muted)] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="animate-marquee-scroll flex items-center gap-16 whitespace-nowrap min-w-full shrink-0" aria-hidden="true">
            {tickerItems.map((text, i) => (
              <div key={`clone-${i}`} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-3 text-[var(--text-muted)] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE PROGRAMS MATRIX SECTION */}
      <section id="programs-matrix" className="relative py-24 border-b border-[var(--border-color)]">
        {/* Ambient Grid Accent */}
        <div className="absolute inset-0 bg-dot-grid opacity-[0.25] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-cream)] via-transparent to-[var(--bg-cream)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 space-y-16">
          <div className="max-w-2xl text-left space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">Specialized Training Modules</p>
            <h2 className="text-4xl font-black text-[var(--text-dark)] tracking-tight sm:text-5xl">
              Build Projects.<br />Learn Industry Standards.
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
              Choose between comprehensive job guaranteed packages, short-term project bootcamps, or school programming courses.
            </p>
          </div>

          {/* Desktop Matrix Layout */}
          <div className="hidden md:block space-y-6">
            {/* Tab Selectors */}
            <div className="relative flex items-center gap-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 shadow-sm">
              {programData.map((p, i) => (
                <button
                  key={p.code}
                  onClick={() => setActiveTab(i)}
                  className={`relative z-10 flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-3.5 transition-all duration-200 ${
                    i === activeTab 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)]'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    i === activeTab ? 'bg-white scale-125' : 'bg-emerald-500/50'
                  }`} />
                  <div className="text-center mt-1">
                    <p className="text-xs font-extrabold tracking-wider">{p.code} Track</p>
                    <p className={`text-[9px] font-semibold ${i === activeTab ? 'text-emerald-100' : 'text-[var(--text-muted)]'}`}>
                      {p.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Tab Content Container */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md overflow-hidden grid grid-cols-12">
              {/* Left Info Column */}
              <div className="col-span-4 border-r border-[var(--border-color)] bg-[var(--bg-cream)] p-8 flex flex-col justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl flex items-center justify-center border bg-emerald-500 text-white border-emerald-400 w-12 h-12 text-sm font-black shadow-lg shadow-emerald-500/20">
                    {programData[activeTab].code}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-[var(--text-dark)]">{programData[activeTab].title}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold">{programData[activeTab].badge}</p>
                  </div>
                </div>

                <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Authorized Curriculum</span>
                  </div>
                  <p className="mt-2 text-lg font-black leading-tight text-emerald-500 tracking-tight">
                    ISO 9001:2015 Approved
                  </p>
                  <p className="mt-1.5 text-[9px] text-[var(--text-muted)] font-semibold">Trainee milestone syllabus</p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-[var(--text-muted)] font-semibold">
                  <Compass className="h-4 w-4 text-emerald-500" />
                  <span>Industrial Placement Focus</span>
                </div>
              </div>

              {/* Right Detail Column */}
              <div className="col-span-8 p-8 flex flex-col justify-between text-left">
                <div className="space-y-6">
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    {programData[activeTab].desc}
                  </p>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Core Technical Specializations
                    </p>
                    <ul className="grid grid-cols-2 gap-3">
                      {programData[activeTab].features.map((item, index) => (
                        <li key={index} className="flex items-center gap-2.5 text-xs text-[var(--text-dark)] font-semibold">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <ArrowRight className="h-3 w-3" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold">
                  <span>Slog Vocational Training standards</span>
                  <a href="#enquiry-quest" className="text-emerald-500 hover:underline">Submit Enquiry for details →</a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Accordions Layout */}
          <div className="block md:hidden space-y-3">
            {programData.map((p, i) => (
              <div 
                key={p.code} 
                className={`overflow-hidden rounded-2xl border transition-all duration-200 text-left ${
                  i === activeTab 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                }`}
              >
                <button 
                  onClick={() => setActiveTab(i)}
                  className="flex w-full items-center gap-4 p-4"
                >
                  <div className={`rounded-lg flex items-center justify-center border text-xs font-bold w-9 h-9 ${
                    i === activeTab 
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20' 
                      : 'bg-[var(--bg-cream)] text-[var(--text-muted)] border-[var(--border-color)]'
                  }`}>
                    {p.code}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--text-dark)]">{p.title}</p>
                    <p className="mt-0.5 text-[9px] text-[var(--text-muted)] font-semibold">
                      {p.badge}
                    </p>
                  </div>
                  <div>
                    <ArrowRight className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${
                      i === activeTab ? 'rotate-90 text-emerald-500' : ''
                    }`} />
                  </div>
                </button>

                {i === activeTab && (
                  <div className="border-t border-[var(--border-color)] p-4 space-y-4 bg-[var(--bg-card)]">
                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                      {p.desc}
                    </p>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Core Specializations
                      </p>
                      <ul className="space-y-1.5">
                        {p.features.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-[var(--text-dark)] font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative py-24 bg-[var(--bg-card)] border-b border-[var(--border-color)] overflow-hidden">
        <div className="absolute -right-32 top-24 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-32 bottom-24 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-16">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">How it works</p>
            <h2 className="text-3xl font-black text-[var(--text-dark)] tracking-tight sm:text-4xl">
              Four steps. No gatekeepers.
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Step list left */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1 */}
              <div className="group flex gap-6 text-left">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-cream)] shadow-sm font-bold text-sm text-[var(--text-dark)] group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition duration-200">
                    01
                  </div>
                  <div className="h-full w-px bg-[var(--border-color)] mt-2" />
                </div>
                <div className="pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Step 01</span>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">~1 minute</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[var(--text-dark)]">Select a Tech Track</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    Pick a domain from Web Development, Artificial Intelligence, Machine Learning, CAD Modeling, or IoT. Register without stressful entrance gatekeepers.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group flex gap-6 text-left">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-cream)] shadow-sm font-bold text-sm text-[var(--text-dark)] group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition duration-200">
                    02
                  </div>
                  <div className="h-full w-px bg-[var(--border-color)] mt-2" />
                </div>
                <div className="pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Step 02</span>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">4 to 6 weeks</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[var(--text-dark)]">Build in Live Labs</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    Access physical laboratories. Build real, structural code projects and design documentation files under direct specialist training mentorship.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group flex gap-6 text-left">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-cream)] shadow-sm font-bold text-sm text-[var(--text-dark)] group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition duration-200">
                    03
                  </div>
                  <div className="h-full w-px bg-[var(--border-color)] mt-2" />
                </div>
                <div className="pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Step 03</span>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">Weekly</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[var(--text-dark)]">Submit & Check Logs</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    Push project changes. Get reviewed, clear milestone checks, and unlock credentials as your vocational skills logs compound.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="group flex gap-6 text-left">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-cream)] shadow-sm font-bold text-sm text-[var(--text-dark)] group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition duration-200">
                    04
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Step 04</span>
                    <span className="text-[9px] uppercase text-[var(--text-muted)] font-semibold">Instant verification</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[var(--text-dark)]">Verify & Placements</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    Approved projects instantly load onto your secure CertiHub Digital Certificate, ready to share with recruiters via cryptographic signature links.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Card right */}
            <div className="lg:col-span-5 text-left">
              <div className="sticky top-24 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-cream)] p-8 space-y-6 shadow-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500">What you walk away with</p>
                <h3 className="text-xl font-bold leading-snug tracking-tight text-[var(--text-dark)]">
                  A digital skill record card that proves what you can ship.
                </h3>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  Every project you complete gets logged as a verified credential. It belongs to you forever, accessible to any employer seeking direct engineering capability.
                </p>
                <div className="space-y-3 pt-2">
                  <a 
                    href="#enquiry-quest" 
                    className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-bold text-white transition-all hover:bg-emerald-400"
                  >
                    Start Training Track
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                  <a 
                    href="https://wa.me/917417483499" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 text-xs font-bold text-emerald-500 transition-all hover:bg-emerald-500/10"
                  >
                    Discuss on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACCREDITATIONS BADGES BANNER */}
      <section className="bg-[var(--bg-cream)] border-b border-[var(--border-color)] py-16">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-500">Our Authorized Standards</h2>
            <p className="text-xl font-extrabold text-[var(--text-dark)]">ISO Certified & MSME Approved Quality Education</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {accreditations.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 text-left space-y-4"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-dark)]">{item.title}</h4>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)] leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="bg-slate-900 text-white py-20 px-6 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Testimonial</h2>
            <p className="text-2xl font-black tracking-tight text-white uppercase">What Our Trainees Say About Us?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Shivani Card */}
            <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-xl flex flex-col justify-between relative transform hover:-translate-y-1 transition duration-300">
              <span className="absolute top-4 left-6 text-6xl text-slate-100 font-serif leading-none select-none">“</span>
              <p className="text-xs leading-relaxed text-slate-600 relative z-10 pt-4 mb-6">
                "I have done my training in python and machine learning , great experience. Learnt a lot, Best faculties, best infrastructure in dehradun, very supportive staff. My suggestion is atleast vist slog campus and intract with faculty. U also find it's best.."
              </p>
              <div className="text-right font-bold text-[10px] text-emerald-600 tracking-wide uppercase">
                — Shivani Singh Chauhan
              </div>
            </div>

            {/* Abuzar Card */}
            <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-xl flex flex-col justify-between relative transform hover:-translate-y-1 transition duration-300">
              <span className="absolute top-4 left-6 text-6xl text-slate-100 font-serif leading-none select-none">“</span>
              <p className="text-xs leading-relaxed text-slate-600 relative z-10 pt-4 mb-6">
                "Hey...I have completed my python and php course. Great experience. Best Institute for python course."
              </p>
              <div className="text-right font-bold text-[10px] text-emerald-600 tracking-wide uppercase">
                — Abuzar Khan
              </div>
            </div>

            {/* Uttkarsh Card */}
            <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-xl flex flex-col justify-between relative transform hover:-translate-y-1 transition duration-300">
              <span className="absolute top-4 left-6 text-6xl text-slate-100 font-serif leading-none select-none">“</span>
              <p className="text-xs leading-relaxed text-slate-600 relative z-10 pt-4 mb-6">
                "Best Training Institute in Dehradun for Autocad and 3Ds max. 100% practical and professional knowledge. Experienced faculty. Best environment for learning."
              </p>
              <div className="text-right font-bold text-[10px] text-emerald-600 tracking-wide uppercase">
                — Uttkarsh Rastogi
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="h-2 w-2 rounded-full bg-slate-700" />
          </div>
        </div>
      </section>

      {/* 6. ENROLLMENT QUEST BOARD (CRM ENQUIRY FORM) */}
      <section id="enquiry-quest" className="relative py-24 px-6 max-w-4xl mx-auto">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center space-y-8">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--text-dark)] tracking-tight">Discuss Your Career Goals</h2>
            <p className="text-xs text-[var(--text-muted)] max-w-lg mx-auto">
              Send us your course interest, and an academic advisor will get back to you with custom scholarship options.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Thank you! Your enquiry has been saved. An advisor will contact you shortly.</span>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {submitError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="form-input-custom"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mobile Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="form-input-custom"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="form-input-custom"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Interested Course</label>
                <select
                  name="courseInterested"
                  value={formData.courseInterested}
                  onChange={handleInputChange}
                  className="form-input-custom"
                >
                  <option value="">Select a training domain</option>
                  {loadingTech ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    technologies.map((tech) => (
                      <option key={tech._id} value={tech.name}>
                        {tech.name}
                      </option>
                    ))
                  )}
                  <option value="JGC Module (AI + ML)">JGC Module (AI + ML)</option>
                  <option value="JGC Module (Web Development)">JGC Module (Web Development)</option>
                  <option value="JGC Module (Civil CAD)">JGC Module (Civil CAD)</option>
                  <option value="JGC Module (Mechanical CAD)">JGC Module (Mechanical CAD)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Ask us about pricing, batch schedules, or demo classes..."
                rows="3"
                className="form-input-custom w-full resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary justify-center py-3 text-xs"
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Submit Enquiry
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
