"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import {
  Compass,
  Users,
  Award,
  Zap,
  Target,
  ShieldCheck,
  CheckCircle2,
  Trees,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Heart,
  Smile,
  Flame,
  Activity,
  Layers,
  Mountain,
} from "lucide-react";

import outboundImg from "@/assets/outbound.png";

// Real Outbound Training Programs
const programs = [
  {
    id: 1,
    title: "Team Building & Synergy Adventures",
    subtitle: "Strengthen cross-functional collaboration and trust",
    description: "Our experiential team building adventures break down organizational silos, refine active listening, and foster deep mutual trust through high-engagement outdoor challenges.",
    features: [
      "Trust-building ropes & suspension challenges",
      "Cross-departmental communication obstacle courses",
      "Group strategy & resource allocation exercises",
      "Conflict resolution debriefing workshops",
      "Fun competitive outdoor team games",
      "Peer feedback & reflection circles",
    ],
    duration: "1 to 3 Days",
    participants: "15 - 100 People",
    location: "Nature Resorts, Adventure Parks, Hill Campuses",
    icon: Users,
    badge: "Most Popular",
  },
  {
    id: 2,
    title: "Executive Leadership Expeditions",
    subtitle: "Develop high-stakes decision making in wilderness settings",
    description: "Designed for C-suite executives, directors, and team leads. We place leaders in dynamic outdoor scenarios where adaptive decision-making, empathy, and crisis leadership emerge naturally.",
    features: [
      "Wilderness leadership & orienteering challenges",
      "Decision-making under physical & mental pressure",
      "Crisis management & resource scarcity simulations",
      "Strategic planning in volatile environments",
      "Executive peer feedback & leadership profiling",
      "Post-expedition workplace transition action plan",
    ],
    duration: "2 to 5 Days",
    participants: "10 - 35 Leaders",
    location: "Himalayan Treks, River Camps, Forest Sanctuaries",
    icon: Mountain,
    badge: "Leadership Grade",
  },
  {
    id: 3,
    title: "Corporate Wellness & Stress Rejuvenation Retreats",
    subtitle: "Rejuvenate mind, body, and workplace enthusiasm",
    description: "Combines nature immersion with structured wellness workshops to combat burnout, improve mental wellbeing, and boost long-term workplace productivity.",
    features: [
      "Guided yoga, breathwork & mindfulness sessions",
      "Forest bathing & eco-immersion walks",
      "Stress resilience & work-life equilibrium seminars",
      "Nutritional wellness & ergonomic advice",
      "Adventure therapy & digital detox activities",
      "Group bonfires & evening reflection debriefs",
    ],
    duration: "2 to 4 Days",
    participants: "12 - 60 People",
    location: "Wellness Resorts, Riverside Eco-Lodges",
    icon: Heart,
    badge: "Wellness Focus",
  },
  {
    id: 4,
    title: "Campus to Corporate Transition Outbound",
    subtitle: "Prepare new university graduates for high-performance corporate culture",
    icon: Sparkles,
    badge: "Early Career",
    description: "Tailored for fresh campus hires and management trainees to instill corporate discipline, ownership, accountability, and team alignment before project deployment.",
    features: [
      "Ownership & accountability physical drills",
      "Time management under tight deadline constraints",
      "Agile team coordination & role switching",
      "Presentation & public confidence building",
      "Corporate etiquette & cultural integration",
    ],
    duration: "2 to 3 Days",
    participants: "20 - 150 Trainees",
    location: "Outbound Training Grounds, Campus Resorts",
  },
];

// Experiential Outdoor Activities
const outdoorActivities = [
  {
    name: "Rafting & River Navigation",
    tagline: "Synchronized Teamwork & Rapid Response",
    desc: "Navigate wild river rapids requiring precise synchronization, instant command execution, and team resilience.",
    icon: "🚣‍♂️",
  },
  {
    name: "High Ropes & Zip-Line Challenges",
    tagline: "Overcoming Fear & Mutual Encouragement",
    desc: "Tackle elevated obstacle courses to push personal comfort zones while relying on team belay support.",
    icon: "🧗‍♀️",
  },
  {
    name: "Trekking & Wilderness Compass Quest",
    tagline: "Strategic Orienteering & Problem Solving",
    desc: "Use maps, compasses, and clues to navigate wilderness trails, assigning roles based on team strengths.",
    icon: "🧭",
  },
  {
    name: "Campfire Reflective Debriefs",
    tagline: "Authentic Bonding & Strategic Realignment",
    desc: "Evening debriefing sessions around the bonfire to analyze team behavior, celebrate wins, and extract workplace learnings.",
    icon: "🔥",
  },
];

// Benefits data
const benefits = [
  {
    title: "Break Communication Silos",
    description: "Dismantle rigid hierarchies and build open, transparent communication channels across departments.",
    icon: "💬",
  },
  {
    title: "High-Stakes Leadership",
    description: "Develop decisive, empathetic leadership skills that translate directly into workplace execution.",
    icon: "🌟",
  },
  {
    title: "Burnout & Stress Relief",
    description: "Reduce workplace fatigue through nature immersion, exercise, and refreshing mental reset.",
    icon: "🧘",
  },
  {
    title: "Agile Problem Solving",
    description: "Encourage out-of-the-box creative thinking when faced with unexpected outdoor obstacles.",
    icon: "💡",
  },
  {
    title: "Enhanced Trust & Loyalty",
    description: "Build genuine personal bonds that elevate mutual trust, team morale, and employee retention.",
    icon: "🤝",
  },
  {
    title: "Measurable ROI & Morale",
    description: "Return to the office with renewed enthusiasm, aligned goals, and heightened productivity.",
    icon: "🚀",
  },
];

