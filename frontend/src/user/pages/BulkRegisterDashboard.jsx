import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Users, Upload, Download, FileSpreadsheet,
  CheckCircle2, AlertCircle, Layers, Send, Trash2, ClipboardList,
  RefreshCw, Eye, X, Plus, ChevronRight, Clock, Mail
} from 'lucide-react';

/* ─── Design System (matches TeacherDashboard) ─────────────────────────── */
const FONT = "'Noto Sans', ui-sans-serif, system-ui, -apple-system, sans-serif";
const C = {
  primary: '#6366F1', primaryDark: '#4F46E5', primarySoft: '#EEF2FF',
  darkNav: '#1E1B4B', ink: '#0F172A', body: '#1E293B', muted: '#334155',
  border: 'rgba(15,23,42,0.08)', borderSoft: 'rgba(15,23,42,0.04)',
  bg: '#FFFFFF', page: '#F8FAFC',
  green: '#22C55E', greenSoft: '#F0FDF4', greenText: '#15803D',
  red: '#EF4444', redSoft: '#FEF2F2', redText: '#B91C1C',
  orange: '#F97316', orangeSoft: '#FFF7ED', orangeText: '#C2410C',
  blue: '#3B82F6', blueSoft: '#EFF6FF', blueText: '#1D4ED8',
  teal: '#14B8A6', tealSoft: '#F0FDFA', tealText: '#0F766E',
  shadow: '0 1px 3px rgba(15,23,42,0.03), 0 4px 16px rgba(15,23,42,0.04)',
  shadowMd: '0 4px 20px rgba(15,23,42,0.06)',
};
const R = { sm: 10, md: 16, lg: 24, pill: 999 };

