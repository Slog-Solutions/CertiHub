import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Plus, Pencil, Trash2, Loader, CheckCircle, X,
  Search, IndianRupee, Clock, BookMarked, FolderPlus, Upload, Image as ImageIcon,
  CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const ManageCourses = () => {
  const { api } = useAuth();
  
  // Lists
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Category Manager Modal / Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState(false);

  // Course Modal control
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null = add mode
  const [form, setForm] = useState({
    name: '',
    description: '',
    fees: '',
    duration: '',
    categoryId: '',
    isActive: true,
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete control
  const [deletingId, setDeletingId] = useState(null);

  /* ── Fetch Categories ── */
  const fetchCategories = async () => {
    try {
      const res = await api.get('/custom-courses/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  /* ── Fetch Courses ── */
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/custom-courses', {
        params: { 
          category: selectedCategoryFilter || undefined, 
          search: search || undefined 
        }
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryFilter, api]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  /* ── Add Category Handler ── */
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoryError('');
    setCategorySuccess(false);

    try {
      await api.post('/custom-courses/categories', { name: newCategoryName });
      setCategorySuccess(true);
      setNewCategoryName('');
      fetchCategories();
      setTimeout(() => setCategorySuccess(false), 1500);
    } catch (err) {
      setCategoryError(err.response?.data?.error || 'Failed to add category');
    }
  };

  /* ── Delete Category Handler ── */
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Any associated courses will prevent deletion.')) return;
    setCategoryError('');
    try {
      await api.delete(`/custom-courses/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete category');
    }
  };

  /* ── Open Edit/Add Modal ── */
  const openAdd = () => {
    setEditingCourse(null);
    setForm({
      name: '',
      description: '',
      fees: '',
      duration: '',
      categoryId: categories[0]?._id || '',
      isActive: true,
      imageFile: null
    });
    setImagePreview('');
    setSaveError('');
    setSaveSuccess(false);
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setForm({
      name: course.name || '',
      description: course.description || '',
      fees: course.fees || '',
      duration: course.duration || '',
      categoryId: course.category?._id || '',
      isActive: course.isActive !== false,
      imageFile: null
    });
    setImagePreview(course.image || '');
    setSaveError('');
    setSaveSuccess(false);
    setShowModal(true);
  };

  /* ── Image Change Handler ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* ── Save Course Handler ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    if (!form.name.trim()) {
      setSaveError('Course name is required.');
      setSaving(false);
      return;
    }
    if (!form.categoryId) {
      setSaveError('Please select or create a Category first.');
      setSaving(false);
      return;
    }

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('fees', form.fees);
    fd.append('duration', form.duration);
    fd.append('categoryId', form.categoryId);
    fd.append('isActive', form.isActive);
    if (form.imageFile) {
      fd.append('image', form.imageFile);
    }

    try {
      if (editingCourse) {
        await api.put(`/custom-courses/${editingCourse._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/custom-courses', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setSaveSuccess(true);
      fetchCourses();
      setTimeout(() => {
        setShowModal(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete Course Handler ── */
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course posting? This action is permanent.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/custom-courses/${id}`);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  // Helper Stats
  const activeCount = courses.filter(c => c.isActive).length;
  const draftCount = courses.length - activeCount;

  return (
    <div className="space-y-6">
      {/* ── HEADER ACTION ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f172a] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" /> Manage Catalog Courses
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Build categories and publish catalog cards directly to the homepage /courses portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FolderPlus className="h-3.5 w-3.5 text-slate-500" /> Manage Categories
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Publish Course
          </button>
        </div>
      </div>

      {/* ── QUICK STATS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', val: courses.length, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100' },
          { label: 'Active on Web', val: activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
          { label: 'Draft State', val: draftCount, color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.border} ${s.bg} flex items-center justify-between`}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
            <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* ── FILTER & SEARCH STRIP ── */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search custom courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-300 focus:bg-white rounded-lg text-xs outline-none transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Category Filter:
          </label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-slate-700 min-w-[160px] focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── COURSE LISTING GRID ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-slate-700">No courses published yet</p>
            <p className="text-[10px] opacity-70 mt-0.5">Click "Publish Course" to add custom courses to your catalog.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow transition-all group relative">
              {/* Course Image Preview */}
              <div className="h-44 w-full bg-slate-50 border-b border-slate-100 relative flex items-center justify-center overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.name}
                    className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1.5">
                    <ImageIcon className="h-7 w-7 opacity-50" />
                    <span className="text-[9px] uppercase tracking-wider font-bold">No Image Provided</span>
                  </div>
                )}
                {/* Active/Draft badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${course.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {course.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Course Details Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                    {course.category?.name || 'General Category'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">{course.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 min-h-[4.5em] leading-relaxed">
                    {course.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3.5 mt-3.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold">{course.duration || 'Flexible'}</span>
                  </div>
                  <div className="font-bold text-slate-800 flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3 text-slate-500" />
                    <span>{course.fees || 'TBD'}</span>
                  </div>
                </div>

                {/* Operations Buttons */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-3.5">
                  <button
                    onClick={() => openEdit(course)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Pencil className="h-3 w-3" /> Edit Course
                  </button>
                  <button
                    disabled={deletingId === course._id}
                    onClick={() => handleDeleteCourse(course._id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                    title="Delete Course"
                  >
                    {deletingId === course._id ? (
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CATEGORY MANAGEMENT MODAL ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-emerald-600" /> Manage Categories
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Category creation form */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category (e.g. Mechanical)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-300 w-full text-slate-800"
                />
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                  Add
                </button>
              </form>

              {categoryError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-600">
                  {categoryError}
                </div>
              )}
              {categorySuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 animate-bounce" /> Category added successfully!
                </div>
              )}

              {/* Category List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-slate-50/50">
                {categories.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-8">No categories created yet.</p>
                ) : (
                  <table className="w-full border-collapse">
                    <tbody>
                      {categories.map((cat, i) => (
                        <tr
                          key={cat._id}
                          className={`border-b border-slate-100 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                        >
                          <td className="p-3 font-semibold text-slate-700">{cat.name}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="text-rose-500 hover:text-rose-600 p-1 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSE ADD/EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                {editingCourse ? 'Edit Catalog Course' : 'Publish New Course'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {saveSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Course {editingCourse ? 'updated' : 'published'} successfully!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  {saveError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-600">
                      {saveError}
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Category *
                    </label>
                    <select
                      required
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-slate-700 bg-slate-50 focus:bg-white focus:border-slate-300 transition-all cursor-pointer"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Course Image
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Image Preview Block */}
                      <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon className="h-6 w-6 opacity-40" />
                        )}
                      </div>
                      <label className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="h-3.5 w-3.5 text-slate-500" /> Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Course Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Course Name (Text Input) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Advanced AutoCAD & 3D Drafting"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-300 text-slate-800"
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Description Syllabus (Text Input)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Overview of the syllabus or topics covered..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-300 text-slate-800 min-h-[80px]"
                    />
                  </div>

                  {/* Fees Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Course Fees (Text Input)
                    </label>
                    <input
                      type="text"
                      value={form.fees}
                      onChange={(e) => setForm({ ...form, fees: e.target.value })}
                      placeholder="e.g. INR 12,500 or TBD"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-300 text-slate-800"
                    />
                  </div>

                  {/* Duration Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Duration (Text Input)
                    </label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 6 Weeks or 40 Hours"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-300 text-slate-800"
                    />
                  </div>

                  {/* Active status Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold">
                      {form.isActive ? 'Publish directly to web frontend' : 'Save draft (hidden from web)'}
                    </span>
                  </label>

                  {/* Save buttons */}
                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5"
                    >
                      {saving && <Loader className="h-3.5 w-3.5 animate-spin" />}
                      Save Course
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
