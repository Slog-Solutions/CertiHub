"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ✅ Grouped FAQ data
const faqCategories = [
  {
    category: "About Us",
    questions: [
      {
        q: "What kind of training programs do you offer?",
        a: "We offer training programs in Software Development, Corporate & Government Training, Ministry of Defence, and Outbound Training.",
      },
      {
        q: "Do you offer online courses?",
        a: "Yes, we offer both online and offline training options to provide flexibility for our students and corporate clients.",
      },
    ],
  },
  {
    category: "Training",
    questions: [
      {
        q: "What is the duration of your courses?",
        a: "Course durations vary based on the program and customization. Please contact us for details about a specific course.",
      },
      {
        q: "Can I request a custom training program?",
        a: "Yes, we specialize in creating custom training programs for both corporate and government clients. Please contact us with your specific requirements.",
      },
    ],
  },
  {
    category: "Development",
    questions: [
      {
        q: "Do you provide software development services?",
        a: "Yes, we provide complete technology solutions, including custom software development, advanced lab setups, and product innovation.",
      },
    ],
  },
  {
    category: "Outbound Training",
    questions: [
      {
        q: "What is outbound training?",
        a: "Our outbound training programs are designed to build leadership, teamwork, problem-solving, and decision-making skills through experiential learning activities.",
      },
    ],
  },
  {
    category: "Corporate Training",
    questions: [
      {
        q: "What is your approach to corporate training?",
        a: "Our corporate training is highly customized to meet the specific needs of your organization. We focus on practical, hands-on learning that directly impacts your team's performance.",
      },
    ],
  },
  {
    category: "Ministry of Defence",
    questions: [
      {
        q: "Do you work with the defence sector?",
        a: "Yes, we provide specialized defence training programs, secure software solutions, and high-security lab setups tailored for the defence sector.",
      },
    ],
  },
  {
    category: "Student Training",
    questions: [
      {
        q: "Do you provide student training?",
        a: "Yes, we offer specialized programs for students to enhance their skills and knowledge. These programs are tailored to the current industry needs and help students prepare for their careers.",
      },
    ],
  },
  {
    category: "How to Contact",
    questions: [
      {
        q: "How can I contact you?",
        a: "You can reach us through the contact form on our website, via email, or by calling our official helpline.",
      },
      {
        q: "How can I verify a certificate?",
        a: "You can verify a certificate through our website's 'Verify Certificates' section by providing the unique certificate ID.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-800 to-blue-900 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-teal-400">Questions</span>
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Browse by category to find answers about our services and training programs.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {faqCategories.map((category, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Category Heading */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  {category.category}
                </h2>
              </div>

              {/* Accordion for category questions */}
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`cat-${idx}-q-${qIdx}`}
                    className="border-b border-gray-200"
                  >
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-teal-600 transition-colors duration-200 px-6 py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-600 text-base leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}