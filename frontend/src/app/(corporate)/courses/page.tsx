"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import {
  Search,
  BookOpen,
  Clock,
  Tag,
  X,
  FileText,
  PhoneCall,
  HelpCircle,
  Mail,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  image: string;
  duration: string;
  price: string;
  category: string;
  description: string;
};

// Colors mapping for category badges
const getCategoryBadgeStyles = (cat: string) => {
  const name = cat.toLowerCase();
  if (name.includes("computer") || name.includes("programming") || name.includes("web") || name.includes("python") || name.includes("java")) {
    return "bg-teal-100 text-teal-800 border border-teal-200";
  }
  if (name.includes("civil") || name.includes("structural") || name.includes("survey")) {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  }
  if (name.includes("mechanical") || name.includes("cad") || name.includes("solidworks") || name.includes("ansys")) {
    return "bg-rose-100 text-rose-800 border border-rose-200";
  }
  if (name.includes("architecture") || name.includes("sketchup") || name.includes("max")) {
    return "bg-purple-100 text-purple-800 border border-purple-200";
  }
  return "bg-teal-100 text-teal-700 border border-teal-200";
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Courses"]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch Categories and Courses ──
  useEffect(() => {
    setIsLoading(true);

    const fetchCategories = fetch("/api/custom-courses/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((cat: any) => cat.name);
          setCategories(["All Courses", ...names]);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));

    const fetchCourses = fetch("/api/custom-courses/public")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: Course[] = data.map((item: any) => ({
            id: item._id,
            title: item.name,
            image: item.image || "/assets/books.jpeg",
            duration: item.duration || "Flexible",
            price: item.fees || "TBD",
            category: item.category?.name || "General",
            description: item.description || "",
          }));
          setCourses(mapped);
          setFilteredCourses(mapped);
        }
      })
      .catch((err) => console.error("Fetch custom courses error:", err));

    Promise.allSettled([fetchCategories, fetchCourses]).then(() => {
      setIsLoading(false);
    });
  }, []);

  // ── Filter courses by category + search ──
  useEffect(() => {
    const q = search.toLowerCase().trim();
    const byCategory =
      selectedCategory === "All Courses"
        ? courses
        : courses.filter((c) => c.category === selectedCategory);
    const bySearch = q
      ? byCategory.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      )
      : byCategory;
    setFilteredCourses(bySearch);
  }, [selectedCategory, search, courses]);

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
              All Courses on <span className="text-teal-600">Slog</span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-white mb-10 max-w-2xl mx-auto">
              Explore professional catalog modules designed to start your journey towards engineering and technological excellence!
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. SEARCH & FILTER SECTION ───────────────────────────────── */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                id="course-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses by name or category…"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-full pl-12 pr-12 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Result Count */}
            {(search || selectedCategory !== "All Courses") && (
              <p className="mt-3 text-xs text-gray-500 text-center font-semibold">
                {filteredCourses.length === 0
                  ? "No matching courses found"
                  : `Found ${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          {/* Category Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
            {categories.map((category, index) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${isSelected
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 3. COURSES CATALOG GRID ───────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl h-80 animate-pulse p-4 space-y-4 shadow-md">
                  <div className="bg-gray-200 h-40 rounded-xl w-full" />
                  <div className="bg-gray-200 h-5 rounded w-3/4" />
                  <div className="bg-gray-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Courses Cards Grid */}
          {!isLoading && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Card Image */}
                    <div className="h-44 w-full bg-gray-50 rounded-xl border border-gray-100 relative flex items-center justify-center overflow-hidden mb-4">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center gap-1.5">
                          <BookOpen className="h-8 w-8 text-teal-600 opacity-60" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Course Track</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${getCategoryBadgeStyles(course.category)}`}>
                          {course.category}
                        </span>
                      </div>
                    </div>

                    {/* Course Title & Description */}
                    <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-teal-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                      {course.description || "Click to view full syllabus details and enquire for this training track."}
                    </p>
                  </div>

                  {/* Card Footer Info */}
                  <div className="border-t border-gray-100 pt-3.5 mt-4 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-teal-600" />
                      <span>{course.duration}</span>
                    </span>

                    <span className="font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 text-xs">
                      {course.price.startsWith("₹") || course.price.toLowerCase().includes("inr") || course.price.toLowerCase().includes("tbd") || course.price.toLowerCase().includes("free") ? course.price : `₹${course.price}`}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-8 max-w-sm mx-auto shadow-sm">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-teal-100 text-teal-600">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">No courses found</h3>
                <p className="text-gray-500 text-xs leading-normal mb-4">We don't have any courses matching this search. Try a different term or reset filters.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All Courses");
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* ── 4. COURSE DETAILS MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden relative border border-gray-100 text-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row min-h-[400px]">
                {/* Course Image Side */}
                <div className="md:w-1/2 min-h-[220px] md:h-auto overflow-hidden relative bg-gray-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                  {selectedCourse.image ? (
                    <img
                      src={selectedCourse.image}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center gap-2 p-8">
                      <BookOpen className="h-10 w-10 text-teal-600 opacity-60" />
                      <span className="text-xs font-bold text-gray-500">Slog Track</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${getCategoryBadgeStyles(selectedCourse.category)}`}>
                      {selectedCourse.category}
                    </span>
                  </div>
                </div>

                {/* Course Details Side */}
                <div className="md:w-1/2 p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                      {selectedCourse.title}
                    </h3>

                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">
                        Course Overview & Syllabus
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2">
                        {selectedCourse.description || "Comprehensive hands-on training module covering foundational theory, lab setups, practical exercises, and capstone project implementations."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100 flex items-center gap-3">
                        <Clock className="h-5 w-5 text-teal-600 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Duration</p>
                          <p className="text-xs font-bold text-gray-800">{selectedCourse.duration}</p>
                        </div>
                      </div>

                      <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100 flex items-center gap-3">
                        <Tag className="h-5 w-5 text-teal-600 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Course Fee</p>
                          <p className="text-xs font-bold text-teal-700">
                            {selectedCourse.price.startsWith("₹") || selectedCourse.price.toLowerCase().includes("inr") || selectedCourse.price.toLowerCase().includes("tbd") || selectedCourse.price.toLowerCase().includes("free") ? selectedCourse.price : `₹${selectedCourse.price}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <EnquiryForm
                      courseInterested={selectedCourse.title}
                      triggerButton={
                        <button className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4" /> Enquire / Enroll For Course
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

      {/* ── 5. CTA BANNER ────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your Training?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Get in touch with our academic team today and let's discuss how we can help you build market-ready skills.
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

    </div>
  );
}