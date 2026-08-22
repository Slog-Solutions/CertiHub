"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search } from "lucide-react";

// ✅ 12 Grouped FAQ Categories with 72+ Questions (Updated)
const faqCategories = [
  {
    category: "About Us",
    questions: [
      {
        q: "What services does Slog Solutions provide?",
        a: "Slog Solutions Pvt. Ltd. provides custom software development (web, mobile, enterprise), corporate & government training, Ministry of Defence training, outbound experiential training, student industrial training & internships, IT lab setups, and digital certificate verification services.",
      },
      {
        q: "What industries do you serve?",
        a: "We serve Information Technology, Government Departments & PSUs, Defence & Military Establishments, Education (Colleges & Universities), Manufacturing, Healthcare, and Corporate Enterprises across India.",
      },
      {
        q: "Where do you provide your training programs?",
        a: "Our training is delivered online globally, at our corporate office and labs in Dehradun, onsite at client premises, directly inside defence establishments, and across 125+ partner centres in India.",
      },
      {
        q: "Do you provide both technical and non-technical training?",
        a: "Yes. Technical training covers Full Stack, Cyber Security, Cloud, DevOps, AI/ML, and Data Science. Non-technical training covers leadership development, team building, soft skills, and communication.",
      },
      {
        q: "Do you provide hands-on practical training?",
        a: "Yes. All programs focus heavily on live coding labs, capstone projects, real-world case studies, and practical assessments.",
      },
      {
        q: "Do you provide training for organizations as well as individuals?",
        a: "Yes. We offer customized enterprise training for corporate and government organizations, as well as open-enrollment skill development programs for individual students and professionals.",
      },
    ],
  },
  {
    category: "Training",
    questions: [
      {
        q: "What subjects and technologies do you provide training in?",
        a: "We train in Web Development (React, Node.js, Next.js), Programming (Python, Java, C++, .NET), Cyber Security & Ethical Hacking, Cloud (AWS, Azure), DevOps, AI & Machine Learning, Data Science, Databases (SQL/NoSQL), and System Administration.",
      },
      {
        q: "Do you offer advanced-level training?",
        a: "Yes, we offer structured tracks from beginner foundation levels to advanced specialist modules for experienced software engineers and corporate teams.",
      },
      {
        q: "Do your courses include projects or real-world assignments?",
        a: "Yes, every course includes hands-on industry assignments, capstone projects, and real-world scenario implementations.",
      },
      {
        q: "Do you provide assessments or evaluations during training?",
        a: "Yes, we conduct periodic quizzes, practical lab evaluations, code reviews, and project presentations to track learning progress.",
      },
      {
        q: "Do you provide certificates after completing training?",
        a: "Yes, upon successful completion and evaluation, participants receive an official verifiable certificate issued by Slog Solutions Pvt. Ltd.",
      },
      {
        q: "Can training duration be customized according to our requirements?",
        a: "Yes, durations can be tailored from short-term intensive bootcamps (1-2 weeks) to multi-month modular schedules or weekend-only sessions.",
      },
      {
        q: "Can online and offline training be combined?",
        a: "Yes, we support hybrid models where theoretical concepts are taught online and practical labs/workshops are conducted offline.",
      },
      {
        q: "What platforms do you use for online training?",
        a: "We deliver online training via Microsoft Teams, Zoom, Google Meet, integrated with our LMS and cloud sandbox lab environments.",
      },
    ],
  },
  {
    category: "Corporate Training",
    questions: [
      {
        q: "Can you design training specifically for our organization?",
        a: "Yes, we perform Training Needs Analysis (TNA) to design bespoke curricula aligned with your tech stack and business objectives.",
      },
      {
        q: "Can corporate training be conducted at our office?",
        a: "Yes, we deploy expert trainers and temporary lab infrastructure to deliver onsite corporate training at your office premises.",
      },
      {
        q: "Can you create a training program based on our business requirements?",
        a: "Yes, our curriculum architects map training modules directly to your company's active projects and business goals.",
      },
      {
        q: "Do you provide post-training support?",
        a: "Yes, we provide follow-up Q&A sessions, project mentoring, code reviews, and refresher workshops.",
      },
      {
        q: "Can corporate training be scheduled according to our employees' availability?",
        a: "Yes, we offer flexible scheduling including weekend bootcamps, evening classes, or custom daily time slots.",
      },
    ],
  },
  {
    category: "Software Development",
    questions: [
      {
        q: "What software development services do you provide?",
        a: "We provide web app development, mobile apps (Android/iOS), enterprise software, API backend engineering, database design, UI/UX design, IT infrastructure setup, and software maintenance.",
      },
      {
        q: "Do you develop custom software solutions?",
        a: "Yes, we build custom, scalable software solutions designed specifically around your unique business workflows.",
      },
      {
        q: "Do you provide API and backend development?",
        a: "Yes, we engineer high-performance RESTful and GraphQL APIs, microservices, and secure backend systems.",
      },
      {
        q: "Do you provide database design and integration?",
        a: "Yes, we design, optimize, and integrate relational (SQL) and non-relational (NoSQL) database systems.",
      },
      {
        q: "Do you provide software maintenance and support?",
        a: "Yes, we offer post-deployment service level agreements (SLAs) covering bug fixes, security updates, server monitoring, and feature upgrades.",
      },
      {
        q: "Can you modernize or upgrade an existing application?",
        a: "Yes, we refactor legacy code, migrate applications to cloud architectures, upgrade database schemas, and refresh UI/UX.",
      },
      {
        q: "How do I request a software development proposal?",
        a: "You can request a proposal by emailing info@slogsolutions.com, calling +91 7456000240/41, or submitting an enquiry through our contact page.",
      },
    ],
  },
  {
    category: "Outbound Training",
    questions: [
      {
        q: "Who can participate in outbound training?",
        a: "Corporate teams, executives, managers, college students, government groups, and defence personnel can participate.",
      },
      {
        q: "Where are outbound training programs conducted?",
        a: "They are conducted at specialized campsite resorts, adventure grounds, and nature spots in Uttarakhand (Dehradun, Mussoorie, Rishikesh).",
      },
      {
        q: "Can outbound training programs be customized?",
        a: "Yes, activity selection, duration (1 to 3 days), intensity level, and learning themes are fully customizable.",
      },
      {
        q: "What activities are included in outbound training?",
        a: "Activities include ropes courses, trust-building challenges, survival simulations, raft building, team puzzles, and facilitated debriefs.",
      },
      {
        q: "How does outbound training improve teamwork and leadership?",
        a: "By placing participants in non-office outdoor environments, it breaks communication barriers, builds trust, and develops collaborative problem-solving.",
      },
      {
        q: "How long does an outbound training program typically last?",
        a: "Outbound programs range from half-day workshops to 1-day, 2-day, or 3-day residential camps.",
      },
    ],
  },
  {
    category: "Ministry of Defence / Defence Training",
    questions: [
      {
        q: "What type of training do you provide for defence organizations?",
        a: "We deliver specialized technical training in Cyber Security, Ethical Hacking, Network Defence, Secure Coding, Database Security, and Systems Administration.",
      },
      {
        q: "Can you develop customized training programs for defence personnel?",
        a: "Yes, we build tailor-made, high-security curriculum modules compliant with defence security standards and protocols.",
      },
      {
        q: "Do you provide technology and technical training for defence organizations?",
        a: "Yes, focusing on digital defence, secure network infrastructure, system hardening, and threat analysis.",
      },
      {
        q: "Can you conduct training at defence establishments?",
        a: "Yes, our instructors are cleared to deliver training on-site inside secure defence bases and command centres.",
      },
      {
        q: "Do you work with government organizations and institutions?",
        a: "Yes, Slog Solutions Pvt. Ltd. is a registered GeM vendor working with central/state government bodies, PSUs, and public institutions.",
      },
      {
        q: "Can your training programs be aligned with specific organizational requirements?",
        a: "Yes, we configure syllabus, security levels, and lab setups to conform directly with organizational guidelines.",
      },
    ],
  },
  {
    category: "Student Training",
    questions: [
      {
        q: "Do you provide internship-oriented training?",
        a: "Yes, we offer internship-oriented training programs (4 weeks to 6 months) with hands-on live project deliverables and certificates.",
      },
      {
        q: "Can students receive hands-on experience?",
        a: "Yes, students work directly on real web/mobile applications, cybersecurity labs, and cloud deployments.",
      },
      {
        q: "Do you provide industry-oriented technical training?",
        a: "Yes, our syllabus mirrors modern industry tech stacks and agile development practices.",
      },
      {
        q: "Do you provide training for colleges and universities?",
        a: "Yes, we partner with colleges for campus bootcamps, Faculty Development Programs (FDP), and credit-aligned training.",
      },
      {
        q: "Can you organize workshops or seminars for students?",
        a: "Yes, we conduct 1-3 day workshops, hackathons, and technology awareness seminars for institutions.",
      },
      {
        q: "Do you provide certificates for student training?",
        a: "Yes, participants receive official Training Certificates, Internship Completion Letters, and Project Certificates.",
      },
      {
        q: "Can you customize training according to a college curriculum?",
        a: "Yes, we align course topics, lab hours, and major/minor project work with university syllabus requirements.",
      },
      {
        q: "Do you provide placement-oriented skill development programs?",
        a: "Yes, including aptitude training, resume building, mock technical interviews, and soft skills preparation.",
      },
    ],
  },
  {
    category: "Certification",
    questions: [
      {
        q: "How can I verify a certificate?",
        a: "You can verify any Slog Solutions certificate on our website's Verification Portal by entering the Certificate ID or Registration Number.",
      },
      {
        q: "Do you provide certificates upon completion of training?",
        a: "Yes, all participants meeting attendance and project completion criteria receive official certificates.",
      },
      {
        q: "How long does it take to receive a certificate?",
        a: "Certificates are issued digitally within 3 to 7 working days after course completion and project submission.",
      },
      {
        q: "Is the certificate digitally verifiable?",
        a: "Yes, every certificate has a unique ID authenticable 24/7 globally via our online portal.",
      },
      {
        q: "What should I do if my certificate cannot be verified?",
        a: "Double-check the ID for typos, or contact support at info@slogsolutions.com with your certificate copy for quick assistance.",
      },
      {
        q: "Can an organization verify a participant's certificate?",
        a: "Yes, employers and background verification agencies can verify credentials instantly via our public portal.",
      },
    ],
  },
  {
    category: "Enrollment & Registration",
    questions: [
      {
        q: "How can I enroll in a training program?",
        a: "You can enroll online via our website enquiry forms, or by calling +91 7456000242/44 (student) or +91 7456000240/41 (corporate).",
      },
      {
        q: "How can I register for a course?",
        a: "Submit the registration form on our website, visit our Dehradun office, or email slog.training@gmail.com.",
      },
      {
        q: "What are the eligibility requirements?",
        a: "Foundational courses require basic computer literacy; advanced or defence modules may require technical background or organizational credentials.",
      },
      {
        q: "How do I know which training program is right for me?",
        a: "Contact our academic advisors for a free counseling session to evaluate your background and goals.",
      },
      {
        q: "Can organizations register multiple participants?",
        a: "Yes, we support bulk group enrollments with corporate invoicing and custom batch timings.",
      },
      {
        q: "Can I request a consultation before enrolling?",
        a: "Yes, we offer free 30-minute counseling calls and demo sessions before enrollment.",
      },
    ],
  },
  {
    category: "Fees & Payment",
    questions: [
      {
        q: "How much do your training programs cost?",
        a: "Fees depend on program depth, duration, and delivery mode. Contact us for a detailed fee schedule or custom quote.",
      },
      {
        q: "Do you offer customized pricing for organizations?",
        a: "Yes, tailored pricing is available based on group size, duration, and curriculum customization.",
      },
      {
        q: "Do you offer group or corporate discounts?",
        a: "Yes, we provide volume discounts for corporate teams, college batches, and multi-module enrollments.",
      },
      {
        q: "Are there any additional charges for customized training?",
        a: "No hidden fees. All customization costs are transparently detailed in the initial commercial proposal.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        q: "Do you provide support after completing a training program?",
        a: "Yes, post-training query resolution, access to learning materials, and alumni community support are included.",
      },
      {
        q: "Who can I contact if I have questions about a course?",
        a: "Contact your trainer, reach out to +91 7456000242/44, or email slog.training@gmail.com / info@slogsolutions.com.",
      },
      {
        q: "Do you provide technical support during online training?",
        a: "Yes, dedicated technical support is available during live sessions to resolve access or lab environment issues.",
      },
      {
        q: "Can I request additional training sessions if required?",
        a: "Yes, supplementary doubt-clearing or refresher sessions can be scheduled upon request.",
      },
      {
        q: "How can I provide feedback about a training program?",
        a: "Feedback is collected through digital evaluation forms, email, or direct calls with program managers.",
      },
    ],
  },
  {
    category: "Contact",
    questions: [
      {
        q: "How can I contact you?",
        a: "Call +91 7456000240/41 (Corporate) or +91 7456000242/44 (Student), email info@slogsolutions.com, or visit 1st Floor, Institution of Engineers, Near ISBT, Dehradun.",
      },
      {
        q: "How quickly will I receive a response to my inquiry?",
        a: "We respond to all website inquiries and emails within 24 business hours.",
      },
      {
        q: "Can I request a quotation?",
        a: "Yes, formal commercial quotes with GST billing can be requested via email or website enquiry.",
      },
      {
        q: "Can I schedule a consultation with your team?",
        a: "Yes, virtual meetings (Zoom/Teams) or in-person office visits can be scheduled with our experts.",
      },
      {
        q: "How can I request a customized training proposal?",
        a: "Send your training requirements and target audience details to info@slogsolutions.com for a detailed proposal within 48 hours.",
      },
    ],
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (cat) =>
        (activeCategory === null || cat.category === activeCategory) &&
        cat.questions.length > 0
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-800 to-blue-900 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-teal-400">Questions</span>
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Browse all categories below to find complete answers about Slog Solutions services, training programs, certifications, and contact details.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search any FAQ topic or question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md text-base"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-5xl mx-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === null
                ? "bg-teal-400 text-slate-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            All Sections ({faqCategories.reduce((acc, c) => acc + c.questions.length, 0)})
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat.category}
              onClick={() =>
                setActiveCategory(activeCategory === cat.category ? null : cat.category)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat.category
                  ? "bg-teal-400 text-slate-900"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {cat.category} ({cat.questions.length})
            </button>
          ))}
        </div>

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {filteredCategories.length === 0 ? (
            <div className="text-center text-white text-lg py-12 bg-white/10 rounded-2xl">
              No matching questions found for "{searchQuery}".
            </div>
          ) : (
            filteredCategories.map((category, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Category Heading */}
                <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">
                    {category.category}
                  </h2>
                  <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                    {category.questions.length} Questions
                  </span>
                </div>

                {/* Accordion for category questions */}
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem
                      key={qIdx}
                      value={`cat-${idx}-q-${qIdx}`}
                      className="border-b border-gray-200"
                    >
                      <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:text-teal-600 transition-colors duration-200 px-6 py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-gray-600 text-sm md:text-base leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}