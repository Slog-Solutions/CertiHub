"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Users,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Laptop,
  Compass,
  ArrowRight,
  Clock,
  Briefcase,
  FileCheck,
  PhoneCall,
  Mail,
  Layers,
  Target,
  Zap,
  Camera,
  X,
  Eye,
} from "lucide-react";

// Real Training Photos from public/training photos
const trainingPhotos = [
  {
    src: "/training photos/photo_6073384451959362378_y.jpg",
    title: "Interactive Classroom Training",
    description: "Instructor-led technical session and live student engagement.",
    tag: "Classroom",
  },
  {
    src: "/training photos/photo_6073384451959362379_y.jpg",
    title: "Hands-on Practical Lab",
    description: "Trainees building real engineering projects under mentor supervision.",
    tag: "Practical Lab",
  },
  {
    src: "/training photos/photo_6073384451959362380_y.jpg",
    title: "Corporate Bootcamp & Workshop",
    description: "Professional upskilling bootcamps for corporate & government teams.",
    tag: "Corporate",
  },
  {
    src: "/training photos/photo_6073384451959362381_y.jpg",
    title: "Live Mentorship & Code Review",
    description: "1-on-1 guidance on software architecture and project debugging.",
    tag: "Mentorship",
  },
  {
    src: "/training photos/photo_6073384451959362382_y.jpg",
    title: "Student Industrial Training Batch",
    description: "Career-oriented skill development and industrial project internships.",
    tag: "Industrial",
  },
  {
    src: "/training photos/photo_6073384451959362383_y.jpg",
    title: "Certificate Award Ceremony",
    description: "Honoring successful participants with verifiable completion credentials.",
    tag: "Certification",
  },
];

