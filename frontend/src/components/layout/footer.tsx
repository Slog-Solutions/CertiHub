import Link from 'next/link';
import Image from 'next/image';
import logo from "../../assets/logo.png";
import {
  Facebook, Twitter, Linkedin, Instagram, Youtube,
  MapPin, Mail, Building2, GraduationCap,
} from 'lucide-react';
import EnquiryForm from '../EnquiryForm';
import gemImg from '../../assets/GeM.png';

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/development", label: "Development" },
  { href: "/training", label: "Corporate & Government Trainings" },
  { href: "/outbound", label: "Outbound Training" },
  { href: "/defence", label: "Ministry of Defence" },
  { href: "/training", label: "Student Trainings" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQs" },
];

const socialLinks = [
  { href: "https://www.facebook.com/slogsolutions/", icon: Facebook, label: "Facebook" },
  { href: "https://x.com/IndiaSlog", icon: Twitter, label: "Twitter" },
  { href: "https://www.linkedin.com/in/slogsolutions007/", icon: Linkedin, label: "LinkedIn" },
  { href: "https://www.instagram.com/slogsolutions/", icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@slogtech", icon: Youtube, label: "YouTube" },
];

const emails = [
  "slog.doon@gmail.com",
  "info@slogsolutions.com",
  "slog.training@gmail.com",
  "slogcounsellor@gmail.com",
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0d1b2a] text-gray-300">
      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1 · Brand & Addresses ── */}
          <div className="space-y-5">
            <Image src={logo} alt="Slog Solutions" width={160} height={60} />

            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering individuals and organisations with excellence in training and development.
            </p>

            {/* Registered Address */}
            <div className="flex gap-3 items-start">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-teal-500" />
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                  Registered Address
                </p>
                <p className="text-sm text-gray-300 leading-snug">
                  M/s Slog Solutions Pvt Ltd, 349/1, Mohabewala Post Office Road,
                  Dehradun (UK) – 248001
                </p>
              </div>
            </div>

            {/* Corporate Address */}
            <div className="flex gap-3 items-start">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-teal-500" />
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                  Corporate Address
                </p>
                <p className="text-sm text-gray-300 leading-snug">
                  1st Floor, Institution of Engineers, Near ISBT,
                  Dehradun (UK) – 248001
                </p>
              </div>
            </div>

            <Link
              href="/about#ourcenters"
              className="inline-block text-sm text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-2"
            >
              Our 125+ Centres → click here
            </Link>
          </div>

          {/* ── Col 2 · Quick Links ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white border-l-2 border-teal-500 pl-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 · Contact Info ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white border-l-2 border-teal-500 pl-3">
              Contact Info
            </h3>

            <div className="space-y-5">
              {/* Govt / Corporate / MoD */}
              <div className="flex gap-3 items-start">
                <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-teal-500" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                    Govt / Corporate / MoD
                  </p>
                  <a href="tel:+917456000240" className="text-sm text-gray-300 hover:text-teal-400 transition-colors">
                    +91 7456000240 / 41
                  </a>
                </div>
              </div>

              {/* Student Training */}
              <div className="flex gap-3 items-start">
                <GraduationCap className="h-4 w-4 mt-0.5 shrink-0 text-teal-500" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                    Student Training
                  </p>
                  <a href="tel:+917456000242" className="text-sm text-gray-300 hover:text-teal-400 transition-colors">
                    +91 7456000242 / 44
                  </a>
                </div>
              </div>

              {/* Emails */}
              <div className="flex gap-3 items-start">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-teal-500" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Email Addresses
                  </p>
                  <div className="space-y-1">
                    {emails.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="block text-sm text-gray-300 hover:text-teal-400 transition-colors"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* GeM Badge */}
              <img src={gemImg.src} alt="Available on GeM" className="h-10 w-auto ml-7" />
            </div>
          </div>

          {/* ── Col 4 · Send Enquiry ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white border-l-2 border-teal-500 pl-3">
              Send Enquiry
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Have questions? Send us a message and we&apos;ll get back to you shortly.
            </p>
            <EnquiryForm
              triggerButton={
                <button className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-semibold tracking-wide shadow">
                  Open Enquiry Form
                </button>
              }
            />
            <div className="overflow-hidden rounded-lg border border-gray-700 shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.243935523095!2d77.99268767535476!3d30.287116474802257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092b96d24fbc93%3A0xd3421d04d411bbdb!2sSLOG%20SOLUTIONS%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1758102427834!5m2!1sen!2sin"
                width="100%"
                height="160"
                className="border-0 w-full"
                title="SLOG Solutions Location"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="text-gray-500 hover:text-teal-400 transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Slog Solutions Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
