// src/app/about/page.tsx

'use client';

import IndiaMap from '@/components/IndiaMap';
import { useState, useEffect } from 'react';
import GeMimage from '../../assets/GeM.png'
export default function AboutUsPage(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-800 to-blue-900 py-28 px-6">
      <div className="max-w-5xl mx-auto text-center text-white">
        {/* Hero Section */}
        <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-teal-400">Slog Solutions Pvt. Ltd.</span>
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-8">
            Empowering businesses, institutions, and individuals with innovative IT
            solutions, corporate training, and advanced technology services from
            Dehradun, Uttarakhand.
          </p>
          <div className="flex justify-center space-x-6 text-xl mb-16">
            <div className="bg-white/10 p-3 rounded-lg">50+ Projects</div>
            <div className="bg-white/10 p-3 rounded-lg">500+ Trainings</div>
            <div className="bg-white/10 p-3 rounded-lg">15,000+ Learners</div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="text-left space-y-10 leading-relaxed">
          {/* Who We Are */}
          <section className={`transition-transform duration-700 delay-100 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
            <h2 className="text-2xl font-semibold text-teal-300 mb-3">Who We Are</h2>
            <p className="mb-6">
              Slog Solutions Pvt. Ltd., based in Dehradun, is a leading technology
              and training company delivering tailored IT solutions, professional
              development programs, and strategic consulting. We work with
              students, corporates, government bodies, and the defence sector to
              empower them with next-generation skills and robust digital
              infrastructure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-teal-400 text-2xl mb-2">
                  <i className="fas fa-certificate"></i>
                </div>
                <h3 className="font-semibold">ISO Certified</h3>
                <p className="text-sm">Quality standards</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-teal-400 text-2xl mb-2">
                  <i className="fas fa-award"></i>
                </div>
                <h3 className="font-semibold">Award Winning</h3>
                <p className="text-sm">Quality Innovation Award 2022</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-teal-400 text-2xl mb-2">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3 className="font-semibold">Trusted Partner</h3>
                <p className="text-sm">Government & Corporate</p>
              </div>
            </div>
          </section>

          {/* What We Do */}
          <section className={`transition-transform duration-700 delay-200 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
            <h2 className="text-2xl font-semibold text-teal-300 mb-3">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-teal-700 p-2 rounded-md mr-3">
                    <i className="fas fa-code text-teal-300"></i>
                  </div>
                  <h3 className="font-semibold">Software Development</h3>
                </div>
                <p className="text-sm">End-to-end IT solutions, product innovation, and advanced lab setups.</p>
              </div>

              <div className="bg-white/5 p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-teal-700 p-2 rounded-md mr-3">
                    <i className="fas fa-chalkboard-teacher text-teal-300"></i>
                  </div>
                  <h3 className="font-semibold">Corporate Training</h3>
                </div>
                <p className="text-sm">Customized programs to upskill employees and officials.</p>
              </div>

              <div className="bg-white/5 p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-teal-700 p-2 rounded-md mr-3">
                    <i className="fas fa-user-graduate text-teal-300"></i>
                  </div>
                  <h3 className="font-semibold">Student Training</h3>
                </div>
                <p className="text-sm">Industry-ready programs bridging academics and real-world skills.</p>
              </div>

              <div className="bg-white/5 p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="bg-teal-700 p-2 rounded-md mr-3">
                    <i className="fas fa-shield-alt text-teal-300"></i>
                  </div>
                  <h3 className="font-semibold">Defence Solutions</h3>
                </div>
                <p className="text-sm">High-security applications and training for defence needs.</p>
              </div>
            </div>
          </section>

          {/* Our Mission */}
          <section className={`transition-transform duration-700 delay-300 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
            <h2 className="text-2xl font-semibold text-teal-300 mb-3">Our Mission</h2>
            <p className="mb-6">
              To transform education, training, and technology adoption by
              equipping individuals and organizations with tools and knowledge
              for long-term success in an evolving digital world.
            </p>
            <div className="bg-teal-900/30 p-5 rounded-lg border-l-4 border-teal-400">
              <p className="italic">
                "Empowering innovation through technology, training, and transformation."
              </p>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className={`transition-transform duration-700 delay-400 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
            <h2 className="text-2xl font-semibold text-teal-300 mb-3">Why Choose Us</h2>
            <p className="mb-6">
              With years of expertise, industry collaborations, and a strong
              track record of government and corporate projects, Slog Solutions
              stands as a trusted partner in innovation and growth.
            </p>
          </section>
	          <section id='ourcenters' className={`transition-transform duration-700 delay-400 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
	            <h2 className="text-2xl font-semibold text-teal-300 mb-3">Our Collaborative Centers</h2>
	            <p className="mb-6">
	              Slog Solutions collaborates with various institutions and organizations across India to expand our reach and deliver high-quality training and technology solutions.
	            </p>
	          </section>
          <IndiaMap />
        </div>
      </div>
    </div>
  );
}
