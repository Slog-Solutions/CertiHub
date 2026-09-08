import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, LogOut, Users, Plus, Bell, FileText, Link2,
  Download, Trash2, Calendar, User, X,
  AlertCircle, PlusCircle, CheckCircle2, ChevronRight,
  Layers, Sparkles, Upload,
  ListChecks, Edit2, Check, RotateCcw, ChevronDown, ChevronUp,
  ClipboardList, Trash, Star, MessageSquare, HelpCircle, Tag, Send,
  Eye, BarChart2, TrendingUp, TrendingDown, LayoutDashboard, Globe, Settings, Package, ShoppingBag, Shield
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   MENTORI DESIGN SYSTEM — Responsive & Fully Interactive
───────────────────────────────────────────────────────── */
const FONT = "'Noto Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const C = {
  primary: '#6366F1',        // Mentori Indigo Accent
  primaryDark: '#4F46E5',
  primarySoft: '#EEF2FF',
  darkNav: '#1E1B4B',         // Dark Indigo for Active Nav & Footer Card
  darkNavHover: '#312E81',
  ink: '#0F172A',             // Dark Slate Headers
  body: '#1E293B',            // Dark Slate Body Text
  muted: '#334155',           // Crisp High-Contrast Subtitles & Headings
  border: 'rgba(15,23,42,0.08)',
  borderSoft: 'rgba(15,23,42,0.04)',
  bg: '#FFFFFF',
  page: '#F8FAFC',            // Clean off-white background
  
  // Action Pill & Badge Palette
  purple: '#8B5CF6', purpleSoft: '#F5F3FF', purpleText: '#6D28D9',
  orange: '#F97316', orangeSoft: '#FFF7ED', orangeText: '#C2410C',
  blue: '#3B82F6', blueSoft: '#EFF6FF', blueText: '#1D4ED8',
  red: '#EF4444', redSoft: '#FEF2F2', redText: '#B91C1C',
  teal: '#14B8A6', tealSoft: '#F0FDFA', tealText: '#0F766E',
  green: '#22C55E', greenSoft: '#F0FDF4', greenText: '#15803D',
  
  // Medals
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#D97706',

  // Shadows
  shadow: '0 1px 3px rgba(15,23,42,0.03), 0 4px 16px rgba(15,23,42,0.04)',
  shadowMd: '0 4px 20px rgba(15,23,42,0.06)',
  shadowLg: '0 12px 40px rgba(15,23,42,0.08)'
};

const RADIUS = { sm: 10, md: 16, lg: 24, pill: 999 };

