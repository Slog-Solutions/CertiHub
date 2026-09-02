import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2, Send, Loader, CheckCircle2, AlertCircle, Calendar, GraduationCap, BookOpen, X, Info } from 'lucide-react';

const Notifications = () => {
  const { api } = useAuth();

  // Lists
  const [notices, setNotices] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetCollegeId, setTargetCollegeId] = useState('');
  const [targetCourseDetailId, setTargetCourseDetailId] = useState('');

  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/notifications');
      setNotices(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notice logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const clgRes = await api.get('/masters/college', { params: { limit: 100, isActive: 'true' } });
      const crsRes = await api.get('/masters/coursedetail', { params: { limit: 100, isActive: 'true' } });
      setColleges(clgRes.data.data);
      setCourses(crsRes.data.data);
    } catch (err) {
      console.error('Failed to load filters:', err.message);
    }
  };

  useEffect(() => {
    fetchNotices();
    fetchDropdowns();
  }, []);

  const handleOpenForm = () => {
    setTitle('');
    setMessage('');
    setTargetCollegeId('');
    setTargetCourseDetailId('');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!title.trim() || !message.trim() || !targetCollegeId || !targetCourseDetailId) {
      setError('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/notifications', {
        title: title.trim(),
        message: message.trim(),
        collegeId: targetCollegeId,
        courseDetailId: targetCourseDetailId
      });
      setNotices([res.data, ...notices]);
      setSuccess('Notice created and dispatched successfully!');
      setIsFormOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this notice?')) return;
    try {
      setError('');
      setSuccess('');
      await api.delete(`/notifications/${id}`);
      setNotices(notices.filter(n => n._id !== id));
      setSuccess('Notice deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete notice.');
    }
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)] flex items-center gap-2">
            <Bell className="h-5.5 w-5.5 text-emerald-500" />
            Candidate Notifications
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Dispatch announcements and notices targeted to active candidates of specific colleges and courses.
          </p>
        </div>

        <button
          onClick={handleOpenForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Send Notice
        </button>
      </div>

      {/* Info Status Banners */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-[var(--text-muted)] flex gap-2.5 items-start">
        <Info className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">Candidate App Integration Notice</span>
          <p className="leading-relaxed">
            Notices dispatched here are filtered and targeted by college and course. The candidate app can query active notices using the candidate's registered college and course detail. Only candidates whose registration status is <strong>Active (On)</strong> will fetch these notices.
          </p>
        </div>
      </div>

      {/* Sent Notices List */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)]">
          <h3 className="text-xs font-bold text-[var(--text-dark)] uppercase tracking-wider">Notice Dispatch History</h3>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Loading notice board...</span>
          </div>
        ) : notices.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <Bell className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No notices sent yet</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Click "Send Notice" to dispatch announcements to candidates.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]/60">
            {notices.map((notice) => (
              <div key={notice._id} className="p-6 hover:bg-[var(--bg-cream)]/10 transition-colors duration-150 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-wider rounded-md flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {notice.collegeId?.collegeName || 'All Colleges'}
                    </span>
                    <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 font-bold text-[9px] uppercase tracking-wider rounded-md flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {notice.courseDetailId?.technologyId?.name || 'All Courses'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[var(--text-dark)]">{notice.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{notice.message}</p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-medium">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(notice.createdAt).toLocaleString()}
                    </span>
                    <span>
                      Dispatched by: <strong className="text-[var(--text-dark)]">{notice.sentBy?.name || notice.sentBy?.username || 'System'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg border border-transparent hover:border-rose-500/20 transition"
                    title="Delete Notice Log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISPATCH FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-scale-up">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)] z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <Send className="h-4.5 w-4.5 text-emerald-500" />
                Dispatch New Candidate Announcement
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Target College</label>
                  <select
                    required
                    value={targetCollegeId}
                    onChange={(e) => setTargetCollegeId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Select College --</option>
                    {colleges.map(c => (
                      <option key={c._id} value={c._id}>{c.collegeName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Target Course</label>
                  <select
                    required
                    value={targetCourseDetailId}
                    onChange={(e) => setTargetCourseDetailId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.technologyId?.name} - {c.durationId?.value} {c.durationId?.unit}(s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch Reschedule Announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notice Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the notice content to send to candidate app..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
                >
                  {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
