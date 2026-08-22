"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Server,
  FileCheck,
  Award,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  PhoneCall,
  Mail,
  Layers,
  Target,
  Zap,
  Radio,
  KeyRound,
  Terminal,
} from "lucide-react";

import armyImg from "@/assets/ArmyTraing.png";

// Ministry of Defence Services Data
const services = [
  {
    id: 1,
    title: "Tactical Cyber Security & Information Defence",
    subtitle: "Advanced military-grade cybersecurity & network hardening",
    icon: ShieldCheck,
    badge: "Ministry Clearance",
    image: armyImg,
    description: "Our specialized defence cyber training programs enhance the operational security of military networks through threat intelligence, penetration testing, air-gapped system isolation, and Incident Response Playbooks.",
    features: [
      "Information warfare & tactical threat analysis",
      "Network hardening & perimeter penetration testing",
      "Air-gapped database encryption & audit trails",
      "Encrypted communications & secure radio protocols",
      "Tactical decision-making under cyber warfare scenarios",
      "Joint operations coordination & command center SOPs",
    ],
    duration: "1 to 3 Weeks / Custom",
    participants: "Military & Defence Personnel Only",
    security: "Top Secret Clearance Protocol",
  },
  {
    id: 2,
    title: "Encrypted Defence Software & Command Systems",
    subtitle: "Mission-critical, high-availability software solutions",
    icon: Server,
    badge: "Mission Critical",
    image: armyImg,
    description: "We develop custom mission-critical software built with AES-256 encryption, zero-trust access architecture, and real-time surveillance analytics designed to operate reliably in harsh operational environments.",
    features: [
      "Encrypted tactical communication interfaces",
      "Command and control (C2) dashboard systems",
      "Real-time aerial & perimeter surveillance software",
      "High-speed intelligence data aggregation platforms",
      "Secure offline messaging & telemetry applications",
      "Logistics, inventory & armory management systems",
    ],
    duration: "Project-Based Engagement",
    participants: "Authorized Security Personnel",
    security: "Classified Clearance Level",
  },
  {
    id: 3,
    title: "High-Security Defence Lab Setup",
    subtitle: "R&D laboratory infrastructure meeting strict defence standards",
    icon: Cpu,
    badge: "Infrastructure",
    image: armyImg,
    description: "We design, equip, and commission high-security R&D laboratory environments tailored for defence research, biometric access control, Faraday cage EMF shielding, and secure hardware testing.",
    features: [
      "Biometric & multi-factor physical access control",
      "Faraday cage EMF shielding & secure network wiring",
      "Specialized hardware testing & diagnostic equipment",
      "Cleanroom environmental control systems",
      "Air-gapped local storage & encrypted data backup",
      "24/7 CCTV surveillance & automated perimeter alerts",
    ],
    duration: "Custom Infrastructure Implementation",
    participants: "Cleared Research Personnel",
    security: "Restricted Access Facility",
  },
  {
    id: 4,
    title: "Onsite Cantonment & Unit Training Bootcamps",
    subtitle: "Direct on-premise technical workshops at military units",
    icon: Building2,
    badge: "Onsite Execution",
    image: armyImg,
    description: "Our certified trainers conduct hands-on technical bootcamps directly at military units, command headquarters, and defence establishments across India with zero security compromise.",
    features: [
      "Customized curriculum based on unit requirement",
      "Offline sandbox lab kits brought to client premises",
      "Hands-on hardware & software troubleshooting",
      "Practical command exercises & digital simulations",
      "Official certificate issuance & performance logs",
    ],
    duration: "1 to 2 Weeks",
    participants: "Unit Batches (20 - 100 Personnel)",
    security: "Onsite Verification Required",
  },
];

// Strategic Advantages / Benefits Data
const benefits = [
  {
    title: "GeM Registered Vendor",
    description: "Empaneled on Government e-Marketplace (GeM) for swift, transparent procurement.",
    icon: "📜",
  },
  {
    title: "Military-Grade Security",
    description: "All training methodologies and software meet military encryption and air-gapped standards.",
    icon: "🔒",
  },
  {
    title: "Tailored Clearance Modules",
    description: "Customized curricula aligned with specific unit SOPs, operational parameters, and clearance levels.",
    icon: "⚙️",
  },
  {
    title: "Proven Defence Track Record",
    description: "Battle-tested solutions refined through extensive collaboration with defence organizations.",
    icon: "🎖️",
  },
  {
    title: "Certified Security Specialists",
    description: "Instructors include top security-cleared software architects and cybersecurity specialists.",
    icon: "👨‍💻",
  },
  {
    title: "24/7 Operational Support",
    description: "Dedicated support desk ensuring continuous reliability for critical deployments.",
    icon: "🛡️",
  },
];

