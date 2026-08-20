import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Plus, Pencil, Trash2, Loader, CheckCircle, X,
  Search, DollarSign, Clock, BookMarked, Eye, EyeOff
} from 'lucide-react';

const ManageCourses = () => {
  const { api } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dropdown options
  const [technologies, setTechnologies] = useState([]);
  const [durations, setDurations] = useState([]);

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null = add mode
  const [form, setForm] = useState({
    technologyId: '',
    durationId: '',
    price: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete control
  const [deletingId, setDeletingId] = useState(null);

  /* ── Fetch Course Details ── */
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/masters/coursedetail', {
        params: { search, limit: 100 }
      });
      const data = res.data?.data || [];
      const seenTechNames = new Map();
      data.forEach((item) => {
        const techName = item.technologyId?.name || '';
        if (techName && !seenTechNames.has(techName)) {
          seenTechNames.set(techName, item);
        } else if (!techName) {
          // If unassigned tech track, keep it using id
          seenTechNames.set(item._id, item);
        }
      });
      const unique = Array.from(seenTechNames.values());
      const sorted = unique.sort((a, b) => {
        const nameA = (a.technologyId?.name || '').toLowerCase();
        const nameB = (b.technologyId?.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setCourses(sorted);
    } catch (err) {
      console.error('Failed to load courses:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, api]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  /* ── Fetch Dropdown References ── */
  const loadReferences = async () => {
    try {
      const [techRes, durRes] = await Promise.all([
        api.get('/masters/technology', { params: { limit: 150, isActive: 'true' } }),
        api.get('/masters/duration', { params: { limit: 150, isActive: 'true' } })
      ]);
      setTechnologies(techRes.data?.data || []);
      setDurations(durRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load dropdown options:', err.message);
    }
  };

  useEffect(() => {
    loadReferences();
  }, [api]);

  /* ── Modal Helpers ── */
  const openAdd = () => {
    setEditingCourse(null);
    setForm({
      technologyId: '',
      durationId: '',
      price: '',
      isActive: true,
    });
    setSaveError('');
    setSaveSuccess(false);
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setForm({
      technologyId: course.technologyId?._id || '',
      durationId: course.durationId?._id || '',
      price: course.price || '',
      isActive: course.isActive !== false,
    });
    setSaveError('');
    setSaveSuccess(false);
    setShowModal(true);
  };

  /* ── Save / Submit ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.technologyId || !form.durationId || !form.price) {
      setSaveError('All fields marked with * are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      if (editingCourse) {
        await api.put(`/masters/coursedetail/${editingCourse._id}`, form);
      } else {
        await api.post('/masters/coursedetail', form);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        fetchCourses();
      }, 1200);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save course detail.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/masters/coursedetail/${id}`);
      setDeletingId(null);
      fetchCourses();
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  /* ── Toggle Active ── */
  const handleToggleActive = async (course) => {
    try {
      await api.put(`/masters/coursedetail/${course._id}`, { isActive: !course.isActive });
      fetchCourses();
    } catch (err) {
      console.error('Toggle status failed:', err.message);
    }
  };

  return (
    <div className="flex-1 space-y-8 py-8 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-dark)] flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-500" />
            Manage <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Create, edit, and post learning courses directly to the Slog corporate frontend.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary gap-2 text-sm px-4 py-2 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* Searchbar */}
      <div className="search-bar w-full max-w-md">
        <Search className="search-icon h-4 w-4" />
        <input
          type="text"
          placeholder="Search by technology name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-xs text-[var(--text-muted)]">Loading course logs…</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8">
          <BookOpen className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[var(--text-dark)]">No courses found</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Click "Add Course" to post your first technology track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`card-custom p-5 flex flex-col gap-3 justify-between ${!course.isActive ? 'opacity-60' : ''}`}
            >
              <div className="space-y-3">
                {/* Header status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Posted Track
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    course.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {course.isActive ? 'Active on Web' : 'Inactive'}
                  </span>
                </div>

                {/* Technology Title */}
                <h3 className="text-lg font-black text-[var(--text-dark)] tracking-tight leading-tight">
                  {course.technologyId?.name || 'Unassigned Tech Track'}
                </h3>

                {/* Description snippet */}
                {course.technologyId?.note && (
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {course.technologyId.note}
                  </p>
                )}

                {/* Details list */}
                <div className="space-y-2 pt-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span>Duration: {course.durationId?.value} {course.durationId?.unit}(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-[var(--text-dark)]">Price: INR {course.price}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                <button
                  onClick={() => openEdit(course)}
                  className="flex-1 btn-secondary text-xs py-1.5 justify-center gap-1"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(course)}
                  title={course.isActive ? 'Deactivate and hide from web' : 'Activate and show on web'}
                  className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-400 transition-colors"
                >
                  {course.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                {deletingId === course._id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-lg font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-[10px] border border-[var(--border-color)] px-2 py-1 rounded-lg text-[var(--text-muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(course._id)}
                    className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md p-6 space-y-5 relative text-left">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Heading */}
            <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-[var(--text-dark)] uppercase">
                {editingCourse ? 'Modify Course Post' : 'Post New Course'}
              </h3>
            </div>

            {saveSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-[var(--text-dark)]">
                  Course details {editingCourse ? 'updated' : 'published'} successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {saveError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
                    {saveError}
                  </div>
                )}

                {/* Technology dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Select Technology *
                  </label>
                  <select
                    required
                    value={form.technologyId}
                    onChange={(e) => setForm({ ...form, technologyId: e.target.value })}
                    className="form-input-custom"
                  >
                    <option value="">-- Choose Technology --</option>
                    {technologies.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Select Duration *
                  </label>
                  <select
                    required
                    value={form.durationId}
                    onChange={(e) => setForm({ ...form, durationId: e.target.value })}
                    className="form-input-custom"
                  >
                    <option value="">-- Choose Duration --</option>
                    {durations.map((d) => (
                      <option key={d._id} value={d._id}>{d.value} {d.unit}(s)</option>
                    ))}
                  </select>
                </div>

                {/* Price Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Base Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 5000"
                    className="form-input-custom"
                  />
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {form.isActive ? 'Publish directly to web frontend' : 'Save draft (hidden from web)'}
                  </span>
                </label>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary justify-center py-2.5 text-xs"
                  >
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : editingCourse ? 'Save Changes' : 'Publish Course'}
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

export default ManageCourses;
