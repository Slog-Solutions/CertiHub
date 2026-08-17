"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/logo.png";
import ct1 from "../../assets/corporateTraining1.png";
import ct2 from "../../assets/corporateTraining2.png";
import ct3 from "../../assets/corporateTraining3.png";
import ct4 from "../../assets/corporateTraining4.png";
import sd1 from "../../assets/SoftwareDevelopment.png";
import sd2 from "../../assets/SoftwareDevelopment2.png";
import sd3 from "../../assets/SoftwareDevelopment3.png";
import ls1 from "../../assets/labsetup1.png";
import ls2 from "../../assets/labsetup2.png";
import ls3 from "../../assets/labsetup3.png";
import ls4 from "../../assets/labsetup4.png";
import prdev1 from "../../assets/productDev1.png";
import prdev2 from "../../assets/productDev2.png";
import prdev3 from "../../assets/productDev3.png";
import armyt1 from "../../assets/ArmyTraing.png";
import armyt2 from "../../assets/ArmyTraing1.png";
import armyt3 from "../../assets/ArmyTraing2.png";
import armyt4 from "../../assets/ArmyTraing3.png";
import out1 from "../../assets/outbound.png";
import out2 from "../../assets/outbound1.png";
import out3 from "../../assets/outbound2.png";
import out4 from "../../assets/outbound3.png";
import studtraining1 from "../../assets/studtraining.png";
import studtraining2 from "../../assets/studtraining1.png";
import studtraining3 from "../../assets/studtraining2.png";
import studtraining4 from "../../assets/studtraining3.png";

import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import EnquiryForm from "../EnquiryForm";
import JoinUsForm from "../Joinusform"; // Import the new component

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#resources", label: "Resources" },
  { href: "/mentors", label: "Slog Ascend" },
  { href: "/#contact", label: "Contact" },
];

const services = [
  {
    name: "Development",
    path: "/development",
    subOptions: [
      {
        name: "Software Development",
        images: [sd1.src, sd2.src, sd3.src],
        description: "Custom software tailored to your needs.",
      },
      {
        name: "Lab Setup",
        images: [ls1.src, ls2.src, ls3.src, ls4.src],
        description: "End-to-end laboratory infrastructure setup.",
      },
      {
        name: "Product Development",
        images: [prdev1.src, prdev2.src, prdev3.src],
        description: "Innovative product creation and delivery.",
      },
    ],
  },
  {
    name: "Corporate & Government Training",
    path: "/training",
    images: [ct1.src, ct2.src, ct3.src, ct4.src],
    description:
      "Professional training programs for corporate and government sectors.",
  },
  {
    name: "Outbound Training Program",
    path: "/outbound",
    images: [out1.src, out2.src, out3.src, out4.src],
    description:
      "Outdoor experiential learning and team-building programs.",
  },
  {
    name: "Ministry of Defence",
    path: "/defence",
    subOptions: [
      {
        name: "Training",
        images: [armyt1.src, armyt2.src, armyt3.src, armyt4.src],
        description: "Specialized defence sector training programs.",
      },
      {
        name: "Software Development",
        images: [sd1.src, sd2.src, sd3.src],
        description: "Secure and robust defence software solutions.",
      },
      {
        name: "Lab Setup",
        images: [ls1.src, ls2.src, ls3.src, ls4.src],
        description: "High-security defence lab infrastructure.",
      },
    ],
  },
  {
    name: "Student Training",
    path: "/courses",
    images: [
      studtraining1.src,
      studtraining2.src,
      studtraining3.src,
      studtraining4.src,
    ],
    description:
      "Special programs for students to enhance skills and knowledge.",
  },
];

