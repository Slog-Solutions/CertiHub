import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen, LogOut, Users, Plus, Bell, FileText, Link2,
  Download, Trash2, Calendar, User, Mail, Phone, X,
  AlertCircle, PlusCircle, CheckCircle2, ChevronRight,
  Layers, GraduationCap, Sparkles, Upload, Sun, Moon,
  ListChecks, Edit2, Check, RotateCcw, ChevronDown, ChevronUp,
  ClipboardList, Trash, RefreshCw, Star, MessageSquare, HelpCircle, Tag, Filter, Send,
  Eye, Info, MapPin, Building
} from 'lucide-react';

/* ─── Utility ──────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const getThemePalette = (dark) => ({
  bg:          dark ? '#0f1117'                        : '#f4f6f8',
  surface:     dark ? 'rgba(255,255,255,0.02)'         : '#ffffff',
  surfaceHov:  dark ? 'rgba(255,255,255,0.04)'         : '#f8fafc',
  border:      dark ? 'rgba(255,255,255,0.07)'         : 'rgba(0,0,0,0.08)',
  borderGreen: dark ? 'rgba(16,185,129,0.2)'           : 'rgba(16,185,129,0.3)',
  text:        dark ? '#e2e8f0'                        : '#1f2937',
  textSub:     dark ? '#f1f5f9'                        : '#111827',
  textMuted:   dark ? 'rgba(255,255,255,0.4)'          : 'rgba(0,0,0,0.5)',
  textMono:    dark ? 'rgba(255,255,255,0.3)'          : 'rgba(0,0,0,0.4)',
  inputBg:     dark ? 'rgba(255,255,255,0.04)'         : '#f9fafb',
  inputBorder: dark ? 'rgba(255,255,255,0.1)'          : 'rgba(0,0,0,0.12)',
  headerBg:    dark ? 'rgba(15,17,23,0.9)'             : 'rgba(255,255,255,0.95)',
  headerBorder:dark ? 'rgba(139,92,246,0.15)'          : 'rgba(139,92,246,0.2)',
  shadow:      dark ? '0 4px 20px rgba(0,0,0,0.25)'    : '0 4px 20px rgba(0,0,0,0.03)',
  sidebarBg:   dark ? 'rgba(255,255,255,0.02)'         : '#ffffff',
  activeBg:    dark ? 'rgba(139,92,246,0.12)'          : 'rgba(139,92,246,0.06)',
  activeBorder:dark ? 'rgba(139,92,246,0.4)'           : 'rgba(139,92,246,0.5)',
  statBg:      dark ? 'rgba(255,255,255,0.02)'         : '#ffffff',
  heroBg:      dark ? 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(109,40,217,0.03))' : 'linear-gradient(135deg,#fcfbfe,#f5f3ff)',
  borderPurple:dark ? 'rgba(139,92,246,0.2)'           : 'rgba(139,92,246,0.25)',
  tabBg:       dark ? 'rgba(255,255,255,0.01)'         : '#ffffff',
  tabActiveBg: dark ? 'rgba(139,92,246,0.15)'          : 'rgba(139,92,246,0.08)',
  tableBg:     dark ? 'rgba(255,255,255,0.01)'         : '#f9fafb',
  cardBg:      dark ? 'rgba(255,255,255,0.02)'         : '#ffffff',
  modalBg:     dark ? '#151821'                        : '#ffffff',
});
const Spin = ({ color = '#fff' }) => (
  <svg className="animate-spin" style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
    <path style={{ opacity: 0.75 }} fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

/* ─── Sub-components ────────────────────────────────────── */
const Empty = ({ icon: Icon, title, sub }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '56px 24px', gap: 14, textAlign: 'center',
    background: 'rgba(16,185,129,0.03)', border: '1.5px dashed rgba(16,185,129,0.12)', borderRadius: 20
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={24} color="#10b981" opacity={0.6} />
    </div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{title}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 300, lineHeight: 1.65 }}>{sub}</p>}
    </div>
  </div>
);

const FormAlert = ({ msg, type }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    borderRadius: 10, fontSize: 12,
    background: type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
    color: type === 'error' ? '#f87171' : '#10b981'
  }}>
    {type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
    {msg}
  </div>
);

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 13, outline: 'none',
};

const SAMPLE_JSON = `[
  {
    "title": "Introduction & Setup",
    "description": "Overview of the course and environment setup",
    "subtopics": ["Course Overview", "Tools Installation", "Hello World"]
  },
  {
    "title": "Core Concepts",
    "description": "Fundamental concepts and principles",
    "subtopics": ["Variables & Types", "Control Flow", "Functions"]
  }
]`;