// Testimonials from Defence Personnel
const testimonials = [
  {
    id: 1,
    name: "Col. Vikram Singh",
    role: "Indian Army",
    content: "Slog Solutions' cybersecurity training program significantly enhanced our unit's digital readiness. The hands-on simulations were realistic and highly effective.",
    avatar: "VS",
  },
  {
    id: 2,
    name: "Dr. Anjali Mehta",
    role: "Defence Research Scientist",
    content: "The secure lab infrastructure implemented by Slog Solutions has accelerated our R&D while strictly maintaining top-level security protocols.",
    avatar: "AM",
  },
  {
    id: 3,
    name: "Wing Commander R. Sharma",
    role: "Indian Air Force",
    content: "The software and encryption modules delivered by their engineering team are reliable, user-friendly, and compliant with military standards.",
    avatar: "RS",
  },
];

export default function MinistryOfDefence() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      
      {/* ── 1. HERO SECTION WITH ARMY IMAGE OVERLAY ──────────────────── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900 text-white">
        <div className="absolute inset-0 -z-10 opacity-25">
          <Image
            src={armyImg}
            alt="Slog Defence Training Session"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-900/90 to-blue-950" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold rounded-full backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-teal-400" /> GeM Registered & Defence Approved Vendor
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Ministry of <span className="text-teal-400">Defence</span> Solutions
                <span className="block text-2xl sm:text-3xl font-light text-teal-200 mt-2">Tactical Training, Secure Software & Infrastructure</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
                Empowering military personnel, defence establishments, and public sector units with specialized cyber security bootcamps, encrypted software systems, and high-security lab setups.
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <EnquiryForm
                  triggerButton={
                    <button className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      Request Secure Briefing
                    </button>
                  }
                />
                <Link
                  href="#services"
                  className="px-8 py-3.5 border-2 border-teal-400/50 text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center gap-2"
                >
                  Explore Capabilities <ArrowRight className="h-4 w-4 text-teal-300" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column Featured Army Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl overflow-hidden border-2 border-teal-400/40 shadow-2xl bg-white p-3 group">
                <div className="relative h-[320px] sm:h-[380px] rounded-2xl overflow-hidden">
                  <Image
                    src={armyImg}
                    alt="Slog Army Defence Training Program"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Badge Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-500 rounded-lg text-white">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Defence Training in Action</h4>
                        <p className="text-xs text-teal-200">High-Security Operational & Technical Readiness</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. STRATEGIC ADVANTAGES / BENEFITS ──────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Strategic <span className="text-teal-600">Advantages</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our defence solutions deliver critical advantages built around zero-trust security and government procurement compliance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. DEFENCE SERVICES SHOWCASE ─────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Defence <span className="text-teal-600">Services & Capabilities</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized technical offerings tailored to Ministry of Defence parameters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer"
                  onClick={() => setActiveTab(index)}
                >
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-teal-100 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                    {service.subtitle}
                  </p>
                  <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 inline-block">
                    {service.badge}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. DETAILED SPECIFICATIONS (TABBED SHOWCASE) ─────────────── */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Service <span className="text-teal-600">Specifications</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore technical capabilities and security protocols for each defence program.
            </p>
          </motion.div>

          {/* Service Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 justify-center">
            {services.map((service, index) => (
              <button
                key={service.id}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base border-b-2 transition-colors duration-300 whitespace-nowrap ${
                  activeTab === index
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-teal-500"
                }`}
                onClick={() => setActiveTab(index)}
              >
                {service.title}
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <div className="md:w-2/3 space-y-4">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                    {services[activeTab].badge}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {services[activeTab].title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {services[activeTab].description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-gray-700">
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-teal-600" /> Duration: {services[activeTab].duration}
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-teal-600" /> Target: {services[activeTab].participants}
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-teal-600" /> Security: {services[activeTab].security}
                    </span>
                  </div>
                </div>

                <div className="md:w-1/3 bg-white p-6 rounded-xl border border-teal-100 shadow-sm w-full space-y-3">
                  <h4 className="font-bold text-teal-800 text-base">Security Compliance:</h4>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Zero-Trust Access Architecture
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> AES-256 Air-Gapped Encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> GeM Procurement Compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Certified Onsite Instructors
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modules List */}
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-3">Core Deliverables & Features:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {services[activeTab].features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start bg-white p-3.5 rounded-xl border border-gray-100 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center pt-2">
                <EnquiryForm
                  triggerButton={
                    <button className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Request Secure Briefing
                    </button>
                  }
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS & ENDORSEMENTS ──────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Defence <span className="text-teal-600">Endorsements</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Feedback from military personnel and research scientists who have completed our programs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold mr-4">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-teal-600 font-medium">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed">"{t.content}"</p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA BANNER ──────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Secure Defence Solutions
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Contact our secure desk today for official proposals, GeM procurement details, or classified briefings.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <EnquiryForm
              triggerButton={
                <button className="px-8 py-3.5 bg-white text-teal-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Secure Inquiry
                </button>
              }
            />
          </div>
        </div>
      </section>

    </div>
  );
}