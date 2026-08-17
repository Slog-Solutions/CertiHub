"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
// Ministry of Defence services data
const services = [
  {
    id: 1,
    title: "Specialized Defence Training",
    subtitle: "Advanced training programs for defence personnel",
    description: "Our specialized defence training programs are designed to enhance the capabilities of military personnel through cutting-edge techniques, simulation-based learning, and strategic skill development. We focus on both physical readiness and mental agility required in modern defence scenarios.",
    features: [
      "Combat training simulations",
      "Strategic leadership development",
      "Technical equipment operation",
      "Tactical decision-making exercises",
      "Cyber warfare preparedness",
      "Joint operations coordination"
    ],
    duration: "Customizable Programs",
    participants: "Military Personnel Only",
    security: "Top Secret Clearance Required",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Defence Software Solutions",
    subtitle: "Secure and robust software for defence applications",
    description: "We develop mission-critical software solutions with the highest security standards for defence applications. Our systems are built with encryption, redundancy, and reliability at their core, ensuring operational continuity even in the most challenging environments.",
    features: [
      "Encrypted communication systems",
      "Command and control interfaces",
      "Real-time surveillance software",
      "Data analysis and intelligence platforms",
      "Secure messaging applications",
      "Logistics and resource management"
    ],
    duration: "Project-Based",
    participants: "Authorized Personnel Only",
    security: "Classified Clearance Required",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Defence Lab Infrastructure",
    subtitle: "High-security laboratory setups for defence R&D",
    description: "We design and implement secure laboratory environments tailored for defence research and development. Our facilities meet the highest security protocols while providing cutting-edge technology for innovation in defence systems, materials, and technologies.",
    features: [
      "Biometric access control systems",
      "EMF shielding and secure networking",
      "Specialized testing equipment",
      "Controlled environment chteals",
      "Secure data storage solutions",
      "Surveillance and monitoring systems"
    ],
    duration: "Custom Implementation",
    participants: "Cleared Research Personnel",
    security: "Restricted Access Facility",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-8 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  }
];

// Testimonials from defence personnel
const testimonials = [
  {
    id: 1,
    name: "Col. Vikram Singh",
    role: "Indian Army",
    content: "The training program significantly enhanced our unit's operational readiness. The simulation systems were exceptionally realistic and valuable.",
    avatar: "VS"
  },
  {
    id: 2,
    name: "Dr. Anjali Mehta",
    role: "Defence Research Scientist",
    content: "The secure lab infrastructure has accelerated our research while maintaining the highest security standards. The technical support is exceptional.",
    avatar: "AM"
  },
  {
    id: 3,
    name: "Wing Commander R. Sharma",
    role: "Indian Air Force",
    content: "The custom software solutions have revolutionized our command and control capabilities. The encryption standards are impeccable.",
    avatar: "RS"
  }
];

// Benefits data
const benefits = [
  {
    title: "Enhanced Security",
    description: "All our solutions meet the highest defence security protocols and encryption standards.",
    icon: "🔒"
  },
  {
    title: "Cutting-Edge Technology",
    description: "We utilize the latest advancements in defence technology and research methodologies.",
    icon: "🛠️"
  },
  {
    title: "Custom Solutions",
    description: "Every program is tailored to specific defence requirements and operational parameters.",
    icon: "⚙️"
  },
  {
    title: "Expert Personnel",
    description: "Our team includes former defence specialists and top security-cleared experts.",
    icon: "👨‍💼"
  },
  {
    title: "Proven Methodologies",
    description: "We employ battle-tested approaches refined through years of defence collaboration.",
    icon: "📊"
  },
  {
    title: "Continuous Support",
    description: "Round-the-clock technical support and maintenance for all deployed solutions.",
    icon: "🛡️"
  }
];

export default function MinistryOfDefence() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiM0NDQiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjIiPjxwYXRoIGQ9Ik0zMCwzMCBMNDUsMTUgTTMwLDMwIEwxNSw0NSBNMzAsMzAgTDE1LDE1IE0zMCwzMCBMNDUsNDUiLz48L2c+PC9zdmc+')] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="mb-6 flex justify-center">
              <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-full text-sm font-semibold">
                Ministry of Defence Approved Vendor
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ministry of <span className="text-teal-600">Defence</span> Solutions
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Specialized training, secure software, and high-security infrastructure for defence applications.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <EnquiryForm
                                    triggerButton={
                                      <button className="px-8 py-3 bg-teal-600 text-white font-semibold rounded shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-700">
                Request Information
              </button>
                                    }
                                />
              
              {/* <button className="px-8 py-3 border-2 border-gray-300 text-gray-300 font-semibold rounded hover:bg-gray-700 transition-colors duration-300">
                Contact Security Desk
              </button> */}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Our defence solutions provide critical advantages for national security operations.
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
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Defence <span className="text-teal-600">Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized solutions designed specifically for Ministry of Defence requirements.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group cursor-pointer"
                onClick={() => setActiveTab(index)}
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-teal-100 rounded-lg text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.subtitle}
                </p>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration}
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {service.security}
                  </span>
                </div>
                
                {/* <button className="text-teal-600 font-semibold flex items-center group-hover:underline">
                  Classified details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button> */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Service Section */}
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
              Service <span className="text-teal-600">Specifications</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Detailed information about our specialized defence solutions (clearance required).
            </p>
          </motion.div>

          <div className="flex flex-wrap mb-8 border-b border-gray-200">
            {services.map((service, index) => (
              <button
                key={service.id}
                className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors duration-300 ${activeTab === index ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-teal-600'}`}
                onClick={() => setActiveTab(index)}
              >
                {service.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 rounded-lg shadow-md p-8"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal-100 p-3 rounded-lg text-teal-600 mr-4">
                      {services[activeTab].icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {services[activeTab].title}
                      </h3>
                      <p className="text-gray-600">
                        {services[activeTab].subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 border-l-4 border-teal-500 pl-4 py-2 bg-teal-50">
                    {services[activeTab].description}
                  </p>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Key Features:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {services[activeTab].features.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start bg-white p-3 rounded border border-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Operational Details:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong>Duration:</strong> {services[activeTab].duration}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span><strong>Personnel:</strong> {services[activeTab].participants}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span><strong>Security Level:</strong> {services[activeTab].security}</span>
                      </div>
                    </div>
                  </div> */}
                  <EnquiryForm
                      triggerButton={
                        <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded shadow-md hover:bg-teal-700 transition-colors duration-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Request Secure Briefing
                  </button>
                      }
                  />
                  
                </div>
                
                <div className="md:w-1/3">
                  <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                    <h4 className="text-lg font-semibold text-teal-800 mb-4">Security Protocols</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Multi-factor authentication required</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Background verification mandatory</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Secure facility access only</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Encrypted communications</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Regular security audits</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200">
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
              Feedback from defence personnel who have utilized our specialized services.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-teal-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Secure Defence Solutions
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Contact our secure desk for classified information about our defence services.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 bg-teal-600 text-white font-semibold rounded shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Inquiry
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 text-gray-300 font-semibold rounded hover:bg-gray-700 transition-colors duration-300">
                Official Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
}