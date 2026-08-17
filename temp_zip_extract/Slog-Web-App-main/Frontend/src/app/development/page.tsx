"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "../../components/EnquiryForm";
import { ProductSection } from "../../components/sections/ProductSection";

// Define a more specific type for services
type Service = {
  id: number;
  title: string;
  sectionKey: "software_development" | "lab_setup" | "product_development";
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
};

// Service data
const services: Service[] = [
  {
    id: 1,
    title: "Software Development",
    sectionKey: "software_development",
    subtitle: "Custom software tailored to your needs.",
    description: "We create robust, scalable, and efficient software solutions designed specifically for your business requirements. Our team uses the latest technologies and agile methodologies to deliver high-quality applications that drive your business forward.",
    features: [
      "Web Application Development",
      "Mobile App Development",
      "Cloud-native Solutions",
      "API Integration",
      "Legacy System Modernization",
      "Quality Assurance & Testing"
    ],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Lab Setup",
    sectionKey: "lab_setup",
    subtitle: "End-to-end laboratory infrastructure setup.",
    description: "We provide comprehensive laboratory setup services including IT infrastructure, specialized software installation, equipment integration, and network configuration. Our solutions ensure your lab operates efficiently and securely.",
    features: [
      "IT Infrastructure Planning",
      "Specialized Software Installation",
      "Equipment Integration",
      "Network Configuration",
      "Data Management Systems",
      "Security & Compliance"
    ],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Product Development",
    sectionKey: "product_development",
    subtitle: "Innovative product creation and delivery.",
    description: "From concept to market, we guide you through the entire product development lifecycle. Our user-centered approach ensures we create products that not only meet technical requirements but also deliver exceptional user experiences.",
    features: [
      "Ideation & Conceptualization",
      "UI/UX Design",
      "Prototyping & MVP Development",
      "Full Product Development",
      "Market Launch Strategy",
      "Post-Launch Support & Iteration"
    ],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
];

// Testimonials
const testimonials = [
  {
    id: 1,
    name: "Abhishek Gupta",
    role: "CTO, TechInnovate",
    content: "The software development team delivered beyond our expectations. Their attention to detail and commitment to quality was evident throughout the project.",
    avatar: "AJ"
  },
  {
    id: 2,
    name: "Sarthak Gupta",
    role: "Lab Director, BioResearch Inc.",
    content: "Our lab setup was completed ahead of schedule and within budget. The infrastructure has been running flawlessly for over a year now.",
    avatar: "SG"
  },
  {
    id: 3,
    name: "Suhani Aggarwal",
    role: "Product Manager, LaunchPad",
    content: "The product development process was collaborative and innovative. They helped us turn our vision into a market-ready product that users love.",
    avatar: "ER"
  }
];

export default function DevelopmentServices() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Development <span className="text-teal-600">Services</span>
            </h1>
            <p className="text-xl text-white mb-10 max-w-2xl mx-auto">
              Transforming ideas into innovative digital solutions through cutting-edge technology and expert craftsmanship.
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
                Get Started
              </button>
                      }
                  />
              
              <button className="px-8 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-full hover:bg-teal-50 transition-colors duration-300">
                View Our Work
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
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
              Our <span className="text-teal-600">Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive development services to bring your ideas to life with precision and innovation.
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
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-teal-100 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.subtitle}
                </p>
                {/* <button className="text-teal-600 font-semibold flex items-center group-hover:underline">
                  Learn more
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
              Service <span className="text-teal-600">Details</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive service offerings and how we can help you achieve your goals.
            </p>
          </motion.div>

          <div className="flex flex-wrap mb-8 border-b border-gray-200">
            {services.map((service, index) => (
              <button
                key={service.id}
                className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors duration-300 ${activeTab === index ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-teal-500'}`}
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
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {services[activeTab].title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {services[activeTab].description}
                  </p>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">What we offer:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {services[activeTab].features.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <EnquiryForm
                      triggerButton={
                        <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300">
                    Request a Quote
                  </button>
                      }
                  />

                  {/* Conditionally render ProductSection here */}
                  <ProductSection section={services[activeTab].sectionKey} />
                  
                </div>
                
                <div className="md:w-1/3">
                  <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                    <h4 className="text-lg font-semibold text-teal-800 mb-4">Why choose us?</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Expert team with 10+ years experience</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">On-time delivery guarantee</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Competitive pricing</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Ongoing support & maintenance</span>
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
              What Our <span className="text-teal-600">Clients Say</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from some of our satisfied clients.
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
                className="bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Get in touch with us today and let's discuss how we can bring your ideas to life.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                Contact Us
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
                View Portfolio
              </button>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
}
