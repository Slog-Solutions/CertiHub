"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import dq from "../../assets/dquotes.png"
import av1 from "../../assets/av1.png"
import av2 from "../../assets/av2.png"
import av3 from "../../assets/av3.png"

const testimonials = [
  {
    id: 1,
    text: "This product has completely transformed how we operate our business. The attention to detail and customer service is unmatched. I couldn't be happier with our decision to work with this team.",
    name: "Thomas Shelby",
    designation: "CEO at Picky Blinders",
    avatar: av1.src,
  },
  {
    id: 2,
    text: "Outstanding quality and exceptional service. The team went above and beyond to ensure our needs were met. This is exactly what we were looking for in a business partner.",
    name: "Sarah Johnson",
    designation: "Marketing Director at TechCorp",
    avatar: av2.src,
  },
  {
    id: 3,
    text: "Incredible results from day one. The professionalism and expertise shown by the team has exceeded all our expectations. Highly recommend to anyone looking for quality service.",
    name: "Michael Chen",
    designation: "Founder at StartupLab",
    avatar: av3.src,
  },
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Main container with soft grey-blue background */}
        <div className="relative bg-[#bfcfcf] rounded-3xl md:p-6 ">
          

          <div className="grid lg:grid-cols-2 gap-3 lg:gap-4">
            {/* Left side - Heading and navigation */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight">WHAT OUR
                <br />
                CUSTOMERS
                <br />
                SAY
              </h2>

              {/* Navigation arrows */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full border-2 border-foreground hover:bg-foreground hover:text-background transition-colors bg-transparent"
                >
                <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full border-2 border-foreground hover:bg-foreground hover:text-background transition-colors bg-transparent"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right side - Testimonial content */}
            <div className="relative">
              <div>
                {/* Quote icon */}
                <img src={dq.src} alt="Quote" className="h-5 w-5 text-muted-foreground" />

                {/* Testimonial text */}
                  <p className="text-base md:text-lg text-foreground leading-relaxed font-medium pl-2 text-justify">
                  {currentTestimonial.text}
                </p>

                {/* Customer info with decorative arrow */}
                <div className="flex items-center gap-4">
                  {/* Decorative hand-drawn style arrow */}
                  <div className="hidden md:block">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="160"
    height="160"
    viewBox="0 0 200 200"
    fill="none"
    stroke="url(#arrowGradient)"
    strokeWidth="4"
    className="text-muted-foreground"
  >
    {/* Gradient definition */}
    <defs>
      <linearGradient id="arrowGradient" x1="0" y1="0" x2="200" y2="200">
        <stop offset="0%" stopColor="#090909ff" />   {/* Tailwind blue-500 */}
        <stop offset="50%" stopColor="#050506ff" />  {/* Tailwind violet-500 */}
        <stop offset="100%" stopColor="#090708ff" /> {/* Tailwind pink-500 */}
      </linearGradient>
    </defs>

    {/* Curved path */}
    <path
      d="M20 40 
         C10 100, 120 60, 80 100 
         C60 120, 120 140, 150 120"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
      strokeDasharray="500"
      strokeDashoffset="500"
    >
      <animate
        attributeName="stroke-dashoffset"
        from="500"
        to="0"
        dur="2s"
        fill="freeze"
      />
    </path>

    {/* Arrowhead */}
    <path
      d="M145 110 L160 120 L145 130"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
      strokeDasharray="100"
      strokeDashoffset="100"
    >
      <animate
        attributeName="stroke-dashoffset"
        from="100"
        to="0"
        dur="1s"
        begin="1.8s"
        fill="freeze"
      />
    </path>
  </svg>
</div>



                  {/* Profile section */}
                  <div className="flex items-center gap-4">
                    <img
                      src={currentTestimonial.avatar || "/placeholder.svg"}
                      alt={currentTestimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-foreground text-lg">{currentTestimonial.name}</h4>
                      <p className="text-muted-foreground text-sm">{currentTestimonial.designation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel dots */}
              <div className="flex gap-2 justify-center lg:justify-end">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
