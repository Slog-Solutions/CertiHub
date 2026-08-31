import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap, LogOut, Plus, Bell, FileText, Link2,
  Download, ExternalLink, Calendar, User, BookOpen, X,
  AlertCircle, ChevronRight, Sparkles, Layers, Search, Sun, Moon
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

  const fetchBatches = async () => {
    try { setLoading(true); const r = await api.get('/batches/student'); setBatches(r.data); if (r.data.length > 0 && !selectedBatchId) setSelectedBatchId(r.data[0]._id); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchDetails = async (id) => {
    try { setDetailsLoading(true); const r = await api.get(`/batches/student/${id}`); setBatchDetails(r.data); }
    catch (e) { console.error(e); } finally { setDetailsLoading(false); }
  };

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => { selectedBatchId ? fetchDetails(selectedBatchId) : setBatchDetails(null); }, [selectedBatchId]);

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

  const tabs = [
    { id: 'notifications', label: 'Announcements', icon: Bell, count: batchDetails?.notifications?.length || 0 },
    { id: 'pdfs', label: 'Study PDFs', icon: FileText, count: batchDetails?.pdfs?.length || 0 },
    { id: 'links', label: 'Useful Links', icon: Link2, count: batchDetails?.links?.length || 0 },
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
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted }}>
                  <User size={13} color="#10b981" />
                  Instructor: <strong style={{ color: c.textSub }}>{batchDetails.teacherId?.name}</strong>
                  <span style={{ color: c.textMuted }}>·</span>
                  <span>{batchDetails.teacherId?.email}</span>
                </div>
              </div>
              {/* Stats pill */}
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                {[
                  { icon: Bell, val: batchDetails.notifications?.length || 0, label: 'Announcements' },
                  { icon: FileText, val: batchDetails.pdfs?.length || 0, label: 'PDFs' },
                  { icon: Link2, val: batchDetails.links?.length || 0, label: 'Links' },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} style={{
                    background: c.statBg, border: `1px solid ${c.border}`,
                    borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 70
                  }}>
                    <Icon size={16} color="#10b981" style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 18, fontWeight: 800, color: c.textSub }}>{val}</div>
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
                  padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
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
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!batchDetails.notifications?.length ? (
                  <Empty icon={Bell} title="No announcements yet" sub="Your teacher hasn't posted any announcements for this batch yet." />
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

            {activeTab === 'pdfs' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                {!batchDetails.pdfs?.length ? (
                  <div style={{ gridColumn: '1/-1' }}>
                    <Empty icon={FileText} title="No PDFs uploaded" sub="Your teacher hasn't uploaded any study material yet." />
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
                      <Download size={13} /> View & Download
                    </a>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'links' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!batchDetails.links?.length ? (
                  <Empty icon={Link2} title="No links shared" sub="Your teacher hasn't shared any useful links for this batch yet." />
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
    </div>
  );
};

export default StudentDashboard;
