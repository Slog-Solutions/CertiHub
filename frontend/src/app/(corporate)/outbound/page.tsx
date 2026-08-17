"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
// Program data
const programs = [
  {
    id: 1,
    title: "Team Building Adventures",
    subtitle: "Strengthen collaboration and trust",
    description: "Our team building adventures are designed to break down barriers, improve communication, and foster a sense of unity among team members. Through challenging yet fun outdoor activities, participants learn to work together effectively.",
    features: [
      "Trust-building exercises",
      "Communication challenges",
      "Problem-solving activities",
      "Leadership development",
      "Conflict resolution workshops",
      "Fun recreational games"
    ],
    duration: "1-3 Days",
    participants: "10-50 People",
    location: "Nature Resorts, Adventure Parks",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Leadership Expeditions",
    subtitle: "Develop leadership in challenging environments",
    description: "Our leadership expeditions take participants out of their comfort zones and into environments where true leadership qualities emerge. Through carefully designed challenges, we help develop decisive, empathetic, and effective leaders.",
    features: [
      "Wilderness leadership challenges",
      "Decision-making under pressure",
      "Crisis management simulations",
      "Team motivation techniques",
      "Strategic planning exercises",
      "Feedback and reflection sessions"
    ],
    duration: "2-5 Days",
    participants: "5-30 People",
    location: "Mountain Treks, Forest Camps",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Corporate Wellness Retreats",
    subtitle: "Rejuvenate mind and body in nature",
    description: "Our corporate wellness retreats combine outdoor activities with mindfulness practices to reduce stress, improve mental health, and boost overall productivity. Participants return to work refreshed, re-energized, and more focused.",
    features: [
      "Yoga and meditation sessions",
      "Nature immersion activities",
      "Stress management workshops",
      "Nutrition and wellness education",
      "Adventure therapy",
      "Digital detox experiences"
    ],
    duration: "2-4 Days",
    participants: "8-40 People",
    location: "Wellness Resorts, Forest Retreats",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

// Testimonials
const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "HR Director, TechSolutions Inc.",
    content: "The team building program transformed our department. Communication improved by 70% and project delivery times decreased significantly.",
    avatar: "RK"
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Team Lead, FinCorp Limited",
    content: "Our leadership expedition was a game-changer. The practical challenges helped our managers develop real-world leadership skills.",
    avatar: "PS"
  },
  {
    id: 3,
    name: "Anil Patel",
    role: "CEO, HealthPlus Enterprises",
    content: "The wellness retreat helped our executives combat burnout and return with renewed energy and creativity. Worth every penny!",
    avatar: "AP"
  }
];

// Benefits data
const benefits = [
  {
    title: "Improved Teamwork",
    description: "Build stronger, more cohesive teams that communicate effectively and collaborate seamlessly.",
    icon: "👥"
  },
  {
    title: "Enhanced Leadership",
    description: "Develop essential leadership skills that translate directly to the workplace.",
    icon: "🌟"
  },
  {
    title: "Stress Reduction",
    description: "Reduce workplace stress and prevent burnout through nature immersion and mindfulness.",
    icon: "🧘"
  },
  {
    title: "Increased Creativity",
    description: "Stimulate innovative thinking by breaking routine patterns in inspiring natural settings.",
    icon: "💡"
  },
  {
    title: "Better Communication",
    description: "Break down communication barriers and improve interpersonal relationships.",
    icon: "💬"
  },
  {
    title: "Higher Motivation",
    description: "Return to work with renewed energy, enthusiasm, and commitment to organizational goals.",
    icon: "🚀"
  }
];

export default function OutboundTraining() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-teal-800 to-blue-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Outbound <span className="text-teal-400">Training</span> Programs
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Transform your team through experiential learning in nature's classroom. Build stronger, more effective teams with our outdoor training solutions.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <EnquiryForm
                      triggerButton={
                        <button className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-600">
                Plan Your Program
              </button>
                      }
                  />
              
              {/* <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
                Download Brochure
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
              Program <span className="text-teal-600">Benefits</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our outbound training programs deliver measurable results that transform teams and individuals.
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
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-teal-600">Programs</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer a variety of outbound training programs tailored to meet your organization's specific needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                onClick={() => setActiveTab(index)}
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-teal-100 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    {program.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                  {program.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {program.subtitle}
                </p>
                
                {/* <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {program.duration}
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {program.participants}
                  </span>
                </div> */}
                
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

      {/* Detailed Program Section */}
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
              Program <span className="text-teal-600">Details</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive outbound training programs designed for transformative experiences.
            </p>
          </motion.div>

          <div className="flex flex-wrap mb-8 border-b border-gray-200">
            {programs.map((program, index) => (
              <button
                key={program.id}
                className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors duration-300 ${activeTab === index ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-teal-500'}`}
                onClick={() => setActiveTab(index)}
              >
                {program.title}
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
              className="bg-gray-50 rounded-2xl shadow-lg p-8"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {programs[activeTab].title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {programs[activeTab].description}
                  </p>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Program Features:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {programs[activeTab].features.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start bg-white p-3 rounded-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* <div className="bg-white p-4 rounded-lg shadow-sm mb-6"> */}
                    {/* <h4 className="font-semibold text-gray-900 mb-2">Program Details:</h4> */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                      {/* <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong>Duration:</strong> {programs[activeTab].duration}</span>
                      </div> */}
                      {/* <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span><strong>Group Size:</strong> {programs[activeTab].participants}</span>
                      </div> */}
                      {/* <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span><strong>Location:</strong> {programs[activeTab].location}</span>
                      </div> */}
                    {/* </div> */}
                  {/* </div> */}
                  <EnquiryForm
                      triggerButton={
                        <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300">
                    Request a Proposal
                  </button>
                      }
                  />
                  
                </div>
                
                <div className="md:w-1/3">
                  <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                    <h4 className="text-lg font-semibold text-teal-800 mb-4">Why Choose Our Programs?</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Certified experienced trainers</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Safety-first approach</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Customized program design</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">Post-program support</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">ROI measurement tools</span>
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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success <span className="text-teal-600">Stories</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from organizations that have transformed their teams through our outbound training programs.
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
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
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
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
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
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Contact us today to design a custom outbound training program that meets your organization's specific needs.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <EnquiryForm
                      triggerButton={
                        <button className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                Get Started
              </button>
                      }
                  />
              
              {/* <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
                Download Brochure
              </button> */}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}