/* ─── Shared UI Primitives ──────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.3s ease forwards; }
    button, input, select, textarea { font-family: ${FONT}; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
    .bulk-table tbody tr:hover { background: #F8FAFC !important; }
    .session-card:hover { background: ${C.primarySoft} !important; border-color: ${C.primary}40 !important; }
  `}</style>
);

const Spin = ({ color = '#fff', size = 15 }) => (
  <svg style={{ width: size, height: size, animation: 'spin 0.9s linear infinite', flexShrink: 0 }} fill="none" viewBox="0 0 24 24">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
    <path style={{ opacity: 0.75 }} fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Btn = ({ children, icon: Icon, variant = 'primary', disabled, loading, onClick, style, ...rest }) => {
  const styles = {
    primary: { background: C.primary, color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' },
    success: { background: C.green, color: '#fff', boxShadow: '0 2px 8px rgba(34,197,94,0.25)' },
    danger: { background: C.redSoft, color: C.redText, border: `1px solid ${C.red}20` },
    ghost: { background: '#F1F5F9', color: C.body },
    outline: { background: '#fff', color: C.ink, border: `1px solid ${C.border}` },
    dark: { background: C.darkNav, color: '#fff' },
    teal: { background: C.tealSoft, color: C.tealText, border: `1px solid ${C.teal}30` },
    orange: { background: C.orangeSoft, color: C.orangeText },
  };
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '9px 18px', borderRadius: R.pill, fontSize: 13, fontWeight: 600,
        border: 'none', cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.6 : 1, whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        ...styles[variant], ...style
      }}
    >
      {loading ? <Spin color={variant === 'primary' || variant === 'success' || variant === 'dark' ? '#fff' : C.body} /> : Icon && <Icon size={14} strokeWidth={2.2} />}
      {children}
    </button>
  );
};

const Card = ({ children, style, accent }) => (
  <div style={{
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: R.md,
    padding: '20px 24px', boxShadow: C.shadow,
    ...(accent ? { borderLeft: `4px solid ${accent}` } : {}),
    ...style
  }}>{children}</div>
);

const Alert = ({ msg, type = 'error' }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 14px',
    borderRadius: R.sm, fontSize: 13, lineHeight: 1.5,
    background: type === 'error' ? C.redSoft : type === 'success' ? C.greenSoft : C.blueSoft,
    color: type === 'error' ? C.redText : type === 'success' ? C.greenText : C.blueText,
    border: `1px solid ${type === 'error' ? C.red : type === 'success' ? C.green : C.blue}20`
  }}>
    {type === 'error' ? <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> : <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
    <span>{msg}</span>
  </div>
);

const StepBadge = ({ n, label, active, done }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, flexShrink: 0,
      background: done ? C.green : active ? C.primary : '#E2E8F0',
      color: done || active ? '#fff' : C.muted,
      boxShadow: active ? '0 2px 8px rgba(99,102,241,0.35)' : 'none'
    }}>
      {done ? <CheckCircle2 size={15} /> : n}
    </div>
    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? C.ink : C.muted }}>{label}</span>
  </div>
);

const rangeInputStyle = {
  width: 84, padding: '8px 10px', borderRadius: R.sm, fontSize: 13, fontWeight: 600,
  color: C.ink, border: `1px solid ${C.border}`, background: '#fff', outline: 'none',
};

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function BulkRegisterDashboard() {
  const { api } = useAuth();
  const navigate = useNavigate();

  // Batch selection
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Step state
  const [step, setStep] = useState('select-batch'); // 'select-batch' | 'import' | 'results'

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSesssionId, setActiveSessionId] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  // Import form
  const [sessionName, setSessionName] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Results / credentials table
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Ranged export — a 4,500-row import is handed out in printable blocks
  // (1–100, 101–200, …) rather than as one unusable sheet.
  const EXPORT_BLOCK = 100;
  const [exportFrom, setExportFrom] = useState(1);
  const [exportTo, setExportTo] = useState(EXPORT_BLOCK);
  const [exportError, setExportError] = useState('');

  // Reset the window whenever a different set of candidates is loaded.
  useEffect(() => {
    setExportFrom(candidates.length ? 1 : 0);
    setExportTo(Math.min(EXPORT_BLOCK, candidates.length));
    setExportError('');
  }, [candidates]);

  /* ── Fetch assigned batches ─────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setBatchesLoading(true);
        const r = await api.get('/batches/teacher');
        setBatches(r.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setBatchesLoading(false);
      }
    })();
  }, []);

  /* ── Fetch sessions when batch is confirmed ─────────────────────────── */
  const fetchSessions = useCallback(async (batchId) => {
    if (!batchId) return;
    try {
      setSessionsLoading(true);
      const r = await api.get(`/batches/teacher/${batchId}/registration-sessions`);
      setSessions(r.data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSessionsLoading(false);
    }
  }, [api]);

  /* ── Confirm batch selection ────────────────────────────────────────── */
  const handleConfirmBatch = () => {
    if (!selectedBatchId) return;
    const b = batches.find(x => x._id === selectedBatchId);
    setSelectedBatch(b || null);
    setStep('import');
    fetchSessions(selectedBatchId);
    // Reset form state
    setSessionName('');
    setFile(null);
    setImportError('');
    setImportSuccess('');
    setCandidates([]);
    setSelectedIds(new Set());
    setSendResult(null);
  };

  /* ── Load a saved session ───────────────────────────────────────────── */
  const handleLoadSession = async (sessionId) => {
    try {
      setActiveSessionId(sessionId);
      const r = await api.get(`/batches/teacher/${selectedBatchId}/registration-sessions/${sessionId}`);
      const data = r.data.session;
      setCandidates(data.candidates || []);
      setSelectedIds(new Set());
      setSendResult(null);
      setStep('results');
      setImportSuccess(`Loaded session: "${data.sessionName}" — ${data.candidates?.length || 0} candidates`);
      setImportError('');
    } catch (e) {
      setImportError(e.response?.data?.error || 'Failed to load session.');
    }
  };

  /* ── Delete a session ───────────────────────────────────────────────── */
  const handleDeleteSession = async (sessionId, sessionName) => {
    if (!window.confirm(`Delete session "${sessionName}"?\n\nStudent accounts and batch enrollment remain intact — only the session record is removed.`)) return;
    setDeletingSessionId(sessionId);
    try {
      await api.delete(`/batches/teacher/${selectedBatchId}/registration-sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (activeSesssionId === sessionId) {
        setStep('import');
        setCandidates([]);
        setActiveSessionId(null);
      }
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete session.');
    } finally {
      setDeletingSessionId(null);
    }
  };

  /* ── Download sample Excel template ────────────────────────────────── */
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['FullName', 'Email', 'PhoneNumber', 'DateOfBirth', 'Gender', 'PermanentAddress', 'WorkingState', 'Branch/Department', 'YearOfStudy', 'TrainingTechnology'],
      ['John Doe', 'johndoe@example.com', '9876543210', '2001-05-15', 'Male', 'Main Street, Dehradun', 'Uttarakhand', 'Computer Science', '3rd Year', 'Python & AI'],
      ['Jane Smith', 'janesmith@example.com', '8765432109', '2000-08-22', 'Female', '12 Park Lane, Mumbai', 'Maharashtra', 'IT', '2nd Year', 'React & Node.js'],
    ]);
    ws['!cols'] = [20, 28, 14, 14, 10, 28, 16, 20, 12, 20].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
    XLSX.writeFile(wb, 'Bulk_Registration_Template.xlsx');
  };

  /* ── Export credentials Excel ───────────────────────────────────────── */
  /**
   * Write a credentials sheet for one slice of the candidate list.
   * `offset` is the slice's zero-based position in the full list, so Sr. No
   * keeps counting from where the previous block left off — block 101–200
   * is numbered 101–200, not restarted at 1.
   */
  const writeCredentialsSheet = (list, offset, fileSuffix) => {
    const wsData = [
      ['Sr. No', 'Full Name', 'Mobile Number', 'Email', 'Username (Login ID)', 'Password']
    ];
    list.forEach((c, i) => {
      wsData.push([offset + i + 1, c.fullName || '', c.phone || '', c.email || '', c.username || '', c.password || '']);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [6, 24, 16, 30, 22, 14].map(w => ({ wch: w }));
    // Bold header row styling
    const headerRow = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'];
    headerRow.forEach(cell => {
      if (ws[cell]) ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'EEF2FF' } } };
    });
    const wb = XLSX.utils.book_new();
    const batchName = (selectedBatch?.name || 'Batch').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.utils.book_append_sheet(wb, ws, 'Credentials');
    XLSX.writeFile(wb, `${batchName}_Credentials${fileSuffix}.xlsx`);
  };

  const handleExportExcel = () => {
    if (!candidates.length) return;
    writeCredentialsSheet(candidates, 0, '');
  };

  /* ── Export one numbered range, then advance to the next block ───────── */
  const handleExportRange = () => {
    setExportError('');
    const from = parseInt(exportFrom, 10);
    const to = parseInt(exportTo, 10);

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      setExportError('Enter a start and end number.');
      return;
    }
    if (from < 1 || to > candidates.length) {
      setExportError(`Range must be between 1 and ${candidates.length}.`);
      return;
    }
    if (from > to) {
      setExportError('The start number cannot be greater than the end number.');
      return;
    }

    // Both ends inclusive: 1–100 exports 100 candidates.
    writeCredentialsSheet(candidates.slice(from - 1, to), from - 1, `_${from}-${to}`);

    // Queue up the next block of the same size so repeated exports are
    // 1–100, 101–200, 201–300 … without retyping.
    const size = to - from + 1;
    if (to < candidates.length) {
      setExportFrom(to + 1);
      setExportTo(Math.min(to + size, candidates.length));
    }
  };

  /* ── Submit bulk import ─────────────────────────────────────────────── */
  const handleImport = async (e) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess('');

    if (!sessionName.trim()) {
      setImportError('Please enter a name for this registration session before importing.');
      return;
    }
    if (!file) {
      setImportError('Please select an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('sessionName', sessionName.trim());
    formData.append('excel', file);

    setImporting(true);
    try {
      const r = await api.post(`/batches/teacher/${selectedBatchId}/bulk-register-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000 // 10 min — a 4,500-row import takes ~1 min of hashing alone
      });
      const data = r.data;
      setCandidates(data.candidates || []);
      setSelectedIds(new Set());
      setSendResult(null);
      setActiveSessionId(data.sessionId);
      setImportSuccess(`✅ ${data.message}`);
      setStep('results');
      fetchSessions(selectedBatchId); // refresh session list
    } catch (err) {
      setImportError(err.response?.data?.error || 'Failed to process Excel file. Please check the format and try again.');
    } finally {
      setImporting(false);
    }
  };

  /* ── Selection helpers ──────────────────────────────────────────────── */
  // How many candidates the current export range covers (0 when it is invalid).
  const rangeCount = (() => {
    const from = parseInt(exportFrom, 10);
    const to = parseInt(exportTo, 10);
    if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
    if (from < 1 || to > candidates.length || from > to) return 0;
    return to - from + 1;
  })();

  const allSelected = candidates.length > 0 && selectedIds.size === candidates.length;
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map(c => c.userId).filter(Boolean)));
    }
  };
  const toggleOne = (uid) => {
    if (!uid) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  /* ── Send credentials ───────────────────────────────────────────────── */
  const handleSendCredentials = async () => {
    if (selectedIds.size === 0) return;
    const confirm = window.confirm(`Send login credentials via email to ${selectedIds.size} selected candidate(s)?\n\nEmails will be dispatched in the background — the page won't freeze.`);
    if (!confirm) return;

    setSendingCredentials(true);
    setSendResult(null);
    try {
      const r = await api.post(`/batches/teacher/${selectedBatchId}/send-credentials`, {
        userIds: Array.from(selectedIds)
      });
      setSendResult({ success: true, message: r.data.message });
    } catch (err) {
      setSendResult({ success: false, message: err.response?.data?.error || 'Failed to queue credentials.' });
    } finally {
      setSendingCredentials(false);
    }
  };

  /* ── File drop handlers ─────────────────────────────────────────────── */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  /* ─────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: C.page, fontFamily: FONT, color: C.body }}>
      <FontLoader />

      {/* ── Top Bar ── */}
      <div style={{
        background: C.bg, borderBottom: `1px solid ${C.border}`,
        padding: '0 32px', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/user/teacher/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: R.sm, border: `1px solid ${C.border}`, background: '#fff',
              color: C.body, fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: C.primarySoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, letterSpacing: '-0.2px' }}>Bulk Candidate Registration</div>
              <div style={{ fontSize: 11, color: C.muted }}>Expert Portal — Import, Register & Manage</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selectedBatch && (
            <div style={{
              padding: '5px 12px', borderRadius: R.pill, fontSize: 12, fontWeight: 600,
              background: C.primarySoft, color: C.primaryDark,
              border: `1px solid ${C.primary}30`
            }}>
              {selectedBatch.name}
            </div>
          )}
          <img src="/logo.png" alt="Slog" style={{ height: 26, objectFit: 'contain' }} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>

        {/* ── LEFT PANEL: Batch + Sessions ── */}
        <aside style={{
          width: 272, flexShrink: 0, background: C.bg,
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', padding: '20px 14px', gap: 20,
          overflowY: 'auto'
        }}>
          {/* Step 1: Batch Selector */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              1. SELECT BATCH
            </div>
            {batchesLoading ? (
              <div style={{ display: 'flex', gap: 8, padding: '10px 0', color: C.muted, fontSize: 13 }}>
                <Spin color={C.muted} /> Loading batches...
              </div>
            ) : batches.length === 0 ? (
              <div style={{ fontSize: 12.5, color: C.muted, padding: '8px 0' }}>No batches assigned to you yet.</div>
            ) : (
              <>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: R.sm, fontSize: 13,
                    border: `1px solid ${C.border}`, background: '#F8FAFC', color: C.ink,
                    outline: 'none', marginBottom: 10
                  }}
                >
                  <option value="">— Choose a batch —</option>
                  {batches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
                <Btn
                  icon={ChevronRight}
                  disabled={!selectedBatchId}
                  onClick={handleConfirmBatch}
                  style={{ width: '100%' }}
                >
                  Confirm Batch
                </Btn>
              </>
            )}
          </div>

          {/* Sessions List */}
          {step !== 'select-batch' && (
            <div style={{ flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  SAVED SESSIONS
                </div>
                <button
                  onClick={() => fetchSessions(selectedBatchId)}
                  title="Refresh sessions"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 3, display: 'flex' }}
                >
                  <RefreshCw size={12} />
                </button>
              </div>

              {/* New Import Button */}
              <button
                onClick={() => {
                  setStep('import');
                  setSessionName('');
                  setFile(null);
                  setImportError('');
                  setImportSuccess('');
                  setCandidates([]);
                  setSelectedIds(new Set());
                  setSendResult(null);
                  setActiveSessionId(null);
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: R.sm, marginBottom: 8,
                  border: `1.5px dashed ${C.primary}60`, background: C.primarySoft,
                  color: C.primaryDark, fontWeight: 700, fontSize: 12.5, cursor: 'pointer'
                }}
              >
                <Plus size={13} /> New Import
              </button>

              {sessionsLoading ? (
                <div style={{ display: 'flex', gap: 8, color: C.muted, fontSize: 12, padding: '8px 0' }}>
                  <Spin color={C.muted} size={12} /> Loading...
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: '20px 8px', lineHeight: 1.6 }}>
                  No sessions yet.<br />Import an Excel file to create one.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {sessions.map(s => {
                    const isActive = activeSesssionId === s._id;
                    return (
                      <div
                        key={s._id}
                        className="session-card"
                        style={{
                          padding: '10px 12px', borderRadius: R.sm, cursor: 'pointer',
                          border: `1px solid ${isActive ? C.primary + '40' : C.border}`,
                          background: isActive ? C.primarySoft : '#FAFAFA',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => handleLoadSession(s._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? C.primaryDark : C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <ClipboardList size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              {s.sessionName}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                              {s.totalRegistered} candidates · {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteSession(s._id, s.sessionName); }}
                            disabled={deletingSessionId === s._id}
                            title="Delete session"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: C.redText, padding: '2px 4px', borderRadius: 6,
                              opacity: deletingSessionId === s._id ? 0.5 : 0.6,
                              flexShrink: 0, display: 'flex', alignItems: 'center'
                            }}
                          >
                            {deletingSessionId === s._id ? <Spin color={C.redText} size={12} /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── RIGHT PANEL: Main Content ── */}
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', minWidth: 0 }}>

          {/* Step Indicator */}
          {step !== 'select-batch' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
              padding: '14px 20px', background: C.bg, borderRadius: R.md,
              border: `1px solid ${C.border}`, boxShadow: C.shadow
            }}>
              <StepBadge n="1" label="Select Batch" done={true} />
              <ChevronRight size={14} color={C.muted} style={{ flexShrink: 0 }} />
              <StepBadge n="2" label="Name & Import" active={step === 'import'} done={step === 'results'} />
              <ChevronRight size={14} color={C.muted} style={{ flexShrink: 0 }} />
              <StepBadge n="3" label="View & Manage" active={step === 'results'} done={false} />
            </div>
          )}

          {/* ── STEP 1: Select Batch (empty state) ── */}
          {step === 'select-batch' && (
            <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22, background: C.primarySoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <Users size={32} color={C.primary} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 10, letterSpacing: '-0.5px' }}>
                Bulk Candidate Registration
              </h1>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
                Import up to <strong>3,000+ students</strong> at once via Excel. Credentials are generated instantly, saved permanently, and never lost. Select a batch from the left panel to get started.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                {[
                  { icon: Upload, label: 'Upload Excel', desc: 'Any .xlsx or .csv file' },
                  { icon: FileSpreadsheet, label: 'Auto Credentials', desc: 'Unique ID + Password generated' },
                  { icon: Mail, label: 'Send Later', desc: 'Email when you\'re ready' }
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} style={{
                    padding: '14px 18px', borderRadius: R.md, border: `1px solid ${C.border}`,
                    background: C.bg, textAlign: 'center', width: 140
                  }}>
                    <Icon size={20} color={C.primary} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{label}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Import Form ── */}
          {step === 'import' && (
            <div style={{ maxWidth: 640 }} className="fade-in">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 4, letterSpacing: '-0.3px' }}>
                  Import Candidates
                </h2>
                <p style={{ fontSize: 13, color: C.muted }}>
                  Name your session, then upload an Excel file. Extra columns are ignored safely.
                </p>
              </div>

              {importError && <div style={{ marginBottom: 16 }}><Alert msg={importError} type="error" /></div>}
              {importSuccess && <div style={{ marginBottom: 16 }}><Alert msg={importSuccess} type="success" /></div>}

              <form onSubmit={handleImport}>
                <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Session Name */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.ink, display: 'block', marginBottom: 7 }}>
                      Session Name <span style={{ color: C.redText }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={sessionName}
                      onChange={e => setSessionName(e.target.value)}
                      placeholder="e.g. Batch 1, September Intake 2026, Rajkot Group..."
                      maxLength={80}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: R.sm,
                        border: `1.5px solid ${sessionName ? C.primary + '70' : C.border}`,
                        fontSize: 13.5, color: C.ink, outline: 'none',
                        background: '#FAFBFF', transition: 'border-color 0.15s ease'
                      }}
                    />
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                      This name is saved permanently and will appear in the sessions list.
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                        Excel / CSV File <span style={{ color: C.redText }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: C.primary, fontSize: 12, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 5
                        }}
                      >
                        <Download size={12} /> Download Template
                      </button>
                    </div>
                    <label
                      htmlFor="bulk-file-input"
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 12, padding: '32px 20px', cursor: 'pointer',
                        border: `2px dashed ${dragOver ? C.primary : file ? C.green : '#CBD5E1'}`,
                        borderRadius: R.md, background: dragOver ? C.primarySoft : file ? C.greenSoft : '#FAFBFF',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        id="bulk-file-input"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        onChange={e => setFile(e.target.files[0] || null)}
                      />
                      {file ? (
                        <>
                          <FileSpreadsheet size={30} color={C.greenText} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.greenText }}>{file.name}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                              {(file.size / 1024).toFixed(0)} KB · Click to change
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload size={28} color={C.muted} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>Drop your Excel file here</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>or click to browse · .xlsx, .xls, .csv</div>
                          </div>
                        </>
                      )}
                    </label>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
                      <strong>Required columns:</strong> FullName, Email &nbsp;·&nbsp;
                      <strong>Optional:</strong> PhoneNumber, DateOfBirth, Gender, PermanentAddress, WorkingState, Branch/Department, YearOfStudy, TrainingTechnology &nbsp;·&nbsp;
                      Extra/unknown columns are silently ignored.
                    </div>
                  </div>

                  <Btn
                    type="submit"
                    icon={Upload}
                    variant="primary"
                    loading={importing}
                    disabled={!sessionName.trim() || !file}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {importing ? 'Registering Candidates...' : 'Register All Candidates →'}
                  </Btn>
                </Card>
              </form>
            </div>
          )}

          {/* ── STEP 3: Results Table ── */}
          {step === 'results' && (
            <div className="fade-in">
              {/* Action Bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12, marginBottom: 20
              }}>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginBottom: 3, letterSpacing: '-0.3px' }}>
                    Registered Candidates
                  </h2>
                  <p style={{ fontSize: 13, color: C.muted }}>
                    {candidates.length} total &nbsp;·&nbsp; {selectedIds.size} selected
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Btn
                    variant="ghost"
                    icon={FileSpreadsheet}
                    onClick={handleExportExcel}
                    disabled={!candidates.length}
                  >
                    Export All ({candidates.length})
                  </Btn>
                  <Btn
                    variant="teal"
                    icon={Send}
                    onClick={handleSendCredentials}
                    loading={sendingCredentials}
                    disabled={selectedIds.size === 0}
                  >
                    Send Credentials ({selectedIds.size})
                  </Btn>
                </div>
              </div>

              {/* Ranged export — hand out credentials in blocks of 100 */}
              {candidates.length > 0 && (
                <Card style={{ marginBottom: 16, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Export range</span>
                    <span style={{ fontSize: 13, color: C.muted }}>from</span>
                    <input
                      type="number"
                      min={1}
                      max={candidates.length}
                      value={exportFrom}
                      onChange={e => setExportFrom(e.target.value)}
                      style={rangeInputStyle}
                    />
                    <span style={{ fontSize: 13, color: C.muted }}>to</span>
                    <input
                      type="number"
                      min={1}
                      max={candidates.length}
                      value={exportTo}
                      onChange={e => setExportTo(e.target.value)}
                      style={rangeInputStyle}
                    />
                    <Btn
                      variant="primary"
                      icon={Download}
                      onClick={handleExportRange}
                      disabled={!candidates.length}
                    >
                      Download
                    </Btn>
                    <span style={{ fontSize: 12.5, color: C.muted }}>
                      {rangeCount > 0
                        ? `${rangeCount} candidate${rangeCount === 1 ? '' : 's'} · of ${candidates.length} total`
                        : `of ${candidates.length} total`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
                    Both numbers are included, so 1–100 gives 100 candidates. After each download the
                    range jumps to the next block automatically.
                  </div>
                  {exportError && (
                    <div style={{ marginTop: 10 }}><Alert msg={exportError} type="error" /></div>
                  )}
                </Card>
              )}

              {importSuccess && (
                <div style={{ marginBottom: 16 }}><Alert msg={importSuccess} type="success" /></div>
              )}
              {importError && (
                <div style={{ marginBottom: 16 }}><Alert msg={importError} type="error" /></div>
              )}
              {sendResult && (
                <div style={{ marginBottom: 16 }}>
                  <Alert msg={sendResult.message} type={sendResult.success ? 'success' : 'error'} />
                </div>
              )}

              {/* Credentials Table */}
              {candidates.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '50px 24px' }}>
                  <Eye size={36} color={C.muted} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, color: C.muted }}>No candidates in this session yet.</p>
                </Card>
              ) : (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9', borderBottom: `1px solid ${C.border}` }}>
                          <th style={{ padding: '12px 14px', textAlign: 'left', width: 40 }}>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleAll}
                              style={{ cursor: 'pointer', accentColor: C.primary, width: 15, height: 15 }}
                            />
                          </th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 700, color: C.muted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', width: 50 }}>Sr.</th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 700, color: C.muted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 160 }}>Full Name</th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 700, color: C.muted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 130 }}>Mobile</th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 700, color: C.muted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 170 }}>Username (Login ID)</th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 700, color: C.muted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 120 }}>Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((c, i) => {
                          const checked = selectedIds.has(c.userId);
                          return (
                            <tr
                              key={c.userId || i}
                              style={{
                                borderBottom: `1px solid ${C.borderSoft}`,
                                background: checked ? `${C.primary}07` : 'transparent',
                                transition: 'background 0.1s ease'
                              }}
                            >
                              <td style={{ padding: '10px 14px' }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleOne(c.userId)}
                                  style={{ cursor: 'pointer', accentColor: C.primary, width: 15, height: 15 }}
                                />
                              </td>
                              <td style={{ padding: '10px 10px', color: C.muted, fontSize: 12 }}>{i + 1}</td>
                              <td style={{ padding: '10px 10px' }}>
                                <div style={{ fontWeight: 600, color: C.ink }}>{c.fullName}</div>
                                <div style={{ fontSize: 11.5, color: C.muted }}>{c.email}</div>
                              </td>
                              <td style={{ padding: '10px 10px', color: C.body }}>{c.phone || '—'}</td>
                              <td style={{ padding: '10px 10px' }}>
                                <code style={{
                                  background: C.primarySoft, color: C.primaryDark,
                                  padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace',
                                  fontSize: 12.5, fontWeight: 700
                                }}>{c.username}</code>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <code style={{
                                  background: C.greenSoft, color: C.greenText,
                                  padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace',
                                  fontSize: 12.5, fontWeight: 700
                                }}>{c.password}</code>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{
                    padding: '10px 16px', fontSize: 12, color: C.muted,
                    borderTop: `1px solid ${C.borderSoft}`, background: '#FAFAFA'
                  }}>
                    Showing {candidates.length} candidates &nbsp;·&nbsp; {selectedIds.size} selected &nbsp;·&nbsp;
                    <span style={{ color: C.primary, cursor: 'pointer', fontWeight: 600 }} onClick={toggleAll}>
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
