"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import book from "../../assets/books.jpeg";
import EnquiryForm from "@/components/EnquiryForm";

type Course = {
  id: number;
  title: string;
  image: string;
  dataAiHint: string;
  duration: string;
  price: string;
  category: string;
  description: string;
};

const categories = [
  "All Courses",
  "Computer Science",
  "Civil Tools",
  "Mechanical Tools",
  "Architecture",
  "Specialized",
  "Networking",
  "Creative Arts",
];

// Updated color palette with teal shades
const courseColors = [
  "from-teal-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-teal-600",
  "from-purple-500 to-teal-600",
  "from-indigo-500 to-cyan-600",
  "from-cyan-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-teal-400 to-cyan-500",
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/courses/`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setFilteredCourses(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    if (selectedCategory === "All Courses") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(
        courses.filter((course) => course.category === selectedCategory)
      );
    }
  }, [selectedCategory, courses]);

  return (
    <section
      id="courses"
      className="pt-6 relative w-full min-h-screen bg-gradient-to-r from-teal-800 to-blue-900"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L3N2Zz4=')]"></div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-10">
        {/* Heading */}
        <div className="text-center mb-16 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-teal-400 rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 pb-2">
              All Courses on Slog
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose a Course to Start your Journey towards Greatness!
            </p>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-teal-400 rounded-full"></div>
          </motion.div>
        </div>

        <div className="mb-16 flex flex-wrap justify-center gap-4">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`rounded-full px-6 py-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
                  : "border-2 border-teal-200 bg-white text-teal-600 hover:bg-teal-50 hover:border-teal-300"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredCourses.map((course, index) => (
            <AnimatedCourseCard
              key={course.id}
              course={course}
              index={index}
              onClick={() => setSelectedCourse(course)}
            />
          ))}
        </motion.div>

        {/* No courses message */}
        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-teal-50 rounded-2xl p-8 max-w-md mx-auto border border-teal-100">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-teal-800 mb-2">No courses found</h3>
              <p className="text-teal-600">We don't have any courses in this category yet. Check back soon!</p>
            </div>
          </motion.div>
        )}

        {/* Course Details Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
              onClick={() => setSelectedCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-teal-50 transition-colors text-teal-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row">
                  {/* Course Image */}
                  <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                    <img
                      src={selectedCourse.image}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/70 to-transparent md:bg-gradient-to-r md:from-teal-900/70 md:to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                      <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {selectedCourse.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="md:w-3/5 p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {selectedCourse.title}
                    </h3>
                    
                    {/* Course Description */}
                    <div className="mb-6">
                      <div className="flex items-start mb-4">
                        <div className="bg-teal-100 p-2 rounded-lg mr-3 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {selectedCourse.description || "Comprehensive course covering all aspects of this subject with hands-on projects and real-world applications."}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">{selectedCourse.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium text-gray-900">{selectedCourse.price}</p>
                        </div>
                      </div>
                    </div> */}

                    <div className="bg-teal-50 rounded-xl p-4 mb-6">
                      <h4 className="font-semibold text-teal-800 mb-2">Learning Options:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span className="text-sm text-teal-700">Online Classes</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm text-teal-700">Offline Classes</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm text-teal-700">Certification</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span className="text-sm text-teal-700">Customizable</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <EnquiryForm
                        triggerButton={
                        <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 px-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Contact for Details
                      </motion.button>
                                            }
                                        />
                      
                      {/* <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 border-2 border-teal-600 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-all"
                      >
                        Customize This Course
                      </motion.button> */}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

const AnimatedCourseCard = ({
  course,
  index,
  onClick,
}: {
  course: Course;
  index: number;
  onClick: () => void;
}) => {
  const colorIndex = index % courseColors.length;
  const bgGradient = courseColors[colorIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex justify-center"
    >
      <motion.div
        className="relative w-full mx-auto cursor-pointer group"
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={onClick}
      >
        <motion.div
          className={`h-32 rounded-3xl bg-gradient-to-r ${bgGradient} shadow-lg flex items-center justify-center p-6 text-center overflow-hidden relative`}
          whileHover={{
            boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Animated background elements */}
          <motion.div 
            className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              delay: index * 0.2
            }}
          />
          <motion.div 
            className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              delay: index * 0.3
            }}
          />
          
          {/* Course title */}
          <h3 className="text-xl font-bold text-white z-10 relative px-2">
            {course.title}
          </h3>
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
              {course.category}
            </span>
          </div>
          
          {/* Hover overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center transition-all duration-300"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-white text-center"
            >
              <p className="text-sm mb-2">Click for details</p>
              <div className="inline-flex items-center justify-center bg-white/20 rounded-full px-4 py-1">
                <span className="text-xs font-semibold">View</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Subtle shadow effect on hover */}
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-teal-200/50 -z-10 mt-2 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </motion.div>
    </motion.div>
  );
};