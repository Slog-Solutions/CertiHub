"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Course = {
  id: number;
  title: string;
  image: string;
  dataAiHint: string;
  duration: string;
  price: string;
  category: string;
};

const categories = [
  "Computer Science",
  "Civil Tools",
  "Mechanical Tools",
  "Architecture",
  "Specialized",
  "Networking",
  "Creative Arts",
];

// Color palette for course boxes
const courseColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-yellow-500 to-orange-600",
  "from-red-500 to-pink-600",
  "from-indigo-500 to-purple-600",
  "from-teal-500 to-blue-600",
  "from-orange-500 to-red-600",
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/courses/`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredCourses(
        courses.filter((course) => course.category === selectedCategory)
      );
    } else {
      setFilteredCourses([]);
    }
  }, [selectedCategory, courses]);

  return (
    <section id="courses" className="pt-6 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 pb-1">
              All Courses on Slog
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose a Course to Start your Journey towards Greatness!
            </p>
          </motion.div>
        </div>

        {/* Category Carousel */}
        <div className="mb-16">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {categories.map((category, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/3 lg:basis-1/5"
                >
                  <div className="p-1">
                    <Button
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      className={`w-full rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "border-2 border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category ? null : category
                        )
                      }
                    >
                      {category}
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex bg-white shadow-md hover:bg-cyan-500 text-black ml-4" />
            <CarouselNext className="hidden sm:flex bg-white shadow-md hover:bg-cyan-500 text-black mr-4" />
          </Carousel>
        </div>

        {/* Courses Grid */}
        {selectedCategory && (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
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
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Course Image */}
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={selectedCourse.image}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedCourse.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">{selectedCourse.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900">{selectedCourse.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium text-gray-900">{selectedCourse.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Enquiry Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Enquiry Now
                  </motion.button>
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
        className="relative w-4/5 mx-auto cursor-pointer"
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={onClick}
      >
        <motion.div
          className={`h-10 rounded-3xl bg-gradient-to-r ${bgGradient} shadow-lg flex items-center justify-center p-6 mb-4 text-center overflow-hidden relative`}
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
          <h3 className="text-xl font-bold text-white z-10 relative">
            {course.title}
          </h3>
          
          {/* Hover overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 rounded-3xl flex items-center justify-center transition-opacity duration-300"
            whileHover={{ opacity: 1 }}
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
          className="absolute inset-0 rounded-3xl bg-gray-200/50 -z-10 mt-2 blur-md"
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};