"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState, useRef, useCallback } from "react";

// Local Assets
import updateslide2 from "../../assets/updateslide2.1.png";
import slide1 from "../../assets/slide1.png";
import slide3 from "../../assets/slide3.png";
import updateslide3 from "../../assets/updateslide3.png";
import student_slide from "../../assets/slide10.png";

/** Auto-play interval in milliseconds — change this one value to tune the cadence */
const AUTO_PLAY_INTERVAL = 2500;

interface HeroSlide {
  id?: number;
  position: number;
  image: string;
  superTitle?: string;
  title?: string;
  description?: string;
  route?: string;
  buttonText?: string;
}

/** Typewriter word lists keyed by slide position */
const TYPEWRITER_WORDS: Record<number, string[]> = {
  1: ["AI & ML Solutions", "Software Development", "Lab Setup", "Product Development"],
  2: [
    "Advanced IT & Digital Transformation",
    "Get 250+ Online/Offline Courses",
    "Industry-Oriented Training Curriculum",
    "Cutting-Edge Technology Training",
    "Cybersecurity & Data Protection Programs",
  ],
};

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
      "Our outbound training programs are designed to build leadership, teamwork, problem-solving, and decision-making skills through experiential learning.",
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
      "Our student training programs bridge the gap between academics and industry. Through hands-on workshops, real-world projects, and mentorship, we equip students with practical skills, technical expertise, and professional confidence.",
    route: "/courses",
    buttonText: "Explore",
  },
];

