"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState } from "react";

// Local Assets (fallbacks)
import updateslide2 from "../../assets/updateslide2.1.png";
import slide1 from "../../assets/slide1.jpeg";
import slide3 from "../../assets/slide3.png";
import updateslide3 from "../../assets/updateslide3.png";
import student_slide from "../../assets/slide10.png";

interface HeroSlide {
  id?: number;
  position: number; // ✅ position will decide which slide it belongs to
  image: string;
  superTitle?: string;
  title?: string;
  description?: string;
  route?: string;
  buttonText?: string;
}

// ✅ Default static slides (with fixed positions)
const defaultSlides: HeroSlide[] = [
  {
    position: 1,
    image: slide1.src,
    superTitle: "Development",
    description:
      "We provide complete technology solutions, including custom software, advanced lab setups, and innovative product development—reliable, scalable, and tailored to your needs.",
    route: "/development",
    buttonText: "Know More",
  },
  {
    position: 2,
    image: slide3.src,
    superTitle: "Corporate and Government Trainings",
    description:
      "Specialized corporate and government training programs designed to enhance technical skills, leadership, and productivity through hands-on learning and real-world projects.",
    route: "/training",
    buttonText: "Explore",
  },
  {
    position: 3,
    image: updateslide3.src,
    superTitle: "Outbound Trainings",
    title: "Enhancing Skills Beyond the Workplace",
    description:
      "Our outbound training programs are designed to build leadership, teamwork, problem-solving, and decision-making skills through experiential learning",
    route: "/outbound",
    buttonText: "Know More",
  },
  {
    position: 4,
    image: updateslide2.src,
    superTitle: "Ministry of Defence",
    title: "Empowering the Defence Sector",
    description:
      "Specialized defence training programs, secure software solutions, and high-security lab setups tailored for the defence sector.",
    route: "/defence",
    buttonText: "Explore",
  },
  {
    position: 5,
    image: student_slide.src,
    superTitle: "Student Training",
    title: "Empowering the Next Generation",
    description:
      "Our student training programs are designed to bridge the gap between academics and industry. Through hands-on workshops, real-world projects, and mentorship, we equip students with practical skills, technical expertise, and professional confidence to excel in their future careers.",
    route: "/courses",
    buttonText: "Explore",
  },
];

export default function Hero() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);


useEffect(() => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  async function fetchSlides() {
    try {
      const res = await fetch(`${API_URL}/api/hero-slides/`);
      const data: HeroSlide[] = await res.json();

      if (Array.isArray(data)) {
        // ✅ Create a map from backend by position
        const backendMap = new Map(
          data.map((slide) => [slide.position, slide])
        );

        // ✅ Merge: static first, backend overrides only same position
        const mergedSlides = defaultSlides.map((slide) =>
          backendMap.has(slide.position)
            ? { ...slide, ...backendMap.get(slide.position) }
            : slide
        );

        setHeroSlides(mergedSlides);
      }
    } catch (error) {
      console.error("Error fetching hero slides:", error);
    }
  }

  fetchSlides();
}, []);


  return (
    <section id="home" className="relative w-full">
      {heroSlides.map((slide, index) => (
        <div key={slide.position} className="relative w-full h-screen">
          {/* Background Image */}
          <div className="relative w-full h-screen">
            <Image
              src={slide.image}
              alt={slide.title || slide.superTitle || `Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 z-10" />

          {/* Slide Content */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div
                className={`flex flex-col md:flex-row ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                } items-center justify-between gap-4 md:gap-8`}
              >
                <div
                  className={`max-w-3xl text-white text-center md:text-left ${
                    index % 2 !== 0 ? "md:text-right" : "md:text-left"
                  } px-4 md:px-0`}
                >
                  <div className="[font-family:'Poiret_One',Helvetica] text-4xl md:text-6xl lg:text-7xl md:leading-[80px] font-semibold tracking-wide bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-500 bg-clip-text text-transparent mb-2 md:mb-4 pb-2">
                    {slide.superTitle}
                  </div>

                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
	                    <Typewriter
	                      words={
	                        index === 0
	                          ? [
	                              "AI & ML Solutions",
	                              "Software Development",
	                              "Lab Setup",
	                              "Product Development",
	                            ]
	                          : index === 1
	                          ? [
	                              "Advanced IT & Digital Transformation",
	                              "Get 250+ Online/Offline Courses",
	                              "Industry-Oriented Training Curriculum",
	                              "Cutting-Edge Technology Training",
	                              "Cybersecurity & Data Protection Programs",
	                            ]
	                          : [slide.title || "Empowering Your Future"]
	                      }
	                      loop={0}
	                      cursor
	                      cursorStyle={index === 0 ? "|" : "."}
	                      typeSpeed={50}
	                      deleteSpeed={30}
	                      delaySpeed={1500}
	                    />
	                  </h2>
	
                  <p className={`text-base md:text-xl lg:text-2xl mt-2 leading-6 md:leading-10 text-justify }`}>
	                    {slide.description}
	                  </p>
	
	                  {slide.route && (
	                    <Link href={slide.route}>
	                      <Button
	                        size="lg"
	                        className="mt-4 md:mt-8 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-lg"
	                      >
	                        {slide.buttonText}
	                      </Button>
	                    </Link>
	                  )}
	                </div>
	              </div>
	            </div>
	          </div>
	        </div>
	      ))}
	    </section>
	  );
	}
