"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
// Training program data
const trainingPrograms = [
  {
    id: 1,
    title: "Leadership Development",
    subtitle: "Cultivating effective leaders at all levels",
    description: "Our leadership programs are designed to develop the next generation of leaders with the skills, mindset, and capabilities needed to drive organizational success in complex environments.",
    features: [
      "Strategic Thinking & Decision Making",
      "Emotional Intelligence & Self-Awareness",
      "Change Management & Adaptability",
      "Team Building & Talent Development",
      "Communication & Influence",
      "Ethical Leadership & Corporate Governance"
    ],
    duration: "2-5 days",
    format: "In-person or Virtual",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Digital Transformation",
    subtitle: "Navigating the digital landscape with confidence",
    description: "Prepare your organization for the digital future with our comprehensive training programs that cover emerging technologies, digital strategies, and transformation methodologies.",
    features: [
      "Digital Strategy & Roadmapping",
      "Data Analytics & Interpretation",
      "AI & Machine Learning Fundamentals",
      "Cloud Computing & Infrastructure",
      "Cybersecurity Best Practices",
      "Agile & DevOps Methodologies"
    ],
    duration: "3-7 days",
    format: "In-person, Virtual, or Blended",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Compliance & Regulations",
    subtitle: "Staying ahead of regulatory requirements",
    description: "Our compliance training ensures your organization meets all regulatory requirements while fostering a culture of ethics and integrity. Stay updated with the latest regulations and best practices.",
    features: [
      "Industry-Specific Regulations",
      "Ethics & Corporate Governance",
      "Risk Management Frameworks",
      "Audit Preparedness",
      "Data Privacy & Protection",
      "Reporting & Documentation"
    ],
    duration: "1-3 days",
    format: "In-person or Virtual",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 4,
    title: "Cybersecurity Awareness",
    subtitle: "Building human firewalls against cyber threats",
    description: "Transform your employees into the first line of defense against cyber threats with our engaging and practical cybersecurity awareness training programs.",
    features: [
      "Phishing & Social Engineering",
      "Password Security & Management",
      "Secure Remote Working Practices",
      "Incident Reporting Procedures",
      "Data Handling & Classification",
      "Mobile Device Security"
    ],
    duration: "1-2 days + ongoing",
    format: "Virtual with simulations",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
      </svg>
    )
  }
];

// Sectors we serve
const sectors = [
  {
    name: "Government Agencies",
    description: "Customized training programs for federal, state, and local government entities",
    icon: "🏛️"
  },
  {
    name: "Financial Services",
    description: "Specialized training for banking, insurance, and financial institutions",
    icon: "💼"
  },
  {
    name: "Healthcare",
    description: "Compliance, technology, and leadership training for healthcare organizations",
    icon: "🏥"
  },
  {
    name: "Technology",
    description: "Cutting-edge training for tech companies and IT departments",
    icon: "💻"
  },
  {
    name: "Manufacturing",
    description: "Operational excellence and safety training for industrial organizations",
    icon: "🏭"
  },
  {
    name: "Education",
    description: "Professional development for educational institutions and administrators",
    icon: "🎓"
  }
];

// Methodology
const methodologies = [
  {
    title: "Needs Assessment",
    description: "We begin with a thorough analysis of your organization's specific requirements and goals",
    icon: "📊"
  },
  {
    title: "Customization",
    description: "Programs are tailored to your industry, culture, and specific challenges",
    icon: "✂️"
  },
  {
    title: "Engaging Delivery",
    description: "Interactive sessions with practical exercises and real-world applications",
    icon: "🎯"
  },
  {
    title: "Measurement & Evaluation",
    description: "Comprehensive assessment of learning outcomes and organizational impact",
    icon: "📈"
  }
];

export default function CorporateTraining() {
  const [selectedProgram, setSelectedProgram] = useState(trainingPrograms[0]);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDk2ODgiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Corporate & Government <span className="text-teal-600">Training</span>
            </h1>
            <p className="text-xl text-white mb-10 max-w-2xl mx-auto">
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
                        <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                Request Information
              </button>
                      }
                  />
              
              {/* <button className="px-8 py-3 border-2 border-blue-600 text-teal-600 font-semibold rounded-full hover:bg-blue-50 transition-colors duration-300">
                Download Brochure
              </button> */}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sectors We Serve */}
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
                className="bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="text-4xl mb-4">{sector.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {sector.name}
                </h3>
                <p className="text-gray-600">
                  {sector.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Methodology */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our <span className="text-blue-200">Methodology</span>
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              A structured approach to ensure maximum learning impact and organizational ROI.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {methodologies.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="text-3xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-semibold mb-3">
                  {method.title}
                </h3>
                <p className="opacity-90">
                  {method.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-teal-600 mb-4">
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
              className="p-6"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">95%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Participant Satisfaction</h3>
              <p className="text-gray-600">Based on post-training evaluations</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">200+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Organizations Served</h3>
              <p className="text-gray-600">Across various sectors and industries</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">85%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Retention</h3>
              <p className="text-gray-600">After 90 days through our reinforcement approach</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <div className="text-5xl font-bold text-teal-600 mb-3">5000+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professionals Trained</h3>
              <p className="text-gray-600">Building capabilities across organizations</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}