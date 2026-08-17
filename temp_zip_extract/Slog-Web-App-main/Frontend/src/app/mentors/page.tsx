"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./mentor.css"; // keep your custom CSS

interface Mentor {
  name: string;
  designation: string;
  image: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/mentors/`)
      .then((res) => res.json())
      .then((data) => {
        setMentors(data);
        setLoading(false);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-stone-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-teal-800 to-blue-900 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block mb-4 text-sm font-semibold tracking-wider text-teal-600 uppercase">
            Introducing Our Professionals
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Team that powers <span className="text-teal-600">Slog</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-white leading-relaxed">
            Learn from industry leaders and passionate educators dedicated to your success.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
          </div>
        </div>

        {/* Grid of mentors (no slider) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="flip-card perspective opacity-100 transition-opacity duration-500"
            >
              <div className="flip-card-inner">
                {/* Front Face */}
                <div className="flip-card-front bg-white">
                  <div className="relative w-full h-80">
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      fill
                      className="object-cover w-full h-full"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-stone-900/10 to-transparent"></div>
                  </div>
                </div>
                {/* Back Face */}
                <div className="flip-card-back">
                  <div className="w-full h-full flex flex-col justify-center items-center p-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-1">
                      {mentor.name}
                    </h2>
                    <p className="text-stone-700 text-base font-medium">
                      {mentor.designation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
