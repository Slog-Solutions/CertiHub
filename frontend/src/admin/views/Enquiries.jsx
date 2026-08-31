import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Loader, AlertCircle, CheckCircle2, MessageSquare, Mail, Phone, ChevronDown, X } from 'lucide-react';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const Enquiries = () => {
  const { api } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    courseInterested: '',
    message: '',
    status: 'New'
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/enquiry', {
        params: { page, search, status: statusFilter, limit: 10 }
      });
      setEnquiries(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve prospective enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEnquiries();
  };

  const handleOpenAddModal = () => {
    setEditingEnquiry(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      courseInterested: '',
      message: '',
      status: 'New'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingEnquiry(item);
    setFormData({
      name: item.name,
      phone: item.phone,
      email: item.email,
      courseInterested: item.courseInterested,
      message: item.message,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = async (enquiry, targetStatus) => {
    try {
      setError('');
      setMessage('');
      const res = await api.put(`/enquiry/${enquiry._id}`, { status: targetStatus });
      setEnquiries(enquiries.map(e => e._id === enquiry._id ? res.data : e));
      setMessage('Enquiry status converted successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update enquiry status');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/enquiry/${id}`);
      setMessage('Enquiry deleted successfully');
      fetchEnquiries();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete enquiry');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.name || !formData.phone) {
      setError('Please provide at least a Candidate Name and Phone number.');
      return;
    }

    try {
      if (editingEnquiry) {
        await api.put(`/enquiry/${editingEnquiry._id}`, formData);
        setMessage('Enquiry updated successfully');
      } else {
        await api.post('/enquiry', formData);
        setMessage('Enquiry recorded successfully');
      }
      setIsModalOpen(false);
      fetchEnquiries();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save enquiry');
    }
  };

  const getStatusBadgeStyle = (status) => {
    if (status === 'New') return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    if (status === 'Contacted') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (status === 'Converted') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    return 'bg-slate-500/10 text-[var(--text-muted)] border border-slate-500/20';
  };

  const exportColumns = [
    { header: 'Prospect Name', accessor: e => e.name },
    { header: 'Phone Number', accessor: e => e.phone },
    { header: 'Email Address', accessor: e => e.email },
    { header: 'Course Interest', accessor: e => e.courseInterested },
    { header: 'Internal Notes', accessor: e => e.message },
    { header: 'CRM Status', accessor: e => e.status }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Enquiry CRM</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Track prospective candidate intake leads, notes, and pipeline status conversions.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          Add Enquiry
        </button>
      </div>

      {/* Info logs */}
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

      {/* Toolbar controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search leads name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 py-1.5 pl-9 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            <button type="submit" className="absolute left-3 top-2 text-[var(--text-muted)] hover:text-[var(--text-dark)]">
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 px-3 py-1.5 text-xs text-[var(--text-muted)] focus:border-emerald-500 focus:outline-none transition"
          >
            <option value="">-- All Statuses --</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
          </select>
        </div>

        <ExportButtons data={enquiries} columns={exportColumns} filename="crm_enquiries_leads" />
      </div>

      {/* CRM Table */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Loading pipelines leads...</span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No leads recorded</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Lead captures will pop up here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact info</th>
                  <th className="py-4 px-6">Course Interested</th>
                  <th className="py-4 px-6">Prospect Message Notes</th>
                  <th className="py-4 px-6">Lead Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {enquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                    <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-dark)]">
                          <Phone className="h-3 w-3 text-emerald-500" />
                          <span>{item.phone}</span>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <Mail className="h-3 w-3 text-[var(--text-muted)]" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-dark)] font-semibold">{item.courseInterested || '—'}</td>
                    <td className="py-4 px-6 text-[var(--text-muted)] max-w-xs truncate">{item.message || '—'}</td>
                    <td className="py-4 px-6">
                      <div className="relative inline-block text-left group">
                        <button className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${getStatusBadgeStyle(item.status)}`}>
                          {item.status}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        
                        {/* Inline status switcher dropdown menu */}
                        <div className="hidden group-hover:block absolute left-0 mt-1 w-28 rounded-md bg-[var(--bg-cream)] border-[var(--border-color)] border border-slate-750 shadow-xl z-50">
                          {['New', 'Contacted', 'Converted'].map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(item, s)}
                              className={`block w-full text-left px-3 py-1.5 text-[10px] font-medium transition ${
                                item.status === s ? 'text-emerald-400 bg-[var(--bg-cream)] font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-cream)] hover:text-[var(--text-dark)]'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ActionsDropdown
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDeleteEnquiry(item._id)}
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
              disabled={enquiries.length < 10}
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
                <MessageSquare className="h-4.5 w-4.5 text-emerald-400" />
                {editingEnquiry ? 'Edit Lead record' : 'Record CRM Prospect Enquiry'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Prospect Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="9999999999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="jane@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Course Interested In</label>
                  <input
                    type="text"
                    value={formData.courseInterested}
                    onChange={(e) => setFormData({ ...formData, courseInterested: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Full Stack Web Dev"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Enquiry Notes / Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="3"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Insert notes about call history..."
                />
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
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
