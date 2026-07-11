import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, CheckCircle2, AlertCircle, Loader, UserPlus, Info, Check, Calendar, ArrowRight } from 'lucide-react';

const PublicRegistration = () => {
  const [searchParams] = useSearchParams();
  const linkId = searchParams.get('linkId');

  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    email: '',
    phone: '',
    nationality: 'Indian',
    address: '',
    workingStatus: 'student',
    branchId: '',
    year: '1st Year',
    state: '',
    city: '',
    trainingType: 'Summer Training'
  });

  const [feeChoice, setFeeChoice] = useState('full'); // full or reservation
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLinkDetails = async () => {
      if (!linkId) {
        setError('Missing course registration link identifier. Please verify the URL.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/api/registration/links/public/${linkId}`);
        setLinkData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or inactive registration link.');
      } finally {
        setLoading(false);
      }
    };
    fetchLinkDetails();
  }, [linkId]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('/api/masters/branch/public');
        setBranches(res.data || []);
      } catch (err) {
        console.error('Failed to load branch list:', err.message);
      }
    };
    fetchBranches();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }

    if (!linkData) return;

    // Build form payload matching Student.js schema
    const payload = new FormData();
    payload.append('linkId', linkId);
    payload.append('name', formData.name);
    payload.append('fatherName', formData.fatherName);
    payload.append('dob', formData.dob);
    payload.append('gender', formData.gender);
    payload.append('email', formData.email);
    payload.append('phone', formData.phone);
    payload.append('nationality', formData.nationality);
    payload.append('address', formData.address);
    payload.append('workingStatus', formData.workingStatus);
    payload.append('branchId', formData.branchId);
    payload.append('year', formData.year);
    payload.append('state', formData.state || linkData.collegeId?.cityName || '');
    payload.append('city', formData.city || linkData.collegeId?.cityName || '');
    
    // collegeId, courseDetailId, durationId, location and totalFee/amountSubmitted are
    // intentionally NOT trusted from the client for a link-based public submission — the
    // backend re-derives all of these from the GeneratedCourseLink identified by linkId.
    // We still send feeChoice so the backend knows which payment option the student picked.
    payload.append('trainingType', formData.trainingType);
    payload.append('startDate', new Date().toISOString().substring(0, 10)); // Default to today
    payload.append('feeChoice', feeChoice); // 'full' or 'booking'

    if (photoFile) {
      payload.append('photo', photoFile);
    }

    try {
      const res = await axios.post('/api/registration/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-xs text-[var(--text-muted)]">Loading registration catalog...</span>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300 px-4">
        <div className="w-full max-w-lg bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Glowing back lights */}
          <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 relative z-10 animate-bounce">
            <Check className="h-8 w-8" />
          </div>

          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-bold text-[var(--text-dark)]">Enrollment Submission Confirmed!</h3>
            <p className="text-xs text-[var(--text-muted)]">Your profile has been saved to the portal registry.</p>
          </div>

          {/* Registration Code box */}
          <div className="p-4 bg-[var(--bg-cream)] border-[var(--border-color)] border border-[var(--border-color)] rounded-xl relative z-10">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Your Registration Number</span>
            <span className="text-lg font-mono font-bold text-emerald-400 block mt-1 select-all">{successData.registrationNo}</span>
            <p className="text-[9px] text-[var(--text-muted)] mt-2">Please copy and save this ID for payment logging reference.</p>
          </div>

          {/* Student Profile summary */}
          <div className="text-left bg-[var(--bg-card)] transition-colors duration-300/40 p-4 border border-[var(--border-color)]/40 rounded-xl space-y-2.5 text-xs text-[var(--text-dark)]">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Name</span><span className="font-semibold text-[var(--text-dark)]">{successData.student.name}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Selected Course</span><span className="font-semibold text-[var(--text-dark)]">{linkData.courseDetailId?.technologyId?.name}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Campus Location</span><span className="text-[var(--text-dark)]">{linkData.location}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Registration Fee Paid</span><span className="font-mono text-emerald-400 font-bold">{feeChoice === 'free' ? 'INR 0 (Free Training)' : feeChoice === 'full' ? `INR ${linkData.price}` : 'INR 1,000 (Booking fee)'}</span></div>
          </div>

          <div className="pt-2 relative z-10">
            <p className="text-[10px] text-[var(--text-muted)]">Confirmation email containing credentials summary sent to: <span className="font-semibold text-[var(--text-dark)]">{formData.email}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300 px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Banner header */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[var(--text-dark)] text-center">Student Registration Portal</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Submit details to request training certification access</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Register Form card */}
        {!error && linkData && (
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
            {/* Locked details banner */}
            <div className="p-6 bg-[var(--bg-cream)] border-[var(--border-color)] border-b border-[var(--border-color)] flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-dark)] uppercase tracking-wider">LOCKED COURSE PROFILE</h4>
                <div className="text-[11px] text-[var(--text-muted)] flex flex-wrap gap-x-4 gap-y-1 mt-1 font-medium">
                  <span>Course: <strong className="text-[var(--text-dark)]">{linkData.courseDetailId?.technologyId?.name}</strong></span>
                  <span>Duration: <strong className="text-[var(--text-dark)]">{linkData.courseDetailId?.durationId?.value} {linkData.courseDetailId?.durationId?.unit}(s)</strong></span>
                  <span>College: <strong className="text-[var(--text-dark)]">{linkData.collegeId?.collegeName}</strong></span>
                  <span>Location: <strong className="text-[var(--text-dark)]">{linkData.location}</strong></span>
                  <span>Price: <strong className="text-emerald-400">INR {linkData.price}</strong></span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              
              {/* Form Section 1 */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)] pb-1.5">
                  1. Candidate Personal Details
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      placeholder="Candidate full name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Father's Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      placeholder="Father's full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      placeholder="9999999999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Permanent Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      placeholder="Street, house no, state, pincode"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Passport Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                      className="w-full text-[var(--text-muted)] text-[10px] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-[var(--bg-cream)] file:text-emerald-400 hover:file:bg-[var(--bg-cream)]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 2 */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)] pb-1.5">
                  2. Student Institution Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Working Status</label>
                    <select
                      value={formData.workingStatus}
                      onChange={(e) => setFormData({ ...formData, workingStatus: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="working">Working Professional</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Branch / Department</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select Branch</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Year of Study</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                      <option value="N/A">Not Applicable</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Training Term</label>
                    <select
                      value={formData.trainingType}
                      onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-[var(--bg-cream)] transition-colors duration-300 p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Summer Training">Summer Training</option>
                      <option value="Winter Training">Winter Training</option>
                      <option value="Industrial Training">Industrial Training</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Section 3 */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)] pb-1.5">
                  3. Select Payment Term
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Full payment option card */}
                  <label className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition ${
                    feeChoice === 'full' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-[var(--border-color)] bg-[var(--bg-cream)] transition-colors duration-300 hover:bg-[var(--bg-card)] transition-colors duration-300/40'
                  }`}>
                    <input
                      type="radio"
                      name="feeChoice"
                      value="full"
                      checked={feeChoice === 'full'}
                      onChange={() => setFeeChoice('full')}
                      className="mt-1 h-3.5 w-3.5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--text-dark)] block">Submit Full Tuition Fee</span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Pay the entire fee: <strong className="text-emerald-400">INR {linkData.price}</strong>.</span>
                    </div>
                  </label>

                  {/* Booking reservation payment option card */}
                  <label className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition ${
                    feeChoice === 'booking' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-[var(--border-color)] bg-[var(--bg-cream)] transition-colors duration-300 hover:bg-[var(--bg-card)] transition-colors duration-300/40'
                  }`}>
                    <input
                      type="radio"
                      name="feeChoice"
                      value="booking"
                      checked={feeChoice === 'booking'}
                      onChange={() => setFeeChoice('booking')}
                      className="mt-1 h-3.5 w-3.5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--text-dark)] block">Submit Booking Fee</span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Pay reservation deposit: <strong className="text-emerald-400">INR 1,000</strong>. Remaining balance due on start.</span>
                    </div>
                  </label>

                  {/* Free / Zero Fee training option card */}
                  <label className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition ${
                    feeChoice === 'free' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-[var(--border-color)] bg-[var(--bg-cream)] transition-colors duration-300 hover:bg-[var(--bg-card)] transition-colors duration-300/40'
                  }`}>
                    <input
                      type="radio"
                      name="feeChoice"
                      value="free"
                      checked={feeChoice === 'free'}
                      onChange={() => setFeeChoice('free')}
                      className="mt-1 h-3.5 w-3.5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--text-dark)] block">Free / Zero Fee Option</span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Register for free training: <strong className="text-emerald-400">INR 0</strong>. No tuition payment required.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-850 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRegistration;
