"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";

type Course = {
  id: string;
  title: string;
  image: string;
  duration: string;
  price: string;
  category: string;
  description: string;
};

// Colors mapping for category-specific tags
const getCategoryBadgeStyles = (cat: string) => {
  const name = cat.toLowerCase();
  if (name.includes("computer") || name.includes("programming") || name.includes("web") || name.includes("python") || name.includes("java")) {
    return "bg-indigo-50 text-indigo-600 border border-indigo-100";
  }
  if (name.includes("civil") || name.includes("structural") || name.includes("survey")) {
    return "bg-amber-50 text-amber-700 border border-amber-100";
  }
  if (name.includes("mechanical") || name.includes("cad") || name.includes("solidworks") || name.includes("ansys")) {
    return "bg-rose-50 text-rose-600 border border-rose-100";
  }
  if (name.includes("architecture") || name.includes("sketchup") || name.includes("max")) {
    return "bg-teal-50 text-teal-600 border border-teal-100";
  }
  return "bg-emerald-50 text-emerald-600 border border-emerald-100";
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Courses"]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");

  // ── Fetch Categories and Courses ──
  useEffect(() => {
    // 1. Fetch categories
    fetch("/api/custom-courses/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((cat: any) => cat.name);
          setCategories(["All Courses", ...names]);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));

    // 2. Fetch custom courses
    fetch("/api/custom-courses/public")
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
    <section
      id="courses"
      className="pt-6 relative w-full min-h-screen bg-slate-50 text-slate-800"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-10">
        {/* Heading */}
        <div className="text-center mb-12 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="w-16 h-1 bg-emerald-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              All Courses on Slog
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Explore professional catalog modules designed to start your journey towards engineering and technological excellence!
            </p>
          </motion.div>
        </div>

        {/* ── Search Bar ── */}
        <div className="max-w-xl mx-auto mb-10 px-2">
          <div className="relative">
            {/* Search icon */}
            <svg
              width="20"
              height="20"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>

            <input
              id="course-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by name or category…"
              className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-sm"
            />

            {/* Clear button */}
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Result count */}
          {(search || selectedCategory !== "All Courses") && (
            <p className="mt-2 text-xs text-slate-500 text-center font-semibold">
              {filteredCourses.length === 0
                ? "No matching courses found"
                : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} found`}
            </p>
          )}
        </div>

        {/* Categories Tabs Selector */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`rounded-lg px-5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === category
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-0"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
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
          transition={{ duration: 0.4 }}
        >
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
            >
              {/* Card Image */}
              <div className="h-44 w-full bg-slate-50 border-b border-slate-100 relative flex items-center justify-center overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-wider">No Image</span>
                  </div>
                )}
                {/* Category tag */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase ${getCategoryBadgeStyles(course.category)}`}>
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Card details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-3 min-h-[4.5em] leading-relaxed">
                    {course.description || "Click to view full syllabus details and enquire for this track."}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3.5 mt-3.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{course.duration}</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {course.price.startsWith("₹") || course.price.toLowerCase().includes("inr") || course.price.toLowerCase().includes("tbd") || course.price.toLowerCase().includes("free") ? course.price : `₹${course.price}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* No courses message */}
        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 max-w-sm mx-auto shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No courses found</h3>
              <p className="text-slate-500 text-xs leading-normal">We don't have any courses active in this category yet. Check back soon!</p>
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4"
              onClick={() => setSelectedCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden relative border border-slate-100 text-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors text-slate-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row min-h-[420px]">
                  {/* Course Image */}
                  <div className="md:w-1/2 min-h-[250px] md:h-auto overflow-hidden relative bg-slate-50 flex items-center justify-center border-r border-slate-100">
                    <img
                      src={selectedCourse.image}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase shadow-sm ${getCategoryBadgeStyles(selectedCourse.category)}`}>
                        {selectedCourse.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                        {selectedCourse.title}
                      </h3>
                      
                      {/* Course Description */}
                      <div className="mb-6 max-h-[200px] overflow-y-auto pr-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Course Details & Syllabus</p>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {selectedCourse.description || "No detailed syllabus description available for this course track."}
                        </p>
                      </div>
                      
                      {/* Duration & Price Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6 border-t border-slate-100 pt-4">
                        <div className="flex items-center">
                          <div className="bg-slate-50 p-2.5 rounded-lg mr-3 border border-slate-150 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Duration</p>
                            <p className="text-xs font-bold text-slate-700">{selectedCourse.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-slate-50 p-2.5 rounded-lg mr-3 border border-slate-150 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Course Fees</p>
                            <p className="text-xs font-bold text-slate-700">
                              {selectedCourse.price.startsWith("₹") || selectedCourse.price.toLowerCase().includes("inr") || selectedCourse.price.toLowerCase().includes("tbd") || selectedCourse.price.toLowerCase().includes("free") ? selectedCourse.price : `₹${selectedCourse.price}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 border-t border-slate-100 pt-4">
                      <EnquiryForm
                        courseInterested={selectedCourse.title}
                        triggerButton={
                          <button
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Enquire About Course
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
      </div>
    </section>
  );
}