"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Briefcase,
  FileCheck,
  PhoneCall,
  Mail,
  Layers,
  Target,
  Zap,
  BookOpen,
  Cpu,
  Server,
  Lock,
  ChevronRight,
  Heart,
  Globe,
  Quote,
  Camera,
  X,
  Eye,
} from "lucide-react";

import isoImg from "@/assets/iso.png";
import gemImg from "@/assets/GeM.png";
import corporateImg1 from "@/assets/corporateTraining1.png";
import corporateImg2 from "@/assets/corporateTraining2.png";
import corporateImg4 from "@/assets/corporateTraining4.png";
import armyImg from "@/assets/ArmyTraing.png";
import studImg from "@/assets/studtraining.png";
import outboundImg from "@/assets/outbound.png";

// Dynamically import IndiaMap component
const IndiaMap = dynamic(() => import("@/components/IndiaMap"), { ssr: false });

// Real Training & Company Photos from public/training photos
const actionPhotos = [
  {
    src: "/training photos/photo_6073384451959362380_y.jpg",
    title: "Corporate & Institutional Bootcamps",
    desc: "Interactive technical training delivered for workforce upskilling.",
    tag: "Corporate Training",
  },
  {
    src: "/training photos/photo_6073384451959362378_y.jpg",
    title: "Interactive Classroom Sessions",
    desc: "Live mentor-led learning and software architecture workshops.",
    tag: "Classroom Labs",
  },
  {
    src: "/training photos/photo_6073384451959362379_y.jpg",
    title: "Practical Engineering Workshops",
    desc: "Hands-on problem solving using industry-standard tech stacks.",
    tag: "Practical Labs",
  },
  {
    src: "/training photos/photo_6073384451959362381_y.jpg",
    title: "1-on-1 Code Review & Mentorship",
    desc: "Direct mentor guidance on capstone projects and live software.",
    tag: "Mentorship",
  },
  {
    src: "/training photos/photo_6073384451959362382_y.jpg",
    title: "Student Industrial Internships",
    desc: "Building placement-ready talent with real project experience.",
    tag: "Industrial Internships",
  },
  {
    src: "/training photos/photo_6073384451959362383_y.jpg",
    title: "Certification & Achievement Ceremonies",
    desc: "Awarding verifiable credentials upon successful project completion.",
    tag: "Certifications",
  },
];

// Timeline journey steps
const timelineSteps = [
  {
    num: "01",
    title: "THE BEGINNING",
    desc: "Slog began with a vision to combine technology development with practical learning and create solutions that address real-world needs.",
  },
  {
    num: "02",
    title: "TECHNOLOGY & TRAINING",
    desc: "We expanded our work across software development, technical training, professional development, and technology-driven learning programs.",
  },
  {
    num: "03",
    title: "INSTITUTIONAL & GOVERNMENT PROJECTS",
    desc: "Our work grew into institutional, government, and organizational projects, allowing us to apply technology and training in real operational environments.",
  },
  {
    num: "04",
    title: "DEFENCE & SPECIALIZED SOLUTIONS",
    desc: "We expanded into specialized technology solutions and training initiatives supporting defence and other high-impact institutional requirements.",
  },
  {
    num: "05",
    title: "AI & EMERGING TECHNOLOGY",
    desc: "Today, Slog continues to explore AI, automation, computer vision, data-driven systems, and emerging technologies while developing solutions for evolving organizational needs.",
  },
  {
    num: "06",
    title: "TODAY",
    desc: "From building digital platforms to developing future-ready talent, Slog continues to grow as a technology partner focused on practical innovation and measurable impact.",
  },
];

// Ecosystem Pillars
const ecosystemCards = [
  {
    title: "Technology",
    desc: "Custom software, web platforms, AI solutions, automation, and digital systems built around real-world requirements.",
    services: ["Software Development", "AI / ML Solutions", "Web & Mobile Apps", "Enterprise Systems", "Automation"],
    link: "/development",
    cta: "Explore Technology →",
    icon: Cpu,
  },
  {
    title: "Learning",
    desc: "Industry-ready training programs designed to help students, professionals, teams, and organizations build practical technology capabilities.",
    services: ["Student Training", "Corporate Training", "Government Training", "AI & Technology Programs", "Workshops"],
    link: "/training",
    cta: "Explore Training →",
    icon: BookOpen,
  },
  {
    title: "Innovation",
    desc: "Exploring emerging technologies and transforming promising ideas into practical, real-world solutions.",
    services: ["Artificial Intelligence", "Computer Vision", "Data & Analytics", "Automation", "Research & Innovation"],
    link: "/development",
    cta: "Explore Innovation →",
    icon: Sparkles,
  },
  {
    title: "Defence & Government",
    desc: "Secure, reliable technology solutions and specialized training designed for defence, government, and institutional environments.",
    services: ["Defence Solutions", "Secure Applications", "Training Systems", "Digital Transformation", "Institutional Platforms"],
    link: "/defence",
    cta: "Explore Solutions →",
    icon: ShieldCheck,
  },
];