// Program Tracks Data using real photos
const programTracks = [
  {
    id: "corporate",
    title: "Corporate & Enterprise Training",
    subtitle: "Customized technical & leadership bootcamps for workforce upskilling",
    icon: Building2,
    badge: "Enterprise Grade",
    image: "/training photos/photo_6073384451959362380_y.jpg",
    description: "We design and deliver bespoke corporate training programs tailored to your organization's specific technical stack, project deadlines, and employee skill levels.",
    programs: [
      {
        name: "Full Stack & Microservices Architecture",
        duration: "2-4 Weeks / Customized",
        level: "Intermediate to Advanced",
        tags: ["React", "Node.js", "Python", "Java", "Docker", "Kubernetes"],
        description: "Comprehensive deep-dive into scalable web architectures, API design, serverless deployments, and microservice engineering.",
      },
      {
        name: "DevOps & Cloud Engineering (AWS / Azure)",
        duration: "2-3 Weeks",
        level: "Advanced",
        tags: ["AWS", "Azure", "CI/CD", "Terraform", "Ansible"],
        description: "Hands-on pipeline automation, infrastructure as code, container orchestration, and cloud security monitoring.",
      },
      {
        name: "Enterprise Cyber Security & Ethical Hacking",
        duration: "1-3 Weeks",
        level: "Intermediate / Advanced",
        tags: ["VPT", "Network Security", "SOC Operations", "Penetration Testing"],
        description: "Threat detection, vulnerability assessments, secure coding standards, and Incident Response Playbooks.",
      },
      {
        name: "AI, Data Engineering & Machine Learning Pipelines",
        duration: "3-4 Weeks",
        level: "Advanced",
        tags: ["Python", "PyTorch", "Pandas", "LLMs", "MLOps"],
        description: "Building production ML models, data pipeline automation, NLP applications, and predictive analytics systems.",
      },
    ],
  },
  {
    id: "student",
    title: "Student Industrial Internships",
    subtitle: "Hands-on, project-heavy training for B.Tech, BCA, MCA & Diploma students",
    icon: GraduationCap,
    badge: "Placement Oriented",
    image: "/training photos/photo_6073384451959362382_y.jpg",
    description: "Empowering university students with hands-on industrial training, capstone deliverables, and verifiable internship certificates.",
    programs: [
      {
        name: "4/6 Weeks Summer & Winter Industrial Training",
        duration: "4 to 6 Weeks",
        level: "Beginner to Intermediate",
        tags: ["MERN Stack", "Python AI", "Cyber Security", "Android/iOS"],
        description: "Intensive practical bootcamp covering core concepts, live lab exercises, and a portfolio capstone project.",
      },
      {
        name: "6 Months Major Project Internship",
        duration: "6 Months",
        level: "Advanced Internship",
        tags: ["Live Client Work", "Agile Sprints", "Git Workflow", "Code Review"],
        description: "Full-semester industry immersion. Work directly on real client modules under senior developer guidance.",
      },
      {
        name: "Academic Major & Minor Project Mentorship",
        duration: "Flexible Modular",
        level: "All Levels",
        tags: ["Project Guidance", "Documentation", "Viva Prep", "Deployment"],
        description: "End-to-end guidance for university major/minor projects with source code, report writing, and viva defense support.",
      },
      {
        name: "Placement Accelerator & Technical Interview Bootcamp",
        duration: "2-4 Weeks",
        level: "Career Preparation",
        tags: ["LeetCode Coding", "System Design", "Mock Interviews", "Resume"],
        description: "Targeted skill preparation focusing on technical aptitude, coding rounds, system design, and soft skills.",
      },
    ],
  },
  {
    id: "defence",
    title: "Ministry of Defence & PSU Training",
    subtitle: "High-security technical programs for defence personnel & public sector units",
    icon: ShieldCheck,
    badge: "GeM Registered Vendor",
    image: "/training photos/photo_6073384451959362378_y.jpg",
    description: "Specialized military-grade cybersecurity, encrypted systems, and database security training conducted for defence personnel.",
    programs: [
      {
        name: "Defence Cyber Security & Tactical Information Defence",
        duration: "1-3 Weeks",
        level: "High Security Standard",
        tags: ["Information Warfare", "Forensics", "Encrypted Networks"],
        description: "Specialized military-grade cybersecurity training tailored for network hardening, operational security, and threat analysis.",
      },
      {
        name: "Secure Systems Administration & Database Security",
        duration: "2 Weeks",
        level: "Specialized",
        tags: ["Linux Hardening", "SQL Audit", "Air-Gapped Systems"],
        description: "Hardening operating environments, database encryption, access governance, and security audit readiness.",
      },
      {
        name: "Custom Defence Tech Modules & Onsite Workshops",
        duration: "Flexible Schedule",
        level: "Tailored Clearance",
        tags: ["Onsite Cantonment Labs", "Offline Delivery", "Custom SOPs"],
        description: "Tailor-made technical training executed directly at defence establishments and command centres.",
      },
    ],
  },
  {
    id: "outbound",
    title: "Outbound & Experiential Training",
    subtitle: "Outdoor experiential learning for leadership, trust & high-performing team dynamics",
    icon: Compass,
    badge: "Outdoor Leadership",
    image: "/training photos/photo_6073384451959362379_y.jpg",
    description: "Experiential learning outdoor retreats designed to break communication barriers and build authentic leadership under pressure.",
    programs: [
      {
        name: "Executive Leadership & Decision-Making Camp",
        duration: "2-3 Days Residential",
        level: "Leadership & Management",
        tags: ["Outdoor Challenges", "Strategic Thinking", "Crisis Response"],
        description: "Immersive wilderness retreat testing leadership under pressure, adaptability, and high-stakes problem solving.",
      },
      {
        name: "Corporate Team Synergy & Trust Building Retreat",
        duration: "1-2 Days",
        level: "All Teams",
        tags: ["Ropes Course", "Raft Building", "Communication Debriefs"],
        description: "Outdoor group challenges designed to break communication barriers, foster genuine trust, and realign team goals.",
      },
    ],
  },
];

// Delivery Modes
const deliveryModes = [
  {
    title: "Onsite Corporate (At Client Site)",
    desc: "Our expert trainers travel to your corporate office anywhere in India with complete hands-on lab setups.",
    icon: Building2,
  },
  {
    title: "Virtual Interactive Labs (Online)",
    desc: "Live instructor-led online sessions via MS Teams/Zoom with cloud sandbox programming environments.",
    icon: Laptop,
  },
  {
    title: "Hybrid Blended Model",
    desc: "Combines self-paced online theory modules with intensive weekend offline lab workshops.",
    icon: Layers,
  },
  {
    title: "Campus & College Bootcamps",
    desc: "Direct institutional bootcamps and Faculty Development Programs (FDP) conducted at university campuses.",
    icon: GraduationCap,
  },
];