const resourcesItems = [
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "#joinus", label: "Join Us" },
  
  { href: "https://slogedu.slogsolutions.com/", label: "LMS" },
  { href: "https://backup.slogsolutions.com/certificateverify.php", label: "Verify Certificates" },
  
  
  { href: "/faq", label: "FAQs" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(services[0]);
  const [activeMain, setActiveMain] = useState(services[0].name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [displayImages, setDisplayImages] = useState(
    services[0].images || []
  );
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  useEffect(() => {
    const allImages = [];
    if (selectedService.images) allImages.push(...selectedService.images);
    if (selectedService.subOptions) {
      selectedService.subOptions.forEach((option) => {
        if (option.images) allImages.push(...option.images);
      });
    }
    setDisplayImages(allImages);
  }, [selectedService]);

  useEffect(() => {
    if (displayImages.length > 1) {
      const interval = setInterval(() => {
        setDisplayImages((prev) => [...prev.slice(1), prev[0]]);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [displayImages]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-black/50 backdrop-blur-sm shadow-md" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={logo}
              alt="Slog Logo"
              width={80}
              height={45}
              className="md:w-100 md:h-57"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) =>
              item.label === "Services" ? (
                <div
                  className="relative group"
                  key={item.label}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button className="text-sm font-bold text-white hover:text-cyan-600 flex items-center py-2">
                    {item.label}
                    <svg
                      className="ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 25 25"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute left-0 pt-2 w-[850px] transition-all duration-200 ${
                      isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                  >
                    <div
                      className="flex bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800 overflow-hidden z-50"
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      {/* Services list */}
                      <div className="w-1/4 p-4 bg-gray-800">
                        <div className="bg-white text-black p-3 shadow-md w-full">
                          {services.map((service) => (
                            <div
                              key={service.name}
                              className={`p-3 cursor-pointer font-semibold transition-all duration-300 hover:bg-gray-200/70 
                                ${activeMain === service.name ? "bg-gray-100" : ""}`}
                              onMouseEnter={() => {
                                setActiveMain(service.name);
                                setSelectedService(service);
                              }}
                            >
                              {service.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Service details */}
                      <div className="w-1/4 p-6 flex flex-col text-left">
                        <h3 className="text-2xl font-bold">{selectedService.name}</h3>
                        <p className="mb-4 text-gray-300 text-sm">{selectedService.description}</p>

                        {selectedService.subOptions && (
                          <div className="space-y-3">
                            {selectedService.subOptions.map((sub) => (
                              <div key={sub.name}>
                                <h4 className="text-lg font-semibold">{sub.name}</h4>
                                <p className="text-gray-400 text-xs">{sub.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Navigate with Next.js Link */}
                        <Link href={selectedService.path || "/services"}>
                          <Button className="mt-1 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg w-fit text-sm py-2 px-4">
                            Explore Now
                          </Button>
                        </Link>
                      </div>

                      {/* Images */}
                      <div className="w-2/4 mt-6 mr-6">
                        {displayImages.length > 0 && (
                          <div className="grid grid-cols-1 gap-2 max-w-full">
                            <img
                              src={displayImages[0]}
                              alt="Main preview"
                              className="h-40 w-full object-cover rounded-lg transition-all duration-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              {displayImages[1] && (
                                <img
                                  src={displayImages[1]}
                                  alt="Preview small 1"
                                  className="h-30 w-full object-cover rounded-lg transition-all duration-500"
                                />
                              )}
                              {displayImages[2] && (
                                <img
                                  src={displayImages[2]}
                                  alt="Preview small 2"
                                  className="h-30 w-full object-cover rounded-lg transition-all duration-500"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : item.label === "Resources" ? (
                <div
                  className="relative group"
                  key={item.label}
                  onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                  onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                >
                  <button className="text-sm font-bold text-white hover:text-cyan-600 flex items-center py-2">
                    {item.label}
                    <svg
                      className="ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Resources dropdown */}
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 pt-3 transition-all duration-200 ${
                      isResourcesDropdownOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    }`}
                  >
                    <div
                      className="bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800 overflow-hidden z-50"
                      onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                      onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                    >
                      {resourcesItems.map((res) => (
                        res.label === "Join Us" ? (
                          <JoinUsForm key={res.label} triggerButton={
                            <Button variant="ghost" className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm hover:text-black">
                              {res.label}
                            </Button>
                          }/>
                        ) : (
                          <Link
                            key={res.label}
                            href={res.href}
                            className="block px-4 py-2 hover:bg-gray-100 text-sm hover:text-black"
                          >
                            {res.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-bold text-white hover:text-cyan-600 py-2"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <JoinUsForm
              triggerButton={
                <Button variant="outline" className="rounded-full w-full">
                  Join Us
                </Button>
              }
            />
              <EnquiryForm
                  triggerButton={
            <Button className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-white">
              Enquiry
            </Button>
                  }
                />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-xs bg-gray-900 text-white p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image
                      src={logo}
                      alt="Slog Logo"
                      width={100}
                      height={45}
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      {item.label === "Services" ? (
                        <div>
                          <button 
                            className="flex items-center justify-between w-full text-lg font-bold hover:text-cyan-400 py-2"
                            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                          >
                            <span>{item.label}</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {mobileServicesOpen && (
                            <div className="pl-4 mt-2 space-y-3 border-l border-gray-700">
                              {services.map((service) => (
                                <div key={service.name} className="py-2">
                                  <Link
                                    href={service.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-semibold hover:text-cyan-400 block"
                                  >
                                    {service.name}
                                  </Link>
                                  {service.subOptions && (
                                    <div className="pl-3 mt-1 space-y-2">
                                      {service.subOptions.map((sub) => (
                                        <Link
                                          key={sub.name}
                                          href={service.path}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="text-sm text-gray-300 hover:text-cyan-400 block"
                                        >
                                          {sub.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : item.label === "Resources" ? (
                        <div>
                          <button 
                            className="flex items-center justify-between w-full text-lg font-bold hover:text-cyan-400 py-2"
                            onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                          >
                            <span>{item.label}</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${mobileResourcesOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {mobileResourcesOpen && (
                            <div className="pl-4 mt-2 space-y-2 border-l border-gray-700">
                              {resourcesItems.map((res) => (
                                res.label === "Join Us" ? (
                                  <JoinUsForm key={res.label} triggerButton={
                                    <Button variant="ghost" className="block w-full text-left font-normal text-gray-300 hover:text-cyan-400 px-0 py-0">
                                      {res.label}
                                    </Button>
                                  }/>
                                ) : (
                                  <Link
                                    key={res.label}
                                    href={res.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-gray-300 hover:text-cyan-400"
                                  >
                                    {res.label}
                                  </Link>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-lg font-bold hover:text-cyan-400 py-2 block"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
                
                <div className="mt-8 flex flex-col space-y-4">
                  
                  <JoinUsForm
                    triggerButton={
                      <Button 
                        variant="outline"
                        className="rounded-full w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Join Us
                      </Button>
                    }
                  />
                  <EnquiryForm
                    triggerButton={
                      <Button 
                        className="rounded-full w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Enquiry
                      </Button>
                    }
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
