import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Settings, Loader, AlertCircle, CheckCircle2, X, FileImage, ShieldCheck, Save, User } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const Masters = ({ defaultTab }) => {
  const { api } = useAuth();
  const location = useLocation();

  // Read URL search parameter or defaultTab immediately during initial state calculation
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
    }
    return defaultTab || 'technology';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [dataList, setDataList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Active tab reference to prevent race conditions from out-of-order async responses
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

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

  const [mentorForm, setMentorForm] = useState({
    name: '',
    designation: '',
    image: '',
    sortOrder: 0,
    isActive: true
  });
  const [mentorPhotoFile, setMentorPhotoFile] = useState(null);

  // Mentors Indexing & Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [headerSortOrder, setHeaderSortOrder] = useState('');
  const [editedIndexes, setEditedIndexes] = useState({});
  const [savingIndexes, setSavingIndexes] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch lists based on active tab
  const fetchTabData = async () => {
    const requestedTab = activeTab;
    try {
      setLoading(true);
      setError('');
      setDataList([]);
      setTotal(0);
      let endpoint = `/masters/${requestedTab}`;
      const res = await api.get(endpoint, {
        params: { page, search, limit: requestedTab === 'mentor' ? 500 : 10 }
      });

      // Ignore response if user switched tabs while request was in-flight
      if (activeTabRef.current !== requestedTab) return;

      const listData = res.data?.data || [];
      setDataList(listData);
      setTotal(res.data?.total || 0);

      if (requestedTab === 'mentor' && listData) {
        const initialMap = {};
        listData.forEach(item => {
          initialMap[item._id] = item.sortOrder || 0;
        });
        setEditedIndexes(initialMap);
      }
    } catch (err) {
      if (activeTabRef.current === requestedTab) {
        setError(err.response?.data?.error || 'Failed to load master records');
        setDataList([]);
        setTotal(0);
      }
    } finally {
      if (activeTabRef.current === requestedTab) {
        setLoading(false);
      }
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
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const targetTab = tabParam || defaultTab || 'technology';
    if (targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  }, [location.search, defaultTab]);

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
    setSelectedIds([]);
    setHeaderSortOrder('');
    setEditedIndexes({});
    setMentorPhotoFile(null);
  };

  // Open modals
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setLogoFile(null);
    setMentorPhotoFile(null);
    
    // Reset forms
    setTechForm({ name: '', note: '', isActive: true });
    setDurForm({ value: '', unit: 'month', note: '', isActive: true });
    setBranchForm({ name: '', note: '', isActive: true });
    setCollegeForm({ cityName: '', collegeName: '', shortForm: '', isActive: true, showSignature: true });
    setCourseForm({ technologyId: '', durationId: '', price: '', isActive: true });
    setMentorForm({ name: '', designation: '', image: '', sortOrder: 0, isActive: true });
    
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setLogoFile(null);
    setMentorPhotoFile(null);

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
    } else if (activeTab === 'mentor') {
      setMentorForm({
        name: item.name,
        designation: item.designation || '',
        image: item.image || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive
      });
    }

    setIsModalOpen(true);
  };

  // Delete
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record? Dependencies will be validated.')) return;
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

  // Bulk & Inline Indexing Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(dataList.map(item => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleHeaderGo = () => {
    const val = parseInt(headerSortOrder);
    if (isNaN(val)) return;
    if (selectedIds.length === 0) {
      alert('Please select at least one mentor checkbox to bulk set sort-order.');
      return;
    }
    const newEdited = { ...editedIndexes };
    selectedIds.forEach(id => {
      newEdited[id] = val;
    });
    setEditedIndexes(newEdited);
    setMessage(`Updated index to ${val} for ${selectedIds.length} selected mentor photo(s). Click 'Save Indexing' to apply.`);
  };

  const handleIndexChange = (id, val) => {
    const parsed = parseInt(val);
    setEditedIndexes(prev => ({
      ...prev,
      [id]: isNaN(parsed) ? '' : parsed
    }));
  };

  const handleSaveIndexes = async () => {
    try {
      setSavingIndexes(true);
      setError('');
      setMessage('');
      const itemsToUpdate = Object.keys(editedIndexes).map(id => ({
        id,
        sortOrder: parseInt(editedIndexes[id]) || 0
      }));

      await api.put('/masters/mentor/bulk-sort', { items: itemsToUpdate });
      setMessage('Mentor photo indexing saved successfully!');
      fetchTabData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save mentor indexing');
    } finally {
      setSavingIndexes(false);
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
      } else if (activeTab === 'mentor') {
        if (mentorPhotoFile) {
          const formData = new FormData();
          formData.append('name', mentorForm.name);
          formData.append('designation', mentorForm.designation);
          formData.append('image', mentorForm.image);
          formData.append('sortOrder', mentorForm.sortOrder);
          formData.append('isActive', mentorForm.isActive);
          formData.append('photo', mentorPhotoFile);
          payload = formData;
          headers = { 'Content-Type': 'multipart/form-data' };
        } else {
          payload = mentorForm;
        }
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
    if (activeTab === 'mentor') {
      return [
        { header: 'Mentor Name', accessor: m => m.name },
        { header: 'Index (Sort Order)', accessor: m => m.sortOrder },
        { header: 'Designation', accessor: m => m.designation },
        { header: 'Photo URL', accessor: m => m.image },
        { header: 'Status', accessor: m => m.isActive ? 'Active' : 'Inactive' }
      ];
    }
    return [];
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">
            {activeTab === 'mentor' ? 'Mentors & Photo Indexing Management' : 'Masters Configuration'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {activeTab === 'mentor'
              ? 'Manage mentor profiles, photos, and indexing positions for frontend ordering.'
              : 'Configure drop-down lookup records used across the platform portals.'}
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          {activeTab === 'mentor' ? 'Add Mentor Photo' : 'Add New Record'}
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[var(--border-color)] space-x-6 text-xs overflow-x-auto">
        {['technology', 'duration', 'branch', 'college', 'coursedetail', 'mentor'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-4 px-1 font-semibold uppercase tracking-wider transition shrink-0 ${
              activeTab === tab 
                ? 'text-emerald-400 border-b-2 border-emerald-500' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-dark)]'
            }`}
          >
            {tab === 'coursedetail' ? 'Course Details' : tab === 'mentor' ? 'Mentors & Photo Indexing' : `${tab} Master`}
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
            placeholder={`Search ${activeTab === 'mentor' ? 'mentors' : activeTab}...`}
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
            <span className="text-xs text-[var(--text-muted)]">Querying records catalog...</span>
          </div>
        ) : dataList.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <Settings className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No records found</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Add configurations to pre-fill registers.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  {/* DYNAMIC HEADERS BASED ON TAB */}
                  {activeTab === 'mentor' && (
                    <>
                      <th className="py-4 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={dataList.length > 0 && selectedIds.length === dataList.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-4 w-14 text-center">Photo</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span>sort-order</span>
                          <input
                            type="number"
                            placeholder="20"
                            value={headerSortOrder}
                            onChange={(e) => setHeaderSortOrder(e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-cream)] text-[var(--text-dark)] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleHeaderGo}
                            className="px-2 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition shadow"
                          >
                            Go
                          </button>
                        </div>
                      </th>
                      <th className="py-4 px-6">Designation</th>
                    </>
                  )}
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
                    {activeTab === 'mentor' && (
                      <>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item._id)}
                            onChange={() => handleSelectRow(item._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        {/* Mentor Photo Thumbnail */}
                        <td className="py-4 px-4 text-center">
                          <div className="h-10 w-10 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm mx-auto cursor-pointer" onClick={() => handleOpenEditModal(item)}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => handleOpenEditModal(item)}>
                          {item.name}
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={editedIndexes[item._id] !== undefined ? editedIndexes[item._id] : (item.sortOrder || 0)}
                            onChange={(e) => handleIndexChange(item._id, e.target.value)}
                            className="w-20 px-2 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-cream)] font-mono text-[var(--text-dark)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-6 text-[var(--text-dark)] max-w-xs truncate">
                          {item.designation || '—'}
                        </td>
                      </>
                    )}
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

        {/* Mentors Bottom Action Bar for Bulk Index Saving */}
        {activeTab === 'mentor' && dataList.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] text-xs">
            <div className="text-[var(--text-muted)] font-semibold flex items-center gap-2">
              <span>{selectedIds.length} selected</span>
            </div>
            <button
              onClick={handleSaveIndexes}
              disabled={savingIndexes}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingIndexes ? 'Saving...' : 'Save Indexing'}
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {total > 10 && activeTab !== 'mentor' && (
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
              <h3 className="text-sm font-bold text-[var(--text-dark)]">
                {editingItem ? `Edit ${activeTab === 'mentor' ? 'Mentor' : 'Master'}` : `Add New ${activeTab === 'mentor' ? 'Mentor' : 'Master Record'}`}
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Fill details below to update master catalog.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* TECHNOLOGY FORM FIELDS */}
              {activeTab === 'technology' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Technology Name *</label>
                    <input
                      type="text"
                      required
                      value={techForm.name}
                      onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. Python Full Stack"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notes / Remarks</label>
                    <textarea
                      rows={2}
                      value={techForm.note}
                      onChange={(e) => setTechForm({ ...techForm, note: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
              )}

              {/* MENTOR FORM FIELDS */}
              {activeTab === 'mentor' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mentor Name *</label>
                    <input
                      type="text"
                      required
                      value={mentorForm.name}
                      onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. Dr. Chandan Prakash Sharma"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Designation</label>
                    <input
                      type="text"
                      value={mentorForm.designation}
                      onChange={(e) => setMentorForm({ ...mentorForm, designation: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. FIE (INDIA), Chairman IEI-UKSC, Dehradun"
                    />
                  </div>

                  {/* Mentor Photo File Upload & URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Upload Mentor Photo</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex flex-col items-center justify-center h-24 border border-[var(--border-color)] border-dashed rounded-lg bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-dark)] transition p-2 text-center">
                        <FileImage className="w-5 h-5 text-emerald-500/80 mb-1" />
                        <p className="text-[10px] font-semibold truncate max-w-[180px]">
                          {mentorPhotoFile ? mentorPhotoFile.name : 'Click to upload photo file'}
                        </p>
                        <p className="text-[8px] text-[var(--text-muted)]">Max size: 2MB (jpg, png, webp)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setMentorPhotoFile(e.target.files[0] || null)}
                          className="hidden"
                        />
                      </label>

                      {/* Photo Preview Card */}
                      <div className="h-24 w-20 rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] flex flex-col items-center justify-center p-1 relative overflow-hidden shrink-0">
                        {mentorPhotoFile ? (
                          <img src={URL.createObjectURL(mentorPhotoFile)} alt="Preview" className="h-full w-full object-cover rounded" />
                        ) : mentorForm.image ? (
                          <img src={mentorForm.image} alt="Preview" className="h-full w-full object-cover rounded" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[8px] text-gray-400">
                            <User className="w-6 h-6 text-gray-300 mb-1" />
                            No Photo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Or Image URL</label>
                      <input
                        type="text"
                        value={mentorForm.image}
                        onChange={(e) => setMentorForm({ ...mentorForm, image: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="https://res.cloudinary.com/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Indexing / Sort Order</label>
                      <input
                        type="number"
                        value={mentorForm.sortOrder}
                        onChange={(e) => setMentorForm({ ...mentorForm, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DURATION FORM FIELDS */}
              {activeTab === 'duration' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Numeric Value *</label>
                      <input
                        type="number"
                        required
                        value={durForm.value}
                        onChange={(e) => setDurForm({ ...durForm, value: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="6"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Duration Unit *</label>
                      <select
                        value={durForm.unit}
                        onChange={(e) => setDurForm({ ...durForm, unit: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="month">Month(s)</option>
                        <option value="week">Week(s)</option>
                        <option value="days">Day(s)</option>
                        <option value="year">Year(s)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notes / Remarks</label>
                    <textarea
                      rows={2}
                      value={durForm.note}
                      onChange={(e) => setDurForm({ ...durForm, note: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
              )}

              {/* BRANCH FORM FIELDS */}
              {activeTab === 'branch' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Branch Name *</label>
                    <input
                      type="text"
                      required
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. Dehradun Main Campus"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notes / Remarks</label>
                    <textarea
                      rows={2}
                      value={branchForm.note}
                      onChange={(e) => setBranchForm({ ...branchForm, note: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
              )}

              {/* COLLEGE FORM FIELDS */}
              {activeTab === 'college' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full College Name *</label>
                    <input
                      type="text"
                      required
                      value={collegeForm.collegeName}
                      onChange={(e) => setCollegeForm({ ...collegeForm, collegeName: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. Graphic Era Deemed to be University"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Short Form / Abbr *</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.shortForm}
                        onChange={(e) => setCollegeForm({ ...collegeForm, shortForm: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="GEU"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">City Location *</label>
                      <input
                        type="text"
                        required
                        value={collegeForm.cityName}
                        onChange={(e) => setCollegeForm({ ...collegeForm, cityName: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                        placeholder="Dehradun"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Show Signature Line</label>
                    <select
                      value={collegeForm.showSignature}
                      onChange={(e) => setCollegeForm({ ...collegeForm, showSignature: e.target.value === 'true' })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="true">Yes, render signatory line</option>
                      <option value="false">No, hide signatory line</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">College Logo Image</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-[var(--border-color)] border-dashed rounded-lg bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-dark)] transition">
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
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
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
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
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
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
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