/* ─────────────────────────────────────────────────────────
   SHARED UI PRIMITIVES
───────────────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px);} to { opacity:1; transform:translateY(0);} }
    @keyframes slideUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
    .animate-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    button, input, select, textarea { font-family: ${FONT}; }
    ::selection { background: ${C.primarySoft}; color: ${C.primaryDark}; }
    /* Responsive Layout Styles */
    .dashboard-grid-3 {
      display: grid;
      grid-template-columns: minmax(240px, 280px) minmax(300px, 1fr) minmax(200px, 240px);
      gap: 18px;
    }
    .dashboard-grid-2 {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 18px;
    }
    @media (max-width: 1200px) {
      .dashboard-grid-3 {
        grid-template-columns: 1fr 1fr;
      }
      .dashboard-grid-2 {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 768px) {
      .dashboard-grid-3 {
        grid-template-columns: 1fr;
      }
      .sidebar-aside {
        display: none !important;
      }
    }
    /* Custom Scrollbars */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 999px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.25); }
  `}</style>
);

const Spin = ({ color = '#fff', size = 15 }) => (
  <svg className="animate-spin" style={{ width: size, height: size, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
    <path style={{ opacity: 0.75 }} fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Pill = ({ children, icon: Icon, variant = 'primary', style, ...rest }) => {
  const variants = {
    primary: { background: C.primary, color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' },
    outline: { background: '#fff', color: C.ink, border: `1px solid ${C.border}` },
    ghost: { background: C.primarySoft, color: C.primaryDark },
    danger: { background: C.redSoft, color: C.redText },
    subtle: { background: '#F1F5F9', color: C.body },
    dark: { background: C.darkNav, color: '#fff' }
  };
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '8px 16px', borderRadius: RADIUS.pill, fontSize: 13, fontWeight: 600,
        border: 'none', cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.55 : 1, whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        ...variants[variant], ...style
      }}
    >
      {Icon && <Icon size={14} strokeWidth={2.2} />}{children}
    </button>
  );
};

const Card = ({ children, accent, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADIUS.md,
      padding: '20px 22px', boxShadow: C.shadow,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s ease',
      ...(accent ? { borderLeft: `4px solid ${accent}` } : {}),
      ...style
    }}
  >{children}</div>
);

const Badge = ({ children, color, bg }) => (
  <span style={{
    padding: '3px 9px', borderRadius: RADIUS.pill, fontSize: 11, fontWeight: 600,
    color, background: bg, display: 'inline-flex', alignItems: 'center', gap: 4
  }}>{children}</span>
);

const IconBadge = ({ icon: Icon, color = C.primary, bg, size = 38 }) => (
  <div style={{
    width: size, height: size, borderRadius: 12, flexShrink: 0,
    background: bg || `${color}14`, border: `1px solid ${color}20`,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}><Icon size={size * 0.44} color={color} strokeWidth={2.2} /></div>
);

const Donut = ({ pct, size = 88, stroke = 9, color = C.primary, sub }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.borderSoft} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px' }}>{pct}%</span>
        {sub && <span style={{ fontSize: 9, color: C.muted, fontWeight: 600, marginTop: 1 }}>{sub}</span>}
      </div>
    </div>
  );
};

const BarRow = ({ label, value, max, color = C.primary, valueLabel }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 100, fontSize: 12, color: C.body, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: RADIUS.pill, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: RADIUS.pill, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ width: 42, fontSize: 12, fontWeight: 700, color: C.ink, textAlign: 'right', flexShrink: 0 }}>{valueLabel ?? value}</span>
    </div>
  );
};

const Empty = ({ icon: Icon, title, sub }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '56px 24px', gap: 14, textAlign: 'center',
    background: C.bg, border: `1px dashed ${C.border}`, borderRadius: RADIUS.lg
  }}>
    <IconBadge icon={Icon} color={C.primary} size={48} />
    <div>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{title}</p>
      {sub && <p style={{ fontSize: 12.5, color: C.muted, maxWidth: 320, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  </div>
);

const FormAlert = ({ msg, type }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px',
    borderRadius: RADIUS.sm, fontSize: 13,
    background: type === 'error' ? C.redSoft : C.greenSoft,
    color: type === 'error' ? C.redText : C.greenText
  }}>
    {type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}{msg}
  </div>
);

const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 2, letterSpacing: '-0.2px' }}>{title}</h3>
      {sub && <p style={{ fontSize: 12.5, color: C.muted }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#F8FAFC',
  border: `1px solid ${C.border}`, borderRadius: RADIUS.sm, color: C.ink, fontSize: 13,
  outline: 'none', fontFamily: FONT, transition: 'border-color 0.15s ease',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

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

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT — Teacher Dashboard
───────────────────────────────────────────────────────── */
const TeacherDashboard = () => {
  const { user, logout, api } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
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
  const [editModal, setEditModal] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '', subtopics: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [clearingCurr, setClearingCurr] = useState(false);
  const [markingSubtopicId, setMarkingSubtopicId] = useState(null);

  const [feedbackData, setFeedbackData] = useState({ feedback: [], avgRating: null, totalReviews: 0 });

  const [teacherQueries, setTeacherQueries] = useState([]);
  const [teacherQueriesLoading, setTeacherQueriesLoading] = useState(false);
  const [teacherQueryFilter, setTeacherQueryFilter] = useState('all');
  const [expandedTeacherQueryId, setExpandedTeacherQueryId] = useState(null);
  const [teacherReplyText, setTeacherReplyText] = useState({});
  const [teacherReplySubmitting, setTeacherReplySubmitting] = useState({});

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
      dob: '', gender: 'Male', branch: '', state: '', technology: '', year: ''
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
      /* fallback */
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editStudentModal?.studentId) return;
    setEditStudentError('');
    setEditStudentSuccess('');
    setEditStudentSubmitting(true);
    try {
      await api.put(`/batches/teacher/${selectedBatchId}/students/${editStudentModal.studentId}`, editStudentModal);
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

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({ title: '', description: '', dueDate: '', totalPoints: 100 });
  const [assignmentPdfFile, setAssignmentPdfFile] = useState(null); // PDF attachment for assignment
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
  const [gradeData, setGradeData] = useState({});
  const [gradingSubmitting, setGradingSubmitting] = useState({});

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const r = await api.get('/batches/teacher');
      setBatches(r.data);
      if (r.data.length > 0 && !selectedBatchId) {
        setSelectedBatchId(r.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const r = await api.get('/batches/teacher');
      const f = r.data.find(b => b._id === id);
      setBatchDetails(f || null);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchFeedback = async (id) => {
    try {
      const r = await api.get(`/batches/teacher/${id}/feedback`);
      setFeedbackData(r.data);
    } catch (e) {
      console.error(e);
    }
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

  useEffect(() => {
    fetchBatches();
  }, []);

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
      // Use FormData so we can send an optional PDF file alongside JSON fields
      const fd = new FormData();
      fd.append('batchId', selectedBatchId);
      fd.append('title', assignmentFormData.title.trim());
      fd.append('description', assignmentFormData.description.trim());
      fd.append('dueDate', assignmentFormData.dueDate);
      fd.append('totalPoints', String(Number(assignmentFormData.totalPoints) || 100));
      if (assignmentPdfFile) {
        fd.append('pdf', assignmentPdfFile);
      }

      await api.post('/assignments', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssignmentSuccess('Assignment created & assigned successfully!');
      fetchAssignments(selectedBatchId);
      setTimeout(() => {
        setIsCreateAssignmentOpen(false);
        setAssignmentSuccess('');
        setAssignmentFormData({ title: '', description: '', dueDate: '', totalPoints: 100 });
        setAssignmentPdfFile(null);
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
    setModalType(type);
    setFormError('');
    setFormSuccess('');
    setLinkData({ title: '', url: '' });
    setNotifData({ title: '', message: '' });
    setPdfData({ title: '', description: '', file: null });
    setCurrJsonText('');
    setCurrJsonError('');
    setCurrManual({ title: '', description: '', subtopics: '' });
    setCurrSuccess('');
    setCurrError('');
    setCurrJsonMode(true);
    setIsModalOpen(true);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormSubmitting(true);
    if (!linkData.title || !linkData.url) {
      setFormError('Please fill in all fields.');
      setFormSubmitting(false);
      return;
    }
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/links`, linkData);
      setFormSuccess('Link added!');
      fetchDetails(selectedBatchId);
      setTimeout(() => setIsModalOpen(false), 800);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add link');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAddNotification = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormSubmitting(true);
    if (!notifData.title || !notifData.message) {
      setFormError('Please fill in all fields.');
      setFormSubmitting(false);
      return;
    }
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/notifications`, notifData);
      setFormSuccess('Announcement posted!');
      fetchDetails(selectedBatchId);
      setTimeout(() => setIsModalOpen(false), 800);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to post');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUploadPdf = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormSubmitting(true);
    if (!pdfData.title || !pdfData.file) {
      setFormError('Please provide a title and select a file.');
      setFormSubmitting(false);
      return;
    }
    const fd = new FormData();
    fd.append('title', pdfData.title);
    fd.append('description', pdfData.description);
    fd.append('pdf', pdfData.file);
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/pdfs`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormSuccess('PDF uploaded!');
      fetchDetails(selectedBatchId);
      setTimeout(() => setIsModalOpen(false), 800);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Upload failed. Max 15MB.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/batches/teacher/${selectedBatchId}/resources/${type}/${id}`);
      fetchDetails(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleUploadCurriculumJson = async () => {
    setCurrJsonError('');
    setCurrError('');
    setCurrSuccess('');
    setCurrSubmitting(true);
    let parsed;
    try {
      parsed = JSON.parse(currJsonText);
    } catch {
      setCurrJsonError('Invalid JSON. Please check the format.');
      setCurrSubmitting(false);
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setCurrJsonError('JSON must be a non-empty array of topics.');
      setCurrSubmitting(false);
      return;
    }
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/curriculum`, { topics: parsed });
      setCurrSuccess(`${parsed.length} topic(s) added!`);
      fetchDetails(selectedBatchId);
      setTimeout(() => {
        setIsModalOpen(false);
        setCurrSuccess('');
      }, 900);
    } catch (err) {
      setCurrError(err.response?.data?.error || 'Failed to upload curriculum');
    } finally {
      setCurrSubmitting(false);
    }
  };

  const handleAddManualTopic = async () => {
    setCurrError('');
    setCurrSuccess('');
    setCurrSubmitting(true);
    if (!currManual.title.trim()) {
      setCurrError('Topic title is required.');
      setCurrSubmitting(false);
      return;
    }
    const subtopics = currManual.subtopics.split('\n').map(s => s.trim()).filter(Boolean);
    const topics = [{ title: currManual.title.trim(), description: currManual.description.trim(), subtopics }];
    try {
      await api.post(`/batches/teacher/${selectedBatchId}/curriculum`, { topics });
      setCurrSuccess('Topic added!');
      setCurrManual({ title: '', description: '', subtopics: '' });
      fetchDetails(selectedBatchId);
      setTimeout(() => setCurrSuccess(''), 1500);
    } catch (err) {
      setCurrError(err.response?.data?.error || 'Failed to add topic');
    } finally {
      setCurrSubmitting(false);
    }
  };

  const handleMarkComplete = async (topicId, current) => {
    setMarkingId(topicId);
    try {
      await api.patch(`/batches/teacher/${selectedBatchId}/curriculum/${topicId}/complete`, { isCompleted: !current });
      fetchDetails(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally {
      setMarkingId(null);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this topic?')) return;
    setDeletingTopicId(topicId);
    try {
      await api.delete(`/batches/teacher/${selectedBatchId}/curriculum/${topicId}`);
      fetchDetails(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    } finally {
      setDeletingTopicId(null);
    }
  };

  const handleClearCurriculum = async () => {
    if (!window.confirm('Clear the entire curriculum? This cannot be undone.')) return;
    setClearingCurr(true);
    try {
      await api.delete(`/batches/teacher/${selectedBatchId}/curriculum`);
      fetchDetails(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear');
    } finally {
      setClearingCurr(false);
    }
  };

  const openEditModal = (topic) => {
    setEditModal(topic);
    setEditData({
      title: topic.title,
      description: topic.description || '',
      subtopics: (topic.subtopics || []).map(s => s.title ?? s).join('\n')
    });
    setEditError('');
  };

  const handleMarkSubtopicComplete = async (topicId, subtopicId, currentState) => {
    setMarkingSubtopicId(`${topicId}-${subtopicId}`);
    try {
      await api.patch(`/batches/teacher/${selectedBatchId}/curriculum/${topicId}/subtopics/${subtopicId}/complete`, { isCompleted: !currentState });
      fetchDetails(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update subtopic');
    } finally {
      setMarkingSubtopicId(null);
    }
  };

  const handleEditTopic = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    if (!editData.title.trim()) {
      setEditError('Title is required');
      setEditSubmitting(false);
      return;
    }
    const subtopics = editData.subtopics.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      await api.put(`/batches/teacher/${selectedBatchId}/curriculum/${editModal._id}`, {
        title: editData.title.trim(),
        description: editData.description.trim(),
        subtopics
      });
      setEditModal(null);
      fetchDetails(selectedBatchId);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update');
    } finally {
      setEditSubmitting(false);
    }
  };

  const curriculum = batchDetails?.curriculum || [];
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

  const ratingCounts = [5, 4, 3, 2, 1].map(star => feedbackData.feedback.filter(f => f.rating === star).length);
  const maxRatingCount = Math.max(1, ...ratingCounts);

  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);
  const gradedSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.filter(s => s.status === 'Graded').length || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Candidates', icon: Users, count: batchDetails?.students?.length || 0 },
    { id: 'notifications', label: 'Announcements', icon: Bell, count: batchDetails?.notifications?.length || 0 },
    { id: 'pdfs', label: 'Study PDFs', icon: FileText, count: batchDetails?.pdfs?.length || 0 },
    { id: 'links', label: 'Links', icon: Link2, count: batchDetails?.links?.length || 0 },
    { id: 'curriculum', label: 'Curriculum', icon: ListChecks, count: `${completedUnits}/${totalUnits}` },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: assignments.length },
    { id: 'queries', label: 'Doubts', icon: HelpCircle, count: pendingCount > 0 ? `${pendingCount} new` : teacherQueries.length },
    { id: 'feedback', label: 'Reviews', icon: MessageSquare, count: feedbackData.avgRating ? `★ ${feedbackData.avgRating}` : feedbackData.totalReviews },
  ];

  const modalConfig = {
    link: { title: 'Add Resource Link', icon: Link2 },
    pdf: { title: 'Upload PDF Material', icon: FileText },
    notification: { title: 'Post Announcement', icon: Bell },
    curriculum: { title: 'Manage Curriculum', icon: ListChecks },
  };

  // Dynamically map real candidate data from batchDetails for the Overview Leaderboard
  const realCandidates = (batchDetails?.students || []).map((std, idx) => ({
    rank: idx + 1,
    name: std.name,
    stdObj: std,
    xp: `${Math.max(100, 5000 - idx * 450)} XP`,
    avatar: std.name?.charAt(0).toUpperCase() || 'S'
  }));

  return (
    <div style={{ minHeight: '100vh', background: C.page, display: 'flex', fontFamily: FONT, color: C.body }}>
      <FontLoader />

      {/* ── MENTORI SIDEBAR NAV (250px) ── */}
      <aside className="sidebar-aside" style={{
        width: 250, flexShrink: 0, background: '#fff', borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Brand Logo */}
        <div style={{ padding: '0 8px 20px', borderBottom: `1px solid ${C.borderSoft}` }}>
          <img src="/logo.png" alt="Slog Solutions" style={{ height: 34, maxWidth: '100%', objectFit: 'contain', display: 'block', marginBottom: 4 }} />
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>EXPERT PORTAL</div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Main Navigation Group */}
          <div>
            <div style={{ padding: '0 8px 8px', fontSize: 11, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MAIN NAVIGATION
            </div>
            {[
              { id: 'overview', label: 'Home', icon: LayoutDashboard },
              { id: 'students', label: 'Candidates', icon: Users, count: batchDetails?.students?.length },
              { id: 'curriculum', label: 'Curriculum', icon: ListChecks },
              { id: 'assignments', label: 'Assignments', icon: ClipboardList },
              { id: 'notifications', label: 'Announcements', icon: Bell },
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: RADIUS.sm, border: 'none', cursor: 'pointer', marginBottom: 3,
                    background: active ? C.darkNav : 'transparent',
                    color: active ? '#ffffff' : C.body,
                    fontWeight: active ? 700 : 500, fontSize: 13,
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 4px 14px rgba(30,27,75,0.25)' : 'none'
                  }}
                >
                  <item.icon size={16} color={active ? '#ffffff' : C.muted} strokeWidth={2} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.count !== undefined && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                      background: active ? 'rgba(255,255,255,0.18)' : C.primarySoft,
                      color: active ? '#ffffff' : C.primaryDark
                    }}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Products Group */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 8px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ASSIGNED BATCHES
              </span>
              <button onClick={fetchBatches} title="Refresh Batches" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2 }}>
                <Plus size={13} />
              </button>
            </div>
            {loading ? (
              <div style={{ padding: '12px 8px', fontSize: 12, color: C.muted, display: 'flex', gap: 6 }}><Spin color={C.muted} /> Loading...</div>
            ) : batches.map(b => {
              const active = selectedBatchId === b._id;
              return (
                <button
                  key={b._id}
                  onClick={() => { setSelectedBatchId(b._id); setActiveTab('overview'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    borderRadius: RADIUS.sm, border: active ? `1px solid ${C.primary}30` : '1px solid transparent',
                    background: active ? C.primarySoft : 'transparent',
                    cursor: 'pointer', marginBottom: 2, textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, background: active ? C.primary : '#F1F5F9',
                    color: active ? '#fff' : C.muted, fontWeight: 800, fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>{b.name?.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.ink : C.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{b.name}</span>
                </button>
              );
            })}
          </div>

          {/* Other Resources */}
          <div>
            <div style={{ padding: '0 8px 8px', fontSize: 11, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RESOURCES &amp; SUPPORT
            </div>
            {[
              { id: 'pdfs', label: 'Study PDFs', icon: FileText },
              { id: 'links', label: 'Shared Links', icon: Link2 },
              { id: 'queries', label: 'Candidate Doubts', icon: HelpCircle },
              { id: 'feedback', label: 'Student Reviews', icon: MessageSquare }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  borderRadius: RADIUS.sm, border: 'none', cursor: 'pointer', marginBottom: 2,
                  background: activeTab === item.id ? C.primarySoft : 'transparent',
                  color: activeTab === item.id ? C.primaryDark : C.body,
                  fontWeight: activeTab === item.id ? 700 : 500, fontSize: 12.5
                }}
              >
                <item.icon size={15} color={activeTab === item.id ? C.primary : C.muted} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Bottom Floating Profile Card */}
        <div style={{
          background: C.darkNav, borderRadius: RADIUS.md, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
          boxShadow: '0 8px 24px rgba(30,27,75,0.3)'
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff'
          }}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <button onClick={logout} title="Sign Out" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Announcement Bar */}
        <div style={{
          background: 'linear-gradient(90deg, #F3E8FF 0%, #EFF6FF 100%)',
          borderBottom: `1px solid ${C.border}`, padding: '9px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: C.body
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Slog" style={{ height: 18, width: 'auto', objectFit: 'contain' }} />
            <span>Selected Batch: <strong style={{ color: C.ink }}>{batchDetails?.name || 'Select a Batch'}</strong> (ID: {batchDetails?.batchId || '—'} · Passcode: <strong style={{ color: C.primaryDark }}>{batchDetails?.uniqueKey || '—'}</strong>).</span>
          </div>
          <button onClick={() => openModal('notification')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontWeight: 700, fontSize: 12 }}>
            + Broadcast Alert
          </button>
        </div>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 4, letterSpacing: '-0.6px' }}>
                Welcome back, {user?.name || 'Instructor'}
              </h1>
              <p style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
                {batchDetails ? `Managing ${batchDetails.name} — ${batchDetails.students?.length || 0} candidates enrolled` : 'Select a batch from sidebar to view details.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setActiveTab('notifications')} style={{
                width: 38, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: C.shadow
              }} title="View Notifications">
                <Bell size={17} color={C.body} />
              </button>
              <Pill variant="outline" icon={Globe} onClick={() => window.open('/', '_blank')} style={{ boxShadow: C.shadow }}>
                View School Portal
              </Pill>
            </div>
          </div>

          {/* Quick Action Pill Strip — Fully Clickable Triggers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { label: 'Announce', color: C.orange, bg: C.orangeSoft, icon: Bell, action: () => openModal('notification') },
              { label: 'Upload PDF', color: C.greenText, bg: C.greenSoft, icon: FileText, action: () => openModal('pdf') },
              { label: 'Add Link', color: C.blue, bg: C.blueSoft, icon: Link2, action: () => openModal('link') },
              { label: 'Curriculum', color: C.purple, bg: C.purpleSoft, icon: ListChecks, action: () => openModal('curriculum') },
              { label: 'New Assignment', color: C.teal, bg: C.tealSoft, icon: ClipboardList, action: () => { setAssignmentError(''); setAssignmentSuccess(''); setAssignmentFormData({ title: '', description: '', dueDate: '', totalPoints: 100, fileUrl: '' }); setIsCreateAssignmentOpen(true); } },
              { label: 'Bulk Register', color: C.primary, bg: C.primarySoft, icon: Upload, action: () => { setIsBulkModalOpen(true); setBulkFile(null); setBulkError(''); setBulkResult(null); } },
            ].map(act => (
              <div key={act.label} onClick={act.action} style={{
                background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.pill,
                padding: '6px 14px 6px 8px', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: C.shadow, cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 999, background: act.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: act.color
                }}>
                  <act.icon size={13} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{act.label}</span>
                <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>+</span>
              </div>
            ))}
          </div>

          {/* OVERVIEW MAIN TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-in">
              
              {/* Analytics Section: Responsive 3-Columns Grid */}
              <div className="dashboard-grid-3" style={{ alignItems: 'stretch' }}>
                
                {/* Left Stack: 3 Real Metric Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Card onClick={() => setActiveTab('students')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconBadge icon={Users} color={C.purple} bg={C.purpleSoft} size={38} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.4px' }}>
                          {batchDetails?.students?.length || 0}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Enrolled Candidates</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </Card>

                  <Card onClick={() => setActiveTab('curriculum')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconBadge icon={ListChecks} color={C.greenText} bg={C.greenSoft} size={38} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.4px' }}>
                          {completedUnits}/{totalUnits}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Curriculum Covered ({progressPct}%)</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </Card>

                  <Card onClick={() => setActiveTab('queries')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconBadge icon={HelpCircle} color={C.orange} bg={C.orangeSoft} size={38} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.4px' }}>
                          {pendingCount}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Pending Doubts</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </Card>
                </div>

                {/* Center Main Analytics Graph */}
                <Card style={{ display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>Batch Engagement Trajectory</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: RADIUS.pill, padding: 3 }}>
                      {['Weekly', 'Monthly', 'Yearly'].map((period, i) => (
                        <button key={period} style={{
                          padding: '4px 12px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: i === 1 ? 700 : 500,
                          background: i === 1 ? '#fff' : 'transparent',
                          color: i === 1 ? C.ink : C.muted,
                          boxShadow: i === 1 ? C.shadow : 'none'
                        }}>{period}</button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Multi-curve Chart */}
                  <div style={{ flex: 1, position: 'relative', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <svg viewBox="0 0 500 140" style={{ width: '100%', height: 130, overflow: 'visible' }}>
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" />

                      <path d="M0,90 Q70,50 140,75 T280,40 T420,20 T500,60" fill="none" stroke={C.purple} strokeWidth="3" strokeLinecap="round" />
                      <path d="M0,110 Q70,95 140,85 T280,70 T420,50 T500,80" fill="none" stroke={C.orange} strokeWidth="3" strokeLinecap="round" />

                      <line x1="280" y1="0" x2="280" y2="120" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx="280" cy="40" r="4" fill={C.purple} stroke="#fff" strokeWidth="2" />
                      <circle cx="280" cy="70" r="4" fill={C.orange} stroke="#fff" strokeWidth="2" />
                    </svg>

                    <div style={{
                      position: 'absolute', top: 10, left: 240,
                      background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: '8px 14px', boxShadow: C.shadowMd, fontSize: 11
                    }}>
                      <div style={{ fontWeight: 800, color: C.ink, marginBottom: 4 }}>Active Session</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.purple, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple }} />
                        <span>Completion: {progressPct}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.orange, fontWeight: 700, marginTop: 2 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                        <span>Submissions: {totalSubmissions}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontSize: 10, color: C.muted, fontWeight: 600 }}>
                      {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'].map(w => (
                        <span key={w}>{w}</span>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Right Real Data Highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Card onClick={() => setActiveTab('assignments')} style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: C.purple }} />
                      Evaluated Assignments
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.6px', lineHeight: 1 }}>{gradedSubmissions}/{totalSubmissions}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.greenText, marginTop: 6 }}>
                      {assignments.length} total assignments assigned
                    </div>
                  </Card>

                  <Card onClick={() => setActiveTab('feedback')} style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: C.orange }} />
                      Avg Candidate Rating
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.6px', lineHeight: 1 }}>
                      ★ {feedbackData.avgRating || '5.0'}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginTop: 6 }}>
                      {feedbackData.totalReviews || 0} reviews received
                    </div>
                  </Card>
                </div>

              </div>

              {/* Bottom Row Grid: Top Candidates Leaderboard & Students Progress */}
              <div className="dashboard-grid-2">
                
                {/* Top Candidates Leaderboard — Built using ACTUAL enrolled candidates */}
                <Card style={{ padding: '20px 24px' }}>
                  <SectionHeader
                    title="Enrolled Candidates Register"
                    sub="Click any candidate row to view detailed profile info"
                    action={<Pill variant="outline" onClick={() => setActiveTab('students')} style={{ fontSize: 11, padding: '5px 12px' }}>View All ({batchDetails?.students?.length || 0})</Pill>}
                  />
                  
                  <div style={{ overflowX: 'auto', marginTop: 14 }}>
                    {realCandidates.length === 0 ? (
                      <Empty icon={Users} title="No candidates enrolled" sub="Click 'Bulk Register' or share batch key to add candidates." />
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: C.muted, fontWeight: 600 }}>#</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: C.muted, fontWeight: 600 }}>Candidate Name</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: C.muted, fontWeight: 600 }}>Points / Status</th>
                            <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, color: C.muted, fontWeight: 600 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {realCandidates.slice(0, 5).map(cnd => (
                            <tr
                              key={cnd.stdObj._id || cnd.rank}
                              onClick={() => openStudentInfoModal(cnd.stdObj)}
                              style={{ borderBottom: `1px solid ${C.borderSoft}`, cursor: 'pointer' }}
                            >
                              <td style={{ padding: '10px 12px' }}>
                                <div style={{
                                  width: 24, height: 24, borderRadius: '50%',
                                  background: cnd.rank === 1 ? C.gold : cnd.rank === 2 ? C.silver : cnd.rank === 3 ? C.bronze : '#F1F5F9',
                                  color: cnd.rank <= 3 ? '#fff' : C.muted,
                                  fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {cnd.rank}
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.primarySoft, color: C.primaryDark, fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {cnd.avatar}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{cnd.name}</div>
                                    <div style={{ fontSize: 10, color: C.muted }}>{cnd.stdObj.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: C.body }}>{cnd.xp}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                <button onClick={(e) => { e.stopPropagation(); openStudentInfoModal(cnd.stdObj); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                                  <Eye size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>

                {/* Students Progress & Dynamic Batch Breakdown */}
                <Card style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <SectionHeader title="Batch Progress &amp; Breakdown" sub="Live completion and resource distribution" />
                    
                    <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, marginTop: 12, letterSpacing: '-0.8px' }}>
                      {batchDetails?.students?.length || 0}
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginLeft: 8 }}>Candidates</span>
                    </div>

                    {/* Segmented Colorful Horizontal Bar based on real completion */}
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: RADIUS.pill, display: 'flex', overflow: 'hidden', margin: '14px 0 18px' }}>
                      <div style={{ width: `${progressPct}%`, background: C.purple }} title={`Covered (${progressPct}%)`} />
                      <div style={{ width: `${100 - progressPct}%`, background: '#CBD5E1' }} title={`Remaining (${100 - progressPct}%)`} />
                    </div>

                    {/* Legend Table using Real Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Completed Subtopics', pct: `${completedUnits} units (${progressPct}%)`, color: C.purple },
                        { label: 'Remaining Subtopics', pct: `${totalUnits - completedUnits} units`, color: '#CBD5E1' },
                        { label: 'Active Assignments', pct: `${assignments.length} assignments`, color: C.teal },
                        { label: 'Announcements Posted', pct: `${batchDetails?.notifications?.length || 0} posts`, color: C.orange },
                        { label: 'Study PDF Files', pct: `${batchDetails?.pdfs?.length || 0} files`, color: C.greenText },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                            <span style={{ color: C.body, fontWeight: 500 }}>{item.label}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: C.ink }}>{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Pill variant="outline" onClick={() => setActiveTab('curriculum')} style={{ fontSize: 11, padding: '5px 12px' }}>View Curriculum Details</Pill>
                    <span style={{ fontSize: 10.5, color: C.muted }}>Synced in real time</span>
                  </div>
                </Card>

              </div>

            </div>
          )}

          {/* CANDIDATES REGISTER TAB */}
          {activeTab === 'students' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <SectionHeader
                title={`Enrolled Candidates (${batchDetails?.students?.length || 0})`}
                action={
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Pill icon={Upload} onClick={() => { setIsBulkModalOpen(true); setBulkFile(null); setBulkError(''); setBulkResult(null); }}>Bulk Register</Pill>
                    {batchDetails?.students?.length > 0 && (
                      <Pill variant="outline" icon={Download} onClick={() => handleDownloadCredentialsCsv(batchDetails.students)}>Download Credentials CSV</Pill>
                    )}
                  </div>
                }
              />
              {!batchDetails?.students?.length ? (
                <Empty icon={Users} title="No candidates enrolled yet" sub={`Upload an Excel file or share Batch ID: ${batchDetails?.batchId} and passcode: ${batchDetails?.uniqueKey}.`} />
              ) : (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                          {['Candidate', 'Username', 'Password', 'Email', 'Mobile', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, background: '#F8FAFC', letterSpacing: '0.2px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {batchDetails.students.map(std => (
                          <tr key={std._id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%', background: C.primarySoft, color: C.primaryDark,
                                  fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{std.name?.charAt(0).toUpperCase()}</div>
                                <button onClick={() => openStudentInfoModal(std)} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontFamily: FONT }}>
                                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{std.name}</div>
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '13px 18px', fontSize: 12.5, color: C.muted }}>{std.username || '—'}</td>
                            <td style={{ padding: '13px 18px', fontSize: 12.5, color: C.primaryDark, fontWeight: 600 }}>{std.generatedPassword || 'Pass@1234'}</td>
                            <td style={{ padding: '13px 18px', fontSize: 12.5, color: C.muted }}>{std.email}</td>
                            <td style={{ padding: '13px 18px', fontSize: 12.5, color: C.muted }}>{std.mobile || '—'}</td>
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Pill variant="outline" icon={Eye} onClick={() => openStudentInfoModal(std)} style={{ padding: '6px 11px', fontSize: 11 }}>Info</Pill>
                                <Pill onClick={() => openStudentEditModal(std)} style={{ padding: '6px 11px', fontSize: 11, background: C.orangeSoft, color: C.orangeText }}><Edit2 size={11} /> Edit</Pill>
                                <Pill onClick={() => { setDirectPushModal({ studentId: std._id, studentName: std.name }); setDirectPushForm({ title: '', message: '' }); setDirectPushResult(null); }}
                                  style={{ padding: '6px 11px', fontSize: 11, background: C.purpleSoft, color: C.purpleText }}><Bell size={11} /> Push</Pill>
                                <Pill variant="danger" onClick={() => handleDeleteStudent(std._id, std.name)} disabled={deletingStudentId === std._id}
                                  style={{ padding: '6px 11px', fontSize: 11 }}><Trash2 size={11} /> {deletingStudentId === std._id ? '...' : 'Remove'}</Pill>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Pill icon={PlusCircle} onClick={() => openModal('notification')} style={{ background: C.orangeSoft, color: C.orangeText }}>Post Announcement</Pill>
              </div>
              {!batchDetails?.notifications?.length ? (
                <Empty icon={Bell} title="No announcements posted" sub="Click 'Post Announcement' to broadcast updates to your candidates." />
              ) : batchDetails.notifications.map((n, i) => (
                <Card key={n._id || i} accent={C.orange} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{n.title}</h4>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}><Calendar size={11} /> {fmt(n.date)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{n.message}</p>
                  </div>
                  <button onClick={() => handleDelete('notifications', n._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: C.muted }}><Trash2 size={14} /></button>
                </Card>
              ))}
            </div>
          )}

          {/* STUDY PDFS TAB */}
          {activeTab === 'pdfs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Pill icon={Upload} onClick={() => openModal('pdf')} style={{ background: C.greenSoft, color: C.greenText }}>Upload PDF</Pill>
              </div>
              {!batchDetails?.pdfs?.length ? (
                <Empty icon={FileText} title="No PDFs uploaded" sub="Click 'Upload PDF' to share study materials with candidates." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                  {batchDetails.pdfs.map((p, i) => (
                    <Card key={p._id || i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <IconBadge icon={FileText} color={C.greenText} bg={C.greenSoft} size={40} />
                        <button onClick={() => handleDelete('pdfs', p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted }}><Trash2 size={13} /></button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{p.title}</div>
                        {p.description && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>{p.description}</div>}
                        <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> {fmt(p.date)}</div>
                      </div>
                      <Pill variant="ghost" icon={Download} onClick={() => window.open(p.pdfUrl, '_blank')}>View PDF File</Pill>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LINKS TAB */}
          {activeTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Pill icon={PlusCircle} onClick={() => openModal('link')} style={{ background: C.blueSoft, color: C.blueText }}>Add Resource Link</Pill>
              </div>
              {!batchDetails?.links?.length ? (
                <Empty icon={Link2} title="No links shared" sub="Click 'Add Resource Link' to share docs and repositories." />
              ) : batchDetails.links.map((l, i) => (
                <Card key={l._id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                  <IconBadge icon={Link2} color={C.blueText} bg={C.blueSoft} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{l.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Pill variant="ghost" icon={Link2} onClick={() => window.open(l.url, '_blank')} style={{ background: C.blueSoft, color: C.blueText, padding: '7px 14px' }}>Open</Pill>
                    <button onClick={() => handleDelete('links', l._id)} style={{ background: C.redSoft, border: 'none', borderRadius: RADIUS.pill, padding: '7px 10px', cursor: 'pointer', color: C.redText }}><Trash2 size={13} /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <SectionHeader
                title="Course Curriculum"
                sub={`${totalCount} topics · ${completedUnits}/${totalUnits} subtopics completed`}
                action={
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Pill icon={PlusCircle} onClick={() => openModal('curriculum')} style={{ background: C.purpleSoft, color: C.purpleText }}>Add Topics</Pill>
                    {totalCount > 0 && <Pill variant="danger" icon={Trash} onClick={handleClearCurriculum} disabled={clearingCurr}>Clear All</Pill>}
                  </div>
                }
              />

              {totalCount > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <Donut pct={progressPct} sub="complete" color={progressPct === 100 ? C.greenText : C.purple} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 2 }}>Overall Syllabus Progress</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{completedUnits} of {totalUnits} subtopics covered</div>
                        {progressPct === 100 && totalUnits > 0 ? (
                          <Badge color={C.greenText} bg={C.greenSoft}>🎉 Curriculum Complete!</Badge>
                        ) : (
                          <Badge color={C.purpleText} bg={C.purpleSoft}>{totalUnits - completedUnits} remaining</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <BarChart2 size={14} color={C.primary} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Progress by Topic</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[...curriculum].sort((a, b) => a.order - b.order).slice(0, 5).map((topic, i) => {
                        const tTotal = topic.subtopics?.length > 0 ? topic.subtopics.length : 1;
                        const tDone = topic.subtopics?.length > 0 ? topic.subtopics.filter(s => s.isCompleted).length : (topic.isCompleted ? 1 : 0);
                        return <BarRow key={topic._id} label={topic.title} value={tDone} max={tTotal} color={C.primary} valueLabel={`${tDone}/${tTotal}`} />;
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {!totalCount ? (
                <Empty icon={ClipboardList} title="No curriculum uploaded yet" sub="Click 'Add Topics' to upload course syllabus via JSON or manual topic entry." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...curriculum].sort((a, b) => a.order - b.order).map((topic, idx) => {
                    const expanded = expandedTopics[topic._id];
                    return (
                      <div key={topic._id} style={{
                        background: '#fff', borderRadius: RADIUS.md,
                        border: `1px solid ${topic.isCompleted ? C.greenText + '40' : C.border}`,
                        borderLeft: `4px solid ${topic.isCompleted ? C.greenText : C.purple}`, overflow: 'hidden'
                      }}>
                        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: topic.isCompleted ? C.greenSoft : C.purpleSoft,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: topic.isCompleted ? C.greenText : C.purpleText
                          }}>{idx + 1}</div>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{topic.title}</span>
                              {topic.isCompleted && <Badge color={C.greenText} bg={C.greenSoft}>✓ Completed</Badge>}
                            </div>
                            {topic.description && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{topic.description}</div>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {topic.subtopics?.length > 0 && (
                              <button onClick={() => setExpandedTopics(p => ({ ...p, [topic._id]: !p[topic._id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: C.muted, display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
                                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{topic.subtopics.length}
                              </button>
                            )}
                            <Pill variant="outline" onClick={() => openEditModal(topic)} style={{ padding: '5px 10px', fontSize: 11 }}><Edit2 size={12} /></Pill>
                            <Pill onClick={() => handleMarkComplete(topic._id, topic.isCompleted)} disabled={markingId === topic._id}
                              style={{ padding: '5px 12px', fontSize: 11, background: topic.isCompleted ? C.orangeSoft : C.greenSoft, color: topic.isCompleted ? C.orangeText : C.greenText }}>
                              {markingId === topic._id ? <Spin color={topic.isCompleted ? C.orangeText : C.greenText} /> : topic.isCompleted ? <><RotateCcw size={12} /> Undo</> : <><Check size={12} /> Complete</>}
                            </Pill>
                            <button onClick={() => handleDeleteTopic(topic._id)} disabled={deletingTopicId === topic._id} style={{ background: C.redSoft, border: 'none', borderRadius: RADIUS.pill, padding: '6px 8px', cursor: 'pointer', color: C.redText }}><Trash2 size={12} /></button>
                          </div>
                        </div>

                        {expanded && topic.subtopics?.length > 0 && (
                          <div style={{ padding: '12px 18px 14px 18px', borderTop: `1px solid ${C.borderSoft}`, background: '#FAFAFA' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {topic.subtopics.map((st) => {
                                const stKey = `${topic._id}-${st._id}`;
                                const isMarking = markingSubtopicId === stKey;
                                return (
                                  <div key={st._id} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                    borderRadius: RADIUS.sm, background: st.isCompleted ? C.greenSoft : '#F9FAFB',
                                    border: `1px solid ${st.isCompleted ? C.greenText + '30' : C.borderSoft}`
                                  }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: st.isCompleted ? '#fff' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {st.isCompleted ? <Check size={11} color={C.greenText} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, display: 'block' }} />}
                                    </div>
                                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: st.isCompleted ? C.ink : C.body }}>{st.title}</span>
                                    <Pill onClick={() => handleMarkSubtopicComplete(topic._id, st._id, st.isCompleted)} disabled={isMarking}
                                      style={{ padding: '4px 10px', fontSize: 10.5, background: st.isCompleted ? C.orangeSoft : C.greenSoft, color: st.isCompleted ? C.orangeText : C.greenText }}>
                                      {isMarking ? <Spin color={st.isCompleted ? C.orangeText : C.greenText} /> : st.isCompleted ? <><RotateCcw size={10} /> Undo</> : <><Check size={10} /> Done</>}
                                    </Pill>
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

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <SectionHeader title="Course Assignments & Evaluation" sub="Create assignments and grade candidate submissions." />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {totalSubmissions > 0 && <Donut size={64} stroke={8} pct={Math.round((gradedSubmissions / totalSubmissions) * 100)} sub="graded" color={C.purple} />}
                    <Pill icon={Plus} onClick={() => { setAssignmentError(''); setAssignmentSuccess(''); setAssignmentFormData({ title: '', description: '', dueDate: '', totalPoints: 100, fileUrl: '' }); setIsCreateAssignmentOpen(true); }}>Create Assignment</Pill>
                  </div>
                </div>
              </Card>

              {assignmentsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: C.muted, fontSize: 13, gap: 10 }}><Spin color={C.primary} /> Loading assignments...</div>
              ) : assignments.length === 0 ? (
                <Empty icon={ClipboardList} title="No assignments created" sub="Click 'Create Assignment' above to assign tasks to candidates." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {assignments.map(asg => {
                    const isExpanded = expandedAssignmentId === asg._id;
                    const totalSubs = asg.submissions?.length || 0;
                    const gradedSubs = asg.submissions?.filter(s => s.status === 'Graded').length || 0;
                    const isOverdue = new Date(asg.dueDate) < new Date();

                    return (
                      <Card key={asg._id} accent={C.purple}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <Badge color={isOverdue ? C.redText : C.greenText} bg={isOverdue ? C.redSoft : C.greenSoft}><Calendar size={10} /> Due: {fmt(asg.dueDate)}</Badge>
                              <Badge color={C.purpleText} bg={C.purpleSoft}>Max Score: {asg.totalPoints} pts</Badge>
                            </div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{asg.title}</h4>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <Pill variant="ghost" onClick={() => setExpandedAssignmentId(isExpanded ? null : asg._id)} style={{ background: C.purpleSoft, color: C.purpleText, padding: '7px 14px', fontSize: 11 }}>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {totalSubs} Submissions ({gradedSubs} Graded)
                            </Pill>
                            <button onClick={() => handleDeleteAssignment(asg._id)} title="Delete Assignment" style={{ padding: '7px 10px', borderRadius: RADIUS.pill, border: 'none', background: C.redSoft, color: C.redText, cursor: 'pointer' }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 10 }}>{asg.description}</p>
                        {asg.fileUrl && <a href={asg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.primaryDark, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}><FileText size={13} /> View Reference Guidelines</a>}

                        {isExpanded && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <h5 style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>Candidate Submissions ({totalSubs})</h5>
                            {totalSubs === 0 ? (
                              <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No submissions yet.</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {asg.submissions.map(sub => {
                                  const isGraded = sub.status === 'Graded';
                                  const currentGrade = gradeData[sub._id]?.grade !== undefined ? gradeData[sub._id].grade : sub.grade !== null ? sub.grade : '';
                                  const currentFeedback = gradeData[sub._id]?.feedback !== undefined ? gradeData[sub._id].feedback : sub.feedback || '';
                                  return (
                                    <Card key={sub._id} style={{ background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                        <div><strong style={{ fontSize: 13, color: C.ink }}>{sub.studentName}</strong><span style={{ fontSize: 11.5, color: C.muted, marginLeft: 8 }}>({sub.studentEmail})</span></div>
                                        <Badge color={isGraded ? C.greenText : C.orangeText} bg={isGraded ? C.greenSoft : C.orangeSoft}>{isGraded ? `Graded: ${sub.grade}/${asg.totalPoints}` : 'Needs Grading'}</Badge>
                                      </div>
                                      {sub.answerText && <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5, whiteSpace: 'pre-line', background: '#fff', padding: '10px 12px', borderRadius: RADIUS.sm }}><strong>Answer:</strong> {sub.answerText}</div>}
                                      {sub.submissionUrl && <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: C.purple, fontWeight: 700, textDecoration: 'none' }}>🔗 Submitted Solution Link</a>}
                                      {sub.submissionPdfUrl && (
                                        <a href={sub.submissionPdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.greenText, fontWeight: 700, textDecoration: 'none' }}>
                                          <FileText size={13} /> View Candidate PDF Submission
                                        </a>
                                      )}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4, background: C.purpleSoft, padding: '12px 14px', borderRadius: RADIUS.sm }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <label style={{ fontSize: 11.5, fontWeight: 700, color: C.ink }}>Score:</label>
                                          <input type="number" min={0} max={asg.totalPoints} placeholder={`0-${asg.totalPoints}`} value={currentGrade}
                                            onChange={e => setGradeData({ ...gradeData, [sub._id]: { ...gradeData[sub._id], grade: e.target.value, feedback: currentFeedback } })}
                                            style={{ width: 70, padding: '6px 8px', borderRadius: 6, background: '#fff', border: `1px solid ${C.border}`, color: C.ink, fontSize: 12, outline: 'none', fontFamily: FONT }} />
                                          <span style={{ fontSize: 11, color: C.muted }}>/ {asg.totalPoints}</span>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 180 }}>
                                          <input type="text" placeholder="Instructor feedback..." value={currentFeedback}
                                            onChange={e => setGradeData({ ...gradeData, [sub._id]: { ...gradeData[sub._id], grade: currentGrade, feedback: e.target.value } })}
                                            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, background: '#fff', border: `1px solid ${C.border}`, color: C.ink, fontSize: 12, outline: 'none', fontFamily: FONT }} />
                                        </div>
                                        <Pill onClick={() => handleGradeSubmission(asg._id, sub._id)} disabled={gradingSubmitting[sub._id]} icon={Check} style={{ padding: '7px 16px', fontSize: 11 }}>Save Grade</Pill>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DOUBTS & QUERIES TAB */}
          {activeTab === 'queries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <Card>
                <SectionHeader title="Candidate Doubts & Queries" sub="Respond to candidate questions for this batch."
                  action={
                    <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: RADIUS.pill, padding: 3 }}>
                      {['all', 'Pending', 'Answered', 'Resolved'].map(f => (
                        <button key={f} onClick={() => setTeacherQueryFilter(f)} style={{
                          padding: '6px 14px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer', fontSize: 11,
                          fontWeight: teacherQueryFilter === f ? 700 : 500, background: teacherQueryFilter === f ? '#fff' : 'transparent',
                          color: teacherQueryFilter === f ? C.primary : C.muted, fontFamily: FONT
                        }}>{f === 'all' ? 'All Doubts' : f}</button>
                      ))}
                    </div>
                  } />
              </Card>

              {teacherQueriesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: C.muted, fontSize: 13, gap: 10 }}><Spin color={C.primary} /> Loading queries...</div>
              ) : teacherQueries.filter(q => teacherQueryFilter === 'all' || q.status === teacherQueryFilter).length === 0 ? (
                <Empty icon={HelpCircle} title="No queries found" sub="No candidate doubts recorded for this filter." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {teacherQueries.filter(q => teacherQueryFilter === 'all' || q.status === teacherQueryFilter).map(q => {
                    const isExpanded = expandedTeacherQueryId === q._id;
                    const badge = q.status === 'Pending' ? { bg: C.orangeSoft, color: C.orangeText }
                      : q.status === 'In Progress' ? { bg: C.blueSoft, color: C.blueText }
                        : q.status === 'Answered' ? { bg: C.greenSoft, color: C.greenText }
                          : { bg: C.purpleSoft, color: C.purpleText };

                    return (
                      <Card key={q._id} accent={badge.color}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <Badge color={C.purpleText} bg={C.purpleSoft}><Tag size={10} /> {q.topicTitle || 'General Course Doubt'}</Badge>
                              <Badge color={C.muted} bg="#F1F5F9">{q.priority} Priority</Badge>
                            </div>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{q.title}</h4>
                            <div style={{ fontSize: 11, color: C.muted }}>Candidate: <strong style={{ color: C.ink }}>{q.studentName}</strong> ({q.studentEmail}) · {fmt(q.createdAt)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <select value={q.status} onChange={e => handleTeacherStatusChange(q._id, e.target.value)} style={{ padding: '5px 12px', borderRadius: RADIUS.pill, fontSize: 11, fontWeight: 800, background: badge.bg, border: 'none', color: badge.color, outline: 'none', cursor: 'pointer', fontFamily: FONT }}>
                              <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Answered">Answered</option><option value="Resolved">Resolved</option>
                            </select>
                            <Pill variant="outline" onClick={() => setExpandedTeacherQueryId(isExpanded ? null : q._id)} style={{ padding: '7px 12px', fontSize: 11 }}>{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {q.replies?.length || 0} msgs</Pill>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 12, background: '#F8FAFC', padding: '10px 12px', borderRadius: RADIUS.sm, border: `1px solid ${C.borderSoft}` }}>{q.description}</p>

                        {isExpanded && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h5 style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>Replies ({q.replies?.length || 0})</h5>
                            {(!q.replies || q.replies.length === 0) ? (
                              <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No replies yet. Type your answer below.</div>
                            ) : q.replies.map((rep, idx) => {
                              const isExpert = ['Teacher', 'Admin', 'Staff'].includes(rep.senderRole);
                              return (
                                <div key={idx} style={{ padding: '12px 14px', borderRadius: RADIUS.sm, background: isExpert ? C.primarySoft : '#F8FAFC', border: `1px solid ${isExpert ? C.primary + '30' : C.borderSoft}`, alignSelf: isExpert ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                                    <strong style={{ fontSize: 12, color: isExpert ? C.primaryDark : C.ink }}>{rep.senderName} {isExpert ? '(Expert)' : '(Candidate)'}</strong>
                                    <span style={{ fontSize: 10, color: C.muted }}>{fmt(rep.createdAt)}</span>
                                  </div>
                                  <p style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5, whiteSpace: 'pre-line', margin: 0 }}>{rep.message}</p>
                                </div>
                              );
                            })}
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                              <input type="text" value={teacherReplyText[q._id] || ''} onChange={e => setTeacherReplyText({ ...teacherReplyText, [q._id]: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') handleTeacherReply(q._id); }} placeholder="Type expert answer..." style={{ flex: 1, padding: '10px 14px', borderRadius: RADIUS.pill, background: '#F8FAFC', border: `1px solid ${C.border}`, color: C.ink, fontSize: 12.5, outline: 'none', fontFamily: FONT }} />
                              <Pill onClick={() => handleTeacherReply(q._id)} disabled={teacherReplySubmitting[q._id] || !teacherReplyText[q._id]?.trim()} icon={Send}>Answer</Pill>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'feedback' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <Donut pct={Math.round(((feedbackData.avgRating || 0) / 5) * 100)} sub="of 5 stars" color={C.orange} />
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 6 }}>Candidate Feedback</h3>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= Math.round(feedbackData.avgRating || 0) ? '#F59E0B' : 'none'} color={s <= Math.round(feedbackData.avgRating || 0) ? '#F59E0B' : C.border} />)}
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{feedbackData.totalReviews} reviews</span>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><BarChart2 size={14} color={C.primary} /><span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Rating Distribution</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[5, 4, 3, 2, 1].map((star, i) => <BarRow key={star} label={`${star} stars`} value={ratingCounts[i]} max={maxRatingCount} color="#F59E0B" />)}
                  </div>
                </Card>
              </div>

              {!feedbackData.feedback?.length ? (
                <Empty icon={MessageSquare} title="No feedback submitted yet" sub="Enrolled candidates haven't submitted reviews for this batch yet." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {feedbackData.feedback.map((item, idx) => (
                    <Card key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.purpleSoft, color: C.purpleText, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(item.studentName || 'S').charAt(0).toUpperCase()}</div>
                          <div><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{item.studentName || 'Candidate'}</div><div style={{ fontSize: 11, color: C.muted }}>Candidate</div></div>
                        </div>
                        <span style={{ fontSize: 11, color: C.muted }}>{fmt(item.date)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= item.rating ? '#F59E0B' : 'none'} color={s <= item.rating ? '#F59E0B' : C.border} />)}</div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706' }}>{item.rating}.0</span>
                      </div>
                      {item.review ? <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.6, fontStyle: 'italic', padding: '10px 12px', borderRadius: RADIUS.sm, background: '#F8FAFC', border: `1px solid ${C.borderSoft}` }}>&ldquo;{item.review}&rdquo;</p> : <span style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No text review.</span>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── ALL MODALS ── */}
      {/* Creation Modal */}
      {isModalOpen && modalConfig[modalType] && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: modalType === 'curriculum' ? 540 : 440, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconBadge icon={modalConfig[modalType].icon} color={C.primary} size={36} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>{modalConfig[modalType].title}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {formError && <div style={{ marginBottom: 12 }}><FormAlert msg={formError} type="error" /></div>}
              {formSuccess && <div style={{ marginBottom: 12 }}><FormAlert msg={formSuccess} type="success" /></div>}

              {modalType === 'link' && (
                <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Title</label><input type="text" required value={linkData.title} onChange={e => setLinkData({ ...linkData, title: e.target.value })} placeholder="e.g. GitHub Repo" style={inputStyle} /></div>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>URL</label><input type="url" required value={linkData.url} onChange={e => setLinkData({ ...linkData, url: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                  <Pill type="submit" disabled={formSubmitting} style={{ marginTop: 8 }}>{formSubmitting ? <Spin /> : 'Save Link'}</Pill>
                </form>
              )}

              {modalType === 'notification' && (
                <form onSubmit={handleAddNotification} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Announcement Title</label><input type="text" required value={notifData.title} onChange={e => setNotifData({ ...notifData, title: e.target.value })} placeholder="e.g. Class Rescheduled" style={inputStyle} /></div>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Message</label><textarea required value={notifData.message} onChange={e => setNotifData({ ...notifData, message: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                  <Pill type="submit" disabled={formSubmitting} style={{ marginTop: 8 }}>{formSubmitting ? <Spin /> : 'Broadcast Announcement'}</Pill>
                </form>
              )}

              {modalType === 'pdf' && (
                <form onSubmit={handleUploadPdf} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>PDF Title</label><input type="text" required value={pdfData.title} onChange={e => setPdfData({ ...pdfData, title: e.target.value })} placeholder="e.g. Lecture Notes" style={inputStyle} /></div>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Description</label><input type="text" value={pdfData.description} onChange={e => setPdfData({ ...pdfData, description: e.target.value })} placeholder="Brief summary..." style={inputStyle} /></div>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Select PDF File</label><input type="file" required accept=".pdf" onChange={e => setPdfData({ ...pdfData, file: e.target.files[0] })} style={{ fontSize: 12 }} /></div>
                  <Pill type="submit" disabled={formSubmitting} style={{ marginTop: 8 }}>{formSubmitting ? <Spin /> : 'Upload PDF'}</Pill>
                </form>
              )}

              {modalType === 'curriculum' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: RADIUS.pill, padding: 3 }}>
                    <button onClick={() => setCurrJsonMode(true)} style={{ flex: 1, padding: '6px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: currJsonMode ? 700 : 500, background: currJsonMode ? '#fff' : 'transparent', color: currJsonMode ? C.primary : C.muted }}>JSON Upload</button>
                    <button onClick={() => setCurrJsonMode(false)} style={{ flex: 1, padding: '6px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: !currJsonMode ? 700 : 500, background: !currJsonMode ? '#fff' : 'transparent', color: !currJsonMode ? C.primary : C.muted }}>Manual Entry</button>
                  </div>
                  {currJsonMode ? (
                    <div>
                      <textarea value={currJsonText} onChange={e => setCurrJsonText(e.target.value)} placeholder={SAMPLE_JSON} rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }} />
                      <Pill onClick={handleUploadCurriculumJson} disabled={currSubmitting || !currJsonText.trim()} style={{ width: '100%', marginTop: 10 }}>Upload Syllabus JSON</Pill>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="text" placeholder="Topic Title *" value={currManual.title} onChange={e => setCurrManual({ ...currManual, title: e.target.value })} style={inputStyle} />
                      <input type="text" placeholder="Description" value={currManual.description} onChange={e => setCurrManual({ ...currManual, description: e.target.value })} style={inputStyle} />
                      <textarea placeholder="Subtopics (one per line)" value={currManual.subtopics} onChange={e => setCurrManual({ ...currManual, subtopics: e.target.value })} rows={3} style={inputStyle} />
                      <Pill onClick={handleAddManualTopic} disabled={currSubmitting || !currManual.title.trim()} style={{ width: '100%', marginTop: 6 }}>Add Topic</Pill>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Assignment Creation Modal */}
      {isCreateAssignmentOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 480, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Create New Assignment</h3>
              <button onClick={() => { setIsCreateAssignmentOpen(false); setAssignmentPdfFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAssignment} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignmentError && <FormAlert msg={assignmentError} type="error" />}
              {assignmentSuccess && <FormAlert msg={assignmentSuccess} type="success" />}
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Title *</label><input type="text" required value={assignmentFormData.title} onChange={e => setAssignmentFormData({ ...assignmentFormData, title: e.target.value })} placeholder="Assignment Title" style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Instructions *</label><textarea required rows={4} value={assignmentFormData.description} onChange={e => setAssignmentFormData({ ...assignmentFormData, description: e.target.value })} placeholder="Describe task instructions..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Due Date *</label><input type="date" required value={assignmentFormData.dueDate} onChange={e => setAssignmentFormData({ ...assignmentFormData, dueDate: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Total Score *</label><input type="number" min={1} max={1000} value={assignmentFormData.totalPoints} onChange={e => setAssignmentFormData({ ...assignmentFormData, totalPoints: e.target.value })} style={inputStyle} /></div>
              </div>

              {/* PDF Attachment — uploaded to Cloudinary */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                  PDF Attachment <span style={{ fontWeight: 400, color: C.muted }}>(optional — max 10 MB)</span>
                </label>
                <div style={{
                  border: `1.5px dashed ${assignmentPdfFile ? C.greenText : C.border}`,
                  borderRadius: RADIUS.sm, padding: '12px 16px',
                  background: assignmentPdfFile ? C.greenSoft : '#F8FAFC',
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                  onClick={() => document.getElementById('assignment-pdf-input').click()}
                >
                  <Upload size={16} color={assignmentPdfFile ? C.greenText : C.muted} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {assignmentPdfFile ? (
                      <>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.greenText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✓ {assignmentPdfFile.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{(assignmentPdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12.5, color: C.muted }}>Click to attach a PDF guideline file...</div>
                    )}
                  </div>
                  {assignmentPdfFile && (
                    <button type="button" onClick={e => { e.stopPropagation(); setAssignmentPdfFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.redText, padding: 2 }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input
                  id="assignment-pdf-input"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f && f.size > 10 * 1024 * 1024) {
                      setAssignmentError('PDF file must be under 10 MB.');
                      return;
                    }
                    setAssignmentPdfFile(f || null);
                    setAssignmentError('');
                    e.target.value = '';
                  }}
                />
              </div>

              <Pill type="submit" disabled={assignmentSubmitting} style={{ marginTop: 8 }}>
                {assignmentSubmitting ? <><Spin /> Uploading...</> : 'Publish Assignment'}
              </Pill>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel Register Modal */}
      {isBulkModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 520, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconBadge icon={Upload} color={C.primary} size={36} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Bulk Register Candidates (Excel)</h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleBulkRegisterSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {bulkError && <FormAlert msg={bulkError} type="error" />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.primarySoft, padding: '12px 14px', borderRadius: RADIUS.sm }}>
                <span style={{ fontSize: 12, color: C.primaryDark, fontWeight: 600 }}>Need format guidelines?</span>
                <Pill type="button" variant="outline" onClick={handleDownloadSampleExcel} style={{ fontSize: 11, padding: '5px 12px' }}>Download CSV Template</Pill>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Upload .xlsx / .csv File</label>
                <input type="file" required accept=".xlsx, .xls, .csv" onChange={e => setBulkFile(e.target.files[0])} style={{ fontSize: 12 }} />
              </div>
              {bulkResult && (
                <div style={{ padding: '12px', background: C.greenSoft, borderRadius: RADIUS.sm, fontSize: 12, color: C.greenText }}>
                  <strong>Success:</strong> {bulkResult.message || 'Candidates registered!'}
                </div>
              )}
              <Pill type="submit" disabled={bulkSubmitting} style={{ marginTop: 6 }}>{bulkSubmitting ? <Spin /> : 'Register Candidates'}</Pill>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Info Modal */}
      {infoStudentModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 440, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Candidate Overview</h3>
              <button onClick={() => setInfoStudentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 22px' }}>
              {infoStudentModal.loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 12 }}><Spin color={C.primary} /> Fetching profile...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div><strong>Name:</strong> {infoStudentModal.user?.name}</div>
                  <div><strong>Email:</strong> {infoStudentModal.user?.email}</div>
                  <div><strong>Username:</strong> {infoStudentModal.user?.username || '—'}</div>
                  <div><strong>Password:</strong> {infoStudentModal.user?.generatedPassword || '—'}</div>
                  <div><strong>Mobile:</strong> {infoStudentModal.user?.mobile || '—'}</div>
                  {infoStudentModal.profile && (
                    <>
                      <div><strong>State:</strong> {infoStudentModal.profile.state || '—'}</div>
                      <div><strong>Branch:</strong> {infoStudentModal.profile.branch || infoStudentModal.profile.branchDepartment || '—'}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudentModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 480, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Edit Candidate Details</h3>
              <button onClick={() => setEditStudentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateStudentSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editStudentError && <FormAlert msg={editStudentError} type="error" />}
              {editStudentSuccess && <FormAlert msg={editStudentSuccess} type="success" />}
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Full Name</label><input type="text" required value={editStudentModal.name} onChange={e => setEditStudentModal({ ...editStudentModal, name: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Email</label><input type="email" required value={editStudentModal.email} onChange={e => setEditStudentModal({ ...editStudentModal, email: e.target.value })} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Username</label><input type="text" value={editStudentModal.username} onChange={e => setEditStudentModal({ ...editStudentModal, username: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Password</label><input type="text" value={editStudentModal.password} onChange={e => setEditStudentModal({ ...editStudentModal, password: e.target.value })} style={inputStyle} /></div>
              </div>
              <Pill type="submit" disabled={editStudentSubmitting} style={{ marginTop: 8 }}>{editStudentSubmitting ? <Spin /> : 'Save Changes'}</Pill>
            </form>
          </div>
        </div>
      )}

      {/* Edit Curriculum Topic Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 440, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Edit Topic</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditTopic} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editError && <FormAlert msg={editError} type="error" />}
              <input type="text" required value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={inputStyle} />
              <input type="text" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} style={inputStyle} />
              <textarea value={editData.subtopics} onChange={e => setEditData({ ...editData, subtopics: e.target.value })} rows={4} style={inputStyle} />
              <Pill type="submit" disabled={editSubmitting}>{editSubmitting ? <Spin /> : 'Update Topic'}</Pill>
            </form>
          </div>
        </div>
      )}

      {/* Direct Push Modal */}
      {directPushModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 420, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Send Direct Push Alert</h3>
              <button onClick={() => setDirectPushModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSendDirectPush} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {directPushResult && <FormAlert msg={directPushResult.message} type={directPushResult.success ? 'success' : 'error'} />}
              <div style={{ fontSize: 12, color: C.muted }}>To: <strong>{directPushModal.studentName}</strong></div>
              <input type="text" required placeholder="Push Title" value={directPushForm.title} onChange={e => setDirectPushForm({ ...directPushForm, title: e.target.value })} style={inputStyle} />
              <textarea required rows={3} placeholder="Push Message Body" value={directPushForm.message} onChange={e => setDirectPushForm({ ...directPushForm, message: e.target.value })} style={inputStyle} />
              <Pill type="submit" disabled={directPushSubmitting}>{directPushSubmitting ? <Spin /> : 'Send Notification'}</Pill>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;