// How We Work Steps
const workSteps = [
  {
    num: "01",
    name: "UNDERSTAND",
    desc: "We start by understanding the problem, environment, people, and requirements before deciding on the right solution.",
  },
  {
    num: "02",
    name: "DESIGN",
    desc: "We translate requirements into a clear solution strategy, combining the right technology, experience, and learning approach.",
  },
  {
    num: "03",
    name: "BUILD",
    desc: "We develop, test, and refine the solution with a focus on quality, usability, security, and real-world performance.",
  },
  {
    num: "04",
    name: "DEPLOY",
    desc: "We implement solutions in real environments and support teams through adoption, integration, and knowledge transfer.",
  },
  {
    num: "05",
    name: "IMPACT",
    desc: "We measure outcomes, learn from real-world use, and continuously improve to ensure the solution delivers meaningful value.",
  },
];

// Projects Showcase
const projects = [
  {
    category: "DEFENCE / AI",
    title: "Wildlife Intrusion Detection System",
    desc: "An AI-powered computer vision system designed to detect wildlife activity in real time and support rapid response in operational environments.",
    link: "/defence",
  },
  {
    category: "GOVERNMENT",
    title: "Digital Platform for Institutional Operations",
    desc: "A centralized digital platform designed to streamline institutional workflows, manage operational information, and improve coordination across teams.",
    link: "/development",
  },
  {
    category: "AI / AUTOMATION",
    title: "Intelligent Vehicle Recognition",
    desc: "An intelligent vehicle monitoring system combining computer vision and number-plate recognition to support automated identification, registration, and operational logging.",
    link: "/development",
  },
  {
    category: "TRAINING",
    title: "Corporate AI Training Program",
    desc: "Practical AI and emerging-technology training designed to help professionals and teams understand, adopt, and apply modern technology in their work.",
    link: "/training",
  },
];

// Credentials
const credentials = [
  {
    label: "ISO Certified",
    sub: "Quality Standards",
    desc: "ISO Certified Technical & Skill Training Protocols",
    icon: "📜",
  },
  {
    label: "Award Winning",
    sub: "Quality Innovation",
    desc: "Quality Innovation Award 2022 Winner",
    icon: "🏆",
  },
  {
    label: "Government Projects",
    sub: "Empaneled Vendor",
    desc: "Technology solutions and training for institutional & government environments.",
    icon: "🏛️",
  },
  {
    label: "Defence Sector Experience",
    sub: "High Security",
    desc: "Specialized technology and training initiatives for defence-oriented environments.",
    icon: "🛡️",
  },
  {
    label: "Data Security & Compliance",
    sub: "Zero Trust",
    desc: "Security-conscious technology solutions designed with responsible data handling.",
    icon: "🔒",
  },
];

// Core Principles / Values
const values = [
  {
    num: "01",
    title: "Solve Real Problems",
    desc: "We start with the problem, not the technology. Every solution begins by understanding what needs to change, who it needs to help, and what success should look like.",
  },
  {
    num: "02",
    title: "Innovate with Purpose",
    desc: "We explore new technologies because they can create better possibilities — not simply because they are new. We focus on turning innovation into something useful, practical, and measurable.",
  },
  {
    num: "03",
    title: "People First",
    desc: "Technology succeeds when people can understand it, use it, and benefit from it. We design our solutions and learning experiences around the people they are meant to serve.",
  },
  {
    num: "04",
    title: "Keep Learning",
    desc: "Technology never stands still. We continuously learn, experiment, adapt, and share knowledge so that our capabilities keep moving forward.",
  },
  {
    num: "05",
    title: "Build with Responsibility",
    desc: "We understand that technology can influence people, organizations, and critical environments. We approach our work with attention to quality, reliability, security, and long-term impact.",
  },
  {
    num: "06",
    title: "Create Lasting Impact",
    desc: "Our work does not end when a product is delivered or a training program is completed. We aim to create outcomes that continue to deliver value beyond the initial engagement.",
  },
];

