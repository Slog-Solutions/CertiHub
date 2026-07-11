import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Loader, AlertCircle, CheckCircle2, Link as LinkIcon, Copy, Check, X, ToggleLeft } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const CourseLinks = () => {
  const { api } = useAuth();
  
  // Lists
  const [links, setLinks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Checkbox Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Form references
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    courseDetailId: '',
    collegeId: '',
    price: '',
    location: '',
    isActive: true
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/registration/links', {
        params: { page, limit: 10 }
      });
      setLinks(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch course links');
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
      console.error('Failed to load dropdown references:', err.message);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page]);

  useEffect(() => {
    if (isModalOpen) {
      fetchDropdowns();
    }
  }, [isModalOpen]);

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setFormData({
      courseDetailId: '',
      collegeId: '',
      price: '',
      location: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link) => {
    setEditingLink(link);
    setFormData({
      courseDetailId: link.courseDetailId?._id || '',
      collegeId: link.collegeId?._id || '',
      price: link.price || '',
      location: link.location || '',
      isActive: link.isActive
    });
    setIsModalOpen(true);
  };

  // Pre-fill price when Course Detail changes
  const handleCourseChange = (id) => {
    const course = courses.find(c => c._id === id);
    if (course) {
      setFormData(prev => ({
        ...prev,
        courseDetailId: id,
        price: course.price || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        courseDetailId: '',
        price: ''
      }));
    }
  };

  const handleStatusToggle = async (link) => {
    try {
      setError('');
      setMessage('');
      const res = await api.put(`/registration/links/${link._id}`, {
        isActive: !link.isActive
      });
      setLinks(links.map(l => l._id === link._id ? { ...l, isActive: res.data.isActive } : l));
      setMessage('Link status updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this registration link?')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/registration/links/${id}`);
      setMessage('Link deleted successfully');
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete link');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.courseDetailId || !formData.collegeId || formData.price === '' || !formData.location) {
      setError('Please fill in all course link fields.');
      return;
    }

    try {
      if (editingLink) {
        await api.put(`/registration/links/${editingLink._id}`, formData);
        setMessage('Link updated successfully');
      } else {
        await api.post('/registration/links', formData);
        setMessage('Registration link generated successfully');
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    }
  };

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Checkbox handlers
  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(links.map(l => l._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkToggle = async (targetActive) => {
    if (selectedIds.length === 0) return;
    try {
      setError('');
      setMessage('');
      await api.post('/registration/links/bulk-toggle', {
        ids: selectedIds,
        isActive: targetActive
      });
      setMessage(`Successfully updated status for ${selectedIds.length} link(s)`);
      setSelectedIds([]);
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update selection');
    }
  };

  const exportColumns = [
    { header: 'Course', accessor: l => l.courseDetailId?.technologyId?.name },
    { header: 'Location', accessor: l => l.location },
    { header: 'Duration', accessor: l => l.courseDetailId?.durationId ? `${l.courseDetailId.durationId.value} ${l.courseDetailId.durationId.unit}` : '' },
    { header: 'Price Override', accessor: l => l.price },
    { header: 'Generated Link URL', accessor: l => l.generatedUrl },
    { header: 'Status', accessor: l => l.isActive ? 'Active' : 'Inactive' }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Generate Course</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Generate city and college scoped registration links to route public candidate inputs.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          Generate Link
        </button>
      </div>

      {/* Info Status Banners */}
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

      {/* Toolbar actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk actions options */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg animate-fade-in text-[10px] text-[var(--text-muted)] font-bold">
              <span>{selectedIds.length} Selected:</span>
              <button
                onClick={() => handleBulkToggle(true)}
                className="text-emerald-400 hover:underline px-1 flex items-center gap-1"
              >
                <ToggleLeft className="h-3 w-3" /> Activate
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleBulkToggle(false)}
                className="text-rose-400 hover:underline px-1 flex items-center gap-1"
              >
                <ToggleLeft className="h-3 w-3 rotate-180" /> Deactivate
              </button>
            </div>
          )}
        </div>

        <ExportButtons data={links} columns={exportColumns} filename="generated_course_links" />
      </div>

      {/* Grid Table Links */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Querying link catalog...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No generated links found</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Generate links mapping Colleges, Locations, and specific pricing overrides.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  <th className="py-4 px-6 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === links.length && links.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border-color)] bg-[var(--bg-cream)] transition-colors duration-300 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="py-4 px-6">Course stream</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Price (Override)</th>
                  <th className="py-4 px-6">Shareable URL</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {links.map((item) => (
                  <tr key={item._id} className={`hover:bg-[var(--bg-cream)]/20 transition-colors duration-150 ${selectedIds.includes(item._id) ? 'bg-[var(--bg-cream)]/10' : ''}`}>
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleSelectRow(item._id)}
                        className="rounded border-[var(--border-color)] bg-[var(--bg-cream)] transition-colors duration-300 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                    </td>
                    <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">
                      <div>
                        <h4>{item.courseDetailId?.technologyId?.name || '—'}</h4>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">{item.collegeId?.collegeName || '—'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-dark)]">{item.location}</td>
                    <td className="py-4 px-6 text-[var(--text-muted)] font-medium">
                      {item.courseDetailId?.durationId?.value} {item.courseDetailId?.durationId?.unit}(s)
                    </td>
                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold">
                      INR {item.price?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 max-w-[200px]">
                        <input
                          type="text"
                          readOnly
                          value={item.generatedUrl}
                          className="w-full bg-[var(--bg-cream)] transition-colors duration-300 border border-slate-850 p-1.5 rounded text-[10px] font-mono text-[var(--text-muted)] truncate cursor-pointer"
                          onClick={() => handleCopyLink(item.generatedUrl, item._id)}
                        />
                        <button
                          onClick={() => handleCopyLink(item.generatedUrl, item._id)}
                          className="p-1.5 bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)] text-[var(--text-dark)] rounded border border-[var(--border-color)] transition"
                          title="Copy Link"
                        >
                          {copiedId === item._id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusToggle isActive={item.isActive} onToggle={() => handleStatusToggle(item)} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ActionsDropdown
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDeleteLink(item._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold">Showing 10 records per page</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={links.length < 10}
              className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <LinkIcon className="h-4.5 w-4.5 text-emerald-400" />
                {editingLink ? 'Edit Link configuration' : 'Generate New Scope Link'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select College</label>
                <select
                  required
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose College --</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.collegeName} ({c.cityName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Course detail</label>
                <select
                  required
                  value={formData.courseDetailId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose Combined Course Detail --</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.technologyId?.name} - {c.durationId?.value} {c.durationId?.unit}(s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Price Override (INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Training City Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Dehradun Campus"
                  />
                </div>
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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold"
                >
                  {editingLink ? 'Save Changes' : 'Generate URL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLinks;
