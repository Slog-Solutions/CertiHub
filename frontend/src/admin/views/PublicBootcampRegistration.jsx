import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  Copy, 
  Check, 
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

const PublicBootcampRegistration = () => {
  const [searchParams] = useSearchParams();
  const queryBatchId = searchParams.get('batchId') || searchParams.get('batch');

  const [loading, setLoading] = useState(true);
  const [batchData, setBatchData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    state: '',
    city: '',
    branch: '',
    year: '1st Year',
    technology: 'Full Stack Web Development'
  });

  useEffect(() => {
    const fetchBatchInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = queryBatchId 
          ? `/batches/public-bootcamp-info/${queryBatchId}`
          : `/batches/public-bootcamp-info`;
        const url = `${API_BASE_URL}${endpoint}`;
        const res = await axios.get(url);
        setBatchData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Active bootcamp batch not found or registration is closed.');
      } finally {
        setLoading(false);
      }
    };
    fetchBatchInfo();
  }, [queryBatchId]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/masters/branch/public`);
        setBranches(res.data || []);
      } catch (err) {
        console.error('Failed to load branches:', err.message);
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please provide mandatory details: Full Name and Email Address.');
      setIsSubmitting(false);
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        batchId: batchData?._id || queryBatchId,
        ...formData
      };
      const res = await axios.post(`${API_BASE_URL}/batches/public-bootcamp-register`, payload);
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Bootcamp registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!successData?.student) return;
    const text = `Slog Solutions Bootcamp Registration Details:\nBatch: ${successData.batch?.name}\nUsername: ${successData.student?.username}\nPassword: ${successData.student?.password}\nPortal URL: ${window.location.origin}/user`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm font-semibold text-[var(--text-dark)]">Loading Bootcamp Registration Portal...</p>
          <p className="text-xs text-[var(--text-muted)]">Fetching active course batch configuration...</p>
        </div>
      </div>
    );
  }

  if (successData) {
    const loginUrl = `${window.location.origin}/user`;
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300 px-4 py-12">
        <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300">
          
          {/* Top Decorative Glow */}
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-teal-500/15 blur-3xl" />

          <div className="flex flex-col items-center text-center space-y-3 relative z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/25 animate-bounce">
              <Check className="h-9 w-9 stroke-[3]" />
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Registration Successful 🎉
            </span>
            <h2 className="text-2xl font-black text-[var(--text-dark)]">You're Enrolled in Bootcamp!</h2>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              Your candidate profile has been generated and automatically enrolled into <strong className="text-emerald-500">{successData.batch?.name}</strong>.
            </p>
          </div>

          {/* Credentials Card */}
          <div className="bg-gradient-to-br from-[var(--bg-cream)] to-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 relative z-10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-dark)]">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>Your Portal Credentials</span>
              </div>
              <button
                onClick={copyCredentials}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-semibold transition"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]/60">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">Username / Student ID</span>
                <span className="font-mono font-bold text-sm text-[var(--text-dark)] block mt-1 select-all">
                  {successData.student?.username}
                </span>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]/60">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">Default Password</span>
                <span className="font-mono font-bold text-sm text-emerald-500 block mt-1 select-all">
                  {successData.student?.password}
                </span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-400">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                An email containing these login credentials & portal access link has been sent to <strong>{successData.student?.email}</strong>.
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 relative z-10">
            <a
              href="/user"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition group"
            >
              <span>Login to Candidate Portal</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <p className="text-[11px] text-center text-[var(--text-muted)] relative z-10">
            No manual approval required — your batch <strong>"{successData.batch?.name}"</strong> will appear immediately upon login!
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300 px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">

        {/* Dynamic Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Independence Day Special Bootcamp Batch</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)] tracking-tight">
            Candidate Registration Form
          </h1>
          
          {batchData && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-dark)] shadow-sm">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <span>Assigned Batch:</span>
              <strong className="text-emerald-500 font-bold">{batchData.name}</strong>
              <span className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--bg-cream)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                {batchData.batchId}
              </span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors duration-300">
          
          <div className="border-b border-[var(--border-color)] pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-dark)] flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                Student Enrollment Details
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Fill in your accurate candidate details to generate your portal ID and join the batch.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Instant Credential Email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                1. Personal Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Father's Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fatherName"
                      placeholder="e.g. Suresh Sharma"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. rahul@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Phone / Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 px-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic & Geographic Info */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                2. Academic & Location Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Branch / Department
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 px-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  >
                    <option value="">Select Branch</option>
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <option key={b._id} value={b.name}>{b.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Information Technology">IT</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Electrical Engineering">EE</option>
                        <option value="Mechanical Engineering">ME</option>
                        <option value="Civil Engineering">CE</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 px-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                    State / Region
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Uttarakhand"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 px-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-dark)] mb-1.5">
                  Permanent Address / City
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Dehradun, Uttarakhand"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 px-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Credentials & Enrolling...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Complete Registration & Generate ID</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-[var(--text-muted)]">
          Need assistance? Contact Slog Solutions Support Team or your designated batch instructor.
        </p>

      </div>
    </div>
  );
};

export default PublicBootcampRegistration;