// Testimonials
const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "HR Director, TechSolutions Inc.",
    content: "The outbound training program transformed our engineering department. Inter-team communication improved by 70% and project delivery friction vanished.",
    avatar: "RK",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Senior VP, FinCorp Limited",
    content: "Our leadership expedition in Dehradun was a turning point. The high-ropes and wilderness challenges helped our managers build true trust under pressure.",
    avatar: "PS",
  },
  {
    id: 3,
    name: "Anil Patel",
    role: "CEO, HealthPlus Enterprises",
    content: "The corporate wellness retreat helped our executives combat severe burnout. They returned to the office refreshed, aligned, and full of energy!",
    avatar: "AP",
  },
];

export default function OutboundTraining() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      
      {/* ── 1. HERO SECTION WITH IMAGE OVERLAY ───────────────────────── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900 text-white">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image
            src={outboundImg}
            alt="Slog Solutions Outbound Training Team"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-900/90 to-blue-950" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold rounded-full backdrop-blur-md">
                <Compass className="h-4 w-4 text-teal-400" /> Experiential Learning & Leadership
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Outbound <span className="text-teal-400">Trainings</span>
                <span className="block text-2xl sm:text-3xl font-light text-teal-200 mt-2">Enhancing Skill & Team Synergy</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
                Our outbound training programs are designed to build leadership, teamwork, problem-solving, and decision-making skills through experiential outdoor learning in nature's classroom.
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
                      Plan Your Program
                    </button>
                  }
                />
                <Link
                  href="#programs"
                  className="px-8 py-3.5 border-2 border-teal-400/50 text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center gap-2"
                >
                  Explore Expeditions <ArrowRight className="h-4 w-4 text-teal-300" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Featured Outbound Team Photo Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl overflow-hidden border-2 border-teal-400/40 shadow-2xl bg-white p-3 group">
                <div className="relative h-[320px] sm:h-[380px] rounded-2xl overflow-hidden">
                  <Image
                    src={outboundImg}
                    alt="Slog Outbound Training Group Photo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-500 rounded-lg text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Corporate Outbound Batch</h4>
                        <p className="text-xs text-teal-200">Dehradun & Rishikesh Experiential Retreat</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. PROGRAM BENEFITS ──────────────────────────────────────── */}
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
              Program <span className="text-teal-600">Benefits</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our outbound training programs deliver measurable outcomes that transform workplace dynamics and performance.
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

      {/* ── 3. OUTDOOR EXPERIENTIAL ACTIVITIES ──────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2 inline-block">
              Experiential Learning Pillars
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Signature <span className="text-teal-600">Outdoor Activities</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Challenging activities structured to test endurance, strategic alignment, and genuine camaraderie.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outdoorActivities.map((act, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 space-y-3"
              >
                <div className="text-4xl mb-2">{act.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{act.name}</h3>
                <span className="inline-block text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  {act.tagline}
                </span>
                <p className="text-gray-600 text-xs leading-relaxed">{act.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. DETAILED OUTBOUND PROGRAMS (TABBED SHOWCASE) ──────────── */}
      <section id="programs" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Outbound <span className="text-teal-600">Modules & Packages</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored outbound packages for team building, executive retreats, and new hire onboardings.
            </p>
          </motion.div>

          {/* Program Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 justify-center">
            {programs.map((prog, index) => (
              <button
                key={prog.id}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base border-b-2 transition-colors duration-300 whitespace-nowrap ${
                  activeTab === index
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-teal-500"
                }`}
                onClick={() => setActiveTab(index)}
              >
                {prog.title}
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
                    {programs[activeTab].badge}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {programs[activeTab].title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {programs[activeTab].description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-gray-700">
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-teal-600" /> Duration: {programs[activeTab].duration}
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-teal-600" /> Group: {programs[activeTab].participants}
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-teal-600" /> Location: {programs[activeTab].location}
                    </span>
                  </div>
                </div>

                <div className="md:w-1/3 bg-white p-6 rounded-xl border border-teal-100 shadow-sm w-full space-y-3">
                  <h4 className="font-bold text-teal-800 text-base">Key Takeaways:</h4>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Reduced workplace communication friction
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Enhanced peer empathy & team trust
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Decisive leadership under pressure
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Actionable post-retreat commitments
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modules list */}
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-3">Core Program Features:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {programs[activeTab].features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start bg-white p-3.5 rounded-xl border border-gray-100 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center pt-2">
                <EnquiryForm
                  triggerButton={
                    <button className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors">
                      Request Custom Outbound Proposal
                    </button>
                  }
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS SECTION ───────────────────────────────────── */}
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
              Client <span className="text-teal-600">Success Stories</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from organizations that have transformed their teams through our outbound retreats.
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
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Contact us today to design a custom outbound training program tailored to your organization's goals.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <EnquiryForm
              triggerButton={
                <button className="px-8 py-3.5 bg-white text-teal-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Get Started
                </button>
              }
            />
          </div>
        </div>
      </section>

    </div>
  );
}