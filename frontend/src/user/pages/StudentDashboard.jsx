import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { requestNotificationPermission, onForegroundMessage } from '../../lib/firebase';
import {
  GraduationCap, LogOut, Plus, Bell, FileText, Link2,
  Download, ExternalLink, Calendar, User, BookOpen, X,
  AlertCircle, ChevronRight, Sparkles, Search, Sun, Moon,
  ListChecks, CheckCircle, Clock, ChevronDown, ChevronUp, ClipboardList,
  MessageSquare, Star, Send, Edit2, CheckCircle2, HelpCircle, Tag, Filter, Check, CornerDownRight, RefreshCw
} from 'lucide-react';

/* ─── Utility ─────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

/* ─── Theme palette ───────────────────────────────────── */
const getThemePalette = (dark) => ({
  bg:          dark ? '#0f1117'                        : '#f4f7f6',
  surface:     dark ? 'rgba(255,255,255,0.02)'         : '#ffffff',
  surfaceHov:  dark ? 'rgba(255,255,255,0.04)'         : '#f0fdf4',
  border:      dark ? 'rgba(255,255,255,0.07)'         : 'rgba(0,0,0,0.08)',
  borderGreen: dark ? 'rgba(16,185,129,0.2)'           : 'rgba(16,185,129,0.3)',
  text:        dark ? '#e2e8f0'                        : '#1e293b',
  textSub:     dark ? '#f1f5f9'                        : '#0f172a',
  textMuted:   dark ? 'rgba(255,255,255,0.4)'          : 'rgba(0,0,0,0.4)',
  textMono:    dark ? 'rgba(255,255,255,0.3)'          : 'rgba(0,0,0,0.35)',
  inputBg:     dark ? 'rgba(255,255,255,0.04)'         : '#f8fafc',
  inputBorder: dark ? 'rgba(255,255,255,0.1)'          : 'rgba(0,0,0,0.12)',
  headerBg:    dark ? 'rgba(15,17,23,0.9)'             : 'rgba(255,255,255,0.95)',
  headerBorder:dark ? 'rgba(16,185,129,0.12)'          : 'rgba(16,185,129,0.2)',
  sidebarBg:   dark ? 'rgba(255,255,255,0.02)'         : '#ffffff',
  activeBg:    dark ? 'rgba(16,185,129,0.08)'          : 'rgba(16,185,129,0.07)',
  activeBorder:dark ? 'rgba(16,185,129,0.35)'          : 'rgba(16,185,129,0.4)',
  tabActiveBg: dark ? 'rgba(16,185,129,0.15)'          : 'rgba(16,185,129,0.1)',
  tabBg:       dark ? 'rgba(255,255,255,0.03)'         : '#f1f5f9',
  cardBg:      dark ? 'rgba(255,255,255,0.03)'         : '#ffffff',
  statBg:      dark ? 'rgba(255,255,255,0.04)'         : '#f8fafc',
  heroBg:      dark ? 'linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(5,150,105,0.06) 50%,rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(5,150,105,0.03) 100%)',
  modalBg:     dark ? '#151922'                        : '#ffffff',
  shadow:      dark ? '0 4px 32px rgba(0,0,0,0.4)'    : '0 4px 32px rgba(0,0,0,0.08)',
});

const Spin = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

/* ─── Empty State ──────────────────────────────────────── */
const Empty = ({ icon: Icon, title, sub }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '56px 24px', gap: 14, textAlign: 'center',
    background: 'rgba(16,185,129,0.03)', border: '1.5px dashed rgba(16,185,129,0.15)', borderRadius: 20
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.06))',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={24} color="#10b981" opacity={0.7} />
    </div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>{title}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  </div>
);

