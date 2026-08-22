"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import {
  Cpu,
  Code2,
  Server,
  Layers,
  Sparkles,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  Bus,
  Calendar,
  Lock,
  Eye,
  ShieldCheck,
  Car,
  FileCheck,
  Bot,
  TrendingUp,
  FileText,
  Landmark,
  ArrowRight,
  Clock,
  Briefcase,
} from "lucide-react";

// Project Data Array with real images from /projects
const projectList = [
  {
    id: "ubtms",
    title: "UBTMS — Uttarakhand Bus Transit Management System",
    category: "Smart Transit & Fleet",
    tag: "TRANSIT / TRACKING",
    image: "/projects/UBTMS.jpg",
    icon: Bus,
    shortDesc: "Smart public transportation management platform connecting passengers, buses, routes, stops, and drivers through real-time tracking.",
    fullDesc: "UBTMS is a comprehensive public transportation management platform that connects passengers, buses, routes, stops, and drivers through real-time GPS tracking. Users can view nearby buses, track live locations, identify upcoming stops, and find optimal routes. The platform also provides centralized route, fleet, driver, and GPS management, enabling efficient transit operations across Uttarakhand.",
    features: [
      "Real-time GPS bus live location tracking & map view",
      "Nearby stop locator & ETA estimation algorithm",
      "Centralized fleet, driver & route assignment management",
      "Passenger convenience mobile & web interface",
      "Automated trip logging & schedule adherence audits",
    ],
    techStack: ["React", "Node.js", "GeoJSON / Leaflet", "GPS Telematics", "MongoDB"],
  },
  {
    id: "tcms",
    title: "TCMS — Training Calendar & Course Management System",
    category: "Education & Assessment",
    tag: "ACADEMIC / CALENDAR",
    image: "/projects/TCMS.jpg",
    icon: Calendar,
    shortDesc: "Centralized platform for planning, scheduling, and managing institutional training programs throughout the academic year.",
    fullDesc: "TCMS is a centralized platform for planning, scheduling, and managing training programs throughout the academic year. It provides a calendar-based view of courses and timelines, enables candidates to register for upcoming programs, and manages attendance, daily activities, course completion, feedback, and performance analysis into one unified system.",
    features: [
      "Interactive calendar-based course & timeline planner",
      "Online candidate registration & batch allocation",
      "Automated attendance, daily activity & feedback logging",
      "Course completion certificate generation & validation",
      "Comprehensive performance analytics & reporting dashboards",
    ],
    techStack: ["Next.js", "Express.js", "FullCalendar", "PostgreSQL", "Tailwind CSS"],
  },
  {
    id: "e3p",
    title: "E3P — Encrypted Examination & Evaluation Platform",
    category: "Government & Defence",
    tag: "SECURITY / EXAM",
    image: "/projects/E3P.jpg",
    icon: Lock,
    shortDesc: "Secure offline examination and evaluation platform designed to manage the complete examination lifecycle.",
    fullDesc: "E3P is a secure offline examination and evaluation platform designed to manage the complete examination lifecycle from scheduling and candidate registration to evaluation and result generation. It supports encrypted question storage and controlled import/export, randomized question allocation, full-screen exam environments, anti-cheating controls, practical and viva assessments, and centralized evaluation.",
    features: [
      "AES-256 encrypted question bank storage & offline delivery",
      "Full-screen lock-down browser & anti-cheating monitoring",
      "Randomized question paper generation & option shuffling",
      "Integrated practical, viva & digital evaluation scoring",
      "Tamper-resistant result compilation & audit trail logs",
    ],
    techStack: ["Electron.js", "Python / Crypto", "SQLite Encrypted", "React", "Zero-Trust Protocol"],
  },
  {
    id: "facelog",
    title: "FACELOG — Facial Recognition & Access Logging System",
    category: "Smart Transit & Access",
    tag: "AI / VISION / ACCESS",
    image: "/projects/FaceLOG.jpg",
    icon: Eye,
    shortDesc: "Intelligent facial recognition and access management platform designed to automate secure entry and exit tracking.",
    fullDesc: "FACELOG is an intelligent facial recognition and access management platform designed to automate secure entry and exit tracking. It can detect and recognize multiple individuals simultaneously across multiple camera locations, automatically identifying registered users while flagging unknown individuals for security review. The system maintains centralized access logs, captures first-time encounters, and provides complete movement histories.",
    features: [
      "Multi-camera real-time facial detection & recognition",
      "Simultaneous crowd identification & zero-touch access",
      "Automated unknown visitor detection & security flagging",
      "Centralized entry/exit timestamp & movement trail logs",
      "Instant security alert notifications & admin dashboard",
    ],
    techStack: ["Python / OpenCV", "PyTorch / FaceNet", "WebSockets", "FastAPI", "React Dashboard"],
  },
  {
    id: "wids",
    title: "WIDS — Wildlife Intrusion Detection System",
    category: "AI & ML",
    tag: "DEFENCE / AI VISION",
    image: "/projects/WIDS.jpg",
    icon: ShieldCheck,
    shortDesc: "Intelligent wildlife monitoring and intrusion detection platform using AI-powered cameras to identify animal species in real time.",
    fullDesc: "WIDS is an intelligent wildlife monitoring and intrusion detection platform that uses AI-powered cameras to identify trained animal species in real time and trigger instant alerts when potential intrusions are detected. It provides centralized monitoring across multiple camera locations, automated alarm notifications, event logging, and historical detection records, enabling faster response and continuous surveillance.",
    features: [
      "Real-time AI animal species classification & detection",
      "Instant automated SMS/email/sound intrusion alerts",
      "Multi-camera centralized surveillance monitoring dashboard",
      "Historical intrusion logging, heatmaps & trend analysis",
      "Ruggedized edge-AI deployment for remote outdoor environments",
    ],
    techStack: ["YOLOv8 Vision", "Edge AI (Jetson)", "Python", "MQTT / Telemetry", "Next.js"],
  },
  {
    id: "vams",
    title: "VAMS — Vehicle Access & Monitoring System",
    category: "Smart Transit & Access",
    tag: "ANPR / AI VISION",
    image: "/projects/VAMS.jpg",
    icon: Car,
    shortDesc: "Intelligent vehicle monitoring and access management platform using AI-powered cameras and number-plate recognition.",
    fullDesc: "VAMS is an intelligent vehicle monitoring and access management platform that uses AI-powered cameras and Automatic Number-Plate Recognition (ANPR) to identify and track vehicles in real time. It automatically recognizes registered vehicles, flags unregistered or blacklisted vehicles for verification, and maintains detailed entry and exit records across multiple camera locations.",
    features: [
      "High-accuracy ANPR (Automatic Number-Plate Recognition)",
      "Automated barrier control & registered vehicle entry",
      "Blacklisted & unknown vehicle alert notifications",
      "Comprehensive vehicle stay duration & timestamp logs",
      "Multi-gate centralized monitoring & search analytics",
    ],
    techStack: ["OpenCV ANPR", "Deep Learning OCR", "Node.js", "React", "PostgreSQL"],
  },
  {
    id: "tam",
    title: "TAM — Training Assessment & Management Platform",
    category: "Education & Assessment",
    tag: "ASSESSMENT / ANALYTICS",
    image: "/projects/TAM.jpg",
    icon: FileCheck,
    shortDesc: "Centralized training and assessment management platform streamlining candidate registration, department assignment, and results.",
    fullDesc: "TAM is a centralized training and assessment management platform designed to streamline candidate registration, department assignment, assessments, performance tracking, and result management. It enables organizations to conduct and manage multiple evaluations, maintain complete candidate records, and generate detailed performance insights with filtering by year, department, or assessment status.",
    features: [
      "Multi-department candidate registration & cohort allocation",
      "Custom assessment builder (MCQs, coding, essay, viva)",
      "Real-time online evaluation & automated score calculation",
      "Year-wise & department-wise performance analytics",
      "Exportable compliance reports & rank certificate generation",
    ],
    techStack: ["React", "Express.js", "Chart.js", "MongoDB", "Tailwind CSS"],
  },
  {
    id: "aiqgen",
    title: "AIQGEN — AI Question Generator",
    category: "AI & ML",
    tag: "AI / LLM GENERATION",
    image: "/projects/AIQGEN.png",
    icon: Bot,
    shortDesc: "Generates structured assessment questions, quizzes, and evaluation papers automatically using AI/LLM models.",
    fullDesc: "AIQGEN is an intelligent assessment creation engine powered by custom LLM models that automatically generates structured question papers, multiple-choice quizzes, short-answer evaluations, and coding challenges from input syllabus documents or topic prompts. It supports difficulty tuning, Bloom's taxonomy alignment, and answer key generation.",
    features: [
      "Automated question paper generation from PDF/Doc syllabus",
      "Bloom's Taxonomy difficulty level customization (Easy/Med/Hard)",
      "MCQ, short answer & coding challenge generation",
      "Automated model answer key & explanation generation",
      "Export to DOCX, PDF, and LMS question bank formats",
    ],
    techStack: ["Python / LangChain", "OpenAI / Local LLMs", "FastAPI", "React", "PDFParser"],
  },
  {
    id: "csd",
    title: "CSD Predict — Canteen Stores Department Demand & Price Predictor",
    category: "Analytics & Enterprise",
    tag: "PREDICTIVE AI / SALES",
    image: "/projects/CSD Predict.png",
    icon: TrendingUp,
    shortDesc: "AI-driven predictive analytics for Canteen Stores Department predicting demand trends and future prices of vehicles & appliances.",
    fullDesc: "CSD Predict is an advanced machine learning analytics platform engineered for Canteen Stores Department operations. It predicts inventory demand trends, seasonal sales spikes, and future price fluctuations for vehicles, electronics, and household appliances, helping procurement teams optimize inventory holding and pricing strategies.",
    features: [
      "Vehicle & appliance demand forecasting models",
      "Historical sales trend analysis & seasonality curves",
      "Price fluctuation forecasting & inflation adjustments",
      "Optimal reorder point & safety stock recommendations",
      "Interactive executive BI dashboard with drill-down filters",
    ],
    techStack: ["Python / Scikit-Learn", "Prophet / XGBoost", "Streamlit / React", "Pandas", "PostgreSQL"],
  },
  {
    id: "archive",
    title: "ARCHIVE LLM — Intelligent Document Archiving & Indexing",
    category: "AI & ML",
    tag: "LLM / DOCUMENT SEARCH",
    image: "/projects/Archive LLM.png",
    icon: FileText,
    shortDesc: "AI document management platform using Large Language Models to automatically summarize, tag, and index complex documents.",
    fullDesc: "ARCHIVE LLM is an enterprise document intelligence platform that leverages Large Language Models to automatically organize, summarize, tag, and semantically index vast document repositories. Users can search through thousands of scanned PDFs, policy documents, and research papers using natural language queries to retrieve exact answers and cited document snippets.",
    features: [
      "Semantic RAG vector search across large document archives",
      "Automated document summarization & metadata extraction",
      "OCR scanning for physical document digitizing & indexing",
      "Natural language Q&A with exact source page citations",
      "Role-based document access permissions & audit logs",
    ],
    techStack: ["Python / LlamaIndex", "Vector DB (FAISS/Chroma)", "Tesseract OCR", "React", "FastAPI"],
  },
  {
    id: "museum",
    title: "VIRTUAL MUSEUM — 🏛️ Virtual Museum & Artifact Exhibit Platform",
    category: "Analytics & Enterprise",
    tag: "DIGITAL EXHIBIT / WEB 3D",
    image: "/projects/MUSEUM.png",
    icon: Landmark,
    shortDesc: "Interactive virtual museum web experience displaying artifacts, historical exhibits, and cultural heritage collections.",
    fullDesc: "VIRTUAL MUSEUM is an immersive digital web platform designed to showcase cultural artifacts, historical exhibits, and virtual gallery tours online. It provides high-resolution 3D artifact inspection, audio-guided tour narratives, multi-language descriptions, and thematic exhibition rooms for remote visitors worldwide.",
    features: [
      "High-resolution artifact gallery with 360° inspection",
      "Audio-guided virtual tour playback in multiple languages",
      "Categorized exhibition rooms (Ancient, Medieval, Defence, Modern)",
      "Interactive artifact timeline & historical context maps",
      "Responsive web interface accessible on desktop & mobile",
    ],
    techStack: ["Three.js / WebGL", "React", "Tailwind CSS", "Node.js", "Cloudinary"],
  },
];

