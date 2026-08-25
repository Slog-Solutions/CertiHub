import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, MessageSquare, Loader, CheckCircle, ArrowRight } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    courseInterested: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    if (!formData.name || !formData.phone) {
      setSubmitError('Name and phone number are required.');
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setSubmitError('Phone number must be exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('/api/enquiry/public', formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        courseInterested: '',
        message: ''
      });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Enquiry submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const helplineGroups = [
    {
      title: 'Training Helplines',
      phone1: '+(91) 7456000242',
      phone2: '+(91) 7456000243',
      desc: 'Call for pricing structure, duration adjustments, and bootcamp info.'
    },
    {
      title: 'Workshop & College Ties',
      phone1: '+(91) 7456000241',
      phone2: '+(91) 7456000240',
      desc: 'Call for institutional guest sessions and industrial partnerships.'
    },
    {
      title: 'WhatsApp Helper',
      phone1: '+(91) 7456000240',
      phone2: '+(91) 7456000241',
      desc: 'Interactive chat support for session status and logs.'
    }
  ];

  return (
    <div className="flex-1 space-y-16 py-12 relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-tight">
          Get in <span className="gradient-text">Touch With Us</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Have questions about internships or certificate issuances? Reach out to our campus office directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Contact details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Box */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 shadow-lg text-left">
            <h3 className="text-sm font-bold text-[var(--text-dark)]">Campus Headquarters</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start text-xs text-slate-400">
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-[var(--text-dark)]">Office Address</span>
                  <span className="block text-[11px] mt-1 leading-relaxed">
                    SLOG, 1st Floor, Institution of Engineers Building, Near ISBT, Dehradun, Uttarakhand, 248001
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-400">
                <Mail className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-[var(--text-dark)]">Email Addresses</span>
                  <span className="block text-[11px] mt-1">info@slogsolutions.com</span>
                  <span className="block text-[11px]">slog.doon@gmail.com</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs text-slate-400">
                <Clock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-[var(--text-dark)]">Working Hours</span>
                  <span className="block text-[11px] mt-1">Monday – Saturday: 10:00 AM – 07:30 PM</span>
                  <span className="block text-[11px] text-rose-400">Sunday Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Helpline Cards */}
          <div className="space-y-3">
            {helplineGroups.map((g, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 flex gap-3.5 items-start text-left shadow"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-dark)]">{g.title}</h4>
                  <div className="text-xs font-semibold text-emerald-500 space-x-2">
                    <a href={`tel:${g.phone1.replace(/[^0-9]/g, '')}`} className="hover:underline">{g.phone1}</a>
                    <span>·</span>
                    <a href={`tel:${g.phone2.replace(/[^0-9]/g, '')}`} className="hover:underline">{g.phone2}</a>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Embedded Form */}
        <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 shadow-lg text-left space-y-6">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h3 className="text-base font-bold text-[var(--text-dark)]">Quick Message Form</h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Write to us for scholarship limits or custom branch syllabus packs.</p>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Thank you! Your enquiry has been submitted. An advisor will reach you shortly.</span>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {submitError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Candidate Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="form-input-custom"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="form-input-custom"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="form-input-custom"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Target Course Topic</label>
                <input
                  type="text"
                  name="courseInterested"
                  value={formData.courseInterested}
                  onChange={handleInputChange}
                  placeholder="e.g. Python Machine Learning"
                  className="form-input-custom"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Write your query details here..."
                rows="4"
                className="form-input-custom w-full resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary justify-center py-3 text-xs"
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send Message
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Google Map Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-2 shadow-lg overflow-hidden h-96 w-full relative z-10">
        <iframe
          title="SLOG Solutions Google Map Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.3966461794166!2d78.0063470151214!3d30.311233681785946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092b96d24fbc93%3A0xd3421d04d411bbdb!2sSLOG%20SOLUTIONS%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1581164240556!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-xl"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactUs;
