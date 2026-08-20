import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen, LogOut, Users, Plus, Bell, FileText, Link2,
  Download, Trash2, Calendar, User, Mail, Phone, X,
  AlertCircle, PlusCircle, CheckCircle2, ChevronRight,
  Layers, GraduationCap, Sparkles, Upload, Sun, Moon
} from 'lucide-react';

/* ─── Utility ──────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const T = (dark) => ({
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

/* ─── Main Component ───────────────────────────────────── */
const TeacherDashboard = () => {
  const { user, logout, api } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const c = T(dark);
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

  const fetchBatches = async () => {
    try { setLoading(true); const r = await api.get('/batches/teacher'); setBatches(r.data); if (r.data.length > 0 && !selectedBatchId) setSelectedBatchId(r.data[0]._id); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchDetails = async (id) => {
    try { setDetailsLoading(true); const r = await api.get('/batches/teacher'); const f = r.data.find(b => b._id === id); setBatchDetails(f || null); }
    catch (e) { console.error(e); } finally { setDetailsLoading(false); }
  };

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => { selectedBatchId ? fetchDetails(selectedBatchId) : setBatchDetails(null); }, [selectedBatchId]);

  const openModal = (type) => {
    setModalType(type); setFormError(''); setFormSuccess('');
    setLinkData({ title: '', url: '' }); setNotifData({ title: '', message: '' }); setPdfData({ title: '', description: '', file: null });
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

  const tabs = [
    { id: 'students', label: 'Students', icon: Users, count: batchDetails?.students?.length || 0 },
    { id: 'notifications', label: 'Announcements', icon: Bell, count: batchDetails?.notifications?.length || 0 },
    { id: 'pdfs', label: 'Study PDFs', icon: FileText, count: batchDetails?.pdfs?.length || 0 },
    { id: 'links', label: 'Links', icon: Link2, count: batchDetails?.links?.length || 0 },
  ];

  const modalConfig = {
    link: { title: 'Add Resource Link', icon: Link2, action: 'Add Link' },
    pdf: { title: 'Upload PDF Material', icon: FileText, action: 'Upload' },
    notification: { title: 'Post Announcement', icon: Bell, action: 'Post' },
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
              <BookOpen size={10} /> Teacher Panel
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                ].map(({ icon: Icon, label, type, color, bg, border }) => (
                  <button key={type} onClick={() => openModal(type)} style={{
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { icon: Users, val: batchDetails.students?.length || 0, label: 'Students', color: '#8b5cf6' },
                { icon: Bell, val: batchDetails.notifications?.length || 0, label: 'Announcements', color: '#f59e0b' },
                { icon: FileText, val: batchDetails.pdfs?.length || 0, label: 'PDFs Uploaded', color: '#10b981' },
                { icon: Link2, val: batchDetails.links?.length || 0, label: 'Links Shared', color: '#60a5fa' },
              ].map(({ icon: Icon, val, label, color }) => (
                <div key={label} style={{
                  background: c.statBg, border: `1px solid ${c.border}`,
                  borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c.textSub, lineHeight: 1 }}>{val}</div>
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
                  padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
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
              !batchDetails.students?.length ? (
                <Empty icon={Users} title="No students enrolled yet" sub={`Share Batch ID: ${batchDetails.batchId} and passcode: ${batchDetails.uniqueKey} with your students.`} />
              ) : (
                <div style={{ background: c.cardBg, border: `1px solid ${c.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={14} color="#8b5cf6" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>Student Register</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: c.textMuted }}>{batchDetails.students.length} students</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                          {['Student', 'Username', 'Email', 'Mobile'].map(h => (
                            <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', background: c.tableBg }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {batchDetails.students.map((s, i) => (
                          <tr key={s._id} style={{ borderBottom: i < batchDetails.students.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                  background: `hsl(${(s.name?.charCodeAt(0) || 0) * 7 % 360},60%,25%)`,
                                  border: `1.5px solid hsl(${(s.name?.charCodeAt(0) || 0) * 7 % 360},60%,40%)`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 12, fontWeight: 800, color: `hsl(${(s.name?.charCodeAt(0) || 0) * 7 % 360},70%,70%)`
                                }}>{s.name?.charAt(0).toUpperCase()}</div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>{s.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '13px 18px', fontSize: 11, color: c.textMuted, fontFamily: 'monospace' }}>{s.username}</td>
                            <td style={{ padding: '13px 18px', fontSize: 11, color: c.text }}>{s.email}</td>
                            <td style={{ padding: '13px 18px', fontSize: 11, color: c.textMuted }}>{s.mobile || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
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
            width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden', position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 2, background: 'linear-gradient(90deg,transparent,#8b5cf6,transparent)' }} />

            <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
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

            <div style={{ padding: '20px 28px 24px' }}>
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
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Announcement Title</label>
                    <input type="text" required value={notifData.title} onChange={e => setNotifData({ ...notifData, title: e.target.value })} placeholder="e.g. Test Scheduled, Class Update" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Message</label>
                    <textarea required value={notifData.message} onChange={e => setNotifData({ ...notifData, message: e.target.value })} placeholder="Write your announcement..." rows={4} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                  </div>
                  <ModalBtns onCancel={() => setIsModalOpen(false)} submitting={formSubmitting} label={modalConfig[modalType].action} />
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
            </div>
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