// Service Categories Overview
const services = [
  {
    id: 1,
    title: "Software & Web Development",
    subtitle: "Custom web applications & mobile platforms built for scale.",
    description: "We create robust, scalable, and secure software applications tailored specifically to your organization's workflow. From enterprise transit portals to AI management systems, we deliver end-to-end digital excellence.",
    icon: Code2,
  },
  {
    id: 2,
    title: "AI, Vision & Machine Learning",
    subtitle: "Computer vision, LLM indexing & predictive analytics.",
    description: "We build custom computer vision models for ANPR, wildlife intrusion, facial access control, and LLM-powered document intelligence to automate complex operational tasks.",
    icon: Cpu,
  },
  {
    id: 3,
    title: "High-Security Lab Setup & Defence Systems",
    subtitle: "Encrypted exam platforms, lab infrastructure & defence SOPs.",
    description: "We design and deploy offline encrypted assessment platforms, high-security lab setups, Faraday shielding, and customized defence software compliant with military protocols.",
    icon: ShieldCheck,
  },
];

export default function DevelopmentServices() {
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [selectedProject, setSelectedProject] = useState<typeof projectList[0] | null>(null);

  const categories = [
    "All Projects",
    "AI & ML",
    "Smart Transit & Access",
    "Education & Assessment",
    "Government & Defence",
    "Analytics & Enterprise",
  ];

  const filteredProjects =
    selectedCategory === "All Projects"
      ? projectList
      : projectList.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">

      {/* ── 1. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900 text-white">
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto pt-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold rounded-full backdrop-blur-md uppercase tracking-wider mb-4">
              <Layers className="h-4 w-4 text-teal-400" /> SLOG ENGINEERING & PORTFOLIO
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Development <span className="text-teal-400">Services & Projects</span>
            </h1>

            <p className="text-sm sm:text-base md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transforming complex ideas into innovative digital solutions, AI vision platforms, smart transit systems, and high-security enterprise software.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <EnquiryForm
                triggerButton={
                  <button className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    Request Project Proposal
                  </button>
                }
              />
              <a
                href="#portfolio"
                className="px-8 py-3.5 border-2 border-teal-400/50 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                Explore Built Projects ↓
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. SERVICES OVERVIEW ─────────────────────────────────────── */}
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
              Core <span className="text-teal-600">Capabilities</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer end-to-end development services to bring your ideas to life with precision and innovation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-teal-100 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 mb-3">
                    {service.subtitle}
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED BUILT PROJECTS SHOWCASE (PORTFOLIO GRID) ────── */}
      <section id="portfolio" className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-3"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">PROVEN IMPACT</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Our Portfolio of <span className="text-teal-600">Built Projects</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our deployed software platforms, AI systems, smart transit solutions, and assessment engines built for clients.
            </p>
          </motion.div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-5xl mx-auto">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${isSelected
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((proj) => {
              const Icon = proj.icon;
              return (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col justify-between"
                >
                  <div>
                    {/* Project Image Box */}
                    <div
                      className="relative h-56 w-full overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedProject(proj)}
                    >
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/95 text-teal-800 text-[10px] font-extrabold rounded-full shadow-sm tracking-wider uppercase">
                          {proj.tag}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-gray-900/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg shrink-0 border border-teal-100">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {proj.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                        {proj.shortDesc}
                      </p>

                      {/* Tech Stack Badges */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {proj.techStack.slice(0, 3).map((tech, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium">
                            #{tech}
                          </span>
                        ))}
                        {proj.techStack.length > 3 && (
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                            +{proj.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="px-6 pb-6 pt-2">
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="w-full py-2.5 bg-gray-50 hover:bg-teal-600 text-gray-800 hover:text-white font-bold text-xs rounded-xl border border-gray-200 hover:border-teal-600 transition-all flex items-center justify-center gap-1.5"
                    >
                      View Full System Details <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 4. PROJECT DETAILS MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex justify-center items-center z-50 p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden relative border border-gray-100 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-2 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="overflow-y-auto">
                {/* Modal Header Image */}
                <div className="relative h-64 sm:h-80 w-full bg-gray-900">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <span className="px-3 py-1 bg-teal-500 text-white text-[10px] font-extrabold rounded-full tracking-wider uppercase">
                      {selectedProject.tag}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold">
                      {selectedProject.title}
                    </h2>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8 space-y-6 text-gray-800">
                  <div>
                    <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">
                      System Overview & Architecture
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedProject.fullDesc}
                    </p>
                  </div>

                  {/* Key Features List */}
                  <div>
                    <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-3">
                      Key Deliverables & System Capabilities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProject.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">
                      Technologies & Frameworks
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, tIdx) => (
                        <span key={tIdx} className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-lg border border-teal-100">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modal Action CTA */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Interested in deploying a similar solution for your organization?
                    </p>
                    <EnquiryForm
                      courseInterested={selectedProject.title}
                      triggerButton={
                        <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2">
                          Request Custom Implementation Proposal →
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. DEVELOPMENT PROCESS SECTION ───────────────────────────── */}
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
              Our Development <span className="text-teal-600">Methodology</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From requirement discovery to edge deployment, we follow rigorous engineering standards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-md space-y-2">
              <span className="text-2xl font-extrabold text-teal-600">01</span>
              <h3 className="font-bold text-gray-900 text-base">Discovery & Architecture</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Understanding operational constraints, security requirements, and designing robust system schemas.</p>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-md space-y-2">
              <span className="text-2xl font-extrabold text-teal-600">02</span>
              <h3 className="font-bold text-gray-900 text-base">Agile Development</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Sprint-based building with continuous integration, automated testing, and client code reviews.</p>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-md space-y-2">
              <span className="text-2xl font-extrabold text-teal-600">03</span>
              <h3 className="font-bold text-gray-900 text-base">Security & QA Audits</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Vulnerability scanning, zero-trust access verification, performance stress testing under load.</p>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-md space-y-2">
              <span className="text-2xl font-extrabold text-teal-600">04</span>
              <h3 className="font-bold text-gray-900 text-base">Deployment & SLA Support</h3>
              <p className="text-xs text-gray-600 leading-relaxed">On-premise / cloud deployment, team training handover, and 24/7 SLA maintenance support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CTA BANNER ────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Build Your Custom Software Solution?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Get in touch with our engineering directors today and let's turn your requirements into an impactful system.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <EnquiryForm
              triggerButton={
                <button className="px-8 py-3.5 bg-white text-teal-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Contact Engineering Team
                </button>
              }
            />
          </div>
        </div>
      </section>

    </div>
  );
}