/* ─── Main Component ───────────────────────────────────── */
const StudentDashboard = () => {
  const { user, logout, api } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const c = getThemePalette(dark);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinData, setJoinData] = useState({ batchId: '', uniqueKey: '' });
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [joining, setJoining] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [expandedTopics, setExpandedTopics] = useState({});

  // Feedback state
  const [myFeedback, setMyFeedback] = useState(null); // existing feedback
  const [fbRating, setFbRating] = useState(0);        // selected star rating
  const [fbHover, setFbHover] = useState(0);          // hovered star
  const [fbReview, setFbReview] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbError, setFbError] = useState('');
  const [fbSuccess, setFbSuccess] = useState('');
  const [fbEditing, setFbEditing] = useState(false); // editing existing

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
  const [submitSubmitting, setSubmitSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Firebase Push Notifications & Real-Time Reflection State
  const [pushPermission, setPushPermission] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');
  const [fcmToken, setFcmToken] = useState(null);
  const [liveAnnouncementToast, setLiveAnnouncementToast] = useState(null);

  // Automatically request push notification permission and register FCM token on load
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = await requestNotificationPermission(api.patch);
        if (isMounted) {
          if (token) {
            setFcmToken(token);
            setPushPermission('granted');
          } else if (typeof window !== 'undefined' && 'Notification' in window) {
            setPushPermission(Notification.permission);
          }
        }
      } catch (e) {
        // silent fallback if browser blocks or unsupported
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Direct Notifications state (Expert → Candidate specific notifications)
  const [directNotifications, setDirectNotifications] = useState([]);
  const [unreadDirectCount, setUnreadDirectCount] = useState(0);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchMyNotifications = async () => {
    try {
      const res = await api.get('/push/my-notifications');
      setDirectNotifications(res.data.notifications || []);
      setUnreadDirectCount(res.data.unreadCount || 0);
    } catch (e) {
      // silent fetch fallback
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
    if (lastToastKeyRef.current === key) return; // Prevent duplicate notification popups!
    lastToastKeyRef.current = key;
    setLiveAnnouncementToast(toastObj);
    setTimeout(() => {
      if (lastToastKeyRef.current === key) {
        lastToastKeyRef.current = '';
      }
    }, 10000);
  };

  useEffect(() => {
    // Listen for Firebase FCM foreground notifications
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

  // Real-time background sync polling for instant reflection
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
    try { setLoading(true); const r = await api.get('/batches/student'); setBatches(r.data); if (r.data.length > 0 && !selectedBatchId) setSelectedBatchId(r.data[0]._id); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchDetails = async (id) => {
    try { setDetailsLoading(true); const r = await api.get(`/batches/student/${id}`); setBatchDetails(r.data); }
    catch (e) { console.error(e); } finally { setDetailsLoading(false); }
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

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => {
    if (selectedBatchId) {
      fetchDetails(selectedBatchId);
      fetchMyFeedback(selectedBatchId);
      fetchQueries(selectedBatchId);
      fetchStudentAssignments(selectedBatchId);
    } else {
      setBatchDetails(null);
      setMyFeedback(null);
      setQueries([]);
      setStudentAssignments([]);
    }
  }, [selectedBatchId]);

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignmentForSubmit(assignment);
    const mySub = assignment.submissions?.find(
      s => s.studentId?.toString() === user._id?.toString() || s.studentId === user._id
    );
    setSubmitFormData({
      answerText: mySub ? mySub.answerText : '',
      submissionUrl: mySub ? mySub.submissionUrl : ''
    });
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignmentSolution = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitSubmitting(true);

    if (!submitFormData.answerText.trim() && !submitFormData.submissionUrl.trim()) {
      setSubmitError('Please provide either a written solution or project link.');
      setSubmitSubmitting(false);
      return;
    }

    try {
      await api.post(`/assignments/${selectedAssignmentForSubmit._id}/submit`, {
        answerText: submitFormData.answerText.trim(),
        submissionUrl: submitFormData.submissionUrl.trim()
      });

      setSubmitSuccess('Assignment submitted successfully to your instructor!');
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

  const handleUpdateQueryStatus = async (queryId, newStatus) => {
    try {
      await api.patch(`/queries/${queryId}/status`, { status: newStatus });
      fetchQueries(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
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

  // Curriculum computed values — subtopic-level progress
  const curriculum = batchDetails?.curriculum || [];
  const sortedCurriculum = [...curriculum].sort((a, b) => a.order - b.order);

  // Progress = completed subtopics / total subtopics
  // Topics without subtopics count as 1 unit (topic-level isCompleted)
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

  const pendingAssignmentCount = studentAssignments.filter(a => {
    const mySub = a.submissions?.find(s => s.studentId?.toString() === user._id?.toString() || s.studentId === user._id);
    return !mySub;
  }).length;

  const tabs = [
    { id: 'notifications', label: 'Announcements', icon: Bell, count: batchDetails?.notifications?.length || 0 },
    { id: 'curriculum', label: 'Curriculum', icon: ListChecks, count: `${completedUnits}/${totalUnits}` },
    { id: 'pdfs', label: 'Study PDFs', icon: FileText, count: batchDetails?.pdfs?.length || 0 },
    { id: 'links', label: 'Useful Links', icon: Link2, count: batchDetails?.links?.length || 0 },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: pendingAssignmentCount > 0 ? `${pendingAssignmentCount} Due` : studentAssignments.length },
    { id: 'queries', label: 'Doubts & Queries', icon: HelpCircle, count: queries.length },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, count: myFeedback ? '★'.repeat(myFeedback.rating) : '' },
  ];


  const filteredBatches = batches.filter(b =>
    b.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    b.batchId?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-outfit)', color: c.text, transition: 'background 0.3s, color 0.3s' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: c.headerBg, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${c.headerBorder}`, padding: '0 28px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: c.shadow
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: dark ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#10b981,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#fff',
            boxShadow: '0 0 20px rgba(16,185,129,0.4)'
          }}>SS</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: dark ? '#fff' : '#0f172a', letterSpacing: '-0.3px' }}>Slog Solutions</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <GraduationCap size={10} /> Candidate Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* ── SPECIFIC NOTIFICATIONS BELL BUTTON & DROPDOWN PANEL ── */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleToggleNotifDropdown}
              title="Expert Notifications"
              style={{
                width: 38, height: 38, borderRadius: 10, border: `1px solid ${c.border}`,
                background: isNotifDropdownOpen ? c.activeBg : c.surface, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: unreadDirectCount > 0 ? '#10b981' : c.textMuted,
                position: 'relative', transition: 'all 0.2s'
              }}
            >
              <Bell size={17} />
              {unreadDirectCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  background: '#ef4444', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239,68,68,0.6)', border: '2px solid ' + c.bg
                }}>
                  {unreadDirectCount > 9 ? '9+' : unreadDirectCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {isNotifDropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 48, width: 360, maxHeight: 460,
                background: dark ? '#161922' : '#ffffff',
                border: `1px solid ${c.border}`, borderRadius: 16,
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}>
                <div style={{
                  padding: '14px 18px', borderBottom: `1px solid ${c.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={15} color="#10b981" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.textSub }}>Expert Notifications</span>
                  </div>
                  <button onClick={() => setIsNotifDropdownOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted }}>
                    <X size={15} />
                  </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {directNotifications.length === 0 ? (
                    <div style={{ padding: '30px 16px', textAlign: 'center', color: c.textMuted, fontSize: 12 }}>
                      <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                      <div>No direct notifications yet</div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>Messages sent directly by your instructors will appear here.</div>
                    </div>
                  ) : (
                    directNotifications.map((n) => (
                      <div key={n._id} style={{
                        padding: '12px 14px', borderRadius: 12,
                        background: n.read ? (dark ? 'rgba(255,255,255,0.02)' : '#f8fafc') : (dark ? 'rgba(16,185,129,0.08)' : '#f0fdf4'),
                        border: `1px solid ${n.read ? c.border : 'rgba(16,185,129,0.3)'}`,
                        display: 'flex', flexDirection: 'column', gap: 6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#10b981',
                            background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 6
                          }}>
                            {n.teacherName || 'Instructor'}
                          </span>
                          <span style={{ fontSize: 10, color: c.textMuted }}>
                            {fmt(n.createdAt)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5 }}>{n.message}</div>
                        {n.batchName && (
                          <div style={{ fontSize: 9, color: c.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                            Class: {n.batchName}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── THEME TOGGLE ── */}
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
              background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))',
              border: '1.5px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#10b981'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: c.textMuted }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.08)', color: '#f87171',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
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
          {/* Header */}
          <div style={{ padding: '0 20px 16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>My Classes</span>
              <button onClick={() => setIsJoinOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.2s'
              }}>
                <Plus size={12} /> Join Batch
              </button>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
              <input
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search batches..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '8px 10px 8px 28px',
                  background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                  borderRadius: 8, color: c.text, fontSize: 11, outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Batch List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120, gap: 8, color: c.textMuted, fontSize: 12 }}>
                <Spin /> Loading...
              </div>
            ) : filteredBatches.length === 0 ? (
              <Empty icon={BookOpen} title="No batches found" sub={searchQ ? 'Try a different search' : 'Click "Join Batch" to enrol'} />
            ) : (
              filteredBatches.map(b => {
                const active = selectedBatchId === b._id;
                return (
                  <button key={b._id} onClick={() => { setSelectedBatchId(b._id); setActiveTab('notifications'); }} style={{
                    width: '100%', textAlign: 'left', padding: '12px 14px', marginBottom: 6,
                    borderRadius: 12, border: active ? `1px solid ${c.activeBorder}` : `1px solid transparent`,
                    background: active ? c.activeBg : c.surfaceHov,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: active ? 'rgba(16,185,129,0.15)' : c.statBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: active ? '#10b981' : c.textMuted
                    }}>
                      {b.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? c.textSub : c.textMuted, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                      <div style={{ fontSize: 10, color: active ? '#10b981' : c.textMono, fontFamily: 'monospace' }}>{b.batchId}</div>
                    </div>
                    {active && <ChevronRight size={14} color="#10b981" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Stats bar */}
          <div style={{ padding: '16px 20px 0', borderTop: `1px solid ${c.border}`, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 10, color: c.textMuted }}>{batches.length} enrolled batch{batches.length !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {!selectedBatchId ? (
            /* WELCOME STATE */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', gap: 20, padding: 48
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.08))',
                border: '1.5px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(16,185,129,0.1)'
              }}>
                <Sparkles size={36} color="#10b981" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textSub, marginBottom: 8 }}>Welcome to your Learning Hub</h2>
                <p style={{ fontSize: 13, color: c.textMuted, maxWidth: 380, lineHeight: 1.7 }}>
                  Select a class from the sidebar or join a new batch using your enrollment code and passcode.
                </p>
              </div>
              <button onClick={() => setIsJoinOpen(true)} style={{
                padding: '11px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
              }}>
                <Plus size={16} /> Join Your First Batch
              </button>
            </div>
          ) : detailsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10, color: c.textMuted, fontSize: 13 }}>
              <Spin /> Loading batch details...
            </div>
          ) : batchDetails ? (<>


            {/* ── BATCH HERO CARD ── */}
            <div style={{
              background: c.heroBg,
              border: `1px solid ${c.borderGreen}`, borderRadius: 20, padding: '24px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden'
            }}>
              {/* Glow */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)',
                    fontSize: 10, fontWeight: 800, color: '#10b981', fontFamily: 'monospace', letterSpacing: '0.05em'
                  }}>{batchDetails.batchId}</span>
                  <span style={{ fontSize: 10, color: c.textMuted }}>Created {fmt(batchDetails.createdAt)}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textSub, marginBottom: 8 }}>{batchDetails.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted, flexWrap: 'wrap' }}>
                  <User size={13} color="#10b981" />
                  <span>Instructors:</span>
                  {batchDetails.teachers && batchDetails.teachers.length > 0 ? (
                    batchDetails.teachers.map((t, idx) => (
                      <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <strong style={{ color: c.textSub }}>{t.teacherId?.name || 'Instructor'}</strong>
                        <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{t.role || 'Instructor'}</span>
                        {idx < batchDetails.teachers.length - 1 && <span style={{ color: c.textMuted }}>·</span>}
                      </span>
                    ))
                  ) : (
                    <>
                      <strong style={{ color: c.textSub }}>{batchDetails.teacherId?.name || 'Unassigned'}</strong>
                      {batchDetails.teacherId?.email && <span style={{ color: c.textMuted }}>({batchDetails.teacherId.email})</span>}
                    </>
                  )}
                </div>
              </div>
              {/* Stats pill */}
              <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {[
                  { icon: Bell, val: batchDetails.notifications?.length || 0, label: 'Announcements', color: '#10b981' },
                  { icon: FileText, val: batchDetails.pdfs?.length || 0, label: 'PDFs', color: '#10b981' },
                  { icon: Link2, val: batchDetails.links?.length || 0, label: 'Links', color: '#10b981' },
                  { icon: ListChecks, val: `${completedUnits}/${totalUnits}`, label: 'Progress', color: progressPct === 100 && totalUnits > 0 ? '#10b981' : '#f59e0b' },
                ].map(({ icon: Icon, val, label, color }) => (
                  <div key={label} style={{
                    background: c.statBg, border: `1px solid ${c.border}`,
                    borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 70
                  }}>
                    <Icon size={16} color={color} style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: c.textSub }}>{val}</div>
                    <div style={{ fontSize: 9, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── TABS ── */}
            <div style={{ display: 'flex', gap: 4, background: c.tabBg, borderRadius: 12, padding: 4, border: `1px solid ${c.border}` }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === t.id ? c.tabActiveBg : 'transparent',
                  color: activeTab === t.id ? '#10b981' : c.textMuted,
                  fontWeight: activeTab === t.id ? 700 : 500, fontSize: 12,
                  outline: activeTab === t.id ? '1px solid rgba(16,185,129,0.25)' : 'none'
                }}>
                  <t.icon size={14} />
                  {t.label}
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 6, padding: '0 5px',
                    background: activeTab === t.id ? 'rgba(16,185,129,0.2)' : c.border,
                    fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeTab === t.id ? '#10b981' : c.textMuted
                  }}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* ── CONTENT ── */}

            {/* ANNOUNCEMENTS TAB */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!batchDetails.notifications?.length ? (
                  <Empty icon={Bell} title="No announcements yet" sub="Your expert hasn't posted any announcements for this batch yet." />
                ) : batchDetails.notifications.map((n, i) => (
                  <div key={i} style={{
                    background: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: 16, padding: '18px 20px', transition: 'all 0.2s',
                    borderLeft: '3px solid #10b981'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: c.textSub }}>{n.title}</h4>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: c.textMuted }}>
                        <Calendar size={11} /> {fmt(n.date)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CURRICULUM TAB */}
            {activeTab === 'curriculum' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ── PROGRESS BAR CARD ── */}
                {totalCount > 0 ? (
                  <div style={{
                    background: c.cardBg, border: `1px solid ${c.borderGreen}`,
                    borderRadius: 20, padding: '22px 24px',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {/* Background glow */}
                    <div style={{
                      position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
                      borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(30px)', pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: c.textSub, marginBottom: 2 }}>Course Progress</div>
                        <div style={{ fontSize: 11, color: c.textMuted }}>
                          {completedUnits} of {totalUnits} subtopics completed
                        </div>
                      </div>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                        background: progressPct === 100 && totalUnits > 0
                          ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))'
                          : 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))',
                        border: `2px solid ${progressPct === 100 && totalUnits > 0 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.3)'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: progressPct === 100 && totalUnits > 0 ? '0 0 20px rgba(16,185,129,0.15)' : 'none'
                      }}>
                        <span style={{
                          fontSize: 18, fontWeight: 900, lineHeight: 1,
                          color: progressPct === 100 && totalUnits > 0 ? '#10b981' : '#f59e0b'
                        }}>{progressPct}%</span>
                        <span style={{ fontSize: 8, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>done</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 12, background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${progressPct}%`,
                        background: progressPct === 100
                          ? 'linear-gradient(90deg,#10b981,#059669)'
                          : 'linear-gradient(90deg,#f59e0b,#10b981)',
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                        boxShadow: progressPct === 100 ? '0 0 12px rgba(16,185,129,0.5)' : '0 0 10px rgba(245,158,11,0.4)',
                        position: 'relative'
                      }}>
                        {/* Shimmer effect */}
                        {progressPct > 5 && (
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.2) 50%,transparent 100%)',
                            animation: 'shimmer 2s infinite'
                          }} />
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
                          <span style={{ color: c.textMuted }}>{completedUnits} Done</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }} />
                          <span style={{ color: c.textMuted }}>{totalUnits - completedUnits} Remaining</span>
                        </div>
                      </div>
                      {progressPct === 100 && totalUnits > 0 && (
                        <span style={{
                          padding: '3px 10px', borderRadius: 20,
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                          fontSize: 10, fontWeight: 800, color: '#10b981'
                        }}>🎉 Curriculum Complete!</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Empty icon={ClipboardList} title="No curriculum yet" sub="Your instructor hasn't uploaded the course curriculum for this batch yet." />
                )}

                {/* ── TOPIC LIST ── */}
                {sortedCurriculum.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sortedCurriculum.map((topic, idx) => {
                      const expanded = expandedTopics[topic._id];
                      return (
                        <div key={topic._id} style={{
                          background: c.cardBg,
                          border: `1px solid ${topic.isCompleted ? 'rgba(16,185,129,0.3)' : c.border}`,
                          borderLeft: `4px solid ${topic.isCompleted ? '#10b981' : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                          borderRadius: 14, overflow: 'hidden',
                          transition: 'border-color 0.3s, box-shadow 0.3s',
                          boxShadow: topic.isCompleted ? '0 0 0 1px rgba(16,185,129,0.08)' : 'none'
                        }}>
                          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Status icon */}
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: topic.isCompleted
                                ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))'
                                : dark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                              border: `1.5px solid ${topic.isCompleted ? 'rgba(16,185,129,0.4)' : c.border}`,
                              transition: 'all 0.3s'
                            }}>
                              {topic.isCompleted
                                ? <CheckCircle size={18} color="#10b981" />
                                : <span style={{ fontSize: 13, fontWeight: 800, color: c.textMuted }}>{idx + 1}</span>
                              }
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: c.textSub }}>{topic.title}</span>
                                {topic.isCompleted ? (
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 800,
                                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                                    color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em',
                                    display: 'flex', alignItems: 'center', gap: 3
                                  }}>
                                    <CheckCircle size={8} /> Covered
                                  </span>
                                ) : (
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 800,
                                    background: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
                                    border: `1px solid ${c.border}`,
                                    color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em',
                                    display: 'flex', alignItems: 'center', gap: 3
                                  }}>
                                    <Clock size={8} /> Pending
                                  </span>
                                )}
                              </div>
                              {topic.description && (
                                <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5 }}>{topic.description}</div>
                              )}
                              {topic.isCompleted && topic.completedAt && (
                                <div style={{ fontSize: 10, color: '#10b981', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Calendar size={9} /> Completed {fmt(topic.completedAt)}
                                </div>
                              )}
                            </div>

                            {/* Ask Doubt button */}
                             <button
                               onClick={() => handleOpenQueryModal(topic)}
                               title="Ask Expert a doubt about this topic"
                               style={{
                                 background: 'rgba(16,185,129,0.1)',
                                 border: '1px solid rgba(16,185,129,0.25)',
                                 borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                                 color: '#10b981', display: 'flex', alignItems: 'center', gap: 4,
                                 fontSize: 10, fontWeight: 700, flexShrink: 0
                               }}>
                               <HelpCircle size={12} /> Ask Doubt
                             </button>

                            {/* Expand subtopics button */}
                            {topic.subtopics?.length > 0 && (
                              <button
                                onClick={() => setExpandedTopics(p => ({ ...p, [topic._id]: !p[topic._id] }))}
                                style={{
                                  background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                  border: `1px solid ${c.border}`,
                                  borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                                  color: c.textMuted, display: 'flex', alignItems: 'center', gap: 4,
                                  fontSize: 10, fontWeight: 700, flexShrink: 0
                                }}>
                                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? 's' : ''}
                              </button>
                            )}
                          </div>

                          {/* Subtopics expanded */}
                          {expanded && topic.subtopics?.length > 0 && (
                            <div style={{
                              padding: '12px 18px 14px 68px',
                              borderTop: `1px solid ${c.border}`,
                              background: dark ? 'rgba(255,255,255,0.01)' : '#fafafa'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {topic.subtopics.map((st, si) => (
                                  <div key={st._id || si} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                      background: st.isCompleted ? 'rgba(16,185,129,0.12)' : dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
                                      border: `1.5px solid ${st.isCompleted ? 'rgba(16,185,129,0.35)' : c.border}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      transition: 'all 0.3s'
                                    }}>
                                      {st.isCompleted
                                        ? <CheckCircle size={11} color="#10b981" />
                                        : <span style={{ fontSize: 8, color: c.textMuted, fontWeight: 700 }}>{si + 1}</span>
                                      }
                                    </div>
                                    <span style={{
                                      fontSize: 12,
                                      color: st.isCompleted ? c.textSub : c.textMuted,
                                      fontWeight: st.isCompleted ? 600 : 400,
                                      lineHeight: 1.5,
                                      flex: 1
                                    }}>{st.title ?? st}</span>
                                    {st.isCompleted && (
                                      <span style={{
                                        padding: '1px 6px', borderRadius: 10,
                                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                        fontSize: 9, color: '#10b981', fontWeight: 700
                                      }}>✓ Done</span>
                                    )}
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

            {/* PDFS TAB */}
            {activeTab === 'pdfs' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                {!batchDetails.pdfs?.length ? (
                  <div style={{ gridColumn: '1/-1' }}>
                    <Empty icon={FileText} title="No PDFs uploaded" sub="Your expert hasn't uploaded any study material yet." />
                  </div>
                ) : batchDetails.pdfs.map((p, i) => (
                  <div key={i} style={{
                    background: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: 16, padding: '18px', display: 'flex', flexDirection: 'column', gap: 12,
                    transition: 'border-color 0.2s, transform 0.2s'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.08))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FileText size={20} color="#10b981" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.textSub, marginBottom: 4 }}>{p.title}</div>
                      {p.description && <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5, marginBottom: 6 }}>{p.description}</div>}
                      <div style={{ fontSize: 10, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} /> Uploaded {fmt(p.date)}
                      </div>
                    </div>
                    <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '9px 16px', borderRadius: 10, textDecoration: 'none',
                      background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                      fontSize: 12, fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                    }}>
                      <Download size={13} /> View &amp; Download
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* LINKS TAB */}
            {activeTab === 'links' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!batchDetails.links?.length ? (
                  <Empty icon={Link2} title="No links shared" sub="Your expert hasn't shared any useful links for this batch yet." />
                ) : batchDetails.links.map((l, i) => (
                  <div key={i} style={{
                    background: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Link2 size={16} color="#10b981" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.textSub, marginBottom: 2 }}>{l.title}</div>
                      <div style={{ fontSize: 10, color: c.textMono, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                    </div>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                      borderRadius: 9, textDecoration: 'none', flexShrink: 0,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                      color: '#10b981', fontSize: 11, fontWeight: 700
                    }}>
                      <ExternalLink size={12} /> Open
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>

                {/* Header card */}
                <div style={{
                  background: c.cardBg, border: `1px solid ${c.borderGreen}`, borderRadius: 20,
                  padding: '22px 24px', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(30px)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.08))',
                      border: '1.5px solid rgba(16,185,129,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <MessageSquare size={22} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: c.textSub, marginBottom: 3 }}>Course Feedback</div>
                      <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.5 }}>
                        Share your experience with <strong style={{ color: c.textSub }}>{batchDetails.teacherId?.name}</strong> for this batch.
                        Your feedback is visible only to your instructor.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitted state — show review card */}
                {myFeedback && !fbEditing ? (
                  <div style={{
                    background: c.cardBg, border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 18,
                    padding: '22px 24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={18} color="#10b981" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Feedback Submitted</span>
                      </div>
                      <button onClick={() => setFbEditing(true)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                        border: `1px solid ${c.border}`, borderRadius: 9,
                        fontSize: 11, fontWeight: 700, color: c.textMuted, cursor: 'pointer'
                      }}>
                        <Edit2 size={11} /> Edit
                      </button>
                    </div>

                    {/* Stars display */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={28}
                          fill={s <= myFeedback.rating ? '#f59e0b' : 'none'}
                          color={s <= myFeedback.rating ? '#f59e0b' : c.border}
                          strokeWidth={1.5}
                        />
                      ))}
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginLeft: 8, alignSelf: 'center' }}>
                        {myFeedback.rating}/5
                      </span>
                    </div>

                    {myFeedback.review && (
                      <div style={{
                        fontSize: 13, color: c.text, lineHeight: 1.7, fontStyle: 'italic',
                        padding: '12px 16px', borderRadius: 10,
                        background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                        border: `1px solid ${c.border}`
                      }}>
                        &ldquo;{myFeedback.review}&rdquo;
                      </div>
                    )}

                    <div style={{ fontSize: 10, color: c.textMuted, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={10} /> Submitted {fmt(myFeedback.date)}
                    </div>
                  </div>
                ) : (
                  /* Feedback form */
                  <form onSubmit={handleSubmitFeedback} style={{
                    background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 18, padding: '24px'
                  }}>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                        Your Rating <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      {/* Interactive star picker */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button"
                            onClick={() => setFbRating(s)}
                            onMouseEnter={() => setFbHover(s)}
                            onMouseLeave={() => setFbHover(0)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              transition: 'transform 0.15s'
                            }}
                          >
                            <Star size={34}
                              fill={(fbHover || fbRating) >= s ? '#f59e0b' : 'none'}
                              color={(fbHover || fbRating) >= s ? '#f59e0b' : dark ? 'rgba(255,255,255,0.15)' : '#d1d5db'}
                              strokeWidth={1.5}
                              style={{ transform: (fbHover || fbRating) >= s ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s' }}
                            />
                          </button>
                        ))}
                        {(fbHover || fbRating) > 0 && (
                          <span style={{ alignSelf: 'center', marginLeft: 8, fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(fbHover || fbRating)]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                        Review <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                      </label>
                      <textarea
                        value={fbReview}
                        onChange={e => setFbReview(e.target.value)}
                        placeholder="Share details about your experience — what you learned, what could be better..."
                        rows={4}
                        style={{
                          width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                          background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                          borderRadius: 12, color: c.text, fontSize: 13, outline: 'none',
                          resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    {fbError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, marginBottom: 14 }}>
                        <AlertCircle size={14} />{fbError}
                      </div>
                    )}
                    {fbSuccess && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12, marginBottom: 14 }}>
                        <CheckCircle size={14} /> {fbSuccess}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      {fbEditing && (
                        <button type="button" onClick={() => setFbEditing(false)} style={{
                          flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${c.border}`,
                          background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}>Cancel</button>
                      )}
                      <button type="submit" disabled={fbSubmitting || !fbRating} style={{
                        flex: 2, padding: '11px 20px', borderRadius: 10, border: 'none',
                        background: fbRating ? 'linear-gradient(135deg,#10b981,#059669)' : dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
                        color: fbRating ? '#fff' : c.textMuted,
                        fontSize: 12, fontWeight: 700, cursor: fbSubmitting || !fbRating ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: fbRating ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
                        transition: 'all 0.2s', opacity: fbSubmitting ? 0.7 : 1
                      }}>
                        {fbSubmitting
                          ? <Spin />
                          : <><Send size={14} /> {myFeedback ? 'Update Feedback' : 'Submit Feedback'}</>
                        }
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* DOUBTS & QUERIES TAB */}
            {activeTab === 'queries' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Controls Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '16px 20px'
                }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, marginBottom: 2 }}>Doubt Resolution Portal</h3>
                    <p style={{ fontSize: 11, color: c.textMuted }}>Ask experts about your course topics or doubts and track their responses.</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Status Filter Pills */}
                    <div style={{ display: 'flex', gap: 4, background: c.tabBg, borderRadius: 10, padding: 3, border: `1px solid ${c.border}` }}>
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'Pending', label: 'Pending' },
                        { id: 'Answered', label: 'Answered' },
                        { id: 'Resolved', label: 'Resolved' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setQueryFilter(f.id)}
                          style={{
                            padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: queryFilter === f.id ? 700 : 500,
                            background: queryFilter === f.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                            color: queryFilter === f.id ? '#10b981' : c.textMuted,
                            transition: 'all 0.2s'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleOpenQueryModal()}
                      style={{
                        padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                        fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'all 0.2s'
                      }}
                    >
                      <HelpCircle size={15} /> Ask Expert a Doubt
                    </button>
                  </div>
                </div>

                {/* Queries List */}
                {queriesLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: c.textMuted, fontSize: 13, gap: 10 }}>
                    <Spin /> Loading your doubts...
                  </div>
                ) : queries.filter(q => queryFilter === 'all' || q.status === queryFilter).length === 0 ? (
                  <Empty
                    icon={HelpCircle}
                    title="No doubts found"
                    sub={queryFilter === 'all' ? 'Have a doubt on any topic? Click "Ask Expert a Doubt" above or click "Ask Doubt" on any curriculum topic.' : `No ${queryFilter.toLowerCase()} doubts found.`}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {queries
                      .filter(q => queryFilter === 'all' || q.status === queryFilter)
                      .map(q => {
                        const isExpanded = expandedQueryId === q._id;
                        const badge = q.status === 'Pending' ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: 'Pending Expert' }
                          : q.status === 'In Progress' ? { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6', label: 'In Review' }
                          : q.status === 'Answered' ? { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: 'Answered ✓' }
                          : { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', color: '#a855f7', label: 'Resolved 🎉' };

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
                                    background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4
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
                                  <span>Submitted: {fmt(q.createdAt)}</span>
                                  {q.teacherId?.name && <span>Assigned Expert: <strong style={{ color: c.textSub }}>{q.teacherId.name}</strong></span>}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <span style={{
                                  padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800,
                                  background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color
                                }}>
                                  {badge.label}
                                </span>
                                <button
                                  onClick={() => setExpandedQueryId(isExpanded ? null : q._id)}
                                  style={{
                                    padding: '6px 12px', borderRadius: 8, border: `1px solid ${c.border}`,
                                    background: c.statBg, color: c.text, fontSize: 11, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  {q.replies?.length || 0} reply{q.replies?.length !== 1 ? 'ies' : ''}
                                </button>
                              </div>
                            </div>

                            <p style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 12 }}>
                              {q.description}
                            </p>

                            {/* Expanded Thread View */}
                            {isExpanded && (
                              <div style={{
                                marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.border}`,
                                display: 'flex', flexDirection: 'column', gap: 12
                              }}>
                                <h5 style={{ fontSize: 11, fontWeight: 800, color: c.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Discussion Thread ({q.replies?.length || 0})
                                </h5>

                                {(!q.replies || q.replies.length === 0) ? (
                                  <div style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic', padding: '8px 0' }}>
                                    No replies yet. Your doubt has been routed to expert instructors and they will respond shortly.
                                  </div>
                                ) : (
                                  q.replies.map((rep, idx) => {
                                    const isTeacher = ['Teacher', 'Admin', 'Staff'].includes(rep.senderRole);
                                    return (
                                      <div key={idx} style={{
                                        padding: '12px 14px', borderRadius: 12,
                                        background: isTeacher ? dark ? 'rgba(16,185,129,0.08)' : '#f0fdf4' : c.statBg,
                                        border: `1px solid ${isTeacher ? 'rgba(16,185,129,0.2)' : c.border}`,
                                        alignSelf: isTeacher ? 'flex-start' : 'flex-end',
                                        maxWidth: '92%'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <strong style={{ fontSize: 12, color: isTeacher ? '#10b981' : c.textSub }}>
                                              {rep.senderName} {isTeacher ? ' (Expert Instructor)' : ''}
                                            </strong>
                                          </div>
                                          <span style={{ fontSize: 9, color: c.textMuted }}>{fmt(rep.createdAt)}</span>
                                        </div>
                                        <p style={{ fontSize: 12, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-line', margin: 0 }}>
                                          {rep.message}
                                        </p>
                                      </div>
                                    );
                                  })
                                )}

                                {/* Reply Input Form */}
                                {q.status !== 'Resolved' && (
                                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                    <input
                                      type="text"
                                      value={replyText[q._id] || ''}
                                      onChange={e => setReplyText({ ...replyText, [q._id]: e.target.value })}
                                      onKeyDown={e => { if (e.key === 'Enter') handleAddReply(q._id); }}
                                      placeholder="Type follow-up doubt or response..."
                                      style={{
                                        flex: 1, padding: '10px 14px', borderRadius: 10,
                                        background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                                        color: c.text, fontSize: 12, outline: 'none'
                                      }}
                                    />
                                    <button
                                      onClick={() => handleAddReply(q._id)}
                                      disabled={replySubmitting[q._id] || !replyText[q._id]?.trim()}
                                      style={{
                                        padding: '10px 16px', borderRadius: 10, border: 'none',
                                        background: replyText[q._id]?.trim() ? 'linear-gradient(135deg,#10b981,#059669)' : c.border,
                                        color: replyText[q._id]?.trim() ? '#fff' : c.textMuted,
                                        fontSize: 12, fontWeight: 700, cursor: replyText[q._id]?.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', gap: 6
                                      }}
                                    >
                                      {replySubmitting[q._id] ? <Spin /> : <><Send size={12} /> Reply</>}
                                    </button>
                                  </div>
                                )}

                                {/* Action Bar */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                  {q.status === 'Answered' && (
                                    <button
                                      onClick={() => handleUpdateQueryStatus(q._id, 'Resolved')}
                                      style={{
                                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)',
                                        background: 'rgba(168,85,247,0.1)', color: '#a855f7',
                                        fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                      }}
                                    >
                                      <Check size={12} /> Mark as Resolved
                                    </button>
                                  )}
                                  {q.status === 'Resolved' && (
                                    <button
                                      onClick={() => handleUpdateQueryStatus(q._id, 'In Progress')}
                                      style={{
                                        padding: '6px 12px', borderRadius: 8, border: `1px solid ${c.border}`,
                                        background: c.statBg, color: c.textMuted,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer'
                                      }}
                                    >
                                      Reopen Doubt
                                    </button>
                                  )}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '16px 20px'
                }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, marginBottom: 2 }}>Course Assignments &amp; Homework</h3>
                    <p style={{ fontSize: 11, color: c.textMuted }}>Complete your assigned tasks and track your grades &amp; instructor feedback.</p>
                  </div>
                </div>

                {studentAssignmentsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: c.textMuted, fontSize: 13, gap: 10 }}>
                    <Spin /> Loading assignments...
                  </div>
                ) : studentAssignments.length === 0 ? (
                  <Empty
                    icon={ClipboardList}
                    title="No assignments found"
                    sub="Your instructor hasn't posted any assignments for this batch yet."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {studentAssignments.map(asg => {
                      const mySub = asg.submissions?.find(
                        s => s.studentId?.toString() === user._id?.toString() || s.studentId === user._id
                      );

                      const isOverdue = new Date(asg.dueDate) < new Date();
                      const statusBadge = !mySub
                        ? isOverdue
                          ? { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: 'Overdue' }
                          : { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: 'Pending Submission' }
                        : mySub.status === 'Graded'
                          ? { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', color: '#a855f7', label: `Graded: ${mySub.grade}/${asg.totalPoints}` }
                          : { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: 'Submitted ✓' };

                      return (
                        <div key={asg._id} style={{
                          background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16,
                          padding: '20px', transition: 'all 0.2s', borderLeft: `4px solid ${statusBadge.color}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                  background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                  <Calendar size={10} /> Due: {fmt(asg.dueDate)}
                                </span>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                  background: 'rgba(139,92,246,0.1)', color: '#a78bfa'
                                }}>
                                  Max Marks: {asg.totalPoints} pts
                                </span>
                              </div>
                              <h4 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, marginBottom: 4 }}>{asg.title}</h4>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              <span style={{
                                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                                background: statusBadge.bg, border: `1px solid ${statusBadge.border}`, color: statusBadge.color
                              }}>
                                {statusBadge.label}
                              </span>

                              <button
                                onClick={() => handleOpenSubmitModal(asg)}
                                style={{
                                  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                  background: mySub ? c.statBg : 'linear-gradient(135deg,#10b981,#059669)',
                                  color: mySub ? c.textSub : '#fff',
                                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                                  border: mySub ? `1px solid ${c.border}` : 'none',
                                  boxShadow: mySub ? 'none' : '0 4px 14px rgba(16,185,129,0.3)'
                                }}
                              >
                                <Send size={13} /> {mySub ? 'Edit Submission' : 'Submit Assignment'}
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
                                fontWeight: 700, textDecoration: 'none', marginBottom: 10
                              }}
                            >
                              <FileText size={12} /> View Reference Guidelines / Attachment
                            </a>
                          )}

                          {/* My Submission Details Card */}
                          {mySub && (
                            <div style={{
                              marginTop: 12, padding: '14px 16px', borderRadius: 12,
                              background: dark ? 'rgba(16,185,129,0.04)' : '#f0fdf4',
                              border: '1px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', gap: 8
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Your Submission Details
                                </span>
                                <span style={{ fontSize: 10, color: c.textMuted }}>Submitted on: {fmt(mySub.submittedAt)}</span>
                              </div>

                              {mySub.answerText && (
                                <div style={{ fontSize: 12, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                                  <strong>Your Answer:</strong> {mySub.answerText}
                                </div>
                              )}

                              {mySub.submissionUrl && (
                                <div>
                                  <a href={mySub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{
                                    fontSize: 11, color: '#10b981', fontWeight: 700, textDecoration: 'none'
                                  }}>
                                    🔗 Submitted Link / Project URL
                                  </a>
                                </div>
                              )}

                              {/* Feedback / Evaluation Section */}
                              {mySub.status === 'Graded' && (
                                <div style={{
                                  marginTop: 6, paddingTop: 8, borderTop: '1px solid rgba(16,185,129,0.2)',
                                  display: 'flex', flexDirection: 'column', gap: 4
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: '#a855f7' }}>
                                      Score: {mySub.grade} / {asg.totalPoints} pts
                                    </span>
                                  </div>
                                  {mySub.feedback && (
                                    <p style={{ fontSize: 12, color: c.textSub, fontStyle: 'italic', margin: 0 }}>
                                      <strong>Expert Feedback:</strong> &ldquo;{mySub.feedback}&rdquo;
                                    </p>
                                  )}
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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textMuted, fontSize: 13 }}>
              Failed to load batch data.
            </div>
          )}
        </main>
      </div>

      {/* ── JOIN MODAL ── */}
      {isJoinOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderGreen}`, borderRadius: 20,
            width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.05)',
            overflow: 'hidden', position: 'relative'
          }}>
            {/* Glow top */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 2, background: 'linear-gradient(90deg,transparent,#10b981,transparent)' }} />

            <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${c.border}` }}>
              <button onClick={() => { setIsJoinOpen(false); setJoinError(''); setJoinSuccess(''); }} style={{
                position: 'absolute', right: 20, top: 20, background: 'rgba(255,255,255,0.05)',
                border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: c.textMuted
              }}><X size={14} /></button>
              <div style={{
                width: 42, height: 42, borderRadius: 12, marginBottom: 14,
                background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.08))',
                border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><BookOpen size={18} color="#10b981" /></div>
              <div style={{ fontSize: 16, fontWeight: 800, color: c.textSub, marginBottom: 4 }}>Enrol in a Class Batch</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>Enter the batch code and passcode provided by your instructor.</div>
            </div>

            <form onSubmit={handleJoin} style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {joinError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12 }}>
                  <AlertCircle size={14} />{joinError}
                </div>
              )}
              {joinSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12 }}>
                  ✓ {joinSuccess}
                </div>
              )}
              {[
                { label: 'Batch ID / Code', key: 'batchId', type: 'text', placeholder: 'e.g. BATCH-REACT-A' },
                { label: 'Unique Join Key', key: 'uniqueKey', type: 'password', placeholder: 'Enter passcode...' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type} value={joinData[f.key]}
                    onChange={e => setJoinData({ ...joinData, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                      background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                      borderRadius: 10, color: c.text, fontSize: 13, outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setIsJoinOpen(false)} style={{
                  flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={joining} style={{
                  flex: 2, padding: '11px', borderRadius: 10, border: 'none', cursor: joining ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)', opacity: joining ? 0.7 : 1
                }}>
                  {joining ? <><Spin /> Enrolling...</> : <><Plus size={14} /> Join Batch</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ASK DOUBT MODAL ── */}
      {isQueryModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderGreen}`, borderRadius: 20,
            width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            overflow: 'hidden', position: 'relative'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <HelpCircle size={18} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: c.textSub, margin: 0 }}>Ask Expert a Doubt</h3>
                  <span style={{ fontSize: 11, color: c.textMuted }}>Get your topic &amp; course doubts answered by instructors</span>
                </div>
              </div>
              <button
                onClick={() => setIsQueryModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuery} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {queryFormError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12 }}>
                  <AlertCircle size={14} />{queryFormError}
                </div>
              )}
              {queryFormSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12 }}>
                  ✓ {queryFormSuccess}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Select Related Topic</label>
                <select
                  value={queryFormData.topicTitle}
                  onChange={e => {
                    const selectedT = curriculum.find(t => t.title === e.target.value);
                    setQueryFormData({
                      ...queryFormData,
                      topicTitle: e.target.value,
                      topicId: selectedT ? selectedT._id : ''
                    });
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none'
                  }}
                >
                  <option value="General Course Doubt">General Course Doubt</option>
                  {curriculum.map(t => (
                    <option key={t._id} value={t.title}>Topic: {t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Doubt Title / Subject</label>
                <input
                  type="text"
                  placeholder="e.g., How does state management work in async handlers?"
                  value={queryFormData.title}
                  onChange={e => setQueryFormData({ ...queryFormData, title: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Priority</label>
                <select
                  value={queryFormData.priority}
                  onChange={e => setQueryFormData({ ...queryFormData, priority: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none'
                  }}
                >
                  <option value="Low">Low - General clarification</option>
                  <option value="Medium">Medium - Stuck on topic/assignment</option>
                  <option value="High">High - Urgent / Exam preparation</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Detailed Question / Doubt</label>
                <textarea
                  rows={4}
                  placeholder="Explain your doubt in detail, code snippets, or error message..."
                  value={queryFormData.description}
                  onChange={e => setQueryFormData({ ...queryFormData, description: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsQueryModalOpen(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${c.border}`,
                    background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={querySubmitting}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: querySubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)', opacity: querySubmitting ? 0.7 : 1
                  }}
                >
                  {querySubmitting ? <Spin /> : <><Send size={14} /> Submit Query</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMIT ASSIGNMENT MODAL ── */}
      {isSubmitModalOpen && selectedAssignmentForSubmit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: c.modalBg, border: `1px solid ${c.borderGreen}`, borderRadius: 20,
            width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            overflow: 'hidden', position: 'relative'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ClipboardList size={18} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: c.textSub, margin: 0 }}>Submit Assignment Solution</h3>
                  <span style={{ fontSize: 11, color: c.textMuted }}>{selectedAssignmentForSubmit.title}</span>
                </div>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignmentSolution} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {submitError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12 }}>
                  <AlertCircle size={14} />{submitError}
                </div>
              )}
              {submitSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12 }}>
                  ✓ {submitSuccess}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Written Solution / Notes</label>
                <textarea
                  rows={4}
                  placeholder="Type your response, explanation, or code solution here..."
                  value={submitFormData.answerText}
                  onChange={e => setSubmitFormData({ ...submitFormData, answerText: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                    color: c.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>Project / Solution URL (GitHub, Google Drive, Figma, PDF link)</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={submitFormData.submissionUrl}
                  onChange={e => setSubmitFormData({ ...submitFormData, submissionUrl: e.target.value })}
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
                  onClick={() => setIsSubmitModalOpen(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${c.border}`,
                    background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitSubmitting}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: submitSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)', opacity: submitSubmitting ? 0.7 : 1
                  }}
                >
                  {submitSubmitting ? <Spin /> : <><Send size={14} /> Submit Solution</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIVE ANNOUNCEMENT FLOATING TOAST BANNER ── */}
      {liveAnnouncementToast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          background: dark ? '#151922' : '#ffffff',
          border: '1.5px solid #10b981', borderRadius: 16,
          padding: '16px 20px', maxWidth: 380, width: '90%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 24px rgba(16,185,129,0.35)',
          animation: 'slideUp 0.4s ease-out', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bell size={16} color="#10b981" />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  New Announcement Alert!
                </span>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: c.textSub, margin: 0 }}>{liveAnnouncementToast.title}</h4>
              </div>
            </div>

            <button
              onClick={() => setLiveAnnouncementToast(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 2 }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.5, marginBottom: 12, maxH: 80, overflow: 'hidden' }}>
            {liveAnnouncementToast.message}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => {
                setActiveTab('notifications');
                setLiveAnnouncementToast(null);
              }}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                fontSize: 11, fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
              }}
            >
              View Announcements
            </button>
          </div>
        </div>
      )}

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
