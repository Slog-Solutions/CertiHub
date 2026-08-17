import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, CreditCard, Award, ArrowRight, Loader, CheckCircle, X } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/masters/coursedetail/public');
        setCourses(res.data || []);
      } catch (err) {
        console.error('Failed to load courses:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const openEnquiry = (courseName) => {
    setSelectedCourseName(courseName);
    setSubmitSuccess(false);
    setSubmitError('');
    setShowEnquiryModal(true);
  };

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
      await axios.post('/api/enquiry/public', {
        ...formData,
        courseInterested: selectedCourseName
      });
      setSubmitSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => {
        setShowEnquiryModal(false);
      }, 2500);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Enquiry submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses by technology name search
  const filteredCourses = courses.filter((c) => {
    const name = c.technologyId?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 space-y-12 py-12 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Title Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-tight">
          Browse Our <span className="gradient-text">Training Courses</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Expose yourself to expert hands-on mentoring. Choose from coding, mechanical layout packages, civil structural suites, or digital marketing.
        </p>
      </div>

      {/* Toolbar Search Row */}
      <div className="flex justify-center">
        <div className="search-bar w-full max-w-md">
          <Search className="search-icon h-4 w-4" />
          <input
            type="text"
            placeholder="Search training technologies (e.g. Python, AutoCAD)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Dynamic Courses Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-xs text-[var(--text-muted)]">Loading training catalogs...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8">
          <p className="text-xs text-[var(--text-muted)]">No matching training programs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="card-custom p-6 space-y-5 text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  Technology Track
                </div>
                <h3 className="text-lg font-black text-[var(--text-dark)] tracking-tight">
                  {course.technologyId?.name}
                </h3>
                {course.technologyId?.note && (
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {course.technologyId.note}
                  </p>
                )}
                
                <div className="space-y-2 pt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span>Duration: {course.durationId?.value} {course.durationId?.unit}(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-[var(--text-dark)]">Base Tuition: INR {course.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <span>Double Certification Included</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => openEnquiry(course.technologyId?.name)}
                  className="w-full btn-primary justify-center py-2 text-xs"
                >
                  Enquire & Apply
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md p-6 text-left space-y-4 relative">
            <button
              onClick={() => setShowEnquiryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-[var(--border-color)] pb-2">
              <h3 className="text-sm font-bold text-[var(--text-dark)] uppercase">Apply / Request details</h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Course: <strong className="text-emerald-500">{selectedCourseName}</strong></p>
            </div>

            {submitSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-dark)]">Enquiry Confirmed!</h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">Our academic coach will call you back shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
                    {submitError}
                  </div>
                )}

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
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mobile Number</label>
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

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address (Optional)</label>
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
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write any batch timing request details..."
                    rows="2"
                    className="form-input-custom resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary justify-center py-2.5 text-xs"
                  >
                    {isSubmitting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Confirm Request
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