export default function Hero() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPlayEnded, setAutoPlayEnded] = useState(false);
  // Ref mirror so setTimeout callbacks always read the latest value (fixes stale closure)
  const autoPlayEndedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Touch/swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  /* ── Fetch CMS slides (merge by position, same as original) ── */
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    async function fetchSlides() {
      try {
        const res = await fetch(`${API_URL}/api/hero-slides/`);
        if (!res.ok) return;
        const data: HeroSlide[] = await res.json();
        if (Array.isArray(data)) {
          const backendMap = new Map(data.map((s) => [s.position, s]));
          const merged = defaultSlides.map((s) =>
            backendMap.has(s.position) ? { ...s, ...backendMap.get(s.position) } : s
          );
          setHeroSlides(merged);
        }
      } catch {
        /* silently fallback to static */
      }
    }
    fetchSlides();
  }, []);

  /* ── Slide navigation ── */
  const goTo = useCallback(
    (index: number, animated = true) => {
      if (isTransitioning) return;
      if (animated) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 700);
      }
      setCurrent((index + heroSlides.length) % heroSlides.length);
    },
    [heroSlides.length, isTransitioning]
  );

  const next = useCallback(() => {
    // Read the ref — not the state — so the stale-closure in setTimeout is never an issue
    if (autoPlayEndedRef.current) return;

    if (current >= heroSlides.length - 1) {
      // Completed one full round — go back to slide 1 and stop
      goTo(0);
      autoPlayEndedRef.current = true;
      setAutoPlayEnded(true);
    } else {
      goTo(current + 1);
    }
  }, [current, heroSlides.length, goTo]);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* ── Auto-play ── */
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPaused && !autoPlayEndedRef.current) {
      timerRef.current = setTimeout(next, AUTO_PLAY_INTERVAL);
    }
  }, [isPaused, next]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, resetTimer]);

  /* ── Keyboard arrow navigation ── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't hijack keys while the user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === "ArrowLeft") {
        if (timerRef.current) clearTimeout(timerRef.current);
        goTo(current - 1);
      } else if (e.key === "ArrowRight") {
        if (timerRef.current) clearTimeout(timerRef.current);
        goTo(current + 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, goTo]);

  /* ── Touch / Swipe ── */
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  const total = heroSlides.length;

  return (
    <section
      id="home"
      aria-label="Hero carousel"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slide stack (all slides rendered; only active one is visible) ── */}
      {heroSlides.map((slide, index) => {
        const isActive = index === current;
        const isOdd = index % 2 !== 0;

        return (
          <div
            key={slide.position}
            aria-hidden={!isActive}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
              zIndex: isActive ? 2 : 1,
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {/* Background image */}
            <Image
              src={slide.image}
              alt={slide.superTitle || `Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />

            {/* Dark gradient overlay — stronger at bottom for dot legibility */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
              }}
            />

            {/* Slide content */}
            <div className="absolute inset-0 flex items-center z-20">
              {/* Matches header.tsx container for perfect left-alignment on all screens */}
              <div
                className="container mx-auto px-4 sm:px-6 lg:px-8 w-full"
              >
                <div
                  className={`flex flex-col ${
                    isOdd ? "md:items-end md:text-right" : "md:items-start md:text-left"
                  } items-center text-center ${isOdd ? "md:ml-auto" : ""}`}
                  style={{
                    maxWidth: "min(48rem, 100%)",
                    transform: isActive
                      ? "translateY(0)"
                      : isOdd
                      ? "translateY(28px)"
                      : "translateY(-28px)",
                    opacity: isActive ? 1 : 0,
                    transition:
                      "transform 0.75s cubic-bezier(0.4,0,0.2,1) 0.1s, opacity 0.75s ease 0.1s",
                  }}
                >
                  {/* Super-title — clamp() keeps it large on 1920px+ screens */}
                  <div
                    className="[font-family:'Poiret_One',Helvetica] font-semibold tracking-wide bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent pb-2 leading-tight"
                    style={{
                      fontSize: "clamp(2.25rem, 4.5vw, 4.5rem)",
                      marginBottom: "clamp(0.5rem, 1vw, 1rem)",
                    }}
                  >
                    {slide.superTitle}
                  </div>

                  {/* Typewriter heading — only rendered when active to keep sync */}
                  <h2
                    className="text-white font-bold min-h-[2.4em]"
                    style={{
                      fontSize: "clamp(1.25rem, 2.5vw, 2.5rem)",
                      marginBottom: "clamp(0.75rem, 1.5vw, 1.25rem)",
                    }}
                  >
                    {isActive && (
                      <Typewriter
                        words={
                          TYPEWRITER_WORDS[slide.position] || [
                            slide.title || "Empowering Your Future",
                          ]
                        }
                        loop={0}
                        cursor
                        cursorStyle={slide.position === 1 ? "|" : "."}
                        typeSpeed={50}
                        deleteSpeed={30}
                        delaySpeed={1800}
                      />
                    )}
                    {!isActive && (
                      <span>
                        {(TYPEWRITER_WORDS[slide.position] || [slide.title || "Empowering Your Future"])[0]}
                      </span>
                    )}
                  </h2>

                  {/* Description — clamp() prevents it shrinking to tiny on large screens */}
                  <p
                    className="text-white/85 leading-relaxed line-clamp-4 md:line-clamp-none"
                    style={{
                      fontSize: "clamp(0.9rem, 1.15vw, 1.2rem)",
                      marginBottom: "clamp(1rem, 1.5vw, 0px)",
                    }}
                  >
                    {slide.description}
                  </p>

                  {/* CTA */}
                  {slide.route && (
                    <Link
                      href={slide.route}
                      className="inline-block"
                      style={{ marginTop: "clamp(1rem, 2vw, 2rem)" }}
                    >
                      <Button
                        size="lg"
                        className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:scale-105 hover:shadow-cyan-400/50"
                        style={{
                          paddingLeft: "clamp(1.75rem, 2.5vw, 2.5rem)",
                          paddingRight: "clamp(1.75rem, 2.5vw, 2.5rem)",
                          paddingTop: "clamp(0.75rem, 1.2vw, 1.25rem)",
                          paddingBottom: "clamp(0.75rem, 1.2vw, 1.25rem)",
                          fontSize: "clamp(0.875rem, 1vw, 1.125rem)",
                        }}
                      >
                        {slide.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}


      {/* ── Navigation dots ── */}
      <div
        className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5"
        role="tablist"
        aria-label="Slide navigation"
      >
        {heroSlides.map((slide, index) => {
          const isActive = index === current;
          return (
            <button
              key={slide.position}
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${index + 1}: ${slide.superTitle}`}
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                goTo(index);
              }}
              className="rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{
                width: isActive ? "28px" : "8px",
                height: "8px",
                background: isActive
                  ? "rgba(6,182,212,1)"   // cyan-500
                  : "rgba(255,255,255,0.45)",
                transform: isActive ? "scaleY(1.15)" : "scale(1)",
              }}
            />
          );
        })}
      </div>

      {/* ── Slide counter (top-right) ── */}
      {/* <div className="absolute top-24 md:top-28 right-5 md:right-8 z-30 text-white/60 text-xs md:text-sm font-mono select-none">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div> */}

    </section>
  );
}
