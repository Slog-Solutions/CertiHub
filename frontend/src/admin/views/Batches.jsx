import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Loader, AlertCircle, CheckCircle2, BookOpen, X, Edit2, Trash2, Eye, Users, User, FileText, Link2, Bell, Key, Calendar } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';
import ActionsDropdown from '../components/ActionsDropdown';

const Batches = () => {
  const { api } = useAuth();
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchId: '',
    name: '',
    uniqueKey: '',
    teachers: [{ teacherId: '', role: 'Lead Instructor' }]
  });

  // Batch Detail Viewer State
  const [viewingBatch, setViewingBatch] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/batches');
      setBatches(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error('Failed to retrieve teachers:', err.message);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBatch(null);
    setFormData({
      batchId: '',
      name: '',
      uniqueKey: '',
      teachers: [{ teacherId: teachers[0]?._id || '', role: 'Lead Instructor' }]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (batch) => {
    setEditingBatch(batch);
    let initialTeachers = [];
    if (Array.isArray(batch.teachers) && batch.teachers.length > 0) {
      initialTeachers = batch.teachers.map(t => ({
        teacherId: t.teacherId?._id || t.teacherId || '',
        role: t.role || 'Instructor'
      }));
    } else if (batch.teacherId) {
      initialTeachers = [{
        teacherId: batch.teacherId?._id || batch.teacherId || '',
        role: 'Lead Instructor'
      }];
    } else {
      initialTeachers = [{ teacherId: teachers[0]?._id || '', role: 'Lead Instructor' }];
    }

    setFormData({
      batchId: batch.batchId,
      name: batch.name,
      uniqueKey: batch.uniqueKey,
      teachers: initialTeachers
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddTeacherRow = () => {
    const defaultTeacherId = teachers[0]?._id || '';
    setFormData(prev => ({
      ...prev,
      teachers: [...prev.teachers, { teacherId: defaultTeacherId, role: 'Instructor' }]
    }));
  };

  const handleRemoveTeacherRow = (index) => {
    if (formData.teachers.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      teachers: prev.teachers.filter((_, i) => i !== index)
    }));
  };

  const handleTeacherChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.teachers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teachers: updated };
    });
  };

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setMessage('');
    setSubmitting(true);

    if (!formData.batchId || !formData.name || !formData.uniqueKey) {
      setFormError('Batch ID, Name, and Passcode are required.');
      setSubmitting(false);
      return;
    }

    const hasInvalidTeacher = formData.teachers.some(t => !t.teacherId || !t.role.trim());
    if (hasInvalidTeacher) {
      setFormError('Please select a teacher and specify their role for all assigned teachers.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        uniqueKey: formData.uniqueKey,
        teachers: formData.teachers,
        teacherId: formData.teachers[0]?.teacherId || ''
      };

      if (editingBatch) {
        await api.put(`/batches/${editingBatch._id}`, payload);
        setMessage('Batch updated successfully');
      } else {
        await api.post('/batches', {
          ...payload,
          batchId: formData.batchId
        });
        setMessage('Batch created successfully');
      }
      setIsModalOpen(false);
      fetchBatches();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save batch details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to permanently delete this batch? All curriculum resources and enrolled students will be unlinked.')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/batches/${batchId}`);
      setMessage('Batch deleted successfully');
      fetchBatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete batch');
    }
  };

  const handleOpenDetail = (batch) => {
    setViewingBatch(batch);
    setIsDetailOpen(true);
  };

  // Filter batches locally by search string
  const filteredBatches = batches.filter(b => {
    const s = search.toLowerCase();
    return (
      b.batchId.toLowerCase().includes(s) ||
      b.name.toLowerCase().includes(s) ||
      b.teacherId?.name?.toLowerCase().includes(s)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)] flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-500" />
            Class Batches Management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Configure student learn groups, assign instructional teachers, and audit resources.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          Create Batch
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by ID, name, teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 py-1.5 pl-9 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Loading batch registers...</span>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No batches found</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Create a new batch, define a key, and assign a teacher user.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  <th className="py-4 px-6">Batch ID</th>
                  <th className="py-4 px-6">Batch Name</th>
                  <th className="py-4 px-6">Access Key</th>
                  <th className="py-4 px-6">Teacher Assigned</th>
                  <th className="py-4 px-6">Enrolled Students</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {filteredBatches.map((item) => (
                  <tr key={item._id} className="text-xs hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                    <td className="py-4 px-6 font-mono font-bold text-[var(--text-dark)]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{item.batchId}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                    <td className="py-4 px-6 font-mono text-[var(--text-muted)]">{item.uniqueKey}</td>
                    <td className="py-4 px-6 font-medium text-[var(--text-dark)]">
                      {item.teachers && item.teachers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {item.teachers.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-[var(--text-dark)]">{t.teacherId?.name || 'Teacher'}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{t.role || 'Instructor'}</span>
                            </div>
                          ))}
                        </div>
                      ) : item.teacherId ? (
                        <div>
                          <p className="font-semibold">{item.teacherId.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{item.teacherId.email}</p>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[var(--text-dark)]">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item.students?.length || 0} students
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-muted)]">{formatDate(item.createdAt)}</td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-[var(--border-color)]/60 hover:bg-emerald-500/5 text-[var(--text-muted)] hover:text-emerald-500"
                        title="Audit Batch Info"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-[var(--border-color)]/60 hover:bg-blue-500/5 text-[var(--text-muted)] hover:text-blue-500"
                        title="Modify Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(item._id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-[var(--border-color)]/60 hover:bg-rose-500/5 text-[var(--text-muted)] hover:text-rose-500"
                        title="Delete Batch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                {editingBatch ? 'Edit Batch Configuration' : 'Create Student Batch'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Batch ID / Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingBatch}
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] disabled:opacity-60 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. BATCH-REACT-A"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Batch Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. React Front-End Basics"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Unique Join Passcode (Key)</label>
                <input
                  type="text"
                  required
                  value={formData.uniqueKey}
                  onChange={(e) => setFormData({ ...formData, uniqueKey: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. reactrules123"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Assigned Teachers & Roles
                  </label>
                  {teachers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddTeacherRow}
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-md transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Teacher
                    </button>
                  )}
                </div>

                {teachers.length === 0 ? (
                  <p className="text-[10px] text-rose-400 font-bold py-1">Please create a user with role 'Teacher' first in Users panel.</p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {formData.teachers.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[var(--bg-cream)]/50 border border-[var(--border-color)] p-2.5 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">Teacher</label>
                          <select
                            value={t.teacherId}
                            onChange={(e) => handleTeacherChange(idx, 'teacherId', e.target.value)}
                            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                          >
                            {teachers.map(teacher => (
                              <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.username})</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">Role of Teacher</label>
                          <input
                            type="text"
                            required
                            value={t.role}
                            onChange={(e) => handleTeacherChange(idx, 'role', e.target.value)}
                            placeholder="e.g. Lead Instructor, Lab Assistant"
                            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        {formData.teachers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTeacherRow(idx)}
                            className="mt-4 p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove Teacher"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || teachers.length === 0}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-lg text-xs font-bold"
                >
                  {submitting ? 'Saving...' : editingBatch ? 'Save Changes' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT DETAIL SIDEBAR/MODAL */}
      {isDetailOpen && viewingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[var(--bg-cream)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border-l border-[var(--border-color)] h-full w-full max-w-2xl shadow-2xl relative flex flex-col">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)] z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold border border-emerald-500/20">{viewingBatch.batchId}</span>
              <h3 className="text-base font-extrabold text-[var(--text-dark)] mt-1">{viewingBatch.name}</h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                <Key className="h-3 w-3" /> Passcode: <strong>{viewingBatch.uniqueKey}</strong>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Teacher Info Card */}
              <div className="bg-[var(--bg-cream)]/40 border border-[var(--border-color)]/60 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <User className="h-4 w-4 text-emerald-500" />
                  Assigned Teachers & Roles
                </h4>
                {viewingBatch.teachers && viewingBatch.teachers.length > 0 ? (
                  <div className="space-y-2">
                    {viewingBatch.teachers.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)]/40 p-2.5 rounded-lg text-xs">
                        <div>
                          <p className="font-bold text-[var(--text-dark)]">{t.teacherId?.name || 'Teacher'}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{t.teacherId?.email}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {t.role || 'Instructor'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : viewingBatch.teacherId ? (
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-[var(--text-dark)]">{viewingBatch.teacherId.name}</p>
                    <p className="text-[var(--text-muted)]">Username: {viewingBatch.teacherId.username}</p>
                    <p className="text-[var(--text-muted)]">Email: {viewingBatch.teacherId.email}</p>
                  </div>
                ) : (
                  <p className="text-xs text-rose-500 font-bold">Unassigned</p>
                )}
              </div>

              {/* Joined Students Catalog */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Enrolled Students Register ({viewingBatch.students?.length || 0})
                </h4>
                {(!viewingBatch.students || viewingBatch.students.length === 0) ? (
                  <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-cream)]/10 border border-dashed border-[var(--border-color)]/30 rounded-xl p-4 text-center">No students have enrolled in this batch yet.</p>
                ) : (
                  <div className="border border-[var(--border-color)]/60 rounded-xl overflow-hidden text-xs bg-[var(--bg-card)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border-color)]/30 text-[10px] text-[var(--text-muted)] uppercase bg-[var(--bg-cream)]/20">
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]/30">
                        {viewingBatch.students.map(std => (
                          <tr key={std._id}>
                            <td className="py-2.5 px-4 font-semibold text-[var(--text-dark)]">{std.name}</td>
                            <td className="py-2.5 px-4 text-[var(--text-dark)]">{std.email}</td>
                            <td className="py-2.5 px-4 text-[var(--text-muted)] font-mono">{std.mobile || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Resource Audit counts */}
              <div className="grid grid-cols-3 gap-4">
                <AuditPill title="Announcements" count={viewingBatch.notifications?.length || 0} icon={Bell} />
                <AuditPill title="Study PDFs" count={viewingBatch.pdfs?.length || 0} icon={FileText} />
                <AuditPill title="Useful Links" count={viewingBatch.links?.length || 0} icon={Link2} />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-color)] flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)]/60 border border-[var(--border-color)] text-xs font-bold rounded-lg"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AuditPill = ({ title, count, icon: Icon }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/40 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
    <Icon className="h-5 w-5 text-[var(--text-muted)] opacity-60 mb-1" />
    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{title}</span>
    <span className="text-sm font-extrabold text-[var(--text-dark)] mt-0.5">{count}</span>
  </div>
);

export default Batches;
