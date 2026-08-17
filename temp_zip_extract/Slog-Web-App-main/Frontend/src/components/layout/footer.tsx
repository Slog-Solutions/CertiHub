import Link from 'next/link';
import Image from 'next/image';
import logo from "../../assets/logo.png";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, MapPin, Phone, Mail, Building2, GraduationCap } from 'lucide-react';
import EnquiryForm from '../EnquiryForm';
import gemImg from '../../assets/GeM.png'


const footerLinks = [
  { href: "#", label: "Home" },
  { href: "/development", label: "Development" },
  { href: "/training", label: "Corporate & Governmnet trainings" },
  { href: "/outbound", label: "Outbound Training" },
  { href: "/defence", label: "Minstry Of Defence" },
  { href: "/training", label: "Student Trainings" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faqs", label: "FAQs" },
];

const socialLinks = [
  { href: "https://www.facebook.com/slogsolutions/", icon: Facebook, label: "Facebook" },
  { href: "https://x.com/IndiaSlog", icon: Twitter, label: "Twitter" },
  { href: "https://www.linkedin.com/in/slogsolutions007/", icon: Linkedin, label: "LinkedIn" },
  { href: "https://www.instagram.com/slogsolutions/", icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@slogtech", icon: Youtube, label: "YouTube" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src={logo}
                alt="Slog Logo"
                width={180}
                height={68}
                className="mb-4"
              />
              <p className="text-gray-300 text-sm mb-4">
                Empowering individuals and organizations with excellence in training and development.
              </p>
              <div className="flex items-center text-gray-300 mb-2">Registered Address
                <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                <span className="text-sm">M/s Slog Solutions Pvt Ltd 349/1, Mohabewala Post Office Road, Dehradun (UK), PIN - 248001</span>
              </div>
              <div className="flex items-center text-gray-300 mb-2">Corporate Address:
                <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                <span className="text-sm">SLOG, 1st Floor, Institution of Engineers, ISBT, Dehradun, (UK), 248001</span>
              </div>
              <div className="flex items-center text-gray-300 mb-2">
                <Link href="/about#ourcenters" className="flex-shrink-0">
                  Our 125+ centers: click here</Link>
                {/* <MapPin className="h-4 w-4 mr-2 text-teal-600" /> */}
                {/* <a className="text-sm"></a> */}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-600">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-teal-600 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-600">Contact Info</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-teal-600" />
                  Government/Corporate/MoD
                </h4>
                <div className="flex flex-col space-y-1 ml-6">
                  <a href="tel:7456000240" className="text-gray-300 hover:text-teal-600 text-sm transition-colors">
                    +91 7456000240/41
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-green-400" />
                  Student Training
                </h4>
                <div className="flex flex-col space-y-1 ml-6">
                  <a href="tel:7456000242" className="text-gray-300 hover:text-green-400 text-sm transition-colors">
                    +91 7456000242/44
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-purple-400" />
                  Email Addresses
                </h4>
                <div className="flex flex-col space-y-1 ml-6">
                  <a href="mailto:slog.doon@gmail.com" className="text-gray-300 hover:text-purple-400 text-sm transition-colors">
                    slog.doon@gmail.com
                  </a>
                  <a href="mailto:info@slogsolutions.com" className="text-gray-300 hover:text-purple-400 text-sm transition-colors">
                    info@slogsolutions.com
                  </a>
                    <a href="mailto:slog.training@gmail.com" className="text-gray-300 hover:text-purple-400 text-sm transition-colors">
                    slog.training@gmail.com
                  </a>
                  <a href="mailto:slogcounsellor@gmail.com" className="text-gray-300 hover:text-purple-400 text-sm transition-colors">
                    slogcounsellor@gmail.com
                  </a>
                  <img src={gemImg.src} className="h-11 w-42 mt-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-600">Send Enquiry</h3>
            <p className="text-gray-300 text-sm mb-4">
              Have questions? Send us a message and we'll get back to you shortly.
            </p>
            <EnquiryForm
              triggerButton={
                <button className="w-full bg-teal-600 hover:bg-teal-600 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium">
                  Open Enquiry Form
                </button>
              }
            />
            <div className="mt-4">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.243935523095!2d77.99268767535476!3d30.287116474802257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092b96d24fbc93%3A0xd3421d04d411bbdb!2sSLOG%20SOLUTIONS%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1758102427834!5m2!1sen!2sin"
                className="w-full h-full border-0 rounded-lg shadow"
                title="OpenStreetMap" />
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-teal-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              © 2018 Slog Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
