import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Loader, AlertCircle, CheckCircle2, UserPlus, X, Calendar, ClipboardCheck, DollarSign, BookOpen, Upload, Download, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const Registration = () => {
  const { api } = useAuth();
  
  // Lists
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [formCollegeSearch, setFormCollegeSearch] = useState('');
  const [showFormCollegeDropdown, setShowFormCollegeDropdown] = useState(false);
  const [formBranchSearch, setFormBranchSearch] = useState('');
  const [showFormBranchDropdown, setShowFormBranchDropdown] = useState(false);
  const [formCourseSearch, setFormCourseSearch] = useState('');
  const [showFormCourseDropdown, setShowFormCourseDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form references
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);

  // View states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Bulk Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadCollegeId, setUploadCollegeId] = useState('');
  const [uploadCourseDetailId, setUploadCourseDetailId] = useState('');
  const [uploadStartDate, setUploadStartDate] = useState('');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  // Form Data
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
    collegeId: '',
    branchId: '',
    year: '1st Year',
    state: '',
    city: '',

    trainingType: 'Summer Training',
    courseDetailId: '',
    durationId: '', // loaded matching CourseDetail
    startDate: '',
    location: '',

    totalFee: '',
    amountSubmitted: '0',
    paymentType: 'offline'
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Paginated list for table view
      const res = await api.get('/registration/students', {
        params: { 
          page, 
          search, 
          limit: 10,
          collegeId: filterCollege,
          courseDetailId: filterCourse
        }
      });
      setStudents(res.data.data);
      setTotal(res.data.total);
      setLoading(false); // Unblock loading spinner immediately!

      // Fetch unpaginated list in the background for exports
      api.get('/registration/students', {
        params: { 
          search, 
          all: 'true',
          collegeId: filterCollege,
          courseDetailId: filterCourse
        }
      }).then(allRes => {
        setAllStudents(allRes.data.data);
      }).catch(err => {
        console.error('Background fetch of all students failed:', err);
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch student list');
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const clgRes = await api.get('/masters/college', { params: { limit: 10000, isActive: 'true' } });
      const brRes = await api.get('/masters/branch', { params: { limit: 10000, isActive: 'true' } });
      const crsRes = await api.get('/masters/coursedetail', { params: { limit: 10000, isActive: 'true' } });
      setColleges(clgRes.data.data);
      setBranches(brRes.data.data);
      setCourses(crsRes.data.data);
    } catch (err) {
      console.error('Failed to load form dropdowns:', err.message);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, filterCollege, filterCourse]);

  useEffect(() => {
    if (isFormOpen) {
      fetchDropdowns();
    }
  }, [isFormOpen]);

  // Adjust duration and price when course details selection changes
  const handleCourseChange = (courseDetailId) => {
    const selectedCourse = courses.find(c => c._id === courseDetailId);
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        courseDetailId,
        durationId: selectedCourse.durationId?._id || selectedCourse.durationId || '',
        totalFee: selectedCourse.price !== undefined ? selectedCourse.price : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        courseDetailId: '',
        durationId: '',
        totalFee: ''
      }));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleCollegeFilterChange = (e) => {
    setFilterCollege(e.target.value);
    setPage(1);
  };

  const handleCourseFilterChange = (e) => {
    setFilterCourse(e.target.value);
    setPage(1);
  };

  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setPhotoFile(null);
    setFormCollegeSearch('');
    setFormBranchSearch('');
    setFormCourseSearch('');
    setFormData({
      name: '',
      fatherName: '',
      dob: '',
      gender: 'Male',
      email: '',
      phone: '',
      nationality: 'Indian',
      address: '',
      workingStatus: 'student',
      collegeId: '',
      branchId: '',
      year: '1st Year',
      state: '',
      city: '',
      trainingType: 'Summer Training',
      courseDetailId: '',
      durationId: '',
      startDate: '',
      location: '',
      totalFee: '',
      amountSubmitted: '0',
      paymentType: 'offline'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (student) => {
    setEditingStudent(student);
    setPhotoFile(null);
    setFormCollegeSearch(student.collegeId?.collegeName || '');
    setFormBranchSearch(student.branchId?.name || '');
    setFormCourseSearch(student.courseDetailId ? `${student.courseDetailId.technologyId?.name} - ${student.courseDetailId.durationId?.value} ${student.courseDetailId.durationId?.unit}(s)` : '');
    setFormData({
      name: student.name,
      fatherName: student.fatherName,
      dob: student.dob ? new Date(student.dob).toISOString().substring(0, 10) : '',
      gender: student.gender || 'Male',
      email: student.email,
      phone: student.phone,
      nationality: student.nationality || 'Indian',
      address: student.address,
      workingStatus: student.workingStatus || 'student',
      collegeId: student.collegeId?._id || '',
      branchId: student.branchId?._id || '',
      year: student.year || '1st Year',
      state: student.state || '',
      city: student.city || '',
      trainingType: student.trainingType || 'Summer Training',
      courseDetailId: student.courseDetailId?._id || '',
      durationId: student.durationId?._id || student.courseDetailId?.durationId || '',
      startDate: student.startDate ? new Date(student.startDate).toISOString().substring(0, 10) : '',
      location: student.location || '',
      totalFee: student.totalFee || ''
    });
    setIsFormOpen(true);
  };

  const handleStatusToggle = async (student) => {
    try {
      setError('');
      setMessage('');
      const res = await api.put(`/registration/students/${student._id}`, {
        isActive: !student.isActive
      });
      setStudents(students.map(s => s._id === student._id ? { ...s, isActive: res.data.isActive } : s));
      setMessage('Student registration status updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('WARNING: Deleting a student permanently removes their entire records, installments paid, and certificates issued. Proceed?')) {
      return;
    }
    try {
      setError('');
      setMessage('');
      await api.delete(`/registration/students/${studentId}`);
      setMessage('Student and all associated records deleted successfully');
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete student');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    // Create Multipart Form Payload
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (photoFile) {
      data.append('photo', photoFile);
    }

    try {
      if (editingStudent) {
        await api.put(`/registration/students/${editingStudent._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Student registration details updated successfully');
      } else {
        await api.post('/registration/register', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Student registered successfully');
      }
      setIsFormOpen(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit registration data');
    }
  };

  const handleDownloadExcelTemplate = async () => {
    try {
      setError('');
      // Request file buffer and save it client side
      const response = await api.get('/registration/template-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Student_Registration_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download Excel template file.');
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadResult(null);
    setUploadSubmitting(true);

    if (!excelFile) {
      setUploadError('Please select an Excel file to upload.');
      setUploadSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('excelFile', excelFile);
    data.append('collegeId', uploadCollegeId);
    data.append('courseDetailId', uploadCourseDetailId);
    data.append('startDate', uploadStartDate);
    data.append('location', uploadLocation);

    try {
      const res = await api.post('/registration/bulk-upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(res.data);
      if (res.data.successCount > 0) {
        setMessage(`Successfully imported ${res.data.successCount} students in bulk.`);
        fetchStudents();
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Bulk registration upload failed.');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (studentId) => {
    setSelectedIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete the ${selectedIds.length} selected registration files, including their payment records and certificates?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      await api.post('/registration/students/bulk-delete', { ids: selectedIds });
      setMessage(`Successfully deleted ${selectedIds.length} candidate records.`);
      setSelectedIds([]);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk delete operation failed.');
      setLoading(false);
    }
  };

  const handleBulkToggle = async (targetActive) => {
    if (selectedIds.length > 0) {
      if (!window.confirm(`Are you sure you want to toggle status ${targetActive ? 'on' : 'off'} for ${selectedIds.length} selected student(s)?`)) return;
      try {
        setLoading(true);
        setError('');
        setMessage('');
        await api.post('/registration/students/bulk-toggle', {
          ids: selectedIds,
          isActive: targetActive
        });
        setMessage(`Successfully updated status for ${selectedIds.length} student(s)`);
        setSelectedIds([]);
        fetchStudents();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to update selection');
        setLoading(false);
      }
    } else {
      const confirmMsg = search
        ? `Are you sure you want to toggle status ${targetActive ? 'on' : 'off'} for all student records matching the search filter "${search}"?`
        : `Are you sure you want to toggle status ${targetActive ? 'on' : 'off'} for ALL student records in the database?`;
        
      if (!window.confirm(confirmMsg)) return;

      try {
        setLoading(true);
        setError('');
        setMessage('');
        await api.post('/registration/students/toggle-all', {
          search,
          isActive: targetActive,
          collegeId: filterCollege,
          courseDetailId: filterCourse
        });
        setMessage(`Successfully updated status for all matching student records.`);
        fetchStudents();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to update matching records');
        setLoading(false);
      }
    }
  };




  // Setup columns for exports
  const exportColumns = [
    { header: 'Reg No', accessor: s => s.registrationNo },
    { header: 'Full Name', accessor: s => s.name },
    { header: 'Phone', accessor: s => s.phone },
    { header: 'Email', accessor: s => s.email },
    { header: 'College', accessor: s => s.collegeId?.collegeName || '' },
    { header: 'Course', accessor: s => s.courseDetailId?.technologyId?.name || '' },
    { header: 'Total Fee (INR)', accessor: s => s.totalFee },
    { header: 'Status', accessor: s => s.isActive ? 'Active' : 'Inactive' }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header + List (always visible; the registration form opens as a modal on top) */}
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-dark)]">Student Registration</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Manage and audit student registrations, candidates and profiles.</p>
          </div>
          
          <div className="flex gap-2">


            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition shadow-md shadow-rose-600/10"
              title="Select checkboxes in the table below to delete candidate records"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </button>


            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] text-[var(--text-dark)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-cream)] transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Download Template
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadError('');
                setUploadResult(null);
                setExcelFile(null);
                setUploadCollegeId('');
                setUploadCourseDetailId('');
                setUploadStartDate('');
                setUploadLocation('');
                setIsUploadOpen(true);
                fetchDropdowns();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] text-[var(--text-dark)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-cream)] transition"
            >
              <Upload className="h-4 w-4 text-emerald-500" />
              Upload Excel
            </button>
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
            >
              <Plus className="h-4 w-4" />
              New Registration
            </button>
          </div>
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

        {/* Table controls */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-[var(--bg-card)] p-4 border border-[var(--border-color)] rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name, email, reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button type="submit" className="absolute left-3 top-2 text-[var(--text-muted)] hover:text-[var(--text-dark)]">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* College Search Select Dropdown */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Filter by College..."
                value={collegeSearchQuery}
                onFocus={() => setShowCollegeDropdown(true)}
                onChange={(e) => {
                  setCollegeSearchQuery(e.target.value);
                  setShowCollegeDropdown(true);
                  if (e.target.value === '') {
                    setFilterCollege('');
                    setPage(1);
                  }
                }}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] py-1.5 pl-9 pr-8 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none transition"
              />
              <span className="absolute left-3 top-2.5 text-[var(--text-muted)]">
                <Search className="h-3.5 w-3.5" />
              </span>
              {collegeSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCollegeSearchQuery('');
                    setFilterCollege('');
                    setPage(1);
                    setShowCollegeDropdown(false);
                  }}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {showCollegeDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCollegeDropdown(false)} />
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto z-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg py-1">
                    <div
                      className="px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-cream)] hover:text-[var(--text-dark)] cursor-pointer"
                      onClick={() => {
                        setCollegeSearchQuery('');
                        setFilterCollege('');
                        setPage(1);
                        setShowCollegeDropdown(false);
                      }}
                    >
                      All Colleges
                    </div>
                    {colleges
                      .filter(c => (c.collegeName || '').toLowerCase().includes(collegeSearchQuery.toLowerCase()))
                      .map(c => (
                        <div
                          key={c._id}
                          className="px-3 py-2 text-xs text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] cursor-pointer font-medium"
                          onClick={() => {
                            setCollegeSearchQuery(c.collegeName);
                            setFilterCollege(c._id);
                            setPage(1);
                            setShowCollegeDropdown(false);
                          }}
                        >
                          {c.collegeName}
                        </div>
                      ))
                    }
                  </div>
                </>
              )}
            </div>

            {/* Course Search Select Dropdown */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Filter by Course..."
                value={courseSearchQuery}
                onFocus={() => setShowCourseDropdown(true)}
                onChange={(e) => {
                  setCourseSearchQuery(e.target.value);
                  setShowCourseDropdown(true);
                  if (e.target.value === '') {
                    setFilterCourse('');
                    setPage(1);
                  }
                }}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] py-1.5 pl-9 pr-8 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none transition"
              />
              <span className="absolute left-3 top-2.5 text-[var(--text-muted)]">
                <Search className="h-3.5 w-3.5" />
              </span>
              {courseSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCourseSearchQuery('');
                    setFilterCourse('');
                    setPage(1);
                    setShowCourseDropdown(false);
                  }}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {showCourseDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCourseDropdown(false)} />
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto z-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg py-1">
                    <div
                      className="px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-cream)] hover:text-[var(--text-dark)] cursor-pointer"
                      onClick={() => {
                        setCourseSearchQuery('');
                        setFilterCourse('');
                        setPage(1);
                        setShowCourseDropdown(false);
                      }}
                    >
                      All Courses
                    </div>
                    {courses
                      .filter(c => (c.technologyId?.name || '').toLowerCase().includes(courseSearchQuery.toLowerCase()))
                      .map(c => {
                        const label = `${c.technologyId?.name || 'Unnamed Course'} - ${c.durationId?.value} ${c.durationId?.unit || 'Month'}(s)`;
                        return (
                          <div
                            key={c._id}
                            className="px-3 py-2 text-xs text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] cursor-pointer font-medium"
                            onClick={() => {
                              setCourseSearchQuery(label);
                              setFilterCourse(c._id);
                              setPage(1);
                              setShowCourseDropdown(false);
                            }}
                          >
                            {label}
                          </div>
                        );
                      })
                    }
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto justify-end">
            <button
              onClick={() => handleBulkToggle(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 border bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-500/10 cursor-pointer"
              title="Bulk toggle status on for selected students or all matching records"
            >
              <ToggleRight className="h-3.5 w-3.5 text-white" />
              {selectedIds.length > 0
                ? `Bulk Toggle On (${selectedIds.length})`
                : `Bulk Toggle On (All ${total})`}
            </button>
            <button
              onClick={() => handleBulkToggle(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 border bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/10 cursor-pointer"
              title="Bulk toggle status off for selected students or all matching records"
            >
              <ToggleLeft className="h-3.5 w-3.5 text-white" />
              {selectedIds.length > 0
                ? `Bulk Toggle Off (${selectedIds.length})`
                : `Bulk Toggle Off (All ${total})`}
            </button>
            <ExportButtons data={allStudents} columns={exportColumns} filename="student_registration_list" onlyActiveForExcel={true} />
          </div>
        </div>

        {/* Students Grid/Table */}
        <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <Loader className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-xs text-[var(--text-muted)]">Loading student registry...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-[var(--text-dark)]">No students registered</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Click "New Registration" to fill up candidate details.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                    <th className="py-4 px-6 w-12">
                      <input
                        type="checkbox"
                        checked={students.length > 0 && selectedIds.length === students.length}
                        onChange={handleSelectAll}
                        className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-card)] cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-6">Reg No</th>
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">College / Inst.</th>
                    <th className="py-4 px-6">Selected Course</th>
                    <th className="py-4 px-6">Total Fee</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/60">
                  {students.map((item) => (
                    <tr key={item._id} className="hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                      <td className="py-4 px-6 w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => handleSelectRow(item._id)}
                          className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-card)] cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 font-mono text-emerald-400 font-bold whitespace-nowrap">{item.registrationNo}</td>
                      <td className="py-4 px-6">
                        <div>
                          <h4 className="font-semibold text-[var(--text-dark)]">{item.name}</h4>
                          <p className="text-[10px] text-[var(--text-muted)]">{item.email} | {item.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[var(--text-dark)]">
                        <h4 className="font-medium truncate max-w-[150px]">{item.collegeId?.collegeName || '—'}</h4>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">{item.branchId?.name || '—'}</span>
                      </td>
                      <td className="py-4 px-6 text-[var(--text-dark)]">
                        <h4 className="font-semibold text-[var(--text-dark)]">
                          {item.courseDetailId?.technologyId?.name || '—'}
                        </h4>
                        {item.durationId?.value && (
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            {item.durationId.value} {item.durationId.unit || 'Month'}{item.durationId.value > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-emerald-400 font-bold">INR {item.totalFee?.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <StatusToggle isActive={item.isActive} onToggle={() => handleStatusToggle(item)} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <ActionsDropdown
                          onEdit={() => handleOpenEditForm(item)}
                          onDelete={() => handleDeleteStudent(item._id)}
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
                disabled={students.length < 10}
                className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>

      {/* MULTI-SECTION EDITING / CREATING FORM — rendered as a real modal overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--bg-cream)] transition-colors duration-300/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl my-8 animate-slide-up">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
              <UserPlus className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              {editingStudent ? `Modify Candidate File: ${editingStudent.registrationNo}` : 'Submit New Candidate File'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-md bg-[var(--bg-cream)] border-[var(--border-color)] hover:bg-[var(--bg-cream)] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
            
            {/* Section 1: Candidate Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold border-b border-[var(--border-color)] pb-2">
                <Calendar className="h-4 w-4" />
                <span>1. CANDIDATE PERSONAL INFORMATION</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Candidate Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Father's Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Father's Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="name@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="9999999999"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Permanent Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Street, locality, country..."
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Institution/College Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold border-b border-[var(--border-color)] pb-2">
                <ClipboardCheck className="h-4 w-4" />
                <span>2. INSTITUTION / COLLEGE INFORMATION</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Working Status</label>
                  <select
                    value={formData.workingStatus}
                    onChange={(e) => setFormData({ ...formData, workingStatus: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="working">Professional / Working</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Select College</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search / Select College..."
                      value={formCollegeSearch}
                      onFocus={() => setShowFormCollegeDropdown(true)}
                      onChange={(e) => {
                        setFormCollegeSearch(e.target.value);
                        setShowFormCollegeDropdown(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, collegeId: '' }));
                        }
                      }}
                      required
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 pr-8 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    />
                    {formCollegeSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormCollegeSearch('');
                          setFormData(prev => ({ ...prev, collegeId: '' }));
                          setShowFormCollegeDropdown(false);
                        }}
                        className="absolute right-2.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {showFormCollegeDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowFormCollegeDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto z-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl py-1">
                        {colleges
                          .filter(c => (c.collegeName || '').toLowerCase().includes(formCollegeSearch.toLowerCase()))
                          .map(c => (
                            <div
                              key={c._id}
                              className="px-3 py-2 text-xs text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] cursor-pointer font-medium"
                              onClick={() => {
                                setFormCollegeSearch(c.collegeName);
                                setFormData(prev => ({ ...prev, collegeId: c._id }));
                                setShowFormCollegeDropdown(false);
                              }}
                            >
                              {c.collegeName} ({c.cityName})
                            </div>
                          ))
                        }
                        {colleges.filter(c => (c.collegeName || '').toLowerCase().includes(formCollegeSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-xs text-[var(--text-muted)] italic">
                            No colleges match your search query
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Select Branch</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search / Select Branch..."
                      value={formBranchSearch}
                      onFocus={() => setShowFormBranchDropdown(true)}
                      onChange={(e) => {
                        setFormBranchSearch(e.target.value);
                        setShowFormBranchDropdown(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, branchId: '' }));
                        }
                      }}
                      required
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 pr-8 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    />
                    {formBranchSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormBranchSearch('');
                          setFormData(prev => ({ ...prev, branchId: '' }));
                          setShowFormBranchDropdown(false);
                        }}
                        className="absolute right-2.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {showFormBranchDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowFormBranchDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto z-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl py-1">
                        {branches
                          .filter(b => (b.name || '').toLowerCase().includes(formBranchSearch.toLowerCase()))
                          .map(b => (
                            <div
                              key={b._id}
                              className="px-3 py-2 text-xs text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] cursor-pointer font-medium"
                              onClick={() => {
                                setFormBranchSearch(b.name);
                                setFormData(prev => ({ ...prev, branchId: b._id }));
                                setShowFormBranchDropdown(false);
                              }}
                            >
                              {b.name}
                            </div>
                          ))
                        }
                        {branches.filter(b => (b.name || '').toLowerCase().includes(formBranchSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-xs text-[var(--text-muted)] italic">
                            No branches match your search query
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Year of Study</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
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
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    placeholder="Campus City"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    placeholder="Campus State"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Training Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold border-b border-[var(--border-color)] pb-2">
                <BookOpen className="h-4 w-4" />
                <span>3. TRAINING SCENE INFORMATION</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Training Type</label>
                  <select
                    value={formData.trainingType}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Summer Training">Summer Training</option>
                    <option value="Winter Training">Winter Training</option>
                    <option value="Industrial Training">Industrial Training</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Certification Bootcamp">Certification Bootcamp</option>
                  </select>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Select Course detail</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search / Select Course..."
                      value={formCourseSearch}
                      onFocus={() => setShowFormCourseDropdown(true)}
                      onChange={(e) => {
                        setFormCourseSearch(e.target.value);
                        setShowFormCourseDropdown(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, courseDetailId: '', durationId: '', totalFee: '' }));
                        }
                      }}
                      required
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 pr-8 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    />
                    {formCourseSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormCourseSearch('');
                          setFormData(prev => ({ ...prev, courseDetailId: '', durationId: '', totalFee: '' }));
                          setShowFormCourseDropdown(false);
                        }}
                        className="absolute right-2.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {showFormCourseDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowFormCourseDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto z-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl py-1">
                        {courses
                          .filter(c => (c.technologyId?.name || '').toLowerCase().includes(formCourseSearch.toLowerCase()))
                          .map(c => {
                            const label = `${c.technologyId?.name || 'Unnamed Course'} - ${c.durationId?.value} ${c.durationId?.unit || 'Month'}(s) (INR ${c.price})`;
                            return (
                              <div
                                key={c._id}
                                className="px-3 py-2 text-xs text-[var(--text-dark)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] cursor-pointer font-medium"
                                onClick={() => {
                                  setFormCourseSearch(label);
                                  handleCourseChange(c._id);
                                  setShowFormCourseDropdown(false);
                                }}
                              >
                                {label}
                              </div>
                            );
                          })
                        }
                        {courses.filter(c => (c.technologyId?.name || '').toLowerCase().includes(formCourseSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-xs text-[var(--text-muted)] italic">
                            No courses match your search query
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Training Location (City)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    placeholder="Training Center City"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Course Fee (INR)</label>
                  <input
                    type="number"
                    required
                    readOnly
                    value={formData.totalFee}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-muted)] cursor-not-allowed focus:outline-none"
                    placeholder="Total course fee"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Initial Fee Information (Shown only when registering new, hidden/read-only on edit) */}
            {!editingStudent && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold border-b border-[var(--border-color)] pb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>4. INITIAL PAYMENT LOG</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Submitted Installment Amount (INR)</label>
                    <input
                      type="number"
                      value={formData.amountSubmitted}
                      onChange={(e) => setFormData({ ...formData, amountSubmitted: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Payment Mode</label>
                    <select
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="offline">Offline / Cash / Bank</option>
                      <option value="online">Online / UPI / Card</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Footer submit */}
            <div className="pt-6 border-t border-[var(--border-color)] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
              >
                {editingStudent ? 'Save Changes' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--bg-cream)] transition-colors duration-300/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl my-8 animate-slide-up">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-emerald-500" />
                Bulk Student Upload via Excel
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-md bg-[var(--bg-cream)] border-[var(--border-color)] hover:bg-[var(--bg-cream)] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBulkUploadSubmit} className="p-6 space-y-6">
              {uploadError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-450">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadResult && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-[var(--text-dark)] space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Upload Completed Successfully!</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-medium text-[var(--text-muted)] uppercase">
                    <div>Total Rows: <strong className="text-[var(--text-dark)] font-mono">{uploadResult.totalRows}</strong></div>
                    <div>Imported: <strong className="text-emerald-400 font-mono">{uploadResult.successCount}</strong></div>
                    <div>Failed: <strong className="text-rose-500 font-mono">{uploadResult.failureCount}</strong></div>
                  </div>

                  {uploadResult.failures && uploadResult.failures.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border-color)] space-y-1">
                      <span className="text-[9px] font-bold text-rose-500 uppercase">Failed Row Log:</span>
                      <div className="max-h-24 overflow-y-auto text-[10px] space-y-1 font-mono text-[var(--text-muted)]">
                        {uploadResult.failures.map((f, i) => (
                          <div key={i}>Row {f.row} ({f.name}): {f.reason}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select College</label>
                  <select
                    required
                    value={uploadCollegeId}
                    onChange={(e) => setUploadCollegeId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose College --</option>
                    {colleges.map(c => (
                      <option key={c._id} value={c._id}>{c.collegeName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Course Detail</label>
                  <select
                    required
                    value={uploadCourseDetailId}
                    onChange={(e) => setUploadCourseDetailId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.technologyId?.name} - {c.durationId?.value} {c.durationId?.unit}(s) (INR {c.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={uploadStartDate}
                    onChange={(e) => setUploadStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Training Location (City)</label>
                  <input
                    type="text"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                    placeholder="Training Center City"
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-cream)]">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Excel File Spreadsheet</label>
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition"
                  >
                    <Download className="h-3 w-3" />
                    Download Sample Template
                  </button>
                </div>
                <input
                  type="file"
                  required
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  className="w-full text-[var(--text-muted)] text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[var(--bg-card)] file:text-emerald-500 hover:file:bg-[var(--bg-card)]"
                />
                <span className="text-[9px] text-[var(--text-muted)] block pt-1 leading-normal">
                  Required columns: <code className="text-emerald-500 font-bold">FullName, DateOfBirth, Gender, Email, PhoneNumber, PermanentAddress, WorkingStatus, Branch/Department, YearOfStudy, TrainingTerm, PaymentTerm</code>
                </span>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={uploadSubmitting}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadSubmitting ? (
                    <>
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload & Register
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
