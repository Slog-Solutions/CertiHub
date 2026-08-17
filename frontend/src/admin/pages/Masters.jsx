import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Settings, Loader, AlertCircle, CheckCircle2, X, FileImage, ShieldCheck } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const Masters = () => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('technology');
  const [dataList, setDataList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // References for drop-downs
  const [technologies, setTechnologies] = useState([]);
  const [durations, setDurations] = useState([]);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Forms States
  const [techForm, setTechForm] = useState({ name: '', note: '', isActive: true });
  const [durForm, setDurForm] = useState({ value: '', unit: 'month', note: '', isActive: true });
  const [branchForm, setBranchForm] = useState({ name: '', note: '', isActive: true });
  
  const [collegeForm, setCollegeForm] = useState({
    cityName: '',
    collegeName: '',
    shortForm: '',
    isActive: true,
    showSignature: true
  });
  const [logoFile, setLogoFile] = useState(null);

  const [courseForm, setCourseForm] = useState({
    technologyId: '',
    durationId: '',
    price: '',
    isActive: true
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch lists based on active tab
  const fetchTabData = async () => {
    try {
      setLoading(true);
      setError('');
      let endpoint = `/masters/${activeTab}`;
      const res = await api.get(endpoint, {
        params: { page, search, limit: 10 }
      });
      setDataList(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load master records');
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown lists for Course Detail setup
  const loadReferences = async () => {
    try {
      const techRes = await api.get('/masters/technology', { params: { limit: 100, isActive: 'true' } });
      const durRes = await api.get('/masters/duration', { params: { limit: 100, isActive: 'true' } });
      setTechnologies(techRes.data.data);
      setDurations(durRes.data.data);
    } catch (err) {
      console.error('Failed to load references', err.message);
    }
  };

  useEffect(() => {
    fetchTabData();
    if (activeTab === 'coursedetail') {
      loadReferences();
    }
  }, [activeTab, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTabData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setDataList([]);
    setTotal(0);
    setError('');
    setMessage('');
  };

  // Open modals
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setLogoFile(null);
    
    // Reset forms
    setTechForm({ name: '', note: '', isActive: true });
    setDurForm({ value: '', unit: 'month', note: '', isActive: true });
    setBranchForm({ name: '', note: '', isActive: true });
    setCollegeForm({ cityName: '', collegeName: '', shortForm: '', isActive: true, showSignature: true });
    setCourseForm({ technologyId: '', durationId: '', price: '', isActive: true });
    
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setLogoFile(null);

    if (activeTab === 'technology') {
      setTechForm({ name: item.name, note: item.note, isActive: item.isActive });
    } else if (activeTab === 'duration') {
      setDurForm({ value: item.value, unit: item.unit, note: item.note, isActive: item.isActive });
    } else if (activeTab === 'branch') {
      setBranchForm({ name: item.name, note: item.note, isActive: item.isActive });
    } else if (activeTab === 'college') {
      setCollegeForm({
        cityName: item.cityName,
        collegeName: item.collegeName,
        shortForm: item.shortForm,
        isActive: item.isActive,
        showSignature: item.showSignature
      });
    } else if (activeTab === 'coursedetail') {
      setCourseForm({
        technologyId: item.technologyId?._id || '',
        durationId: item.durationId?._id || '',
        price: item.price,
        isActive: item.isActive
      });
      loadReferences();
    }

    setIsModalOpen(true);
  };

  // Delete
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this master record? Dependencies will be validated.')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/masters/${activeTab}/${id}`);
      setMessage('Record deleted successfully');
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete record: active references exist');
    }
  };

  // Status Toggle
  const handleStatusToggle = async (item, field = 'isActive') => {
    try {
      setError('');
      setMessage('');
      
      const payload = {};
      payload[field] = !item[field];
      
      const res = await api.put(`/masters/${activeTab}/${item._id}`, payload);
      setDataList(dataList.map(d => d._id === item._id ? { ...d, ...res.data } : d));
      setMessage('Status updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      let payload;
      let headers = {};

      if (activeTab === 'technology') {
        payload = techForm;
      } else if (activeTab === 'duration') {
        payload = durForm;
      } else if (activeTab === 'branch') {
        payload = branchForm;
      } else if (activeTab === 'college') {
        // Multipart upload form data
        const formData = new FormData();
        formData.append('cityName', collegeForm.cityName);
        formData.append('collegeName', collegeForm.collegeName);
        formData.append('shortForm', collegeForm.shortForm);
        formData.append('isActive', collegeForm.isActive);
        formData.append('showSignature', collegeForm.showSignature);
        if (logoFile) {
          formData.append('logoImage', logoFile);
        }
        payload = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
      } else if (activeTab === 'coursedetail') {
        payload = courseForm;
      }

      if (editingItem) {
        await api.put(`/masters/${activeTab}/${editingItem._id}`, payload, { headers });
        setMessage('Record updated successfully');
      } else {
        await api.post(`/masters/${activeTab}`, payload, { headers });
        setMessage('Record added successfully');
      }

      setIsModalOpen(false);
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    }
  };

  // Export Columns mapping
  const getExportColumns = () => {
    if (activeTab === 'technology') {
      return [
        { header: 'Tech Name', accessor: t => t.name },
        { header: 'Notes', accessor: t => t.note },
        { header: 'Status', accessor: t => t.isActive ? 'Active' : 'Inactive' }
      ];
    }
    if (activeTab === 'duration') {
      return [
        { header: 'Value', accessor: d => d.value },
        { header: 'Unit', accessor: d => d.unit },
        { header: 'Notes', accessor: d => d.note },
        { header: 'Status', accessor: d => d.isActive ? 'Active' : 'Inactive' }
      ];
    }
    if (activeTab === 'branch') {
      return [
        { header: 'Branch Name', accessor: b => b.name },
        { header: 'Notes', accessor: b => b.note },
        { header: 'Status', accessor: b => b.isActive ? 'Active' : 'Inactive' }
      ];
    }
    if (activeTab === 'college') {
      return [
        { header: 'College Name', accessor: c => c.collegeName },
        { header: 'Short Form', accessor: c => c.shortForm },
        { header: 'City Location', accessor: c => c.cityName },
        { header: 'Signature Visible', accessor: c => c.showSignature ? 'Yes' : 'No' },
        { header: 'Status', accessor: c => c.isActive ? 'Active' : 'Inactive' }
      ];
    }
    if (activeTab === 'coursedetail') {
      return [
        { header: 'Course Stream', accessor: c => c.technologyId?.name },
        { header: 'Duration Period', accessor: c => c.durationId ? `${c.durationId.value} ${c.durationId.unit}` : '' },
        { header: 'Tuition Fee (Price)', accessor: c => c.price },
        { header: 'Status', accessor: c => c.isActive ? 'Active' : 'Inactive' }
      ];
    }
    return [];
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Masters Configuration</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Configure drop-down lookup records used across the platform portals.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          Add New Record
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[var(--border-color)] space-x-6 text-xs">
        {['technology', 'duration', 'branch', 'college', 'coursedetail'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-4 px-1 font-semibold uppercase tracking-wider transition ${
              activeTab === tab 
                ? 'text-emerald-400 border-b-2 border-emerald-500' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-dark)]'
            }`}
          >
            {tab === 'coursedetail' ? 'Course Details' : `${tab} Master`}
          </button>
        ))}
      </div>

      {/* Alert logs */}
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
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 py-1.5 pl-9 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
          <button type="submit" className="absolute left-3 top-2 text-[var(--text-muted)] hover:text-[var(--text-dark)]">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        <ExportButtons data={dataList} columns={getExportColumns()} filename={`${activeTab}_master`} />
      </div>

      {/* Records Table View */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Querying master catalog...</span>
          </div>
        ) : dataList.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <Settings className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No master records found</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Add configurations to pre-fill registers.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  {/* DYNAMIC HEADERS BASED ON TAB */}
                  {activeTab === 'technology' && (
                    <>
                      <th className="py-4 px-6">Technology Name</th>
                      <th className="py-4 px-6">Note Description</th>
                    </>
                  )}
                  {activeTab === 'duration' && (
                    <>
                      <th className="py-4 px-6">Value</th>
                      <th className="py-4 px-6">Unit</th>
                      <th className="py-4 px-6">Notes</th>
                    </>
                  )}
                  {activeTab === 'branch' && (
                    <>
                      <th className="py-4 px-6">Branch Name</th>
                      <th className="py-4 px-6">Note Description</th>
                    </>
                  )}
                  {activeTab === 'college' && (
                    <>
                      <th className="py-4 px-6">College Name</th>
                      <th className="py-4 px-6">Short Form</th>
                      <th className="py-4 px-6">City</th>
                      <th className="py-4 px-6">Signature Toggle</th>
                    </>
                  )}
                  {activeTab === 'coursedetail' && (
                    <>
                      <th className="py-4 px-6">Technology Stream</th>
                      <th className="py-4 px-6">Duration Period</th>
                      <th className="py-4 px-6">Tuition Price (INR)</th>
                    </>
                  )}
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {dataList.map((item) => (
                  <tr key={item._id} className="text-xs hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                    {/* DYNAMIC DATA ROWS */}
                    {activeTab === 'technology' && (
                      <>
                        <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                        <td className="py-4 px-6 text-[var(--text-muted)] max-w-xs truncate">{item.note || '—'}</td>
                      </>
                    )}
                    {activeTab === 'duration' && (
                      <>
                        <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.value}</td>
                        <td className="py-4 px-6 text-[var(--text-dark)] font-mono capitalize">{item.unit}</td>
                        <td className="py-4 px-6 text-[var(--text-muted)]">{item.note || '—'}</td>
                      </>
                    )}
                    {activeTab === 'branch' && (
                      <>
                        <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                        <td className="py-4 px-6 text-[var(--text-muted)] max-w-xs truncate">{item.note || '—'}</td>
                      </>
                    )}
                    {activeTab === 'college' && (
                      <>
                        <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">
                          <div className="flex items-center gap-2">
                            {item.logoImageUrl ? (
                              <img src={item.logoImageUrl} alt="Logo" className="h-6 w-6 object-contain rounded bg-[var(--bg-cream)] border border-[var(--border-color)]" />
                            ) : (
                              <div className="h-6 w-6 rounded bg-[var(--bg-cream)] border border-[var(--border-color)] flex items-center justify-center text-[8px] text-[var(--text-muted)]">Logo</div>
                            )}
                            <span>{item.collegeName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-emerald-400 font-semibold">{item.shortForm}</td>
                        <td className="py-4 px-6 text-[var(--text-dark)]">{item.cityName}</td>
                        <td className="py-4 px-6">
                          <StatusToggle isActive={item.showSignature} onToggle={() => handleStatusToggle(item, 'showSignature')} />
                        </td>
                      </>
                    )}
                    {activeTab === 'coursedetail' && (
                      <>
                        <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.technologyId?.name || '—'}</td>
                        <td className="py-4 px-6 text-[var(--text-dark)]">{item.durationId ? `${item.durationId.value} ${item.durationId.unit}(s)` : '—'}</td>
                        <td className="py-4 px-6 font-mono text-emerald-400 font-bold">INR {item.price?.toLocaleString()}</td>
                      </>
                    )}
                    <td className="py-4 px-6">
                      <StatusToggle isActive={item.isActive} onToggle={() => handleStatusToggle(item, 'isActive')} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ActionsDropdown
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDeleteItem(item._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
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
              disabled={dataList.length < 10}
              className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Unified Form Modal */}
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
              <h3 className="text-sm font-bold text-[var(--text-dark)] capitalize flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-400 animate-spin-slow" />
                {editingItem ? `Edit ${activeTab}` : `Add New ${activeTab}`}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              {/* TECHNOLOGY FORM FIELDS */}
              {activeTab === 'technology' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tech stream Name</label>
                    <input
                      type="text"
                      required
                      value={techForm.name}
                      onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="React.js Development"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Note Details</label>
                    <textarea
                      value={techForm.note}
                      onChange={(e) => setTechForm({ ...techForm, note: e.target.value })}
                      rows="3"
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none resize-none"
                      placeholder="Enter optional description..."
                    />
                  </div>
                </div>
              )}

              {/* DURATION FORM FIELDS */}
              {activeTab === 'duration' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Value (Number)</label>
                      <input
                        type="number"
                        required
                        value={durForm.value}
                        onChange={(e) => setDurForm({ ...durForm, value: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                        placeholder="6"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Unit Period</label>
                      <select
                        value={durForm.unit}
                        onChange={(e) => setDurForm({ ...durForm, unit: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="hour">Hour(s)</option>
                        <option value="day">Day(s)</option>
                        <option value="week">Week(s)</option>
                        <option value="month">Month(s)</option>
                        <option value="year">Year(s)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notes</label>
                    <input
                      type="text"
                      value={durForm.note}
                      onChange={(e) => setDurForm({ ...durForm, note: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="Short notes"
                    />
                  </div>
                </div>
              )}

              {/* BRANCH FORM FIELDS */}
              {activeTab === 'branch' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Branch Name</label>
                    <input
                      type="text"
                      required
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="Computer Science Engineering (CSE)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Note Details</label>
                    <textarea
                      value={branchForm.note}
                      onChange={(e) => setBranchForm({ ...branchForm, note: e.target.value })}
                      rows="3"
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none resize-none"
                      placeholder="Enter optional description..."
                    />
                  </div>
                </div>
              )}

              {/* COLLEGE FORM FIELDS (Supporting image upload) */}
              {activeTab === 'college' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">College Name</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.collegeName}
                        onChange={(e) => setCollegeForm({ ...collegeForm, collegeName: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="Indian Institute of Technology"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Short Form</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.shortForm}
                        onChange={(e) => setCollegeForm({ ...collegeForm, shortForm: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="IIT"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.cityName}
                        onChange={(e) => setCollegeForm({ ...collegeForm, cityName: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="New Delhi"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Show Signature Line</label>
                      <select
                        value={collegeForm.showSignature}
                        onChange={(e) => setCollegeForm({ ...collegeForm, showSignature: e.target.value === 'true' })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="true">Yes, render signatory line</option>
                        <option value="false">No, hide signatory line</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">College Logo Image</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-[var(--border-color)] border-dashed rounded-lg bg-[var(--bg-cream)] border-[var(--border-color)] hover:bg-[var(--bg-cream)] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-dark)] transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileImage className="w-6 h-6 text-emerald-500/80 mb-1" />
                          <p className="text-[10px] font-semibold">
                            {logoFile ? `Selected: ${logoFile.name.substring(0, 20)}...` : 'Click to upload logo image'}
                          </p>
                          <p className="text-[8px] text-[var(--text-muted)]">Max file size: 2MB (jpg, png, webp)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* COURSE DETAILS FORM FIELDS */}
              {activeTab === 'coursedetail' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Technology</label>
                      <select
                        required
                        value={courseForm.technologyId}
                        onChange={(e) => setCourseForm({ ...courseForm, technologyId: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">-- Choose Technology --</option>
                        {technologies.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Duration</label>
                      <select
                        required
                        value={courseForm.durationId}
                        onChange={(e) => setCourseForm({ ...courseForm, durationId: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">-- Choose Duration --</option>
                        {durations.map(d => (
                          <option key={d._id} value={d._id}>{d.value} {d.unit}(s)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tuition Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="15000"
                    />
                  </div>
                </div>
              )}

              {/* Footer buttons */}
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
                  {editingItem ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Masters;