/* ─── Main Component ───────────────────────────────────── */
const TeacherDashboard = () => {
  const { user, logout, api } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const c = getThemePalette(dark);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [linkData, setLinkData] = useState({ title: '', url: '' });
  const [notifData, setNotifData] = useState({ title: '', message: '' });
  const [pdfData, setPdfData] = useState({ title: '', description: '', file: null });

  // Curriculum state
  const [currJsonMode, setCurrJsonMode] = useState(true);
  const [currJsonText, setCurrJsonText] = useState('');
  const [currJsonError, setCurrJsonError] = useState('');
  const [currManual, setCurrManual] = useState({ title: '', description: '', subtopics: '' });
  const [currSubmitting, setCurrSubmitting] = useState(false);
  const [currSuccess, setCurrSuccess] = useState('');
  const [currError, setCurrError] = useState('');
  const [markingId, setMarkingId] = useState(null);
  const [deletingTopicId, setDeletingTopicId] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [editModal, setEditModal] = useState(null); // { topic }
  const [editData, setEditData] = useState({ title: '', description: '', subtopics: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [clearingCurr, setClearingCurr] = useState(false);
  const [markingSubtopicId, setMarkingSubtopicId] = useState(null); // { topicId, subtopicId }

  // Feedback state
  const [feedbackData, setFeedbackData] = useState({ feedback: [], avgRating: null, totalReviews: 0 });

  // Student Queries / Doubts state for experts
  const [teacherQueries, setTeacherQueries] = useState([]);
  const [teacherQueriesLoading, setTeacherQueriesLoading] = useState(false);
  const [teacherQueryFilter, setTeacherQueryFilter] = useState('all');
  const [expandedTeacherQueryId, setExpandedTeacherQueryId] = useState(null);
  const [teacherReplyText, setTeacherReplyText] = useState({});
  const [teacherReplySubmitting, setTeacherReplySubmitting] = useState({});

  // Direct Push Notification state (Expert → Specific Candidate)
  const [directPushModal, setDirectPushModal] = useState(null);
  const [directPushForm, setDirectPushForm] = useState({ title: '', message: '' });
  const [directPushSubmitting, setDirectPushSubmitting] = useState(false);
  const [directPushResult, setDirectPushResult] = useState(null);

  const handleSendDirectPush = async (e) => {
    e.preventDefault();
    if (!directPushModal?.studentId) return;
    if (!directPushForm.title.trim() || !directPushForm.message.trim()) return;
    setDirectPushSubmitting(true);
    setDirectPushResult(null);
    try {
      const res = await api.post(`/push/student/${directPushModal.studentId}`, {
        title: directPushForm.title.trim(),
        message: directPushForm.message.trim()
      });
      setDirectPushResult({ success: res.data.success, message: res.data.message });
      if (res.data.success) {
        setTimeout(() => {
          setDirectPushModal(null);
          setDirectPushForm({ title: '', message: '' });
          setDirectPushResult(null);
        }, 1200);
      }
    } catch (err) {
      setDirectPushResult({ success: false, message: err.response?.data?.error || 'Failed to send push notification.' });
    } finally {
      setDirectPushSubmitting(false);
    }
  };

  // Bulk Candidate Registration via Excel state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

  const handleDownloadSampleExcel = () => {
    const headers = "FullName,DateOfBirth,Gender,Email,PhoneNumber,PermanentAddress,WorkingState,Branch/Department,YearOfStudy,TrainingTechnology,PaymentTerm\n";
    const sampleRow = "John Doe,2001-05-15,Male,johndoe@example.com,9876543210,Main Street Dehradun,Uttarakhand,Computer Science,3rd Year,Python & AI,Full Paid\n";
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sample_Candidate_Registration_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCredentialsCsv = (candidatesList) => {
    if (!candidatesList || candidatesList.length === 0) return;
    let csv = "FullName,Email,Phone,GeneratedUsername,GeneratedPassword,SMTP_Status,Technology,Branch\n";
    candidatesList.forEach(c => {
      const name = `"${(c.fullName || '').replace(/"/g, '""')}"`;
      const email = `"${(c.email || '').replace(/"/g, '""')}"`;
      const phone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const uname = `"${(c.username || '').replace(/"/g, '""')}"`;
      const pass = `"${(c.password || '').replace(/"/g, '""')}"`;
      const smtp = c.emailSent ? "Sent via SMTP" : "Skipped/Pending";
      const tech = `"${(c.technology || '').replace(/"/g, '""')}"`;
      const branch = `"${(c.branch || '').replace(/"/g, '""')}"`;
      csv += `${name},${email},${phone},${uname},${pass},${smtp},${tech},${branch}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${batchDetails?.name || 'Batch'}_Candidates_Credentials.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkRegisterSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkResult(null);

    if (!bulkFile) {
      setBulkError('Please select an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('excel', bulkFile);
    setBulkSubmitting(true);

    try {
      const res = await api.post(`/batches/teacher/${selectedBatchId}/bulk-register-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkResult(res.data);
      fetchDetails(selectedBatchId);
    } catch (err) {
      setBulkError(err.response?.data?.error || 'Failed to register candidates from Excel file.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const [deletingStudentId, setDeletingStudentId] = useState(null);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove candidate "${studentName}" from this batch?`)) return;
    setDeletingStudentId(studentId);
    try {
      await api.delete(`/batches/teacher/${selectedBatchId}/students/${studentId}`);
      fetchDetails(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove student from batch.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  // Candidate Info & Edit Modal states
  const [infoStudentModal, setInfoStudentModal] = useState(null);
  const [editStudentModal, setEditStudentModal] = useState(null);
  const [editStudentSubmitting, setEditStudentSubmitting] = useState(false);
  const [editStudentError, setEditStudentError] = useState('');
  const [editStudentSuccess, setEditStudentSuccess] = useState('');

  const openStudentInfoModal = async (std) => {
    setInfoStudentModal({ studentId: std._id, name: std.name, loading: true });
    try {
      const res = await api.get(`/batches/teacher/${selectedBatchId}/students/${std._id}`);
      setInfoStudentModal({ studentId: std._id, user: res.data.user, profile: res.data.profile, loading: false });
    } catch (err) {
      setInfoStudentModal({ studentId: std._id, user: std, profile: null, loading: false });
    }
  };

  const openStudentEditModal = async (std) => {
    setEditStudentError('');
    setEditStudentSuccess('');
    setEditStudentModal({
      studentId: std._id,
      name: std.name || '',
      email: std.email || '',
      username: std.username || '',
      password: std.generatedPassword || '',
      mobile: std.mobile || '',
      address: std.address || '',
      dob: '',
      gender: 'Male',
      branch: '',
      state: '',
      technology: '',
      year: ''
    });

    try {
      const res = await api.get(`/batches/teacher/${selectedBatchId}/students/${std._id}`);
      const u = res.data.user || std;
      const p = res.data.profile || {};
      setEditStudentModal({
        studentId: std._id,
        name: u.name || '',
        email: u.email || '',
        username: u.username || '',
        password: u.generatedPassword || '',
        mobile: u.mobile || p.phone || '',
        address: u.address || p.address || '',
        dob: u.dob ? new Date(u.dob).toISOString().split('T')[0] : (p.dob ? new Date(p.dob).toISOString().split('T')[0] : ''),
        gender: u.gender || p.gender || 'Male',
        branch: u.branch || p.branchDepartment || p.branch || '',
        state: u.state || p.state || '',
        technology: u.technology || p.trainingType || '',
        year: u.year || p.year || ''
      });
    } catch (err) {
      // fallback to basic user data
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editStudentModal?.studentId) return;
    setEditStudentError('');
    setEditStudentSuccess('');
    setEditStudentSubmitting(true);

    try {
      const res = await api.put(`/batches/teacher/${selectedBatchId}/students/${editStudentModal.studentId}`, editStudentModal);
      setEditStudentSuccess('Candidate details updated successfully!');
      fetchDetails(selectedBatchId);
      setTimeout(() => {
        setEditStudentModal(null);
        setEditStudentSuccess('');
      }, 1200);
    } catch (err) {
      setEditStudentError(err.response?.data?.error || 'Failed to update candidate details.');
    } finally {
      setEditStudentSubmitting(false);
    }
  };

  // Assignments state for experts
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({ title: '', description: '', dueDate: '', totalPoints: 100, fileUrl: '' });
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
  const [gradeData, setGradeData] = useState({});
  const [gradingSubmitting, setGradingSubmitting] = useState({});

  const fetchBatches = async () => {
    try { setLoading(true); const r = await api.get('/batches/teacher'); setBatches(r.data); if (r.data.length > 0 && !selectedBatchId) setSelectedBatchId(r.data[0]._id); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchDetails = async (id) => {
    try { setDetailsLoading(true); const r = await api.get('/batches/teacher'); const f = r.data.find(b => b._id === id); setBatchDetails(f || null); }
    catch (e) { console.error(e); } finally { setDetailsLoading(false); }
  };

  const fetchFeedback = async (id) => {
    try {
      const r = await api.get(`/batches/teacher/${id}/feedback`);
      setFeedbackData(r.data);
    } catch (e) { console.error(e); }
  };

  const fetchTeacherQueries = async (id) => {
    if (!id) return;
    try {
      setTeacherQueriesLoading(true);
      const r = await api.get(`/queries/teacher?batchId=${id}`);
      setTeacherQueries(r.data);
    } catch (e) {
      console.error('Error fetching teacher queries:', e);
    } finally {
      setTeacherQueriesLoading(false);
    }
  };

  const fetchAssignments = async (id) => {
    if (!id) return;
    try {
      setAssignmentsLoading(true);
      const r = await api.get(`/assignments/batch/${id}`);
      setAssignments(r.data);
    } catch (e) {
      console.error('Error fetching assignments:', e);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => {
    if (selectedBatchId) {
      fetchDetails(selectedBatchId);
      fetchFeedback(selectedBatchId);
      fetchTeacherQueries(selectedBatchId);
      fetchAssignments(selectedBatchId);
    } else {
      setBatchDetails(null);
      setFeedbackData({ feedback: [], avgRating: null, totalReviews: 0 });
      setTeacherQueries([]);
      setAssignments([]);
    }
  }, [selectedBatchId]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAssignmentError('');
    setAssignmentSuccess('');
    setAssignmentSubmitting(true);

    if (!assignmentFormData.title.trim() || !assignmentFormData.description.trim() || !assignmentFormData.dueDate) {
      setAssignmentError('Title, instructions, and due date are required.');
      setAssignmentSubmitting(false);
      return;
    }

    try {
      await api.post('/assignments', {
        batchId: selectedBatchId,
        title: assignmentFormData.title.trim(),
        description: assignmentFormData.description.trim(),
        dueDate: assignmentFormData.dueDate,
        totalPoints: Number(assignmentFormData.totalPoints) || 100,
        fileUrl: assignmentFormData.fileUrl.trim()
      });

      setAssignmentSuccess('Assignment created & assigned successfully!');
      fetchAssignments(selectedBatchId);
      setTimeout(() => {
        setIsCreateAssignmentOpen(false);
        setAssignmentSuccess('');
        setAssignmentFormData({ title: '', description: '', dueDate: '', totalPoints: 100, fileUrl: '' });
      }, 900);
    } catch (err) {
      setAssignmentError(err.response?.data?.error || 'Failed to create assignment.');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleGradeSubmission = async (assignmentId, submissionId) => {
    const data = gradeData[submissionId] || {};
    if (data.grade === undefined || data.grade === '') {
      alert('Please enter a grade score.');
      return;
    }

    setGradingSubmitting(p => ({ ...p, [submissionId]: true }));
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        grade: Number(data.grade),
        feedback: data.feedback || ''
      });
      fetchAssignments(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update grade.');
    } finally {
      setGradingSubmitting(p => ({ ...p, [submissionId]: false }));
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      fetchAssignments(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete assignment');
    }
  };


  const handleTeacherReply = async (queryId) => {
    const msg = teacherReplyText[queryId];
    if (!msg || !msg.trim()) return;

    setTeacherReplySubmitting(p => ({ ...p, [queryId]: true }));
    try {
      await api.post(`/queries/${queryId}/reply`, { message: msg.trim() });
      setTeacherReplyText(p => ({ ...p, [queryId]: '' }));
      fetchTeacherQueries(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit response');
    } finally {
      setTeacherReplySubmitting(p => ({ ...p, [queryId]: false }));
    }
  };

  const handleTeacherStatusChange = async (queryId, status) => {
    try {
      await api.patch(`/queries/${queryId}/status`, { status });
      fetchTeacherQueries(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };


  const openModal = (type) => {
    setModalType(type); setFormError(''); setFormSuccess('');
    setLinkData({ title: '', url: '' }); setNotifData({ title: '', message: '' }); setPdfData({ title: '', description: '', file: null });
    setCurrJsonText(''); setCurrJsonError(''); setCurrManual({ title: '', description: '', subtopics: '' });
    setCurrSuccess(''); setCurrError(''); setCurrJsonMode(true);
    setIsModalOpen(true);
  };

  const handleAddLink = async (e) => {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setFormSubmitting(true);
    if (!linkData.title || !linkData.url) { setFormError('Please fill in all fields.'); setFormSubmitting(false); return; }
    try { await api.post(`/batches/teacher/${selectedBatchId}/links`, linkData); setFormSuccess('Link added!'); fetchDetails(selectedBatchId); setTimeout(() => setIsModalOpen(false), 800); }
    catch (err) { setFormError(err.response?.data?.error || 'Failed to add link'); }
    finally { setFormSubmitting(false); }
  };

  const handleAddNotification = async (e) => {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setFormSubmitting(true);
    if (!notifData.title || !notifData.message) { setFormError('Please fill in all fields.'); setFormSubmitting(false); return; }
    try { await api.post(`/batches/teacher/${selectedBatchId}/notifications`, notifData); setFormSuccess('Announcement posted!'); fetchDetails(selectedBatchId); setTimeout(() => setIsModalOpen(false), 800); }
    catch (err) { setFormError(err.response?.data?.error || 'Failed to post'); }
    finally { setFormSubmitting(false); }
  };

  const handleUploadPdf = async (e) => {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setFormSubmitting(true);
    if (!pdfData.title || !pdfData.file) { setFormError('Please provide a title and select a file.'); setFormSubmitting(false); return; }
    const fd = new FormData(); fd.append('title', pdfData.title); fd.append('description', pdfData.description); fd.append('pdf', pdfData.file);
    try { await api.post(`/batches/teacher/${selectedBatchId}/pdfs`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setFormSuccess('PDF uploaded!'); fetchDetails(selectedBatchId); setTimeout(() => setIsModalOpen(false), 800); }
    catch (err) { setFormError(err.response?.data?.error || 'Upload failed. Max 15MB.'); }
    finally { setFormSubmitting(false); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this resource?')) return;
    try { await api.delete(`/batches/teacher/${selectedBatchId}/resources/${type}/${id}`); fetchDetails(selectedBatchId); }
    catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
  };

  // ── Curriculum handlers ──
  const handleUploadCurriculumJson = async () => {
    setCurrJsonError(''); setCurrError(''); setCurrSuccess(''); setCurrSubmitting(true);
    let parsed;
    try { parsed = JSON.parse(currJsonText); }
    catch { setCurrJsonError('Invalid JSON. Please check the format.'); setCurrSubmitting(false); return; }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setCurrJsonError('JSON must be a non-empty array of topics.'); setCurrSubmitting(false); return;
    }
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/curriculum`, { topics: parsed });
      setCurrSuccess(`${parsed.length} topic(s) added!`);
      fetchDetails(selectedBatchId);
      setTimeout(() => { setIsModalOpen(false); setCurrSuccess(''); }, 900);
    } catch (err) { setCurrError(err.response?.data?.error || 'Failed to upload curriculum'); }
    finally { setCurrSubmitting(false); }
  };

  const handleAddManualTopic = async () => {
    setCurrError(''); setCurrSuccess(''); setCurrSubmitting(true);
    if (!currManual.title.trim()) { setCurrError('Topic title is required.'); setCurrSubmitting(false); return; }
    const subtopics = currManual.subtopics.split('\n').map(s => s.trim()).filter(Boolean);
    const topics = [{ title: currManual.title.trim(), description: currManual.description.trim(), subtopics }];
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/curriculum`, { topics });
      setCurrSuccess('Topic added!');
      setCurrManual({ title: '', description: '', subtopics: '' });
      fetchDetails(selectedBatchId);
      setTimeout(() => setCurrSuccess(''), 1500);
    } catch (err) { setCurrError(err.response?.data?.error || 'Failed to add topic'); }
    finally { setCurrSubmitting(false); }
  };

  const handleMarkComplete = async (topicId, current) => {
    setMarkingId(topicId);
    try {
      await api.patch(`/batches/teacher/${selectedBatchId}/curriculum/${topicId}/complete`, { isCompleted: !current });
      fetchDetails(selectedBatchId);
    } catch (err) { alert(err.response?.data?.error || 'Failed to update'); }
    finally { setMarkingId(null); }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this topic?')) return;
    setDeletingTopicId(topicId);
    try { await api.delete(`/batches/teacher/${selectedBatchId}/curriculum/${topicId}`); fetchDetails(selectedBatchId); }
    catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
    finally { setDeletingTopicId(null); }
  };

  const handleClearCurriculum = async () => {
    if (!window.confirm('Clear the entire curriculum? This cannot be undone.')) return;
    setClearingCurr(true);
    try { await api.delete(`/batches/teacher/${selectedBatchId}/curriculum`); fetchDetails(selectedBatchId); }
    catch (err) { alert(err.response?.data?.error || 'Failed to clear'); }
    finally { setClearingCurr(false); }
  };

  const openEditModal = (topic) => {
    setEditModal(topic);
    // subtopics are now objects with .title
    setEditData({ title: topic.title, description: topic.description || '', subtopics: (topic.subtopics || []).map(s => s.title ?? s).join('\n') });
    setEditError('');
  };

  const handleMarkSubtopicComplete = async (topicId, subtopicId, currentState) => {
    setMarkingSubtopicId(`${topicId}-${subtopicId}`);
    try {
      await api.patch(`/batches/teacher/${selectedBatchId}/curriculum/${topicId}/subtopics/${subtopicId}/complete`, { isCompleted: !currentState });
      fetchDetails(selectedBatchId);
    } catch (err) { alert(err.response?.data?.error || 'Failed to update subtopic'); }
    finally { setMarkingSubtopicId(null); }
  };

  const handleEditTopic = async (e) => {
    e.preventDefault(); setEditError(''); setEditSubmitting(true);
    if (!editData.title.trim()) { setEditError('Title is required'); setEditSubmitting(false); return; }
    const subtopics = editData.subtopics.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      await api.put(`/batches/teacher/${selectedBatchId}/curriculum/${editModal._id}`, {
        title: editData.title.trim(), description: editData.description.trim(), subtopics
      });
      setEditModal(null); fetchDetails(selectedBatchId);
    } catch (err) { setEditError(err.response?.data?.error || 'Failed to update'); }
    finally { setEditSubmitting(false); }
  };

  const curriculum = batchDetails?.curriculum || [];

  // Progress is subtopic-based:
  // - Topics WITH subtopics contribute subtopic count to total & completed
  // - Topics WITHOUT subtopics contribute 1 unit (topic-level isCompleted)
  const { totalUnits, completedUnits } = curriculum.reduce((acc, topic) => {
    if (topic.subtopics && topic.subtopics.length > 0) {
      acc.totalUnits += topic.subtopics.length;
      acc.completedUnits += topic.subtopics.filter(s => s.isCompleted).length;
    } else {
      acc.totalUnits += 1;
      acc.completedUnits += topic.isCompleted ? 1 : 0;
    }
    return acc;
  }, { totalUnits: 0, completedUnits: 0 });

  const totalCount = curriculum.length;
  const progressPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const pendingCount = teacherQueries.filter(q => q.status === 'Pending').length;

  const tabs = [
    { id: 'students', label: 'Candidates', icon: Users, count: batchDetails?.students?.length || 0 },
    { id: 'notifications', label: 'Announcements', icon: Bell, count: batchDetails?.notifications?.length || 0 },
    { id: 'pdfs', label: 'Study PDFs', icon: FileText, count: batchDetails?.pdfs?.length || 0 },
    { id: 'links', label: 'Links', icon: Link2, count: batchDetails?.links?.length || 0 },
    { id: 'curriculum', label: 'Curriculum', icon: ListChecks, count: `${completedUnits}/${totalUnits}` },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: assignments.length },
    { id: 'queries', label: 'Candidate Doubts', icon: HelpCircle, count: pendingCount > 0 ? `${pendingCount} new` : teacherQueries.length },
    { id: 'feedback', label: 'Reviews', icon: MessageSquare, count: feedbackData.avgRating ? `★ ${feedbackData.avgRating}` : feedbackData.totalReviews },
  ];

  const modalConfig = {
    link: { title: 'Add Resource Link', icon: Link2, action: 'Add Link' },
    pdf: { title: 'Upload PDF Material', icon: FileText, action: 'Upload' },
    notification: { title: 'Post Announcement', icon: Bell, action: 'Post' },
    curriculum: { title: 'Manage Curriculum', icon: ListChecks, action: 'Add Topics' },
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-outfit)', color: c.text, transition: 'background 0.3s, color 0.3s' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: c.headerBg, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${c.headerBorder}`, padding: '0 28px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: c.shadow
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#fff',
            boxShadow: '0 0 20px rgba(139,92,246,0.4)'
          }}>SS</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: dark ? '#fff' : '#0f172a', letterSpacing: '-0.3px' }}>Slog Solutions</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={10} /> Expert Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={toggleTheme} title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} style={{
            width: 38, height: 38, borderRadius: 10, border: `1px solid ${c.border}`,
            background: c.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dark ? '#fbbf24' : '#6366f1', transition: 'all 0.25s'
          }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(109,40,217,0.1))',
              border: '1.5px solid rgba(139,92,246,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#a78bfa'
            }}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: c.textMuted }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.08)', color: '#f87171',
            fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 280, flexShrink: 0,
          background: c.sidebarBg, borderRight: `1px solid ${c.border}`,
          display: 'flex', flexDirection: 'column', padding: '20px 0', overflow: 'hidden'
        }}>
          <div style={{ padding: '0 20px 16px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Assigned Batches</p>
            <p style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5 }}>Select a batch to manage resources and students.</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, gap: 8, color: c.textMuted, fontSize: 12 }}>
                <Spin color="rgba(255,255,255,0.4)" /> Loading...
              </div>
            ) : batches.length === 0 ? (
              <Empty icon={BookOpen} title="No batches assigned" sub="Contact the Super Admin to assign batches to your account." />
            ) : (
              batches.map(b => {
                const active = selectedBatchId === b._id;
                return (
                  <button key={b._id} onClick={() => { setSelectedBatchId(b._id); setActiveTab('students'); }} style={{
                    width: '100%', textAlign: 'left', padding: '12px 14px', marginBottom: 6,
                    borderRadius: 12, border: active ? `1px solid ${c.activeBorder}` : `1px solid transparent`,
                    background: active ? c.activeBg : c.surfaceHov,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: active ? 'rgba(139,92,246,0.2)' : c.statBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: active ? '#a78bfa' : c.textMuted
                    }}>{b.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? c.textSub : c.textMuted, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: active ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{b.batchId}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Users size={9} /> {b.students?.length || 0}
                        </span>
                      </div>
                    </div>
                    {active && <ChevronRight size={14} color="#a78bfa" />}
                  </button>
                );
              })
            )}
          </div>

          <div style={{ padding: '16px 20px 0', borderTop: `1px solid ${c.border}`, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
              <span style={{ fontSize: 10, color: c.textMuted }}>{batches.length} assigned batch{batches.length !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {!selectedBatchId ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, padding: 48 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(109,40,217,0.08))',
                border: '1.5px solid rgba(139,92,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(139,92,246,0.15)'
              }}>
                <Layers size={36} color="#8b5cf6" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textSub, marginBottom: 8 }}>Welcome, Instructor!</h2>
                <p style={{ fontSize: 13, color: c.textMuted, maxWidth: 380, lineHeight: 1.7 }}>
                  Select an assigned batch from the sidebar to manage students, post announcements, and upload study materials.
                </p>
              </div>
            </div>
          ) : detailsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              <Spin color="rgba(255,255,255,0.4)" /> Loading class data...
            </div>
          ) : batchDetails ? (<>

            {/* ── BATCH HERO ── */}
            <div style={{
              background: c.heroBg,
              border: `1px solid ${c.borderPurple}`, borderRadius: 20, padding: '24px 28px',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20,
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', fontSize: 10, fontWeight: 800, color: '#a78bfa', fontFamily: 'monospace' }}>{batchDetails.batchId}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 6, background: c.surfaceHov, border: `1px solid ${c.border}`, fontSize: 10, color: c.textMuted }}>
                    Key: <strong style={{ color: c.textSub, fontFamily: 'monospace' }}>{batchDetails.uniqueKey}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textSub, marginBottom: 8 }}>{batchDetails.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted }}>
                  <Users size={13} color="#8b5cf6" />
                  <strong style={{ color: c.textSub }}>{batchDetails.students?.length || 0}</strong> students enrolled
                </div>
              </div>
              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { icon: Bell, label: 'Announce', type: 'notification', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
                  { icon: FileText, label: 'Upload PDF', type: 'pdf', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
                  { icon: Link2, label: 'Add Link', type: 'link', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
                  { icon: ListChecks, label: 'Curriculum', type: 'curriculum', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
                ].map(({ icon: Icon, label, type, color, bg, border }) => (
                  <button key={type} onClick={() => { if (type === 'curriculum') { setActiveTab('curriculum'); } else { openModal(type); } }} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                    borderRadius: 10, border: `1px solid ${border}`, background: bg,
                    color, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                  }}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── STATS STRIP ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
              {[
                { icon: Users, val: batchDetails.students?.length || 0, label: 'Students', color: '#8b5cf6' },
                { icon: Bell, val: batchDetails.notifications?.length || 0, label: 'Announcements', color: '#f59e0b' },
                { icon: FileText, val: batchDetails.pdfs?.length || 0, label: 'PDFs', color: '#10b981' },
                { icon: Link2, val: batchDetails.links?.length || 0, label: 'Links', color: '#60a5fa' },
                { icon: ListChecks, val: `${completedUnits}/${totalUnits}`, label: 'Curriculum', color: '#a78bfa' },
              ].map(({ icon: Icon, val, label, color }) => (
                <div key={label} style={{
                  background: c.statBg, border: `1px solid ${c.border}`,
                  borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c.textSub, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 10, color: c.textMuted, marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── TABS ── */}
            <div style={{ display: 'flex', gap: 4, background: c.tabBg, borderRadius: 12, padding: 4, border: `1px solid ${c.border}` }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 8px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === t.id ? c.tabActiveBg : 'transparent',
                  color: activeTab === t.id ? '#a78bfa' : c.textMuted,
                  fontWeight: activeTab === t.id ? 700 : 500, fontSize: 11,
                  outline: activeTab === t.id ? '1px solid rgba(139,92,246,0.25)' : 'none'
                }}>
                  <t.icon size={13} />
                  {t.label}
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 5, padding: '0 5px',
                    background: activeTab === t.id ? 'rgba(139,92,246,0.25)' : c.border,
                    fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: activeTab === t.id ? '#a78bfa' : c.textMuted
                  }}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* ── STUDENTS TAB ── */}
            {activeTab === 'students' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#8b5cf6" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: c.textSub }}>Enrolled Candidates Register</span>
                    <span style={{ fontSize: 11, color: c.textMuted }}>({batchDetails.students?.length || 0} students)</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsBulkModalOpen(true);
                      setBulkFile(null);
                      setBulkError('');
                      setBulkResult(null);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                      fontSize: 12, fontWeight: 700, boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Upload size={14} /> Bulk Register Candidates (Excel)
                  </button>
                </div>

                {!batchDetails.students?.length ? (
                  <Empty icon={Users} title="No students enrolled yet" sub={`Upload an Excel file using the button above or share Batch ID: ${batchDetails.batchId} and passcode: ${batchDetails.uniqueKey}.`} />
                ) : (
                  <div style={{ background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                            {['Student', 'Username', 'Password', 'Email', 'Mobile', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', background: c.tableBg }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody style={{ divideY: `1px solid ${c.border}` }}>
                          {batchDetails.students.map(std => (
                            <tr key={std._id} style={{ borderBottom: `1px solid ${c.border}` }}>
                              <td style={{ padding: '12px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {std.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <button
                                    onClick={() => openStudentInfoModal(std)}
                                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                                    title="Click to view full candidate profile"
                                  >
                                    <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all 0.2s' }}>
                                      {std.name}
                                    </div>
                                  </button>
                                </div>
                              </td>
                              <td style={{ padding: '12px 18px', fontSize: 11, fontFamily: 'monospace', color: c.textMuted }}>{std.username || '—'}</td>
                              <td style={{ padding: '12px 18px', fontSize: 11, fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>{std.generatedPassword || 'Pass@1234'}</td>
                              <td style={{ padding: '12px 18px', fontSize: 11, color: c.textMuted }}>{std.email}</td>
                              <td style={{ padding: '12px 18px', fontSize: 11, color: c.textMuted }}>{std.mobile || '—'}</td>
                              <td style={{ padding: '12px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => openStudentInfoModal(std)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      padding: '5px 9px', borderRadius: 8, border: `1px solid ${c.border}`,
                                      background: c.surfaceHov, color: c.textSub,
                                      fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    title="View full candidate information"
                                  >
                                    <Eye size={12} color="#3b82f6" /> Info
                                  </button>

                                  <button
                                    onClick={() => openStudentEditModal(std)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      padding: '5px 9px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)',
                                      background: 'rgba(245,158,11,0.08)', color: '#fbbf24',
                                      fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    title="Edit candidate details"
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>

                                  <button
                                    onClick={() => {
                                      setDirectPushModal({ studentId: std._id, studentName: std.name });
                                      setDirectPushForm({ title: '', message: '' });
                                      setDirectPushResult(null);
                                    }}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      padding: '5px 9px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.25)',
                                      background: 'rgba(139,92,246,0.08)', color: '#a78bfa',
                                      fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    title="Send push notification directly to this student"
                                  >
                                    <Bell size={12} /> Push Alert
                                  </button>

                                  <button
                                    onClick={() => handleDeleteStudent(std._id, std.name)}
                                    disabled={deletingStudentId === std._id}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      padding: '5px 9px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)',
                                      background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                      fontSize: 11, fontWeight: 700, cursor: deletingStudentId === std._id ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s', opacity: deletingStudentId === std._id ? 0.6 : 1
                                    }}
                                    title="Remove/Delete candidate from this batch"
                                  >
                                    <Trash2 size={12} /> {deletingStudentId === std._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => openModal('notification')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 10, color: '#fbbf24', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}><PlusCircle size={14} /> Post Announcement</button>
                </div>
                {!batchDetails.notifications?.length ? (
                  <Empty icon={Bell} title="No announcements posted" sub="Click 'Post Announcement' to notify your students about important updates." />
                ) : batchDetails.notifications.map((n, i) => (
                  <div key={n._id || i} style={{
                    background: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: 16, padding: '18px 20px', borderLeft: '3px solid #f59e0b',
                    display: 'flex', alignItems: 'flex-start', gap: 14
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: c.textSub }}>{n.title}</h4>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: c.textMuted }}>
                          <Calendar size={10} /> {fmt(n.date)}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{n.message}</p>
                    </div>
                    <button onClick={() => handleDelete('notifications', n._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: c.textMuted }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── PDFS TAB ── */}
            {activeTab === 'pdfs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => openModal('pdf')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 10, color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}><Upload size={14} /> Upload PDF</button>
                </div>
                {!batchDetails.pdfs?.length ? (
                  <Empty icon={FileText} title="No PDFs uploaded" sub="Click 'Upload PDF' to share study notes and materials with your class." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                    {batchDetails.pdfs.map((p, i) => (
                     <div key={p._id || i} style={{
                        background: c.cardBg, border: `1px solid ${c.border}`,
                        borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}><FileText size={18} color="#10b981" /></div>
                          <button onClick={() => handleDelete('pdfs', p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: c.textMuted, flexShrink: 0 }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: c.textSub, marginBottom: 4 }}>{p.title}</div>
                          {p.description && <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5, marginBottom: 6 }}>{p.description}</div>}
                          <div style={{ fontSize: 10, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} /> {fmt(p.date)}
                          </div>
                        </div>
                        <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px', borderRadius: 10, textDecoration: 'none',
                          border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)',
                          color: '#10b981', fontSize: 12, fontWeight: 700
                        }}>
                          <Download size={13} /> View File
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── LINKS TAB ── */}
            {activeTab === 'links' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => openModal('link')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                    borderRadius: 10, color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}><PlusCircle size={14} /> Add Link</button>
                </div>
                {!batchDetails.links?.length ? (
                  <Empty icon={Link2} title="No links shared" sub="Click 'Add Link' to share reference material and resources with students." />
                ) : batchDetails.links.map((l, i) => (
                  <div key={l._id || i} style={{
                    background: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><Link2 size={16} color="#60a5fa" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.textSub, marginBottom: 2 }}>{l.title}</div>
                      <div style={{ fontSize: 10, color: c.textMono, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9,
                        textDecoration: 'none', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                        color: '#60a5fa', fontSize: 11, fontWeight: 700
                      }}><Link2 size={11} /> Open</a>
                      <button onClick={() => handleDelete('links', l._id)} style={{
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: 9, padding: '7px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center'
                      }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CURRICULUM TAB ── */}
            {activeTab === 'curriculum' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: c.textSub, marginBottom: 2 }}>Course Curriculum</div>
                    <div style={{ fontSize: 11, color: c.textMuted }}>{totalCount} topics · {completedUnits}/{totalUnits} subtopics covered</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openModal('curriculum')} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                      background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                      borderRadius: 10, color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}><PlusCircle size={14} /> Add Topics</button>
                    {totalCount > 0 && (
                      <button onClick={handleClearCurriculum} disabled={clearingCurr} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                        borderRadius: 10, color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        opacity: clearingCurr ? 0.6 : 1
                      }}>{clearingCurr ? <Spin color="#f87171" /> : <Trash size={13} />} Clear All</button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {totalCount > 0 && (
                  <div style={{
                    background: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: 16, padding: '18px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>Overall Progress</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa' }}>{progressPct}%</span>
                    </div>
                    <div style={{ height: 10, background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${progressPct}%`,
                        background: progressPct === 100 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
                        transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                        boxShadow: progressPct === 100 ? '0 0 10px rgba(16,185,129,0.5)' : '0 0 10px rgba(139,92,246,0.5)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: c.textMuted }}>{completedUnits} of {totalUnits} subtopics covered</span>
                      <span style={{ fontSize: 10, color: progressPct === 100 && totalUnits > 0 ? '#10b981' : c.textMuted, fontWeight: 700 }}>
                        {progressPct === 100 && totalUnits > 0 ? '🎉 Curriculum Complete!' : `${totalUnits - completedUnits} remaining`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Topic list */}
                {!totalCount ? (
                  <Empty icon={ClipboardList} title="No curriculum yet" sub="Click 'Add Topics' to upload your course curriculum via JSON or add topics manually." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...curriculum].sort((a, b) => a.order - b.order).map((topic, idx) => {
                      const expanded = expandedTopics[topic._id];
                      return (
                        <div key={topic._id} style={{
                          background: c.cardBg, borderRadius: 14,
                          border: `1px solid ${topic.isCompleted ? 'rgba(16,185,129,0.3)' : c.border}`,
                          borderLeft: `4px solid ${topic.isCompleted ? '#10b981' : '#8b5cf6'}`,
                          overflow: 'hidden', transition: 'border-color 0.3s'
                        }}>
                          {/* Topic header */}
                          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Order badge */}
                            <div style={{
                              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                              background: topic.isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.12)',
                              border: `1px solid ${topic.isCompleted ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.25)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 800, color: topic.isCompleted ? '#10b981' : '#a78bfa'
                            }}>{idx + 1}</div>

                            {/* Title & meta */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                <span style={{
                                  fontSize: 13, fontWeight: 700, color: c.textSub,
                                  textDecoration: topic.isCompleted ? 'none' : 'none'
                                }}>{topic.title}</span>
                                {topic.isCompleted && (
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 800,
                                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)',
                                    color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em'
                                  }}>✓ Completed</span>
                                )}
                              </div>
                              {topic.description && <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5 }}>{topic.description}</div>}
                              {topic.isCompleted && topic.completedAt && (
                                <div style={{ fontSize: 10, color: '#10b981', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={9} /> Completed {fmt(topic.completedAt)}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {topic.subtopics?.length > 0 && (
                                <button onClick={() => setExpandedTopics(p => ({ ...p, [topic._id]: !p[topic._id] }))} style={{
                                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                                  borderRadius: 6, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 3, fontSize: 10
                                }}>
                                  {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                  {topic.subtopics.length}
                                </button>
                              )}
                              <button onClick={() => openEditModal(topic)} title="Edit" style={{
                                background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
                                borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#60a5fa',
                                display: 'flex', alignItems: 'center'
                              }}><Edit2 size={12} /></button>
                              <button
                                onClick={() => handleMarkComplete(topic._id, topic.isCompleted)}
                                disabled={markingId === topic._id}
                                title={topic.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                                style={{
                                  background: topic.isCompleted ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                                  border: `1px solid ${topic.isCompleted ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
                                  borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                                  color: topic.isCompleted ? '#fbbf24' : '#10b981',
                                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5
                                }}>
                                {markingId === topic._id ? <Spin color={topic.isCompleted ? '#fbbf24' : '#10b981'} /> :
                                  topic.isCompleted ? <><RotateCcw size={12} /> Unmark</> : <><Check size={12} /> Complete</>}
                              </button>
                              <button onClick={() => handleDeleteTopic(topic._id)} disabled={deletingTopicId === topic._id} style={{
                                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                                borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center',
                                opacity: deletingTopicId === topic._id ? 0.5 : 1
                              }}><Trash2 size={12} /></button>
                            </div>
                          </div>

                          {/* Subtopics (expandable) */}
                          {expanded && topic.subtopics?.length > 0 && (
                            <div style={{
                              padding: '12px 18px 14px 18px',
                              borderTop: `1px solid ${c.border}`,
                              background: dark ? 'rgba(255,255,255,0.01)' : '#fafafa'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {topic.subtopics.map((st) => {
                                  const stKey = `${topic._id}-${st._id}`;
                                  const isMarking = markingSubtopicId === stKey;
                                  return (
                                    <div key={st._id} style={{
                                      display: 'flex', alignItems: 'center', gap: 10,
                                      padding: '8px 12px', borderRadius: 10,
                                      background: st.isCompleted
                                        ? (dark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)')
                                        : (dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
                                      border: `1px solid ${st.isCompleted ? 'rgba(16,185,129,0.2)' : c.border}`,
                                      transition: 'all 0.2s'
                                    }}>
                                      {/* Status dot */}
                                      <div style={{
                                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                        background: st.isCompleted ? 'rgba(16,185,129,0.15)' : dark ? 'rgba(255,255,255,0.05)' : '#eff6ff',
                                        border: `1.5px solid ${st.isCompleted ? 'rgba(16,185,129,0.4)' : c.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}>
                                        {st.isCompleted
                                          ? <Check size={11} color="#10b981" />
                                          : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', display: 'block' }} />}
                                      </div>
                                      <span style={{
                                        flex: 1, fontSize: 12, fontWeight: 500,
                                        color: st.isCompleted ? c.textSub : c.textMuted,
                                        textDecoration: 'none'
                                      }}>{st.title}</span>
                                      {st.isCompleted && st.completedAt && (
                                        <span style={{ fontSize: 9, color: '#10b981', opacity: 0.8 }}>{fmt(st.completedAt)}</span>
                                      )}
                                      {/* Subtopic mark-complete button */}
                                      <button
                                        onClick={() => handleMarkSubtopicComplete(topic._id, st._id, st.isCompleted)}
                                        disabled={isMarking}
                                        title={st.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                                        style={{
                                          flexShrink: 0,
                                          padding: '4px 10px', borderRadius: 7,
                                          border: `1px solid ${st.isCompleted ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                          background: st.isCompleted ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                                          color: st.isCompleted ? '#fbbf24' : '#10b981',
                                          fontSize: 10, fontWeight: 700, cursor: isMarking ? 'not-allowed' : 'pointer',
                                          display: 'flex', alignItems: 'center', gap: 4,
                                          opacity: isMarking ? 0.5 : 1, transition: 'all 0.2s'
                                        }}>
                                        {isMarking
                                          ? <Spin color={st.isCompleted ? '#fbbf24' : '#10b981'} />
                                          : st.isCompleted
                                            ? <><RotateCcw size={10} /> Undo</>
                                            : <><Check size={10} /> Done</>}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── FEEDBACK & REVIEWS TAB ── */}
            {activeTab === 'feedback' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Rating Overview Card */}
                <div style={{
                  background: c.cardBg, border: `1px solid ${c.borderPurple}`,
                  borderRadius: 20, padding: '24px 28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 20,
                      background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(109,40,217,0.08))',
                      border: '1.5px solid rgba(139,92,246,0.3)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: '#a78bfa', lineHeight: 1 }}>
                        {feedbackData.avgRating ? feedbackData.avgRating : 'N/A'}
                      </span>
                      <span style={{ fontSize: 9, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>out of 5</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: c.textSub, marginBottom: 4 }}>Candidate Feedback & Ratings</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={18}
                              fill={s <= Math.round(feedbackData.avgRating || 0) ? '#f59e0b' : 'none'}
                              color={s <= Math.round(feedbackData.avgRating || 0) ? '#f59e0b' : c.border}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>
                          {feedbackData.totalReviews} {feedbackData.totalReviews === 1 ? 'review' : 'reviews'} submitted
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: c.textMuted }}>Reviews provided by enrolled students for this course batch.</p>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                {!feedbackData.feedback || feedbackData.feedback.length === 0 ? (
                  <Empty icon={MessageSquare} title="No feedback submitted yet" sub="Enrolled candidates haven't submitted any reviews for this course batch yet." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {feedbackData.feedback.map((item, idx) => (
                      <div key={idx} style={{
                        background: c.cardBg, border: `1px solid ${c.border}`,
                        borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
                        boxShadow: c.shadow, transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(109,40,217,0.1))',
                              border: '1px solid rgba(139,92,246,0.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 800, color: '#a78bfa'
                            }}>
                              {(item.studentName || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: c.textSub }}>{item.studentName || 'Anonymous Student'}</div>
                              <div style={{ fontSize: 10, color: c.textMuted }}>Candidate</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 10, color: c.textMuted }}>{fmt(item.date)}</span>
                        </div>

                        {/* Star Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={14}
                                fill={s <= item.rating ? '#f59e0b' : 'none'}
                                color={s <= item.rating ? '#f59e0b' : c.border}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>{item.rating}.0</span>
                        </div>

                        {/* Review text */}
                        {item.review ? (
                          <p style={{
                            fontSize: 12, color: c.text, lineHeight: 1.6, fontStyle: 'italic',
                            padding: '10px 12px', borderRadius: 10,
                            background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            border: `1px solid ${c.border}`
                          }}>
                            &ldquo;{item.review}&rdquo;
                          </p>
                        ) : (
                          <span style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic' }}>No detailed review provided.</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STUDENT DOUBTS & QUERIES TAB (EXPERT VIEW) ── */}
            {activeTab === 'queries' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Controls Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  background: c.cardBg, border: `1px solid ${c.borderPurple}`, borderRadius: 20, padding: '18px 24px'
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: c.textSub, marginBottom: 2 }}>Candidate Doubts &amp; Queries</h3>
                    <p style={{ fontSize: 11, color: c.textMuted }}>Review and respond to candidate questions submitted for this batch.</p>
                  </div>

                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', gap: 4, background: c.tabBg, borderRadius: 10, padding: 3, border: `1px solid ${c.border}` }}>
                    {[
                      { id: 'all', label: 'All Doubts' },
                      { id: 'Pending', label: 'Pending Response' },
                      { id: 'Answered', label: 'Answered' },
                      { id: 'Resolved', label: 'Resolved' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTeacherQueryFilter(f.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: teacherQueryFilter === f.id ? 700 : 500,
                          background: teacherQueryFilter === f.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                          color: teacherQueryFilter === f.id ? '#a78bfa' : c.textMuted,
                          transition: 'all 0.2s'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queries List */}
                {teacherQueriesLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: c.textMuted, fontSize: 13, gap: 10 }}>
                    <Spin color="#8b5cf6" /> Loading candidate queries...
                  </div>
                ) : teacherQueries.filter(q => teacherQueryFilter === 'all' || q.status === teacherQueryFilter).length === 0 ? (
                  <Empty
                    icon={HelpCircle}
                    title="No queries found"
                    sub={teacherQueryFilter === 'all' ? 'No candidate doubts have been submitted for this batch yet.' : `No ${teacherQueryFilter.toLowerCase()} queries found.`}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {teacherQueries
                      .filter(q => teacherQueryFilter === 'all' || q.status === teacherQueryFilter)
                      .map(q => {
                        const isExpanded = expandedTeacherQueryId === q._id;
                        const badge = q.status === 'Pending' ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: 'Pending Response' }
                          : q.status === 'In Progress' ? { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6', label: 'In Progress' }
                          : q.status === 'Answered' ? { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: 'Answered' }
                          : { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', color: '#a855f7', label: 'Resolved' };

                        const prioColor = q.priority === 'High' ? '#ef4444' : q.priority === 'Medium' ? '#f59e0b' : '#94a3b8';

                        return (
                          <div key={q._id} style={{
                            background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16,
                            padding: '18px 20px', transition: 'all 0.2s', borderLeft: `4px solid ${badge.color}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                    background: 'rgba(139,92,246,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4
                                  }}>
                                    <Tag size={10} /> {q.topicTitle || 'General Course Doubt'}
                                  </span>
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                    background: `${prioColor}15`, color: prioColor
                                  }}>
                                    {q.priority} Priority
                                  </span>
                                </div>

                                <h4 style={{ fontSize: 14, fontWeight: 800, color: c.textSub, marginBottom: 4 }}>{q.title}</h4>

                                <div style={{ fontSize: 11, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                  <span>Candidate: <strong style={{ color: c.textSub }}>{q.studentName}</strong> ({q.studentEmail})</span>
                                  <span>Asked: {fmt(q.createdAt)}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                {/* Status Dropdown */}
                                <select
                                  value={q.status}
                                  onChange={e => handleTeacherStatusChange(q._id, e.target.value)}
                                  style={{
                                    padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800,
                                    background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
                                    outline: 'none', cursor: 'pointer'
                                  }}
                                >
                                  <option value="Pending" style={{ color: '#000' }}>Pending</option>
                                  <option value="In Progress" style={{ color: '#000' }}>In Progress</option>
                                  <option value="Answered" style={{ color: '#000' }}>Answered</option>
                                  <option value="Resolved" style={{ color: '#000' }}>Resolved</option>
                                </select>

                                <button
                                  onClick={() => setExpandedTeacherQueryId(isExpanded ? null : q._id)}
                                  style={{
                                    padding: '6px 12px', borderRadius: 8, border: `1px solid ${c.border}`,
                                    background: c.statBg, color: c.text, fontSize: 11, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  {q.replies?.length || 0} message{q.replies?.length !== 1 ? 's' : ''}
                                </button>
                              </div>
                            </div>

                            <p style={{ fontSize: 12, color: c.text, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 12, background: dark ? 'rgba(255,255,255,0.015)' : '#f9fafb', padding: '10px 12px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                              {q.description}
                            </p>

                            {/* Expanded Thread & Expert Reply View */}
                            {isExpanded && (
                              <div style={{
                                marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.border}`,
                                display: 'flex', flexDirection: 'column', gap: 12
                              }}>
                                <h5 style={{ fontSize: 11, fontWeight: 800, color: c.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Conversation Thread ({q.replies?.length || 0})
                                </h5>

                                {(!q.replies || q.replies.length === 0) ? (
                                  <div style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic', padding: '4px 0' }}>
                                    No replies yet. Type your answer below to assist this candidate.
                                  </div>
                                ) : (
                                  q.replies.map((rep, idx) => {
                                    const isExpert = ['Teacher', 'Admin', 'Staff'].includes(rep.senderRole);
                                    return (
                                      <div key={idx} style={{
                                        padding: '12px 14px', borderRadius: 12,
                                        background: isExpert ? dark ? 'rgba(139,92,246,0.08)' : '#f5f3ff' : c.statBg,
                                        border: `1px solid ${isExpert ? 'rgba(139,92,246,0.2)' : c.border}`,
                                        alignSelf: isExpert ? 'flex-end' : 'flex-start',
                                        maxWidth: '92%'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                                          <strong style={{ fontSize: 12, color: isExpert ? '#a78bfa' : c.textSub }}>
                                            {rep.senderName} {isExpert ? ' (You / Expert)' : ' (Candidate)'}
                                          </strong>
                                          <span style={{ fontSize: 9, color: c.textMuted }}>{fmt(rep.createdAt)}</span>
                                        </div>
                                        <p style={{ fontSize: 12, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-line', margin: 0 }}>
                                          {rep.message}
                                        </p>
                                      </div>
                                    );
                                  })
                                )}

                                {/* Expert Reply Input */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                  <input
                                    type="text"
                                    value={teacherReplyText[q._id] || ''}
                                    onChange={e => setTeacherReplyText({ ...teacherReplyText, [q._id]: e.target.value })}
                                    onKeyDown={e => { if (e.key === 'Enter') handleTeacherReply(q._id); }}
                                    placeholder="Type expert response / explanation..."
                                    style={{
                                      flex: 1, padding: '10px 14px', borderRadius: 10,
                                      background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                                      color: c.text, fontSize: 12, outline: 'none'
                                    }}
                                  />
                                  <button
                                    onClick={() => handleTeacherReply(q._id)}
                                    disabled={teacherReplySubmitting[q._id] || !teacherReplyText[q._id]?.trim()}
                                    style={{
                                      padding: '10px 18px', borderRadius: 10, border: 'none',
                                      background: teacherReplyText[q._id]?.trim() ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : c.border,
                                      color: teacherReplyText[q._id]?.trim() ? '#fff' : c.textMuted,
                                      fontSize: 12, fontWeight: 700, cursor: teacherReplyText[q._id]?.trim() ? 'pointer' : 'not-allowed',
                                      display: 'flex', alignItems: 'center', gap: 6,
                                      boxShadow: teacherReplyText[q._id]?.trim() ? '0 4px 14px rgba(139,92,246,0.3)' : 'none'
                                    }}
                                  >
                                    {teacherReplySubmitting[q._id] ? <Spin /> : <><Send size={13} /> Answer Doubt</>}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* ── ASSIGNMENTS MANAGEMENT TAB (EXPERT VIEW) ── */}
            {activeTab === 'assignments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header & Create Action */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  background: c.cardBg, border: `1px solid ${c.borderPurple}`, borderRadius: 20, padding: '18px 24px'
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: c.textSub, marginBottom: 2 }}>Course Assignments &amp; Evaluation</h3>
                    <p style={{ fontSize: 11, color: c.textMuted }}>Create assignments, set deadlines, and evaluate candidate submissions.</p>
                  </div>

                  <button
                    onClick={() => {
                      setAssignmentError(''); setAssignmentSuccess('');
                      setAssignmentFormData({ title: '', description: '', dueDate: '', totalPoints: 100, fileUrl: '' });
                      setIsCreateAssignmentOpen(true);
                    }}
                    style={{
                      padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                      fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(139,92,246,0.35)', transition: 'all 0.2s'
                    }}
                  >
                    <Plus size={15} /> Create New Assignment
                  </button>
                </div>

                {/* Assignments List */}
                {assignmentsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: c.textMuted, fontSize: 13, gap: 10 }}>
                    <Spin color="#8b5cf6" /> Loading assignments...
                  </div>
                ) : assignments.length === 0 ? (
                  <Empty
                    icon={ClipboardList}
                    title="No assignments created yet"
                    sub="Click 'Create New Assignment' above to assign tasks and homework to candidates in this batch."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {assignments.map(asg => {
                      const isExpanded = expandedAssignmentId === asg._id;
                      const totalSubs = asg.submissions?.length || 0;
                      const gradedSubs = asg.submissions?.filter(s => s.status === 'Graded').length || 0;
                      const isOverdue = new Date(asg.dueDate) < new Date();

                      return (
                        <div key={asg._id} style={{
                          background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16,
                          padding: '20px', transition: 'all 0.2s', borderLeft: '4px solid #8b5cf6'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 220 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                  background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                  color: isOverdue ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                  <Calendar size={10} /> Due: {fmt(asg.dueDate)}
                                </span>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                  background: 'rgba(139,92,246,0.1)', color: '#a78bfa'
                                }}>
                                  Max Score: {asg.totalPoints} pts
                                </span>
                              </div>

                              <h4 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, marginBottom: 4 }}>{asg.title}</h4>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <button
                                onClick={() => setExpandedAssignmentId(isExpanded ? null : asg._id)}
                                style={{
                                  padding: '7px 14px', borderRadius: 8, border: `1px solid ${c.border}`,
                                  background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontSize: 11, fontWeight: 700,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                                }}
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {totalSubs} Submissions ({gradedSubs} Graded)
                              </button>

                              <button
                                onClick={() => handleDeleteAssignment(asg._id)}
                                title="Delete Assignment"
                                style={{
                                  padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                                  background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <p style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 10 }}>
                            {asg.description}
                          </p>

                          {asg.fileUrl && (
                            <a
                              href={asg.fileUrl} target="_blank" rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10b981',
                                fontWeight: 700, textDecoration: 'none', marginBottom: 8
                              }}
                            >
                              <FileText size={12} /> View Reference Attachment / Guidelines
                            </a>
                          )}

                          {/* Submissions Evaluation Panel */}
                          {isExpanded && (
                            <div style={{
                              marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.border}`,
                              display: 'flex', flexDirection: 'column', gap: 14
                            }}>
                              <h5 style={{ fontSize: 12, fontWeight: 800, color: c.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Candidate Submissions &amp; Grading ({totalSubs})
                              </h5>

                              {totalSubs === 0 ? (
                                <div style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic', padding: '8px 0' }}>
                                  No candidates have submitted solutions for this assignment yet.
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {asg.submissions.map(sub => {
                                    const isGraded = sub.status === 'Graded';
                                    const currentGrade = gradeData[sub._id]?.grade !== undefined
                                      ? gradeData[sub._id].grade
                                      : sub.grade !== null ? sub.grade : '';
                                    const currentFeedback = gradeData[sub._id]?.feedback !== undefined
                                      ? gradeData[sub._id].feedback
                                      : sub.feedback || '';

                                    return (
                                      <div key={sub._id} style={{
                                        padding: '14px 16px', borderRadius: 12,
                                        background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
                                        border: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: 10
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                          <div>
                                            <strong style={{ fontSize: 13, color: c.textSub }}>{sub.studentName}</strong>
                                            <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 8 }}>({sub.studentEmail})</span>
                                          </div>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 10, color: c.textMuted }}>
                                              Submitted: {fmt(sub.submittedAt)}
                                            </span>
                                            <span style={{
                                              padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 800,
                                              background: isGraded ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                              color: isGraded ? '#10b981' : '#f59e0b', border: `1px solid ${isGraded ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                                            }}>
                                              {isGraded ? `Graded: ${sub.grade}/${asg.totalPoints}` : 'Needs Grading'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Candidate Solution Text & Link */}
                                        {sub.answerText && (
                                          <div style={{ fontSize: 12, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-line', background: c.inputBg, padding: '10px 12px', borderRadius: 8 }}>
                                            <strong>Written Answer:</strong> {sub.answerText}
                                          </div>
                                        )}

                                        {sub.submissionUrl && (
                                          <div>
                                            <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{
                                              fontSize: 11, color: '#8b5cf6', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4
                                            }}>
                                              🔗 View Submitted Project / Repository Link
                                            </a>
                                          </div>
                                        )}

                                        {/* Grading Controls */}
                                        <div style={{
                                          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4,
                                          background: dark ? 'rgba(139,92,246,0.04)' : '#f5f3ff', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.15)'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: c.textSub }}>Grade Score:</label>
                                            <input
                                              type="number"
                                              min={0}
                                              max={asg.totalPoints}
                                              placeholder={`0 - ${asg.totalPoints}`}
                                              value={currentGrade}
                                              onChange={e => setGradeData({
                                                ...gradeData,
                                                [sub._id]: { ...gradeData[sub._id], grade: e.target.value, feedback: currentFeedback }
                                              })}
                                              style={{
                                                width: 70, padding: '6px 8px', borderRadius: 6,
                                                background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                                                color: c.text, fontSize: 12, outline: 'none'
                                              }}
                                            />
                                            <span style={{ fontSize: 11, color: c.textMuted }}>/ {asg.totalPoints}</span>
                                          </div>

                                          <div style={{ flex: 1, minWidth: 200 }}>
                                            <input
                                              type="text"
                                              placeholder="Enter expert feedback / notes..."
                                              value={currentFeedback}
                                              onChange={e => setGradeData({
                                                ...gradeData,
                                                [sub._id]: { ...gradeData[sub._id], grade: currentGrade, feedback: e.target.value }
                                              })}
                                              style={{
                                                width: '100%', padding: '6px 10px', borderRadius: 6,
                                                background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                                                color: c.text, fontSize: 12, outline: 'none'
                                              }}
                                            />
                                          </div>

                                          <button
                                            onClick={() => handleGradeSubmission(asg._id, sub._id)}
                                            disabled={gradingSubmitting[sub._id]}
                                            style={{
                                              padding: '6px 14px', borderRadius: 8, border: 'none',
                                              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                                              fontSize: 11, fontWeight: 700, cursor: gradingSubmitting[sub._id] ? 'not-allowed' : 'pointer',
                                              display: 'flex', alignItems: 'center', gap: 4
                                            }}
                                          >
                                            {gradingSubmitting[sub._id] ? <Spin /> : <><Check size={12} /> Save Grade</>}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}




          </>) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              Failed to load batch data.
            </div>
          )}
        </main>
      </div>

      {/* ── RESOURCE MODAL ── */}
      {isModalOpen && modalConfig[modalType] && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderPurple}`, borderRadius: 20,
            width: '100%', maxWidth: modalType === 'curriculum' ? 560 : 460,
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 2, background: 'linear-gradient(90deg,transparent,#8b5cf6,transparent)' }} />

            <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {React.createElement(modalConfig[modalType].icon, { size: 16, color: '#a78bfa' })}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.textSub }}>{modalConfig[modalType].title}</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: '20px 28px 24px', overflowY: 'auto' }}>
              {formError && <div style={{ marginBottom: 16 }}><FormAlert msg={formError} type="error" /></div>}
              {formSuccess && <div style={{ marginBottom: 16 }}><FormAlert msg={formSuccess} type="success" /></div>}

              {/* LINK FORM */}
              {modalType === 'link' && (
                <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Link Title</label>
                    <input type="text" required value={linkData.title} onChange={e => setLinkData({ ...linkData, title: e.target.value })} placeholder="e.g. GitHub Repo, Documentation" style={{...inputStyle, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text}} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>URL</label>
                    <input type="url" required value={linkData.url} onChange={e => setLinkData({ ...linkData, url: e.target.value })} placeholder="https://example.com" style={{...inputStyle, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text}} />
                  </div>
                  <ModalBtns onCancel={() => setIsModalOpen(false)} submitting={formSubmitting} label={modalConfig[modalType].action} />
                </form>
              )}

              {/* NOTIFICATION FORM */}
              {modalType === 'notification' && (
                <form onSubmit={handleAddNotification} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#a78bfa'
                  }}>
                    <Bell size={14} color="#a78bfa" />
                    <span><strong>Firebase Push Notification:</strong> Will be broadcasted instantly to all candidates in this batch.</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Announcement Title</label>
                    <input type="text" required value={notifData.title} onChange={e => setNotifData({ ...notifData, title: e.target.value })} placeholder="e.g. Test Scheduled, Class Update" style={{...inputStyle, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text}} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Message</label>
                    <textarea required value={notifData.message} onChange={e => setNotifData({ ...notifData, message: e.target.value })} placeholder="Write your announcement..." rows={4} style={{ ...inputStyle, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, resize: 'none', lineHeight: 1.6 }} />
                  </div>
                  <ModalBtns onCancel={() => setIsModalOpen(false)} submitting={formSubmitting} label="Broadcast Announcement" />
                </form>
              )}

              {/* PDF FORM */}
              {modalType === 'pdf' && (
                <form onSubmit={handleUploadPdf} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>PDF Title</label>
                    <input type="text" required value={pdfData.title} onChange={e => setPdfData({ ...pdfData, title: e.target.value })} placeholder="e.g. React Cheatsheet, Module 3 Notes" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description (Optional)</label>
                    <input type="text" value={pdfData.description} onChange={e => setPdfData({ ...pdfData, description: e.target.value })} placeholder="Brief description of the content..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Select PDF File *</label>
                    <div style={{
                      border: '1.5px dashed rgba(139,92,246,0.25)', borderRadius: 12, padding: '20px',
                      textAlign: 'center', background: 'rgba(139,92,246,0.04)', cursor: 'pointer'
                    }}>
                      <Upload size={20} color="#8b5cf6" style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{pdfData.file ? pdfData.file.name : 'Click or drag PDF here'}</p>
                      <input type="file" required accept=".pdf" onChange={e => setPdfData({ ...pdfData, file: e.target.files[0] })} style={{ display: 'block', width: '100%', fontSize: 11, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} />
                    </div>
                  </div>
                  <ModalBtns onCancel={() => setIsModalOpen(false)} submitting={formSubmitting} label={modalConfig[modalType].action} />
                </form>
              )}

              {/* CURRICULUM FORM */}
              {modalType === 'curriculum' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Mode toggle */}
                  <div style={{ display: 'flex', background: dark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', borderRadius: 10, padding: 3, gap: 3 }}>
                    {[{ id: true, label: '{ } JSON Upload' }, { id: false, label: '✏️ Manual Entry' }].map(m => (
                      <button key={String(m.id)} onClick={() => { setCurrJsonMode(m.id); setCurrError(''); setCurrJsonError(''); setCurrSuccess(''); }} style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                        background: currJsonMode === m.id ? (dark ? 'rgba(139,92,246,0.2)' : '#ffffff') : 'transparent',
                        color: currJsonMode === m.id ? '#a78bfa' : c.textMuted,
                        boxShadow: currJsonMode === m.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                      }}>{m.label}</button>
                    ))}
                  </div>

                  {currError && <FormAlert msg={currError} type="error" />}
                  {currSuccess && <FormAlert msg={currSuccess} type="success" />}

                  {currJsonMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Format guide */}
                      <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>📋 Required JSON Format</div>
                        <pre style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', overflowX: 'auto', lineHeight: 1.6, margin: 0, fontFamily: 'monospace' }}>{SAMPLE_JSON}</pre>
                        <button onClick={() => setCurrJsonText(SAMPLE_JSON)} style={{
                          marginTop: 10, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(139,92,246,0.25)',
                          background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                        }}>Load Sample</button>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Paste JSON *</label>
                        <textarea
                          value={currJsonText}
                          onChange={e => { setCurrJsonText(e.target.value); setCurrJsonError(''); }}
                          placeholder={SAMPLE_JSON}
                          rows={10}
                          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}
                        />
                        {currJsonError && <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{currJsonError}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{
                          flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${c.border}`,
                          background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}>Cancel</button>
                        <button onClick={handleUploadCurriculumJson} disabled={currSubmitting || !currJsonText.trim()} style={{
                          flex: 2, padding: '11px', borderRadius: 10, border: 'none',
                          cursor: currSubmitting ? 'not-allowed' : 'pointer',
                          background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                          fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: '0 4px 16px rgba(139,92,246,0.3)', opacity: currSubmitting ? 0.7 : 1
                        }}>
                          {currSubmitting ? <><Spin /> Uploading...</> : <><Upload size={13} /> Upload Curriculum</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Topic Title *</label>
                        <input type="text" value={currManual.title} onChange={e => setCurrManual(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to React" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description</label>
                        <input type="text" value={currManual.description} onChange={e => setCurrManual(p => ({ ...p, description: e.target.value }))} placeholder="Brief overview of this topic..." style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Subtopics (one per line)</label>
                        <textarea
                          value={currManual.subtopics}
                          onChange={e => setCurrManual(p => ({ ...p, subtopics: e.target.value }))}
                          placeholder={'JSX Syntax\nFunctional Components\nProps & State'}
                          rows={4}
                          style={{ ...inputStyle, resize: 'none', lineHeight: 1.6, fontFamily: 'monospace', fontSize: 12 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{
                          flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${c.border}`,
                          background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}>Cancel</button>
                        <button onClick={handleAddManualTopic} disabled={currSubmitting || !currManual.title.trim()} style={{
                          flex: 2, padding: '11px', borderRadius: 10, border: 'none',
                          cursor: currSubmitting ? 'not-allowed' : 'pointer',
                          background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                          fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: '0 4px 16px rgba(139,92,246,0.3)', opacity: currSubmitting ? 0.7 : 1
                        }}>
                          {currSubmitting ? <><Spin /> Adding...</> : <><Plus size={13} /> Add Topic</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT TOPIC MODAL ── */}
      {editModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderPurple}`, borderRadius: 20,
            width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden', position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 2, background: 'linear-gradient(90deg,transparent,#60a5fa,transparent)' }} />
            <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Edit2 size={16} color="#60a5fa" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.textSub }}>Edit Topic</div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Modify topic details</div>
              </div>
              <button onClick={() => setEditModal(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleEditTopic} style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {editError && <FormAlert msg={editError} type="error" />}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Topic Title *</label>
                <input type="text" required value={editData.title} onChange={e => setEditData(p => ({ ...p, title: e.target.value }))} placeholder="Topic title..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description</label>
                <input type="text" value={editData.description} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Subtopics (one per line)</label>
                <textarea value={editData.subtopics} onChange={e => setEditData(p => ({ ...p, subtopics: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6, fontFamily: 'monospace', fontSize: 12 }} />
              </div>
              <ModalBtns onCancel={() => setEditModal(null)} submitting={editSubmitting} label="Save Changes" />
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE ASSIGNMENT MODAL ── */}
      {isCreateAssignmentOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderPurple}`, borderRadius: 20,
            width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden', position: 'relative'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ClipboardList size={18} color="#a78bfa" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: c.textSub, margin: 0 }}>Create Batch Assignment</h3>
                  <span style={{ fontSize: 11, color: c.textMuted }}>Assign homework or project tasks to candidates</span>
                </div>
              </div>
              <button onClick={() => setIsCreateAssignmentOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {assignmentError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12 }}>
                  <AlertCircle size={14} />{assignmentError}
                </div>
              )}
              {assignmentSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12 }}>
                  ✓ {assignmentSuccess}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Build a Responsive Portfolio Project"
                  value={assignmentFormData.title}
                  onChange={e => setAssignmentFormData({ ...assignmentFormData, title: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Due Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={assignmentFormData.dueDate}
                    onChange={e => setAssignmentFormData({ ...assignmentFormData, dueDate: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                      color: c.text, fontSize: 13, outline: 'none'
                    }}
                  />
                </div>

                <div style={{ width: 120 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Max Points</label>
                  <input
                    type="number"
                    min={1}
                    value={assignmentFormData.totalPoints}
                    onChange={e => setAssignmentFormData({ ...assignmentFormData, totalPoints: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                      color: c.text, fontSize: 13, outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Instructions &amp; Requirements</label>
                <textarea
                  rows={4}
                  placeholder="Specify assignment criteria, deliverables, and submission guidelines..."
                  value={assignmentFormData.description}
                  onChange={e => setAssignmentFormData({ ...assignmentFormData, description: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Optional Attachment / File Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={assignmentFormData.fileUrl}
                  onChange={e => setAssignmentFormData({ ...assignmentFormData, fileUrl: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateAssignmentOpen(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${c.border}`,
                    background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignmentSubmitting}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: assignmentSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(139,92,246,0.3)', opacity: assignmentSubmitting ? 0.7 : 1
                  }}
                >
                  {assignmentSubmitting ? <Spin /> : <><Plus size={14} /> Assign Task</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DIRECT PUSH NOTIFICATION MODAL (Expert → Specific Candidate) ── */}
      {directPushModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 120,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderPurple}`, borderRadius: 20,
            width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bell size={18} color="#a78bfa" />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: c.textSub, margin: 0 }}>Direct Push Notification</h3>
                  <span style={{ fontSize: 11, color: c.textMuted }}>To: <strong style={{ color: '#a78bfa' }}>{directPushModal.studentName}</strong></span>
                </div>
              </div>
              <button onClick={() => setDirectPushModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendDirectPush} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {directPushResult && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
                  background: directPushResult.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${directPushResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: directPushResult.success ? '#10b981' : '#f87171', fontSize: 12
                }}>
                  {directPushResult.success ? '✓' : <AlertCircle size={14} />} {directPushResult.message}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Please attend tomorrow's special class"
                  value={directPushForm.title}
                  onChange={e => setDirectPushForm({ ...directPushForm, title: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your message to this candidate..."
                  value={directPushForm.message}
                  onChange={e => setDirectPushForm({ ...directPushForm, message: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setDirectPushModal(null)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${c.border}`,
                    background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={directPushSubmitting || !directPushForm.title.trim() || !directPushForm.message.trim()}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                    fontSize: 12, fontWeight: 700,
                    cursor: directPushSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                    opacity: (directPushSubmitting || !directPushForm.title.trim() || !directPushForm.message.trim()) ? 0.6 : 1
                  }}
                >
                  {directPushSubmitting ? <Spin /> : <><Bell size={14} /> Send Push Notification</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── BULK CANDIDATE REGISTRATION VIA EXCEL MODAL ── */}
      {isBulkModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 115,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: dark ? '#161922' : '#ffffff',
            border: `1px solid ${c.border}`, borderRadius: 20,
            width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Upload size={18} color="#8b5cf6" />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, margin: 0 }}>Bulk Register Candidates via Excel</h3>
                  <div style={{ fontSize: 11, color: c.textMuted }}>Auto-enroll candidates into "{batchDetails?.name}" & generate credentials</div>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header Info Pill */}
              <div style={{
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 12, padding: '12px 16px', fontSize: 12, color: c.textSub, lineHeight: 1.6
              }}>
                <strong>Supported Excel Headers:</strong>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#a78bfa', marginTop: 4 }}>
                  FullName | DateOfBirth | Gender | Email | PhoneNumber | PermanentAddress | WorkingState | Branch/Department | YearOfStudy | TrainingTechnology | PaymentTerm
                </div>
              </div>

              {/* Sample Template Download */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.surfaceHov, padding: '10px 16px', borderRadius: 12, border: `1px solid ${c.border}` }}>
                <span style={{ fontSize: 12, color: c.textMuted }}>Need a sample file format?</span>
                <button
                  type="button"
                  onClick={handleDownloadSampleExcel}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardBg,
                    color: '#8b5cf6', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  <Download size={13} /> Download Sample Template
                </button>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleBulkRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bulkError && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={15} /> {bulkError}
                  </div>
                )}

                <div style={{
                  border: `2px dashed ${bulkFile ? '#8b5cf6' : c.border}`, borderRadius: 16,
                  padding: 24, textAlign: 'center', background: bulkFile ? 'rgba(139,92,246,0.05)' : c.surfaceHov,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => setBulkFile(e.target.files[0])}
                    id="excelFileInput"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="excelFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Upload size={32} color={bulkFile ? '#8b5cf6' : c.textMuted} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.textSub }}>
                      {bulkFile ? bulkFile.name : 'Click to select Excel (.xlsx, .xls) or CSV file'}
                    </div>
                    <div style={{ fontSize: 11, color: c.textMuted }}>
                      {bulkFile ? `${(bulkFile.size / 1024).toFixed(1)} KB` : 'Maximum file size: 10MB'}
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    style={{
                      padding: '10px 18px', borderRadius: 10, border: `1px solid ${c.border}`,
                      background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkSubmitting || !bulkFile}
                    style={{
                      padding: '10px 22px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
                      fontSize: 12, fontWeight: 700, cursor: (bulkSubmitting || !bulkFile) ? 'not-allowed' : 'pointer',
                      opacity: (bulkSubmitting || !bulkFile) ? 0.6 : 1,
                      boxShadow: '0 4px 14px rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', gap: 8
                    }}
                  >
                    {bulkSubmitting ? <><Spin /> Registering & Sending Emails...</> : '🚀 Upload & Register Candidates'}
                  </button>
                </div>
              </form>

              {/* Bulk Registration Results Display */}
              {bulkResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                      <CheckCircle2 size={16} />
                      <span>{bulkResult.message}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadCredentialsCsv(bulkResult.candidates)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                        borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)',
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <Download size={13} /> Download Candidates Credentials CSV
                    </button>
                  </div>

                  {/* Registered Candidates Credentials Table */}
                  <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: c.tableBg, borderBottom: `1px solid ${c.border}` }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: c.textMuted }}>Name</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: c.textMuted }}>Email</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: c.textMuted }}>Username</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: c.textMuted }}>Password</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: c.textMuted }}>SMTP Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResult.candidates.map((cand, idx) => (
                          <tr key={idx} style={{ borderBottom: `1px solid ${c.border}` }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: c.textSub }}>{cand.fullName}</td>
                            <td style={{ padding: '8px 12px', color: c.textMuted }}>{cand.email}</td>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#8b5cf6', fontWeight: 700 }}>{cand.username}</td>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>{cand.password}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                background: cand.emailSent ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                color: cand.emailSent ? '#10b981' : '#f59e0b'
                              }}>
                                {cand.emailSent ? 'Sent ✓' : 'Skipped'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── CANDIDATE INFO MODAL ── */}
      {infoStudentModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 120,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: dark ? '#161922' : '#ffffff',
            border: `1px solid ${c.border}`, borderRadius: 20,
            width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Eye size={18} color="#3b82f6" />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, margin: 0 }}>Candidate Profile &amp; Information</h3>
                  <div style={{ fontSize: 11, color: c.textMuted }}>Full details for {infoStudentModal.name}</div>
                </div>
              </div>
              <button
                onClick={() => setInfoStudentModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {infoStudentModal.loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: c.textMuted }}><Spin /> Loading candidate information...</div>
              ) : (
                <>
                  {/* Avatar & Key Creds Card */}
                  <div style={{
                    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {infoStudentModal.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c.textSub }}>{infoStudentModal.user?.name}</div>
                      <div style={{ fontSize: 12, color: c.textMuted }}>{infoStudentModal.user?.email}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#a78bfa', fontWeight: 700, background: 'rgba(139,92,246,0.15)', padding: '3px 8px', borderRadius: 6 }}>
                        User: {infoStudentModal.user?.username || 'N/A'}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '3px 8px', borderRadius: 6 }}>
                        Pass: {infoStudentModal.user?.generatedPassword || 'Pass@1234'}
                      </span>
                    </div>
                  </div>

                  {/* Info Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <div style={{ background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Mobile Phone</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, marginTop: 2 }}>{infoStudentModal.user?.mobile || infoStudentModal.profile?.phone || 'N/A'}</div>
                    </div>

                    <div style={{ background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Gender</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, marginTop: 2 }}>{infoStudentModal.user?.gender || infoStudentModal.profile?.gender || 'N/A'}</div>
                    </div>

                    <div style={{ background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Date of Birth</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, marginTop: 2 }}>{(infoStudentModal.user?.dob || infoStudentModal.profile?.dob) ? fmt(infoStudentModal.user?.dob || infoStudentModal.profile?.dob) : 'N/A'}</div>
                    </div>

                    <div style={{ background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Working State</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, marginTop: 2 }}>{infoStudentModal.user?.state || infoStudentModal.profile?.state || 'N/A'}</div>
                    </div>

                    <div style={{ background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Branch / Department</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, marginTop: 2 }}>{infoStudentModal.user?.branch || infoStudentModal.profile?.branchDepartment || infoStudentModal.profile?.branch || 'N/A'}</div>
                    </div>

                    <div style={{ background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Year of Study</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub, marginTop: 2 }}>{infoStudentModal.user?.year || infoStudentModal.profile?.year || 'N/A'}</div>
                    </div>

                    <div style={{ gridColumn: 'span 2', background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Training Technology</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginTop: 2 }}>{infoStudentModal.user?.technology || infoStudentModal.profile?.trainingType || 'N/A'}</div>
                    </div>

                    <div style={{ gridColumn: 'span 2', background: c.surfaceHov, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase' }}>Permanent Address</div>
                      <div style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>{infoStudentModal.user?.address || infoStudentModal.profile?.address || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      onClick={() => setInfoStudentModal(null)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        const std = infoStudentModal.user;
                        setInfoStudentModal(null);
                        openStudentEditModal(std);
                      }}
                      style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Edit2 size={13} /> Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT CANDIDATE MODAL ── */}
      {editStudentModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 125,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: dark ? '#161922' : '#ffffff',
            border: `1px solid ${c.border}`, borderRadius: 20,
            width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Edit2 size={18} color="#f59e0b" />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, margin: 0 }}>Edit Candidate Details</h3>
                  <div style={{ fontSize: 11, color: c.textMuted }}>Update information for {editStudentModal.name}</div>
                </div>
              </div>
              <button
                onClick={() => setEditStudentModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudentSubmit} style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {editStudentError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={15} /> {editStudentError}
                </div>
              )}
              {editStudentSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={15} /> {editStudentSuccess}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentModal.name}
                    onChange={e => setEditStudentModal({ ...editStudentModal, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editStudentModal.email}
                    onChange={e => setEditStudentModal({ ...editStudentModal, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Username *</label>
                  <input
                    type="text"
                    required
                    value={editStudentModal.username}
                    onChange={e => setEditStudentModal({ ...editStudentModal, username: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Password (Plain Text) *</label>
                  <input
                    type="text"
                    required
                    value={editStudentModal.password}
                    onChange={e => setEditStudentModal({ ...editStudentModal, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: '#10b981', fontWeight: 700, fontSize: 12, outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Mobile Number</label>
                  <input
                    type="text"
                    value={editStudentModal.mobile}
                    onChange={e => setEditStudentModal({ ...editStudentModal, mobile: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Gender</label>
                  <select
                    value={editStudentModal.gender}
                    onChange={e => setEditStudentModal({ ...editStudentModal, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Working State</label>
                  <input
                    type="text"
                    value={editStudentModal.state}
                    onChange={e => setEditStudentModal({ ...editStudentModal, state: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Branch / Department</label>
                  <input
                    type="text"
                    value={editStudentModal.branch}
                    onChange={e => setEditStudentModal({ ...editStudentModal, branch: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Year of Study</label>
                  <input
                    type="text"
                    value={editStudentModal.year}
                    onChange={e => setEditStudentModal({ ...editStudentModal, year: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Training Technology</label>
                  <input
                    type="text"
                    value={editStudentModal.technology}
                    onChange={e => setEditStudentModal({ ...editStudentModal, technology: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Permanent Address</label>
                  <textarea
                    rows={2}
                    value={editStudentModal.address}
                    onChange={e => setEditStudentModal({ ...editStudentModal, address: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditStudentModal(null)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStudentSubmitting}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: editStudentSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, opacity: editStudentSubmitting ? 0.7 : 1
                  }}
                >
                  {editStudentSubmitting ? <><Spin /> Saving...</> : 'Save Candidate Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalBtns = ({ onCancel, submitting, label }) => (
  <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
    <button type="button" onClick={onCancel} style={{
      flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
      background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
    }}>Cancel</button>
    <button type="submit" disabled={submitting} style={{
      flex: 2, padding: '11px', borderRadius: 10, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
      background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', fontSize: 12, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: '0 4px 16px rgba(139,92,246,0.3)', opacity: submitting ? 0.7 : 1
    }}>
      {submitting ? <><Spin /> Saving...</> : label}
    </button>
  </div>
);

export default TeacherDashboard;