export default function AboutPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      
      {/* ── SECTION 01 — HERO / ABOUT SLOG ──────────────────────────── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900 text-white">
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold rounded-full backdrop-blur-md uppercase tracking-wider">
                <Globe className="h-4 w-4 text-teal-400" /> ABOUT SLOG
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Technology that solves. <br />
                <span className="text-teal-400">Training that transforms.</span> <br />
                <span className="text-blue-200">Innovation that moves organizations forward.</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
                We build digital solutions, develop talent, and help organizations adopt emerging technology to create meaningful, measurable impact.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <EnquiryForm
                  triggerButton={
                    <button className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      Work With Us →
                    </button>
                  }
                />
                <a
                  href="#story"
                  className="px-8 py-3.5 border-2 border-teal-400/50 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  Explore Our Story ↓
                </a>
              </div>

              {/* Impact Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-teal-500/30">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">50+</div>
                  <div className="text-xs text-blue-100 font-medium">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">500+</div>
                  <div className="text-xs text-blue-100 font-medium">Training Programs</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">15,000+</div>
                  <div className="text-xs text-blue-100 font-medium">Learners Impacted</div>
                </div>
              </div>

              <p className="text-xs text-teal-300/80 font-semibold tracking-widest uppercase">
                Technology • Training • Innovation • Defence
              </p>
            </motion.div>

            {/* Right-Side Visual: Real Photo Card with Dehradun Spotlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl overflow-hidden border-2 border-teal-400/40 shadow-2xl bg-white p-3 group">
                <div className="relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden">
                  <img
                    src="/training photos/photo_6073384451959362380_y.jpg"
                    alt="Slog Solutions Dehradun Headquarters & Training Hub"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Dehradun Location Badge Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Dehradun Headquarters</h4>
                        <p className="text-xs text-teal-300">Innovation & Training Hub • Uttarakhand, India</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 02 — OUR STORY & TIMELINE ──────────────────────── */}
      <section id="story" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Story Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">OUR STORY</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Built from a <span className="text-teal-600">simple idea.</span>
              </h2>
              <p className="text-lg font-semibold text-teal-700">
                Technology should not just exist. It should create impact.
              </p>

              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  Slog Solutions Pvt. Ltd. is a technology and training company based in Dehradun, Uttarakhand, focused on building practical digital solutions and creating meaningful learning experiences.
                </p>
                <p>
                  We work with students, professionals, corporates, government organizations, institutions, and the defence sector to turn technology into real-world capability.
                </p>
                <p>
                  From software development and emerging technologies to professional training and specialized solutions, we combine technology, expertise, and continuous learning to help organizations and individuals move forward in a rapidly changing digital world.
                </p>
              </div>

              {/* Highlight Block */}
              <div className="p-6 bg-teal-50 border-l-4 border-teal-600 rounded-r-2xl space-y-2">
                <p className="text-sm font-semibold text-teal-900 italic leading-relaxed">
                  "We don't believe technology is valuable simply because it is new. We believe it is valuable when it solves a real problem, enables people, and creates lasting impact."
                </p>
              </div>

              <div>
                <a
                  href="#gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl text-sm shadow hover:bg-teal-700 transition-colors"
                >
                  Discover What We Do <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Timeline Right Column */}
            <div className="lg:col-span-7 space-y-6 bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-3xl border border-gray-100 shadow-md">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-900">THE JOURNEY & EVOLUTION</h3>
                <span className="text-xs font-bold text-teal-600 uppercase">2018 — Present</span>
              </div>

              <div className="space-y-6 relative pl-6 border-l-2 border-teal-300">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-teal-600 border-2 border-white group-hover:scale-125 transition-transform" />
                    <span className="text-xs font-bold text-teal-700 tracking-wider">{step.num} — {step.title}</span>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PHOTO SHOWCASE GALLERY — SLOG IN ACTION ─────────────────── */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-full uppercase tracking-wider">
              <Camera className="h-4 w-4" /> SLOG SOLUTIONS IN ACTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Live Projects, Bootcamps & <span className="text-teal-600">Training In Action</span>
            </h2>
            <p className="text-lg text-gray-600">
              Real photo snapshots from our corporate workshops, technical labs, and student industrial sessions across India.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {actionPhotos.map((photo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                onClick={() => setSelectedPhoto(photo.src)}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
              >
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 text-teal-700 text-xs font-bold rounded-full shadow-sm">
                      {photo.tag}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-gray-900/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    {photo.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 03 — OUR ECOSYSTEM / WHAT WE DO ────────────────── */}
      <section id="ecosystem" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">WHAT WE DO</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Our <span className="text-teal-600">Ecosystem</span>
            </h2>
            <p className="text-lg text-gray-600">
              We combine technology, training, and innovation to deliver end-to-end solutions that create measurable impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {ecosystemCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 flex flex-col justify-between group">
                  <div>
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-xl w-fit mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{card.desc}</p>
                    
                    <ul className="space-y-1.5 border-t border-gray-100 pt-3 mb-6">
                      {card.services.map((srv, sIdx) => (
                        <li key={sIdx} className="text-xs text-gray-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> {srv}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={card.link}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group-hover:underline"
                  >
                    {card.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Ecosystem Closing Statement */}
          <div className="bg-teal-50 rounded-2xl p-8 text-center max-w-3xl mx-auto shadow-md border border-teal-100 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">One ecosystem. Multiple possibilities.</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Whether the challenge is building a digital product, developing technology skills, modernizing an organization, or exploring what's next, Slog brings the technology, expertise, and learning capabilities together under one ecosystem.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full text-xs shadow transition-colors inline-block"
              >
                Explore Our Services →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 04 — HOW WE WORK ────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">HOW WE WORK</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              From Idea <span className="text-teal-600">to Impact</span>
            </h2>
            <p className="text-lg text-gray-600">
              Our approach combines clarity, collaboration, technology, and continuous improvement to deliver solutions that create long-term value.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {workSteps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md space-y-3 relative group hover:border-teal-300 transition-colors">
                <span className="text-3xl font-extrabold text-teal-600">{step.num}</span>
                <h3 className="text-lg font-bold text-gray-900">{step.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/development"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 hover:underline"
            >
              See What We've Built →
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 05 — OUR WORK IN ACTION ─────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">OUR WORK IN ACTION</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Solutions That <span className="text-teal-600">Create Impact</span>
            </h2>
            <p className="text-lg text-gray-600">
              We turn ideas, requirements, and real-world challenges into technology solutions that create measurable value for organizations, institutions, and communities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {projects.map((proj, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 space-y-3 group">
                <span className="px-3 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {proj.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{proj.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{proj.desc}</p>
                <Link
                  href={proj.link}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 group-hover:underline pt-2"
                >
                  View Project →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/development"
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full text-xs shadow transition-colors inline-block"
            >
              View All Projects →
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 06 — TRUST & CREDENTIALS ───────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">TRUST & CREDENTIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Trusted by Institutions. <span className="text-teal-600">Proven by Results.</span>
            </h2>
            <p className="text-lg text-gray-600">
              Our work is built on quality, practical expertise, institutional experience, and a commitment to delivering technology and training that organizations can rely on.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {credentials.map((cred, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100 text-center space-y-2 hover:border-teal-300">
                <div className="text-4xl mb-1">{cred.icon}</div>
                <h3 className="font-bold text-gray-900 text-base">{cred.label}</h3>
                <span className="text-[10px] font-bold text-teal-600 uppercase block">{cred.sub}</span>
                <p className="text-xs text-gray-600 leading-relaxed">{cred.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 07 — OUR PEOPLE & REAL TEAM SHOWCASE ─────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">OUR PEOPLE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              The People <span className="text-teal-600">Behind Slog</span>
            </h2>
            <p className="text-lg text-gray-600">
              A team of technology professionals, trainers, consultants, and innovators working together to turn ideas into meaningful outcomes.
            </p>
          </motion.div>

          {/* Team Real Photo Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-lg group">
              <div className="h-64 relative overflow-hidden bg-gray-100">
                <img
                  src="/training photos/photo_6073384451959362378_y.jpg"
                  alt="Slog Engineering & Technical Training Team"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center space-y-1">
                <h4 className="font-bold text-gray-900 text-base">Engineering & Tech Team</h4>
                <p className="text-xs text-teal-600 font-semibold">Software & AI Engineers</p>
                <p className="text-[11px] text-gray-500">Building scalable products & custom software platforms.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-lg group">
              <div className="h-64 relative overflow-hidden bg-gray-100">
                <img
                  src="/training photos/photo_6073384451959362382_y.jpg"
                  alt="Slog Corporate & Industrial Trainers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center space-y-1">
                <h4 className="font-bold text-gray-900 text-base">Corporate & Student Trainers</h4>
                <p className="text-xs text-teal-600 font-semibold">Domain Experts & Instructors</p>
                <p className="text-[11px] text-gray-500">Upskilling students, professionals & government teams.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-lg group">
              <div className="h-64 relative overflow-hidden bg-gray-100">
                <img
                  src="/training photos/photo_6073384451959362380_y.jpg"
                  alt="Slog Leadership & Project Consultants"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center space-y-1">
                <h4 className="font-bold text-gray-900 text-base">Leadership & Outbound Team</h4>
                <p className="text-xs text-teal-600 font-semibold">Project Directors & Consultants</p>
                <p className="text-[11px] text-gray-500">Leading strategic initiatives, defence & outbound camps.</p>
              </div>
            </div>

          </div>

          <div className="bg-teal-50 rounded-3xl p-8 shadow-md border border-teal-100 max-w-4xl mx-auto space-y-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900">People who build. People who teach. People who innovate.</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Our strength comes from bringing together people with different skills, perspectives, and experiences. From software development and artificial intelligence to training, consulting, design, and operations, our teams work together to solve problems and create practical solutions.
            </p>
            <p className="text-xs font-semibold text-teal-700 italic">
              "We believe great technology is built by people who understand both the technology and the people who use it."
            </p>
            <div className="pt-2">
              <a
                href="#leadership"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full text-xs shadow transition-colors inline-block"
              >
                Meet Our Leadership →
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 08 — LEADERSHIP MESSAGE & DIRECTORS ───────────────── */}
      <section id="leadership" className="py-20 bg-gradient-to-br from-teal-50 to-blue-50 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">LEADERSHIP MESSAGE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Building technology <span className="text-teal-600">with purpose.</span>
            </h2>
          </motion.div>

          {/* Directors Card & Quote Showcase */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl max-w-4xl mx-auto space-y-8 mb-20">
            <div className="flex justify-center text-teal-600">
              <Quote className="h-12 w-12 opacity-80" />
            </div>

            <blockquote className="text-xl sm:text-2xl font-bold text-gray-900 text-center italic leading-relaxed">
              “Technology is most valuable when it solves a problem that actually matters.”
            </blockquote>

            <div className="space-y-4 text-gray-600 text-sm leading-relaxed max-w-3xl mx-auto text-center">
              <p>
                At Slog, we believe technology should move beyond ideas and become something useful, practical, and impactful.
              </p>
              <p>
                Our journey has always been driven by a simple belief — understand the real challenge, bring the right people and technology together, and create solutions that make a meaningful difference.
              </p>
              <p>
                As technology continues to evolve, our focus remains on building capabilities that help organizations adapt, empowering people through learning, and creating innovative solutions for the challenges of today and tomorrow.
              </p>
              <p className="font-semibold text-teal-800">
                We are committed to growing responsibly, learning continuously, and building technology that creates lasting value.
              </p>
            </div>

            {/* Directors Attribution */}
            <div className="pt-6 border-t border-gray-200 flex flex-wrap justify-center gap-8 text-center">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900">SURAJ PRASAD SINGH</h4>
                <p className="text-xs font-bold text-teal-600">Director / Founder</p>
                <p className="text-[11px] text-gray-500">Slog Solutions Pvt. Ltd.</p>
              </div>

              <div className="hidden sm:block w-px bg-gray-300 h-12 my-auto" />

              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900">KIRAN BISHT</h4>
                <p className="text-xs font-bold text-teal-600">Director / Founder</p>
                <p className="text-[11px] text-gray-500">Slog Solutions Pvt. Ltd.</p>
              </div>
            </div>
          </div>

          {/* ── OUR VALUES / PRINCIPLES ───────────────────────────── */}
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">WHAT WE BELIEVE</span>
              <h3 className="text-3xl font-extrabold text-gray-900">
                Technology changes. <span className="text-teal-600">Our principles don't.</span>
              </h3>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                The tools we use will continue to evolve. What remains constant is how we approach problems, people, learning, and the work we deliver.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((val, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 space-y-3">
                  <span className="text-2xl font-extrabold text-teal-600">{val.num}</span>
                  <h4 className="text-lg font-bold text-gray-900">{val.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 09 — INTERACTIVE MAP & COLLABORATIVE CENTERS ───────── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">PAN-INDIA REACH</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Our Collaborative <span className="text-teal-400">Centers & Delivered Projects</span>
            </h2>
            <p className="text-sm text-slate-300">
              Slog Solutions collaborates with institutions and government bodies across India to deliver high-quality technology and training.
            </p>
          </div>

          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-x-auto">
            <IndiaMap />
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX MODAL FOR GALLERY ─────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-100 shadow-2xl bg-white p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto}
                alt="Slog in Action"
                className="w-full h-full object-contain max-h-[80vh] rounded-xl"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-gray-900/80 text-white hover:bg-gray-800 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
