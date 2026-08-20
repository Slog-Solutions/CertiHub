'use client'
import React from 'react';

const PurposeSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10" id="aboutus">

      {/* Purpose Box */}
      <div className="relative text-center px-4 sm:px-8 py-10 border border-sky-400 rounded-lg bg-white shadow-lg mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
          Our Purpose:
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-black leading-relaxed max-w-3xl mx-auto">
          Our purpose is to empower individuals, organizations, and communities by
          fostering innovation, building sustainable solutions, and creating meaningful
          opportunities. We are committed to amplifying human potential through
          technology, collaboration, and continuous growth, enabling a brighter and
          more inclusive future for all.
        </p>
      </div>

      {/* About heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black mb-2 text-center">
        About Us
      </h2>
      <p className="text-center text-gray-600 mb-10 text-sm sm:text-base">
        Learn &amp; Grow Your Skills From Anywhere
      </p>

      {/* Stats — responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="bg-sky-50 rounded-xl p-6 shadow-sm">
          <div className="text-3xl sm:text-4xl font-bold text-sky-700 mb-2">50+</div>
          <div className="text-sm sm:text-base text-gray-600 leading-snug">Projects Successfully Delivered</div>
        </div>
        <div className="bg-sky-50 rounded-xl p-6 shadow-sm">
          <div className="text-3xl sm:text-4xl font-bold text-sky-700 mb-2">500+</div>
          <div className="text-sm sm:text-base text-gray-600 leading-snug">Successful Training Programs</div>
        </div>
        <div className="bg-sky-50 rounded-xl p-6 shadow-sm">
          <div className="text-3xl sm:text-4xl font-bold text-sky-700 mb-2">15k+</div>
          <div className="text-sm sm:text-base text-gray-600 leading-snug">Happy Customers</div>
        </div>
      </div>

    </div>
  );
};

export default PurposeSection;