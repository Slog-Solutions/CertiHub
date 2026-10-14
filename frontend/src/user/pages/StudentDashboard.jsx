import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, onForegroundMessage } from '../../lib/firebase';
import { API_BASE_URL } from '@/admin/config';
import {
  GraduationCap, LogOut, Plus, Bell, FileText, Link2,
  Download, ExternalLink, Calendar, User, BookOpen, X,
  AlertCircle, ChevronRight, Sparkles, Search,
  ListChecks, CheckCircle, Clock, ChevronDown, ChevronUp, ClipboardList,
  MessageSquare, Star, Send, Edit2, CheckCircle2, HelpCircle, Tag, Check, CornerDownRight,
  TrendingUp, PieChart, Award, LayoutDashboard, Globe, Upload, BarChart2, Trash2, ShieldAlert, RefreshCw
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   DESIGN SYSTEM — Mentori Light Mode SaaS Layout
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
      .dashboard-grid-3 { grid-template-columns: 1fr 1fr; }
      .dashboard-grid-2 { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .dashboard-grid-3 { grid-template-columns: 1fr; }
      .sidebar-aside { display: none !important; }
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

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT — Student Dashboard (Mentori UI Layout)
───────────────────────────────────────────────────────── */
const StudentDashboard = () => {
  const { user, logout, api, setUser } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Candidate Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobile: '',
    address: '',
    dob: '',
    gender: '',
    state: '',
    branch: '',
    year: '',
    technology: '',
    photoUrl: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        state: user.state || '',
        branch: user.branch || '',
        year: user.year || '',
        technology: user.technology || '',
        photoUrl: user.photoUrl || ''
      });
      setPhotoUrlInput(user.photoUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await api.put('/auth/profile', profileForm);
      setProfileSuccess('Profile updated successfully!');
      if (setUser) setUser(res.data);
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    setProfileError('');
    setProfileSuccess('');

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/auth/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.photoUrl) {
        setProfileForm(prev => ({ ...prev, photoUrl: res.data.photoUrl }));
        setPhotoUrlInput(res.data.photoUrl);
        setProfileSuccess('Profile photo uploaded! Click Save Changes to apply.');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setProfileError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinData, setJoinData] = useState({ batchId: '', uniqueKey: '' });
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [joining, setJoining] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});

  // Feedback state
  const [myFeedback, setMyFeedback] = useState(null);
  const [fbRating, setFbRating] = useState(0);
  const [fbHover, setFbHover] = useState(0);
  const [fbReview, setFbReview] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbError, setFbError] = useState('');
  const [fbSuccess, setFbSuccess] = useState('');
  const [fbEditing, setFbEditing] = useState(false);

  // Doubts / Queries state
  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [queryFilter, setQueryFilter] = useState('all');
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryFormData, setQueryFormData] = useState({ topicId: '', topicTitle: '', title: '', description: '', priority: 'Medium' });
  const [querySubmitting, setQuerySubmitting] = useState(false);
  const [queryFormError, setQueryFormError] = useState('');
  const [queryFormSuccess, setQueryFormSuccess] = useState('');
  const [expandedQueryId, setExpandedQueryId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});

  // Assignments state for candidates
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentAssignmentsLoading, setStudentAssignmentsLoading] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState(null);
  const [submitFormData, setSubmitFormData] = useState({ answerText: '', submissionUrl: '' });
  const [submissionPdfFile, setSubmissionPdfFile] = useState(null);
  const [submitSubmitting, setSubmitSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // ── Delete Account Request State ────────────────────────────────────────────
  const [deleteReqStatus, setDeleteReqStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [deleteReqData, setDeleteReqData] = useState(null);     // full request object
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // ── My Certificate State ──────────────────────────────────────────────────────
  const [myCertificates, setMyCertificates] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
  const [certGenerating, setCertGenerating] = useState(false);
  const [certError, setCertError] = useState('');
  const [certNotice, setCertNotice] = useState('');

  // Firebase Push Notifications State
  const [pushPermission, setPushPermission] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');
  const [fcmToken, setFcmToken] = useState(null);
  const [liveAnnouncementToast, setLiveAnnouncementToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = await requestNotificationPermission(api);
        if (isMounted) {
          if (token) {
            setFcmToken(token);
            setPushPermission('granted');
          } else if (typeof window !== 'undefined' && 'Notification' in window) {
            setPushPermission(Notification.permission);
          }
        }
      } catch (e) {
        // silent fallback
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const [directNotifications, setDirectNotifications] = useState([]);
  const [unreadDirectCount, setUnreadDirectCount] = useState(0);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // ── Derived Progress & Metrics Calculations ──
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

  const submittedAssignmentsCount = studentAssignments.filter(a =>
    a.submissions?.some(s => s.studentId?.toString() === user?._id?.toString() || s.studentId === user?._id)
  ).length;

  const pendingQueriesCount = queries.filter(q => q.status === 'Pending').length;

  const fetchMyNotifications = async () => {
    try {
      const res = await api.get('/push/my-notifications');
      const list = res.data.notifications || [];
      setDirectNotifications(list);
      setUnreadDirectCount(res.data.unreadCount || 0);
      const unreadFirst = list.find(n => !n.read);
      if (unreadFirst) {
        triggerToast({
          title: unreadFirst.title,
          message: unreadFirst.message,
          date: unreadFirst.createdAt
        });
      }
    } catch (e) {
      // silent fetch
    }
  };

  const handleToggleNotifDropdown = async () => {
    const nextState = !isNotifDropdownOpen;
    setIsNotifDropdownOpen(nextState);
    if (nextState && unreadDirectCount > 0) {
      setUnreadDirectCount(0);
      try {
        await api.patch('/push/my-notifications/read');
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    fetchMyNotifications();
    const interval = setInterval(fetchMyNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const lastToastKeyRef = useRef('');
  const triggerToast = (toastObj) => {
    if (!toastObj?.title) return;
    const key = `${toastObj.title}_${toastObj.message || ''}`;
    if (lastToastKeyRef.current === key) return;
    lastToastKeyRef.current = key;
    setLiveAnnouncementToast(toastObj);
    setTimeout(() => {
      if (lastToastKeyRef.current === key) {
        lastToastKeyRef.current = '';
      }
    }, 10000);
  };

  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      if (payload?.notification) {
        triggerToast({
          title: payload.notification.title || 'New Notification!',
          message: payload.notification.body || '',
          date: new Date()
        });
        fetchMyNotifications();
        if (selectedBatchId) fetchDetails(selectedBatchId);
      }
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [selectedBatchId]);

  useEffect(() => {
    if (!selectedBatchId) return;
    const interval = setInterval(async () => {
      try {
        const r = await api.get(`/batches/student/${selectedBatchId}`);
        if (r.data?.notifications) {
          setBatchDetails(prev => {
            const oldLen = prev?.notifications?.length || 0;
            const newLen = r.data.notifications.length;
            if (newLen > oldLen && prev) {
              const newest = r.data.notifications[r.data.notifications.length - 1];
              triggerToast(newest);
            }
            return r.data;
          });
        }
      } catch (e) {
        // silent sync
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedBatchId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const r = await api.get('/batches/student');
      setBatches(r.data);
      if (r.data.length > 0 && !selectedBatchId) setSelectedBatchId(r.data[0]._id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const r = await api.get(`/batches/student/${id}`);
      setBatchDetails(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchQueries = async (batchId) => {
    if (!batchId) return;
    try {
      setQueriesLoading(true);
      const r = await api.get(`/queries/student?batchId=${batchId}`);
      setQueries(r.data);
    } catch (e) {
      console.error('Error fetching queries:', e);
    } finally {
      setQueriesLoading(false);
    }
  };

  const fetchStudentAssignments = async (batchId) => {
    if (!batchId) return;
    try {
      setStudentAssignmentsLoading(true);
      const r = await api.get(`/assignments/batch/${batchId}`);
      setStudentAssignments(r.data);
    } catch (e) {
      console.error('Error fetching student assignments:', e);
    } finally {
      setStudentAssignmentsLoading(false);
    }
  };

  const fetchMyCertificate = async () => {
    try {
      setCertLoading(true);
      setCertError('');
      const r = await api.get('/certificates/my');
      setMyCertificates(r.data?.certificates || []);
    } catch (e) {
      console.error('Error fetching certificate:', e);
      setMyCertificates([]);
    } finally {
      setCertLoading(false);
    }
  };

  // regenerate = true issues a new certificate and deletes the previous one for this course
  const requestCertificate = async (batchId, regenerate = false) => {
    if (!batchId || certGenerating) return;
    try {
      setCertGenerating(true);
      setCertError('');
      setCertNotice('');
      await api.post(`/batches/student/${batchId}/request-certificate`, { regenerate });
      if (regenerate) setCertNotice('New certificate generated. Your previous certificate for this course has been replaced.');
      // After generation, fetch the updated cert list
      await fetchMyCertificate();
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to generate certificate. Please try again.';
      const code = e.response?.data?.code;
      if (code === 'NO_STUDENT_RECORD') {
        setCertError('Your account is not linked to a student registration record. Please contact your training coordinator to generate your certificate.');
      } else if (code === 'NO_COURSE_DETAIL') {
        setCertError('No course details are linked to your student record. Please contact your training coordinator.');
      } else {
        setCertError(msg);
      }
    } finally {
      setCertGenerating(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => {
    if (selectedBatchId) {
      fetchDetails(selectedBatchId);
      fetchMyFeedback(selectedBatchId);
      fetchQueries(selectedBatchId);
      fetchStudentAssignments(selectedBatchId);
      fetchMyCertificate();
    } else {
      setBatchDetails(null);
      setMyFeedback(null);
      setQueries([]);
      setStudentAssignments([]);
      setMyCertificates([]);
      setCertError('');
    }
  }, [selectedBatchId]);

  // Fetch delete request status whenever the profile tab becomes active
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchDeleteRequestStatus();
    }
  }, [activeTab]);

  // Certificates issued for the currently selected batch (newest first, as returned by the API)
  const batchCertificates = myCertificates.filter(c => (c.batchId?._id || c.batchId) === selectedBatchId);

  const handleRegenerateCertificate = () => {
    if (!selectedBatchId || certGenerating) return;
    if (!window.confirm('Generate a new certificate for this course? Your current certificate for this course will be deleted and replaced with the new one.')) return;
    requestCertificate(selectedBatchId, true);
  };

  // Automatically issue certificate immediately when course progress reaches 100% and student has no cert yet
  useEffect(() => {
    if (
      selectedBatchId &&
      progressPct === 100 &&
      batchCertificates.length === 0 &&
      !certLoading &&
      !certGenerating &&
      !certError
    ) {
      requestCertificate(selectedBatchId);
    }
  }, [selectedBatchId, progressPct, batchCertificates.length, certLoading, certGenerating, certError]);

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignmentForSubmit(assignment);
    const mySub = assignment.submissions?.find(
      s => s.studentId?.toString() === user._id?.toString() || s.studentId === user._id
    );
    setSubmitFormData({
      answerText: mySub ? mySub.answerText : '',
      submissionUrl: mySub ? mySub.submissionUrl : ''
    });
    setSubmissionPdfFile(null);
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignmentSolution = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitSubmitting(true);

    if (!submitFormData.answerText.trim() && !submitFormData.submissionUrl.trim() && !submissionPdfFile) {
      setSubmitError('Please provide either a written solution, solution URL, or upload a PDF document.');
      setSubmitSubmitting(false);
      return;
    }

    try {
      let payload;
      let headers = {};

      if (submissionPdfFile) {
        payload = new FormData();
        payload.append('answerText', submitFormData.answerText.trim());
        payload.append('submissionUrl', submitFormData.submissionUrl.trim());
        payload.append('submissionPdf', submissionPdfFile);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = {
          answerText: submitFormData.answerText.trim(),
          submissionUrl: submitFormData.submissionUrl.trim()
        };
      }

      await api.post(`/assignments/${selectedAssignmentForSubmit._id}/submit`, payload, { headers });

      setSubmitSuccess('Assignment submitted successfully!');
      setSubmissionPdfFile(null);
      fetchStudentAssignments(selectedBatchId);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess('');
      }, 900);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit assignment.');
    } finally {
      setSubmitSubmitting(false);
    }
  };

  const handleOpenQueryModal = (topicObj = null) => {
    setQueryFormError('');
    setQueryFormSuccess('');
    setQueryFormData({
      topicId: topicObj ? topicObj._id : '',
      topicTitle: topicObj ? topicObj.title : 'General Course Doubt',
      title: '',
      description: '',
      priority: 'Medium'
    });
    setIsQueryModalOpen(true);
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setQueryFormError('');
    setQueryFormSuccess('');
    setQuerySubmitting(true);

    if (!queryFormData.title.trim() || !queryFormData.description.trim()) {
      setQueryFormError('Please enter a doubt title and detailed question.');
      setQuerySubmitting(false);
      return;
    }

    try {
      await api.post('/queries', {
        batchId: selectedBatchId,
        topicId: queryFormData.topicId || null,
        topicTitle: queryFormData.topicTitle || 'General Course Doubt',
        title: queryFormData.title.trim(),
        description: queryFormData.description.trim(),
        priority: queryFormData.priority
      });

      setQueryFormSuccess('Query submitted successfully to your expert instructor!');
      fetchQueries(selectedBatchId);
      setTimeout(() => {
        setIsQueryModalOpen(false);
        setQueryFormSuccess('');
        setActiveTab('queries');
      }, 900);
    } catch (err) {
      setQueryFormError(err.response?.data?.error || 'Failed to submit query.');
    } finally {
      setQuerySubmitting(false);
    }
  };

  const handleAddReply = async (queryId) => {
    const msg = replyText[queryId];
    if (!msg || !msg.trim()) return;

    setReplySubmitting(p => ({ ...p, [queryId]: true }));
    try {
      await api.post(`/queries/${queryId}/reply`, { message: msg.trim() });
      setReplyText(p => ({ ...p, [queryId]: '' }));
      fetchQueries(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setReplySubmitting(p => ({ ...p, [queryId]: false }));
    }
  };

  const fetchMyFeedback = async (id) => {
    try {
      const r = await api.get(`/batches/student/${id}/feedback/mine`);
      if (r.data) {
        setMyFeedback(r.data);
        setFbRating(r.data.rating);
        setFbReview(r.data.review || '');
        setFbEditing(false);
      } else {
        setMyFeedback(null);
        setFbRating(0);
        setFbReview('');
        setFbEditing(false);
      }
    } catch { setMyFeedback(null); }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFbError(''); setFbSuccess(''); setFbSubmitting(true);
    if (!fbRating) { setFbError('Please select a star rating.'); setFbSubmitting(false); return; }
    try {
      const r = await api.post(`/batches/student/${selectedBatchId}/feedback`, { rating: fbRating, review: fbReview });
      setMyFeedback(r.data);
      setFbSuccess(myFeedback ? 'Feedback updated!' : 'Feedback submitted! Thank you.');
      setFbEditing(false);
      setTimeout(() => setFbSuccess(''), 3000);
    } catch (err) { setFbError(err.response?.data?.error || 'Failed to submit feedback'); }
    finally { setFbSubmitting(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault(); setJoinError(''); setJoinSuccess(''); setJoining(true);
    if (!joinData.batchId || !joinData.uniqueKey) { setJoinError('Please fill in both fields.'); setJoining(false); return; }
    try {
      const r = await api.post('/batches/student/join', { batchId: joinData.batchId.trim(), uniqueKey: joinData.uniqueKey.trim() });
      setJoinSuccess(r.data.message); setJoinData({ batchId: '', uniqueKey: '' }); await fetchBatches();
      if (r.data.batch?._id) setSelectedBatchId(r.data.batch._id);
      setTimeout(() => { setIsJoinOpen(false); setJoinSuccess(''); }, 1000);
    } catch (err) { setJoinError(err.response?.data?.error || 'Invalid credentials or batch already joined.'); }
    finally { setJoining(false); }
  };

  // ── Delete Account handlers ──────────────────────────────────────────────
  const fetchDeleteRequestStatus = async () => {
    try {
      const r = await api.get('/delete-requests/mine');
      if (r.data?.request) {
        setDeleteReqData(r.data.request);
        setDeleteReqStatus(r.data.request.status);
      } else {
        setDeleteReqData(null);
        setDeleteReqStatus(null);
      }
    } catch (e) {
      // silent – non-critical
    }
  };

  const handleRequestDeletion = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== 'delete my account') {
      setDeleteError('Please type the exact phrase to confirm.');
      return;
    }
    setDeleteSubmitting(true);
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const r = await api.post('/delete-requests', { reason: deleteReason.trim() });
      setDeleteSuccess(r.data.message);
      setDeleteReqStatus('pending');
      setDeleteReqData(r.data.request);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      setDeleteReason('');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setDeleteSubmitting(false);
    }
  };


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
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>CANDIDATE PORTAL</div>
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
              { id: 'curriculum', label: 'Curriculum', icon: ListChecks, count: `${completedUnits}/${totalUnits}` },
              { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: studentAssignments.length },
              { id: 'notifications', label: 'Announcements', icon: Bell, count: batchDetails?.notifications?.length },
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

          {/* Enrolled Batches Group */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 8px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                MY ENROLLED BATCHES
              </span>
              <button onClick={() => setIsJoinOpen(true)} title="Join New Batch" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2 }}>
                <Plus size={13} />
              </button>
            </div>
            {loading ? (
              <div style={{ padding: '12px 8px', fontSize: 12, color: C.muted, display: 'flex', gap: 6 }}><Spin color={C.muted} /> Loading...</div>
            ) : batches.length === 0 ? (
              <Pill variant="outline" onClick={() => setIsJoinOpen(true)} style={{ width: '100%', fontSize: 11, padding: '6px' }}>+ Join Batch</Pill>
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

          {/* Resources & Support */}
          <div>
            <div style={{ padding: '0 8px 8px', fontSize: 11, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RESOURCES &amp; SUPPORT
            </div>
            {[
              { id: 'pdfs', label: 'Study PDFs', icon: FileText },
              { id: 'links', label: 'Shared Links', icon: Link2 },
              { id: 'queries', label: 'My Doubts', icon: HelpCircle, count: pendingQueriesCount > 0 ? `${pendingQueriesCount}` : undefined },
              { id: 'feedback', label: 'Course Review', icon: MessageSquare },
              { id: 'certificate', label: 'My Certificate', icon: Award, count: myCertificates.length > 0 ? myCertificates.length : undefined },
              { id: 'profile', label: 'My Profile', icon: User }
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
                {item.count && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: C.orangeSoft, color: C.orangeText }}>{item.count}</span>
                )}
              </button>
            ))}
          </div>

        </div>

        {/* Bottom Floating Profile Card */}
        <div
          onClick={() => setActiveTab('profile')}
          title="Click to view & edit profile"
          style={{
            background: C.darkNav, borderRadius: RADIUS.md, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
            boxShadow: '0 8px 24px rgba(30,27,75,0.3)', cursor: 'pointer',
            border: activeTab === 'profile' ? `1px solid ${C.primary}` : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff'
            }}>{user?.name?.charAt(0).toUpperCase()}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); logout(); }} title="Sign Out" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>
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
            <span>Enrolled Batch: <strong style={{ color: C.ink }}>{batchDetails?.name || 'Loading Batch...'}</strong> (ID: {batchDetails?.batchId || '—'}).</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={handleToggleNotifDropdown} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: C.primary, fontWeight: 700, fontSize: 12 }}>
                <Bell size={14} /> Alerts {unreadDirectCount > 0 && <span style={{ background: C.redText, color: '#fff', fontSize: 9, borderRadius: 999, padding: '1px 5px' }}>{unreadDirectCount}</span>}
              </button>
              {isNotifDropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: 28, width: 280, background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.sm, boxShadow: C.shadowLg, zIndex: 90, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Notifications</div>
                  {directNotifications.length === 0 ? (
                    <div style={{ fontSize: 11, color: C.muted }}>No direct alerts.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                      {directNotifications.slice(0, 5).map((n, i) => (
                        <div key={i} style={{ fontSize: 11, borderBottom: `1px solid ${C.borderSoft}`, paddingBottom: 6 }}>
                          <strong style={{ color: C.ink }}>{n.title}</strong>
                          <div style={{ color: C.body }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Pill variant="outline" onClick={() => setIsJoinOpen(true)} style={{ fontSize: 11, padding: '4px 10px' }}>+ Join Batch</Pill>
          </div>
        </div>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 4, letterSpacing: '-0.6px' }}>
                Welcome back, {user?.name || 'Candidate'}
              </h1>
              <p style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
                {batchDetails ? `Syllabus progress and active tasks for ${batchDetails.name}` : 'Select an enrolled batch to view course materials.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pill variant="outline" icon={Globe} onClick={() => window.open('/', '_blank')} style={{ boxShadow: C.shadow }}>
                View Portal
              </Pill>
            </div>
          </div>

          {/* Quick Action Pill Strip — Fully Clickable Candidate Triggers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { label: 'Syllabus', color: C.purple, bg: C.purpleSoft, icon: ListChecks, action: () => setActiveTab('curriculum') },
              { label: 'Submit Task', color: C.teal, bg: C.tealSoft, icon: ClipboardList, action: () => setActiveTab('assignments') },
              { label: 'Ask Doubt', color: C.orange, bg: C.orangeSoft, icon: HelpCircle, action: () => handleOpenQueryModal() },
              { label: 'Submit Review', color: C.blue, bg: C.blueSoft, icon: Star, action: () => setActiveTab('feedback') },
              { label: 'My Profile', color: C.purpleText, bg: C.purpleSoft, icon: User, action: () => setActiveTab('profile') },
              { label: 'Study PDFs', color: C.greenText, bg: C.greenSoft, icon: FileText, action: () => setActiveTab('pdfs') },
              { label: 'My Certificate', color: C.gold, bg: '#FFFBEB', icon: Award, action: () => setActiveTab('certificate') },
              { label: 'Join Batch', color: C.primary, bg: C.primarySoft, icon: Plus, action: () => setIsJoinOpen(true) },
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
                  <Card onClick={() => setActiveTab('curriculum')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconBadge icon={ListChecks} color={C.purple} bg={C.purpleSoft} size={38} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.4px' }}>
                          {completedUnits}/{totalUnits}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Syllabus Covered ({progressPct}%)</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </Card>

                  <Card onClick={() => setActiveTab('assignments')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconBadge icon={ClipboardList} color={C.teal} bg={C.tealSoft} size={38} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.4px' }}>
                          {studentAssignments.length}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>My Assignments ({submittedAssignmentsCount} submitted)</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </Card>

                  <Card onClick={() => setActiveTab('queries')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <IconBadge icon={HelpCircle} color={C.orange} bg={C.orangeSoft} size={38} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.4px' }}>
                          {queries.length}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>My Doubts ({pendingQueriesCount} pending)</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.muted} />
                  </Card>
                </div>

                {/* Center Main Analytics Graph */}
                <Card style={{ display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>Learning Trajectory</h3>
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

                      <path d="M0,100 Q70,70 140,80 T280,50 T420,30 T500,60" fill="none" stroke={C.purple} strokeWidth="3" strokeLinecap="round" />
                      <path d="M0,115 Q70,100 140,90 T280,80 T420,60 T500,75" fill="none" stroke={C.teal} strokeWidth="3" strokeLinecap="round" />

                      <line x1="280" y1="0" x2="280" y2="120" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx="280" cy="50" r="4" fill={C.purple} stroke="#fff" strokeWidth="2" />
                      <circle cx="280" cy="80" r="4" fill={C.teal} stroke="#fff" strokeWidth="2" />
                    </svg>

                    <div style={{
                      position: 'absolute', top: 10, left: 240,
                      background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: '8px 14px', boxShadow: C.shadowMd, fontSize: 11
                    }}>
                      <div style={{ fontWeight: 800, color: C.ink, marginBottom: 4 }}>Current Progress</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.purple, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple }} />
                        <span>Syllabus: {progressPct}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.teal, fontWeight: 700, marginTop: 2 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.teal }} />
                        <span>Submitted: {submittedAssignmentsCount}</span>
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
                  <Card onClick={() => setActiveTab('pdfs')} style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: C.greenText }} />
                      Study PDF Materials
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.6px', lineHeight: 1 }}>
                      {batchDetails?.pdfs?.length || 0}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.greenText, marginTop: 6 }}>
                      Files available for download
                    </div>
                  </Card>

                  <Card onClick={() => setActiveTab('feedback')} style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: C.orange }} />
                      My Course Review
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.6px', lineHeight: 1 }}>
                      {myFeedback ? `★ ${myFeedback.rating}.0` : 'Not Given'}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginTop: 6 }}>
                      {myFeedback ? 'Feedback submitted' : 'Click to rate course'}
                    </div>
                  </Card>
                </div>

              </div>

              {/* Certificate Ready Banner — shown when progress = 100% */}
              {progressPct === 100 && (
                <div style={{
                  borderRadius: RADIUS.lg, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF3C7 40%, #FFFBEB 100%)',
                  border: '2px solid #F59E0B40',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.15)'
                }}>
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
                      <Award size={26} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#92400E', marginBottom: 3 }}>
                        🎉 Course Complete — {batchCertificates.length > 0 ? 'Certificate Issued!' : 'Certificate Being Generated…'}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#B45309', lineHeight: 1.5 }}>
                        {batchCertificates.length > 0
                          ? `Your certificate is ready. ID: ${batchCertificates[0].certificateId}`
                          : 'You have completed 100% of the curriculum. Your certificate is being generated — check the "My Certificate" tab soon!'}
                      </div>
                    </div>
                    {batchCertificates.length > 0 && (
                      <button
                        onClick={() => setActiveTab('certificate')}
                        style={{
                          padding: '10px 20px', background: 'linear-gradient(135deg,#F59E0B,#D97706)',
                          color: '#fff', border: 'none', borderRadius: RADIUS.pill,
                          fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <Award size={15} /> View Certificate
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Row Grid: Course Syllabus & Candidate Progress */}
              <div className="dashboard-grid-2">

                {/* Course Syllabus Overview */}
                <Card style={{ padding: '20px 24px' }}>
                  <SectionHeader
                    title="Course Syllabus Topics"
                    sub="Topics covered by your instructor"
                    action={<Pill variant="outline" onClick={() => setActiveTab('curriculum')} style={{ fontSize: 11, padding: '5px 12px' }}>View Full Syllabus</Pill>}
                  />
                  
                  <div style={{ marginTop: 14 }}>
                    {curriculum.length === 0 ? (
                      <Empty icon={ListChecks} title="No curriculum topics added" sub="Your instructor will upload the course syllabus soon." />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {curriculum.slice(0, 5).map((topic, idx) => (
                          <div key={topic._id} style={{
                            padding: '10px 14px', borderRadius: RADIUS.sm, background: '#F8FAFC',
                            border: `1px solid ${topic.isCompleted ? C.greenText + '30' : C.borderSoft}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: 6,
                                background: topic.isCompleted ? C.greenSoft : C.purpleSoft,
                                color: topic.isCompleted ? C.greenText : C.purpleText,
                                fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>{idx + 1}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{topic.title}</div>
                                {topic.description && <div style={{ fontSize: 11, color: C.muted }}>{topic.description}</div>}
                              </div>
                            </div>
                            {topic.isCompleted ? (
                              <Badge color={C.greenText} bg={C.greenSoft}>✓ Complete</Badge>
                            ) : (
                              <Badge color={C.muted} bg="#F1F5F9">{topic.subtopics?.length || 0} subtopics</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Candidate Progress Breakdown */}
                <Card style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <SectionHeader title="Syllabus Progress Breakdown" sub="Live completion and task metrics" />
                    
                    <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, marginTop: 12, letterSpacing: '-0.8px' }}>
                      {progressPct}%
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginLeft: 8 }}>Syllabus Completed</span>
                    </div>

                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: RADIUS.pill, display: 'flex', overflow: 'hidden', margin: '14px 0 18px' }}>
                      <div style={{ width: `${progressPct}%`, background: C.purple }} title={`Covered (${progressPct}%)`} />
                      <div style={{ width: `${100 - progressPct}%`, background: '#CBD5E1' }} title={`Remaining (${100 - progressPct}%)`} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Covered Subtopics', pct: `${completedUnits} units`, color: C.purple },
                        { label: 'Remaining Subtopics', pct: `${totalUnits - completedUnits} units`, color: '#CBD5E1' },
                        { label: 'My Submitted Tasks', pct: `${submittedAssignmentsCount} submitted`, color: C.teal },
                        { label: 'Announcements Posted', pct: `${batchDetails?.notifications?.length || 0} announcements`, color: C.orange },
                        { label: 'Study PDFs Available', pct: `${batchDetails?.pdfs?.length || 0} files`, color: C.greenText },
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
                    <Pill variant="outline" onClick={() => setActiveTab('curriculum')} style={{ fontSize: 11, padding: '5px 12px' }}>View Full Curriculum</Pill>
                    <span style={{ fontSize: 10.5, color: C.muted }}>Synced live</span>
                  </div>
                </Card>

              </div>

            </div>
          )}

          {/* CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <SectionHeader
                title="Course Curriculum"
                sub={`${totalCount} topics · ${completedUnits}/${totalUnits} subtopics completed`}
              />

              {totalCount > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <Donut pct={progressPct} sub="complete" color={progressPct === 100 ? C.greenText : C.purple} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 2 }}>Syllabus Completion</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{completedUnits} of {totalUnits} subtopics covered</div>
                        {progressPct === 100 && totalUnits > 0 ? (
                          <Badge color={C.greenText} bg={C.greenSoft}>✓ Syllabus Complete!</Badge>
                        ) : (
                          <Badge color={C.purpleText} bg={C.purpleSoft}>{totalUnits - completedUnits} subtopics remaining</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <BarChart2 size={14} color={C.primary} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Topic Breakdown</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[...curriculum].sort((a, b) => a.order - b.order).slice(0, 5).map((topic) => {
                        const tTotal = topic.subtopics?.length > 0 ? topic.subtopics.length : 1;
                        const tDone = topic.subtopics?.length > 0 ? topic.subtopics.filter(s => s.isCompleted).length : (topic.isCompleted ? 1 : 0);
                        return <BarRow key={topic._id} label={topic.title} value={tDone} max={tTotal} color={C.primary} valueLabel={`${tDone}/${tTotal}`} />;
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {!totalCount ? (
                <Empty icon={ClipboardList} title="No curriculum uploaded" sub="Your instructor has not added syllabus topics to this batch yet." />
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
                            <Pill onClick={() => handleOpenQueryModal(topic)} style={{ padding: '5px 10px', fontSize: 11, background: C.orangeSoft, color: C.orangeText }}><HelpCircle size={12} /> Ask Doubt</Pill>
                          </div>
                        </div>

                        {expanded && topic.subtopics?.length > 0 && (
                          <div style={{ padding: '12px 18px 14px 18px', borderTop: `1px solid ${C.borderSoft}`, background: '#FAFAFA' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {topic.subtopics.map((st) => (
                                <div key={st._id} style={{
                                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                  borderRadius: RADIUS.sm, background: st.isCompleted ? C.greenSoft : '#F9FAFB',
                                  border: `1px solid ${st.isCompleted ? C.greenText + '30' : C.borderSoft}`
                                }}>
                                  <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: st.isCompleted ? '#fff' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {st.isCompleted ? <Check size={11} color={C.greenText} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, display: 'block' }} />}
                                  </div>
                                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: st.isCompleted ? C.ink : C.body }}>{st.title}</span>
                                  {st.isCompleted && <span style={{ fontSize: 10, color: C.greenText, fontWeight: 700 }}>Covered</span>}
                                </div>
                              ))}
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
              <SectionHeader title="Course Assignments &amp; Homework" sub="View assigned tasks and submit your solutions" />

              {studentAssignmentsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: C.muted, fontSize: 13, gap: 10 }}><Spin color={C.primary} /> Loading assignments...</div>
              ) : studentAssignments.length === 0 ? (
                <Empty icon={ClipboardList} title="No assignments assigned" sub="Your instructor has not created any assignments for this batch yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {studentAssignments.map(asg => {
                    const mySub = asg.submissions?.find(
                      s => s.studentId?.toString() === user?._id?.toString() || s.studentId === user?._id
                    );
                    const isSubmitted = !!mySub;
                    const isGraded = mySub?.status === 'Graded';
                    const isOverdue = new Date(asg.dueDate) < new Date();

                    return (
                      <Card key={asg._id} accent={isGraded ? C.greenText : isSubmitted ? C.purple : C.orange}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <Badge color={isOverdue && !isSubmitted ? C.redText : C.greenText} bg={isOverdue && !isSubmitted ? C.redSoft : C.greenSoft}><Calendar size={10} /> Due: {fmt(asg.dueDate)}</Badge>
                              <Badge color={C.purpleText} bg={C.purpleSoft}>Score: {asg.totalPoints} pts</Badge>
                              {isGraded ? (
                                <Badge color={C.greenText} bg={C.greenSoft}>Graded: {mySub.grade}/{asg.totalPoints}</Badge>
                              ) : isSubmitted ? (
                                <Badge color={C.purpleText} bg={C.purpleSoft}>Submitted</Badge>
                              ) : (
                                <Badge color={C.orangeText} bg={C.orangeSoft}>Pending</Badge>
                              )}
                            </div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{asg.title}</h4>
                          </div>
                          <Pill onClick={() => handleOpenSubmitModal(asg)} style={{ padding: '7px 16px', fontSize: 11 }}>
                            {isSubmitted ? 'Update Solution' : 'Submit Solution'}
                          </Pill>
                        </div>
                        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 10 }}>{asg.description}</p>
                        {asg.fileUrl && <a href={asg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.primaryDark, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}><FileText size={13} /> View Task File Guidelines</a>}

                        {mySub && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}`, background: C.purpleSoft, padding: '12px 14px', borderRadius: RADIUS.sm }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: C.purpleText, marginBottom: 4 }}>My Submission Details</div>
                            {mySub.answerText && <div style={{ fontSize: 12, color: C.ink, marginBottom: 4 }}><strong>Written Response:</strong> {mySub.answerText}</div>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              {mySub.submissionUrl && <a href={mySub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: C.primaryDark, fontWeight: 700, textDecoration: 'none' }}>🔗 Submitted Link</a>}
                              {mySub.submissionPdfUrl && (
                                <a href={mySub.submissionPdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.greenText, fontWeight: 700, textDecoration: 'none' }}>
                                  <FileText size={13} /> Submitted PDF Document
                                </a>
                              )}
                            </div>
                            {mySub.feedback && <div style={{ fontSize: 12, color: C.greenText, marginTop: 6 }}><strong>Instructor Feedback:</strong> {mySub.feedback}</div>}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
              <SectionHeader title="Batch Announcements" sub="Broadcast updates from your instructor" />
              {!batchDetails?.notifications?.length ? (
                <Empty icon={Bell} title="No announcements posted" sub="Your instructor has not posted announcements for this batch yet." />
              ) : batchDetails.notifications.map((n, i) => (
                <Card key={n._id || i} accent={C.orange} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{n.title}</h4>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}><Calendar size={11} /> {fmt(n.date)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{n.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* STUDY PDFS TAB */}
          {activeTab === 'pdfs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <SectionHeader title="Study PDFs &amp; Learning Materials" sub="Download course notes uploaded by your instructor" />
              {!batchDetails?.pdfs?.length ? (
                <Empty icon={FileText} title="No PDFs uploaded" sub="No study PDF files uploaded for this batch yet." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                  {batchDetails.pdfs.map((p, i) => (
                    <Card key={p._id || i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <IconBadge icon={FileText} color={C.greenText} bg={C.greenSoft} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{p.title}</div>
                        {p.description && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>{p.description}</div>}
                        <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> {fmt(p.date)}</div>
                      </div>
                      <Pill variant="ghost" icon={Download} onClick={() => window.open(p.pdfUrl, '_blank')}>Download PDF</Pill>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LINKS TAB */}
          {activeTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
              <SectionHeader title="Shared Reference Links" sub="Course links shared by your instructor" />
              {!batchDetails?.links?.length ? (
                <Empty icon={Link2} title="No shared links" sub="No reference links shared for this batch yet." />
              ) : batchDetails.links.map((l, i) => (
                <Card key={l._id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                  <IconBadge icon={Link2} color={C.blueText} bg={C.blueSoft} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{l.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                  </div>
                  <Pill variant="ghost" icon={Link2} onClick={() => window.open(l.url, '_blank')} style={{ background: C.blueSoft, color: C.blueText, padding: '7px 14px' }}>Open Link</Pill>
                </Card>
              ))}
            </div>
          )}

          {/* MY DOUBTS & QUERIES TAB */}
          {activeTab === 'queries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">
              <Card>
                <SectionHeader title="My Doubts &amp; Queries" sub="Ask questions and receive direct expert guidance"
                  action={<Pill icon={Plus} onClick={() => handleOpenQueryModal()} style={{ background: C.orangeSoft, color: C.orangeText }}>Ask New Doubt</Pill>} />
              </Card>

              {queriesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: C.muted, fontSize: 13, gap: 10 }}><Spin color={C.primary} /> Loading your doubts...</div>
              ) : queries.length === 0 ? (
                <Empty icon={HelpCircle} title="No doubts submitted" sub="Click 'Ask New Doubt' to submit questions to your instructor." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {queries.map(q => {
                    const isExpanded = expandedQueryId === q._id;
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
                              <Badge color={badge.color} bg={badge.bg}>{q.status}</Badge>
                            </div>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{q.title}</h4>
                            <div style={{ fontSize: 11, color: C.muted }}>Asked on {fmt(q.createdAt)}</div>
                          </div>
                          <Pill variant="outline" onClick={() => setExpandedQueryId(isExpanded ? null : q._id)} style={{ padding: '7px 12px', fontSize: 11 }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {q.replies?.length || 0} Replies
                          </Pill>
                        </div>
                        <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 12, background: '#F8FAFC', padding: '10px 12px', borderRadius: RADIUS.sm, border: `1px solid ${C.borderSoft}` }}>{q.description}</p>

                        {isExpanded && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h5 style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>Conversation Thread ({q.replies?.length || 0})</h5>
                            {(!q.replies || q.replies.length === 0) ? (
                              <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>Your question has been received. Your instructor will respond shortly.</div>
                            ) : q.replies.map((rep, idx) => {
                              const isExpert = ['Teacher', 'Admin', 'Staff'].includes(rep.senderRole);
                              return (
                                <div key={idx} style={{ padding: '12px 14px', borderRadius: RADIUS.sm, background: isExpert ? C.primarySoft : '#F8FAFC', border: `1px solid ${isExpert ? C.primary + '30' : C.borderSoft}`, alignSelf: isExpert ? 'flex-start' : 'flex-end', maxWidth: '92%' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                                    <strong style={{ fontSize: 12, color: isExpert ? C.primaryDark : C.ink }}>{rep.senderName} {isExpert ? '(Expert Instructor)' : '(You)'}</strong>
                                    <span style={{ fontSize: 10, color: C.muted }}>{fmt(rep.createdAt)}</span>
                                  </div>
                                  <p style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5, whiteSpace: 'pre-line', margin: 0 }}>{rep.message}</p>
                                </div>
                              );
                            })}
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                              <input type="text" value={replyText[q._id] || ''} onChange={e => setReplyText({ ...replyText, [q._id]: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddReply(q._id); }} placeholder="Type follow-up message..." style={{ flex: 1, padding: '10px 14px', borderRadius: RADIUS.pill, background: '#F8FAFC', border: `1px solid ${C.border}`, color: C.ink, fontSize: 12.5, outline: 'none', fontFamily: FONT }} />
                              <Pill onClick={() => handleAddReply(q._id)} disabled={replySubmitting[q._id] || !replyText[q._id]?.trim()} icon={Send}>Send</Pill>
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

          {/* COURSE REVIEW TAB */}
          {activeTab === 'feedback' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-in">
              <Card>
                <SectionHeader title="Course &amp; Instructor Review" sub="Share your learning experience for this batch" />
                <form onSubmit={handleSubmitFeedback} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {fbError && <FormAlert msg={fbError} type="error" />}
                  {fbSuccess && <FormAlert msg={fbSuccess} type="success" />}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Select Rating</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button type="button" key={s} onClick={() => setFbRating(s)} onMouseEnter={() => setFbHover(s)} onMouseLeave={() => setFbHover(0)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <Star size={24} fill={(fbHover || fbRating) >= s ? '#F59E0B' : 'none'} color={(fbHover || fbRating) >= s ? '#F59E0B' : C.border} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Your Review</label>
                    <textarea value={fbReview} onChange={e => setFbReview(e.target.value)} placeholder="Write your thoughts about the course..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <Pill type="submit" disabled={fbSubmitting} style={{ alignSelf: 'flex-start' }}>
                    {fbSubmitting ? <Spin /> : myFeedback ? 'Update Review' : 'Submit Review'}
                  </Pill>
                </form>
              </Card>
            </div>
          )}

          {/* MY PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-in">
              <SectionHeader
                title="My Profile Settings"
                sub="View and edit your personal details, academic information, and profile picture"
              />

              <div className="dashboard-grid-2" style={{ alignItems: 'flex-start' }}>
                
                {/* Left Card: Profile Picture & Quick Details */}
                <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 110, height: 110 }}>
                    {profileForm.photoUrl ? (
                      <img
                        src={profileForm.photoUrl}
                        alt={profileForm.name || 'Candidate'}
                        style={{
                          width: 110, height: 110, borderRadius: RADIUS.lg,
                          objectFit: 'cover', border: `3px solid ${C.primarySoft}`,
                          boxShadow: C.shadowMd
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 110, height: 110, borderRadius: RADIUS.lg,
                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
                        color: '#fff', fontSize: 38, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: C.shadowMd
                      }}>
                        {(profileForm.name || user?.name || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: RADIUS.lg,
                        background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(2px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 11, fontWeight: 700, gap: 6
                      }}>
                        <Spin color="#fff" size={20} />
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: '0 0 4px' }}>{profileForm.name || user?.name}</h3>
                    <Badge color={C.purpleText} bg={C.purpleSoft}>Candidate ({user?.role || 'Student'})</Badge>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{user?.email}</div>
                  </div>

                  <div style={{ width: '100%', borderTop: `1px solid ${C.borderSoft}`, paddingTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 10, textAlign: 'left' }}>Profile Picture</div>

                    <div>
                      <label style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: RADIUS.sm, border: `1px dashed ${C.primary}`,
                        background: C.primarySoft, color: C.primaryDark, fontSize: 12, fontWeight: 700,
                        cursor: uploadingPhoto ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease'
                      }}>
                        <Upload size={15} /> {uploadingPhoto ? 'Uploading Photo...' : 'Upload Profile Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadPhoto}
                          disabled={uploadingPhoto}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6, textAlign: 'center' }}>
                        Supports JPG, PNG, WEBP (Max 5MB)
                      </div>
                    </div>

                    {profileForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileForm(prev => ({ ...prev, photoUrl: '' }));
                          setPhotoUrlInput('');
                        }}
                        style={{
                          width: '100%', marginTop: 10, padding: '6px', background: 'none',
                          border: `1px solid ${C.redSoft}`, borderRadius: RADIUS.sm,
                          color: C.redText, fontSize: 11, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Remove Current Photo
                      </button>
                    )}
                  </div>
                </Card>

                {/* Right Card: Editable Profile Details Form */}
                <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <SectionHeader title="Edit Candidate Details" sub="Update your personal, contact, and academic records" />

                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {profileError && <FormAlert msg={profileError} type="error" />}
                    {profileSuccess && <FormAlert msg={profileSuccess} type="success" />}

                    {/* Account Fixed Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Username / Registration ID</label>
                        <input type="text" readOnly value={user?.username || ''} style={{ ...inputStyle, background: '#F1F5F9', cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Registered Email</label>
                        <input type="email" readOnly value={user?.email || ''} style={{ ...inputStyle, background: '#F1F5F9', cursor: 'not-allowed' }} />
                      </div>
                    </div>

                    <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 4 }} />

                    {/* Personal Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Full Name *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Enter full name"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Phone / Mobile Number</label>
                        <input
                          type="text"
                          value={profileForm.mobile}
                          onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                          placeholder="10-digit mobile number"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Date of Birth (DOB)</label>
                        <input
                          type="date"
                          value={profileForm.dob}
                          onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Gender</label>
                        <select
                          value={profileForm.gender}
                          onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                          style={inputStyle}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Address</label>
                      <textarea
                        rows={2}
                        value={profileForm.address}
                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Enter address"
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 4 }} />

                    {/* Academic & Training Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>State</label>
                        <input
                          type="text"
                          value={profileForm.state}
                          onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                          placeholder="e.g. Uttar Pradesh"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Branch / Department</label>
                        <input
                          type="text"
                          value={profileForm.branch}
                          onChange={e => setProfileForm({ ...profileForm, branch: e.target.value })}
                          placeholder="e.g. Computer Science"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Year of Study</label>
                        <input
                          type="text"
                          value={profileForm.year}
                          onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                          placeholder="e.g. 3rd Year / 2025"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Training Technology</label>
                        <input
                          type="text"
                          value={profileForm.technology}
                          onChange={e => setProfileForm({ ...profileForm, technology: e.target.value })}
                          placeholder="e.g. Full Stack Web Dev"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
                      <Pill type="submit" disabled={profileSaving} style={{ minWidth: 140 }}>
                        {profileSaving ? <Spin /> : 'Save Changes'}
                      </Pill>
                    </div>
                  </form>
                </Card>

              </div>

              {/* ── DANGER ZONE — Delete Account ── */}
              <div style={{
                border: `1.5px solid ${C.red}30`,
                borderRadius: RADIUS.md,
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '14px 22px',
                  background: C.redSoft,
                  borderBottom: `1px solid ${C.red}20`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <ShieldAlert size={18} color={C.redText} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.redText }}>Danger Zone</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>Actions here are irreversible. Please proceed with caution.</div>
                  </div>
                </div>

                <div style={{ padding: '20px 22px', background: '#fff' }}>
                  {/* No request yet */}
                  {deleteReqStatus === null && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>Request Account Deletion</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3, maxWidth: 480, lineHeight: 1.6 }}>
                          Submitting this request will flag your account for deletion. An admin will review it within <strong>15–30 days</strong>.
                          Your data will be permanently removed only after admin approval.
                        </div>
                      </div>
                      <button
                        id="btn-request-delete-account"
                        onClick={() => { setDeleteError(''); setShowDeleteConfirm(true); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          padding: '9px 18px', borderRadius: RADIUS.pill,
                          background: 'transparent', border: `1.5px solid ${C.red}`,
                          color: C.redText, fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.redSoft; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Trash2 size={14} /> Delete My Account
                      </button>
                    </div>
                  )}

                  {/* Pending */}
                  {deleteReqStatus === 'pending' && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                      borderRadius: RADIUS.sm,
                      border: '1.5px solid #F59E0B40'
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: '#F59E0B20', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Clock size={20} color="#D97706" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#92400E' }}>Request Received — Under Review</div>
                        <div style={{ fontSize: 12.5, color: '#78350F', marginTop: 4, lineHeight: 1.7 }}>
                          Your account deletion request has been submitted and is being reviewed by our admin team.
                          This process typically takes <strong>15 to 30 days</strong>. You will be notified once a decision is made.
                        </div>
                        {deleteReqData?.createdAt && (
                          <div style={{ fontSize: 11, color: '#92400E', marginTop: 8, fontWeight: 600 }}>
                            📅 Requested on: {new Date(deleteReqData.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejected */}
                  {deleteReqStatus === 'rejected' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '16px 20px',
                        background: C.redSoft, borderRadius: RADIUS.sm,
                        border: `1.5px solid ${C.red}30`
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: `${C.red}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <X size={20} color={C.redText} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.redText }}>Deletion Request Rejected</div>
                          <div style={{ fontSize: 12.5, color: '#7F1D1D', marginTop: 4, lineHeight: 1.7 }}>
                            Your previous deletion request was not approved. {deleteReqData?.adminNote ? (
                              <><strong>Admin note:</strong> {deleteReqData.adminNote}</>
                            ) : 'You may submit a new request if you still wish to delete your account.'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setDeleteReqStatus(null);
                            setDeleteReqData(null);
                            setShowDeleteConfirm(true);
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '9px 18px', borderRadius: RADIUS.pill,
                            background: 'transparent', border: `1.5px solid ${C.red}`,
                            color: C.redText, fontSize: 13, fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} /> Submit New Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success message */}
                  {deleteSuccess && <FormAlert msg={deleteSuccess} type="success" />}
                </div>
              </div>

            </div>
          )}

          {/* MY CERTIFICATE TAB */}
          {activeTab === 'certificate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-in">
              <SectionHeader
                title="My Certificate"
                sub="Your course completion certificate issued upon finishing the curriculum"
                action={
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {progressPct === 100 && batchCertificates.length > 0 && (
                      <Pill icon={RefreshCw} onClick={handleRegenerateCertificate} disabled={certGenerating} style={{ fontSize: 11, padding: '5px 12px' }}>
                        {certGenerating ? 'Generating…' : 'Regenerate Certificate'}
                      </Pill>
                    )}
                    <Pill variant="outline" icon={Download} onClick={fetchMyCertificate} style={{ fontSize: 11, padding: '5px 12px' }}>
                      Refresh
                    </Pill>
                  </div>
                }
              />

              {certLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 12 }}>
                  <Spin color={C.primary} size={22} />
                  <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Loading your certificate…</span>
                </div>
              ) : certGenerating && myCertificates.length === 0 ? (
                <div style={{
                  background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)',
                  border: `2px dashed ${C.primary}40`, borderRadius: RADIUS.lg,
                  padding: '56px 32px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#6366F1,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                    <Spin color="#fff" size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 6 }}>
                      Generating Your Certificate...
                    </h3>
                    <p style={{ fontSize: 13, color: C.muted, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
                      Congratulations on completing the course! We are preparing your official verified certificate with QR code validation. This will take just a moment...
                    </p>
                  </div>
                </div>
              ) : myCertificates.length === 0 ? (
                /* ── Empty State ── */
                <div style={{
                  background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)',
                  border: `2px dashed ${C.primary}40`, borderRadius: RADIUS.lg,
                  padding: '56px 32px', textAlign: 'center'
                }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#6366F1,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                    <Award size={32} color="#fff" strokeWidth={2} />
                  </div>

                  {progressPct === 100 ? (
                    <>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 8 }}>
                        🎉 Course Completed!
                      </h3>
                      {certError ? (
                        <div style={{ margin: '0 auto 20px', maxWidth: 480, padding: '12px 16px', background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: RADIUS.sm, color: C.redText, fontSize: 13 }}>
                          {certError}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '0 auto 16px' }}>
                          <Spin color={C.primary} size={18} />
                          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
                            Issuing your official certificate automatically...
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 8 }}>
                        Certificate Not Yet Issued
                      </h3>
                      <p style={{ fontSize: 13, color: C.muted, maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.7 }}>
                        Your certificate will be automatically generated once your expert marks all curriculum topics as complete (100% course progress).
                      </p>
                      {/* Progress bar */}
                      <div style={{ maxWidth: 320, margin: '0 auto 8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                          <span>Current Progress</span><span>{progressPct}%</span>
                        </div>
                        <div style={{ height: 10, background: '#E2E8F0', borderRadius: RADIUS.pill, overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', borderRadius: RADIUS.pill, transition: 'width 1s ease' }} />
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{completedUnits} of {totalUnits} subtopics completed</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('curriculum')}
                        style={{ marginTop: 16, padding: '10px 24px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADIUS.pill, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        View Curriculum
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* ── Certificate Cards ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {certGenerating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C.primarySoft, borderRadius: RADIUS.sm, border: `1px solid ${C.primary}30` }}>
                      <Spin color={C.primary} size={16} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryDark }}>Generating your new certificate…</span>
                    </div>
                  )}
                  {!certGenerating && certNotice && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C.greenSoft, borderRadius: RADIUS.sm, border: `1px solid ${C.greenText}20` }}>
                      <CheckCircle size={16} color={C.greenText} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.greenText }}>{certNotice}</span>
                    </div>
                  )}
                  {!certGenerating && certError && (
                    <div style={{ padding: '12px 16px', background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: RADIUS.sm, color: C.redText, fontSize: 13 }}>
                      {certError}
                    </div>
                  )}
                  {myCertificates.map((cert) => {
                    const stu = cert.studentId || {};
                    const cd = cert.courseDetailId || {};
                    // Candidates without a registration record fall back to batch/account details (same as the PDF)
                    const tech = cd.technologyId?.name || cert.batchId?.name || 'N/A';
                    const dur = cd.durationId ? `${cd.durationId.value} ${cd.durationId.unit}(s)` : 'N/A';
                    const college = stu.collegeId?.collegeName || 'SLOG Solutions Private Limited';
                    const branch = stu.branchId?.branchName || stu.branch || user?.branch || 'N/A';
                    const regNo = stu.registrationNo || user?.username || '—';
                    const issued = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
                    // Derive backend base URL: strip trailing /api from API_BASE_URL
                    const backendBase = (API_BASE_URL || '').replace(/\/api\/?$/, '');

                    return (
                      <div key={cert._id} style={{
                        background: '#fff', borderRadius: RADIUS.lg,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 8px 32px rgba(99,102,241,0.08)',
                        overflow: 'hidden'
                      }}>
                        {/* Gold gradient header */}
                        <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
                          {/* Decorative circle */}
                          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                          <div style={{ position: 'absolute', bottom: -40, right: 60, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                                  <Award size={22} color="#fff" strokeWidth={2.2} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Certificate of Completion</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', letterSpacing: '0.02em' }}>{cert.certificateId}</div>
                                </div>
                              </div>
                              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>
                                {user?.name || stu.name || '—'}
                              </div>
                              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                has successfully completed <span style={{ color: '#FDE68A', fontWeight: 700 }}>{tech}</span>
                              </div>
                            </div>

                            {/* QR Code display */}
                            {cert.qrCodeUrl && (
                              <div style={{ background: '#fff', borderRadius: 12, padding: 8, flexShrink: 0 }}>
                                <img src={cert.qrCodeUrl} alt="QR" style={{ width: 72, height: 72, display: 'block' }} />
                                <div style={{ fontSize: 9, textAlign: 'center', color: C.muted, marginTop: 4, fontWeight: 600 }}>Scan to Verify</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details grid */}
                        <div style={{ padding: '24px 32px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                            {[
                              { label: 'Registration No', value: regNo, icon: User },
                              { label: 'Course / Technology', value: tech, icon: BookOpen },
                              { label: 'Duration', value: dur, icon: Clock },
                              { label: 'Issue Date', value: issued, icon: Calendar },
                              { label: 'Institution', value: college, icon: GraduationCap },
                              { label: 'Branch / Stream', value: branch, icon: Tag },
                            ].map(({ label, value, icon: Icon }) => (
                              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                  <Icon size={14} color={C.primary} strokeWidth={2.2} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{value}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Status badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: C.greenSoft, borderRadius: RADIUS.sm, border: `1px solid ${C.greenText}20` }}>
                            <CheckCircle size={15} color={C.greenText} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.greenText }}>Certificate Status: Active & Verified</span>
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {cert.pdfUrl && (
                              <>
                                <a
                                  href={`${backendBase}${cert.pdfUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '11px 22px', borderRadius: RADIUS.pill,
                                    background: 'linear-gradient(135deg,#6366F1,#4F46E5)', color: '#fff',
                                    fontWeight: 700, fontSize: 13, textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <ExternalLink size={15} /> View Certificate
                                </a>
                                <a
                                  href={`${backendBase}${cert.pdfUrl}`}
                                  download={`Certificate_${stu.name || user?.name}_${cert.certificateId}.pdf`}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '11px 22px', borderRadius: RADIUS.pill,
                                    background: '#fff', color: C.ink,
                                    border: `1.5px solid ${C.border}`,
                                    fontWeight: 700, fontSize: 13, textDecoration: 'none',
                                    boxShadow: C.shadow,
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <Download size={15} /> Download PDF
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── ALL CANDIDATE MODALS ── */}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1.5px solid ${C.red}40`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(239,68,68,0.18)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', background: C.redSoft, borderBottom: `1px solid ${C.red}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.red}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} color={C.redText} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.redText }}>Delete Account</div>
                  <div style={{ fontSize: 11, color: C.muted }}>This action will be reviewed by admin</div>
                </div>
              </div>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteReason(''); setDeleteError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Warning banner */}
              <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: RADIUS.sm }}>
                <AlertCircle size={16} color="#C2410C" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12.5, color: '#7C2D12', lineHeight: 1.6 }}>
                  <strong>What happens next:</strong> Your request will be sent to admin for review.
                  If approved (within <strong>15–30 days</strong>), your entire account data will be <strong>permanently deleted</strong>.
                  You can continue using your account until then.
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                  Reason for deletion <span style={{ color: C.muted, fontWeight: 500 }}>(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you want to delete your account..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Confirmation phrase */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: C.redText, marginBottom: 6 }}>
                  Type <code style={{ background: C.redSoft, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>delete my account</code> to confirm
                </label>
                <input
                  id="delete-confirm-input"
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError(''); }}
                  placeholder="delete my account"
                  style={{ ...inputStyle, border: deleteConfirmText && deleteConfirmText.trim().toLowerCase() !== 'delete my account' ? `1.5px solid ${C.red}` : `1px solid ${C.border}` }}
                  autoComplete="off"
                />
              </div>

              {deleteError && <FormAlert msg={deleteError} type="error" />}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteReason(''); setDeleteError(''); }}
                  style={{ padding: '9px 20px', borderRadius: RADIUS.pill, border: `1px solid ${C.border}`, background: '#fff', color: C.body, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-account"
                  onClick={handleRequestDeletion}
                  disabled={deleteSubmitting || deleteConfirmText.trim().toLowerCase() !== 'delete my account'}
                  style={{
                    padding: '9px 22px', borderRadius: RADIUS.pill,
                    background: deleteConfirmText.trim().toLowerCase() === 'delete my account' ? C.red : '#CBD5E1',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: deleteConfirmText.trim().toLowerCase() === 'delete my account' ? 'pointer' : 'not-allowed',
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {deleteSubmitting ? <><Spin /> Submitting...</> : <><Trash2 size={14} /> Submit Deletion Request</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Batch Modal */}
      {isJoinOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>

          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 420, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Join New Batch</h3>
              <button onClick={() => setIsJoinOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleJoin} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {joinError && <FormAlert msg={joinError} type="error" />}
              {joinSuccess && <FormAlert msg={joinSuccess} type="success" />}
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Batch ID *</label><input type="text" required placeholder="e.g. BATCH-2024" value={joinData.batchId} onChange={e => setJoinData({ ...joinData, batchId: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Unique Passcode Key *</label><input type="text" required placeholder="Passcode key" value={joinData.uniqueKey} onChange={e => setJoinData({ ...joinData, uniqueKey: e.target.value })} style={inputStyle} /></div>
              <Pill type="submit" disabled={joining} style={{ marginTop: 8 }}>{joining ? <Spin /> : 'Join Batch Session'}</Pill>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {isSubmitModalOpen && selectedAssignmentForSubmit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 480, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Submit Solution</h3>
                <div style={{ fontSize: 11, color: C.muted }}>{selectedAssignmentForSubmit.title}</div>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitAssignmentSolution} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {submitError && <FormAlert msg={submitError} type="error" />}
              {submitSuccess && <FormAlert msg={submitSuccess} type="success" />}
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Written Response / Notes</label><textarea rows={4} value={submitFormData.answerText} onChange={e => setSubmitFormData({ ...submitFormData, answerText: e.target.value })} placeholder="Type solution explanation..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Solution URL (GitHub / Drive Link)</label><input type="url" value={submitFormData.submissionUrl} onChange={e => setSubmitFormData({ ...submitFormData, submissionUrl: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
                  Attach Solution PDF Document (Cloudinary)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setSubmissionPdfFile(e.target.files[0] || null)}
                  style={{ ...inputStyle, padding: '8px' }}
                />
                {submissionPdfFile && (
                  <div style={{ fontSize: 11, color: C.greenText, marginTop: 4, fontWeight: 600 }}>
                    Selected PDF: {submissionPdfFile.name} ({(submissionPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              <Pill type="submit" disabled={submitSubmitting} style={{ marginTop: 8 }}>{submitSubmitting ? <Spin /> : 'Submit Solution'}</Pill>
            </form>
          </div>
        </div>
      )}

      {/* Ask Doubt Modal */}
      {isQueryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: RADIUS.lg, width: '100%', maxWidth: 460, boxShadow: C.shadowLg, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>Ask Doubt to Expert</h3>
              <button onClick={() => setIsQueryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitQuery} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {queryFormError && <FormAlert msg={queryFormError} type="error" />}
              {queryFormSuccess && <FormAlert msg={queryFormSuccess} type="success" />}
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Topic Context</label><input type="text" readOnly value={queryFormData.topicTitle} style={{ ...inputStyle, background: '#F1F5F9' }} /></div>
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Doubt Title *</label><input type="text" required value={queryFormData.title} onChange={e => setQueryFormData({ ...queryFormData, title: e.target.value })} placeholder="Brief title of your question" style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Detailed Question *</label><textarea required rows={4} value={queryFormData.description} onChange={e => setQueryFormData({ ...queryFormData, description: e.target.value })} placeholder="Describe what you need help with..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <Pill type="submit" disabled={querySubmitting} style={{ marginTop: 8 }}>{querySubmitting ? <Spin /> : 'Submit Question'}</Pill>
            </form>
          </div>
        </div>
      )}

      {/* Live Announcement Toast */}
      {liveAnnouncementToast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          background: '#fff', border: `1.5px solid ${C.primary}`, borderRadius: 16,
          padding: '16px 20px', maxWidth: 360, width: '90%', boxShadow: C.shadowLg,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <strong style={{ fontSize: 13, color: C.primaryDark }}>New Announcement Alert</strong>
            <button onClick={() => setLiveAnnouncementToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={14} /></button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{liveAnnouncementToast.title}</div>
          <div style={{ fontSize: 12, color: C.body, marginTop: 4 }}>{liveAnnouncementToast.message}</div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