// Sectors we serve
const sectors = [
  {
    name: "Government Agencies & PSUs",
    description: "Customized training programs for central, state, and local government entities.",
    icon: "🏛️"
  },
  {
    name: "Ministry of Defence",
    description: "High-security technical training for military and defence personnel.",
    icon: "🛡️"
  },
  {
    name: "IT & Technology Companies",
    description: "Cutting-edge tech stack training for developers and engineering teams.",
    icon: "💻"
  },
  {
    name: "Colleges & Universities",
    description: "Industrial training, internships, and faculty development bootcamps.",
    icon: "🎓"
  },
  {
    name: "Manufacturing & Enterprise",
    description: "Operational excellence, system security, and technical skill upgrades.",
    icon: "🏭"
  },
  {
    name: "Financial & Banking Sector",
    description: "Cybersecurity, database governance, and compliance training.",
    icon: "💼"
  }
];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      
      {/* ── 1. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto pt-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Corporate & Government <span className="text-teal-600">Training</span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-white mb-10 max-w-2xl mx-auto">
              Professional training programs designed to enhance capabilities, ensure compliance, and drive performance in corporate and government sectors.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <EnquiryForm
                triggerButton={
                  <button className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    Request Information
                  </button>
                }
              />
              <Link
                href="#gallery"
                className="px-8 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-full hover:bg-teal-50 transition-colors duration-300 bg-white/10 text-white hover:text-teal-600"
              >
                View Training Photos
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. SECTORS WE SERVE ───────────────────────────────────────── */}
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
              Sectors We <span className="text-teal-600">Serve</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide specialized training solutions for a wide range of industries and sectors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="text-4xl mb-4">{sector.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {sector.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {sector.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. LIVE TRAINING PHOTOS GALLERY ────────────────────────────── */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full mb-3">
              <Camera className="h-4 w-4" /> Live Training Snapshots
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Training Sessions <span className="text-teal-600">In Action</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real photos from our live corporate bootcamps, technical workshops, and student industrial sessions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                    {photo.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. DETAILED TRAINING TRACKS SECTION ─────────────────────── */}
      <section id="tracks" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Training <span className="text-teal-600">Tracks</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our structured training categories built for corporate teams, defence personnel, and university students.
            </p>
          </motion.div>

          {/* Tabs selector */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 justify-center">
            {programTracks.map((track, index) => (
              <button
                key={track.id}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base border-b-2 transition-colors duration-300 whitespace-nowrap ${
                  activeTab === index
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-teal-500'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {track.title}
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
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                <div className="md:w-2/3 space-y-3">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                    {programTracks[activeTab].badge}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {programTracks[activeTab].title}
                  </h3>
                  <p className="text-gray-600">
                    {programTracks[activeTab].description}
                  </p>
                </div>
                <div className="md:w-1/3 relative h-52 w-full rounded-xl overflow-hidden shadow-md">
                  <img
                    src={programTracks[activeTab].image}
                    alt={programTracks[activeTab].title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Course list inside track */}
              <h4 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-3">Available Programs & Modules:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programTracks[activeTab].programs.map((prog, pIdx) => (
                  <div key={pIdx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 hover:border-teal-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                        {prog.duration}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">{prog.level}</span>
                    </div>
                    <h5 className="font-bold text-gray-900 text-base">{prog.name}</h5>
                    <p className="text-gray-600 text-xs leading-relaxed">{prog.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {prog.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <EnquiryForm
                  triggerButton={
                    <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300">
                      Enquire For This Track
                    </button>
                  }
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 5. TRAINING DELIVERY MODES ───────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Flexible <span className="text-teal-600">Delivery Modes</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We deliver training in formats designed to fit your team's workflow and location.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliveryModes.map((mode, idx) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 space-y-3"
                >
                  <div className="p-3 bg-teal-100 rounded-xl text-teal-600 w-fit">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{mode.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{mode.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. MEASURABLE RESULTS SECTION ─────────────────────────── */}
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
              Measurable <span className="text-teal-600">Results</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our training programs deliver tangible outcomes that drive organizational success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">95%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Participant Satisfaction</h3>
              <p className="text-gray-600 text-xs">Based on post-training evaluations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">200+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Organizations Served</h3>
              <p className="text-gray-600 text-xs">Across corporate & government sectors</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">85%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Retention</h3>
              <p className="text-gray-600 text-xs">Measured through post-course audits</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">15,000+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learners Trained</h3>
              <p className="text-gray-600 text-xs">Building capabilities across India</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 7. CTA BANNER ─────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your Training Program?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Contact our training directors today to discuss customized proposals, corporate bootcamps, or college enrollments.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <EnquiryForm
              triggerButton={
                <button className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Contact Us
                </button>
              }
            />
          </div>
        </div>
      </section>

      {/* ── 8. LIGHTBOX MODAL FOR GALLERY ──────────────────────────── */}
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
                alt="Training photo"
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