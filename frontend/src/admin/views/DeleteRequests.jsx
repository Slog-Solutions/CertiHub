import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Trash2, CheckCircle2, XCircle, Clock, Search,
  AlertCircle, User, Calendar, FileText, RefreshCw,
  ShieldAlert, ChevronDown, X
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Helper utilities
───────────────────────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_META = {
  pending:  { label: 'Pending Review', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  approved: { label: 'Approved',        color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  rejected: { label: 'Rejected',        color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' }
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const icons = { pending: <Clock size={12} />, approved: <CheckCircle2 size={12} />, rejected: <XCircle size={12} /> };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`
    }}>
      {icons[status]} {meta.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
const DeleteRequests = () => {
  const { api, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Action modal
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject', request }
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Detail expand
  const [expandedId, setExpandedId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await api.get('/delete-requests', { params });
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load deletion requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await api.get('/delete-requests/counts');
      setCounts(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCounts();
  }, [statusFilter]);

  // Filtered list by local search
  const filteredRequests = requests.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.studentEmail?.toLowerCase().includes(q) ||
      r.studentUsername?.toLowerCase().includes(q)
    );
  });

  const openActionModal = (type, request) => {
    setActionModal({ type, request });
    setAdminNote('');
    setActionError('');
  };

  const closeActionModal = () => {
    setActionModal(null);
    setAdminNote('');
    setActionError('');
  };

  const handleAction = async () => {
    if (!actionModal) return;
    const { type, request } = actionModal;

    setActionLoading(true);
    setActionError('');
    try {
      const endpoint = `/delete-requests/${request._id}/${type}`;
      const res = await api.post(endpoint, { adminNote: adminNote.trim() });
      setSuccessMsg(res.data.message);
      closeActionModal();
      await fetchRequests();
      await fetchCounts();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setActionError(err.response?.data?.error || `Failed to ${type} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const TABS = [
    { key: 'pending',  label: 'Pending',  count: counts.pending },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
    { key: 'all',      label: 'All',      count: counts.total }
  ];

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'var(--font-outfit)', maxWidth: 1200 }}>

      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #FCA5A5'
            }}>
              <Trash2 size={18} color="#DC2626" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                Account Deletion Requests
              </h1>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
                Review and manage student account deletion requests
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { fetchRequests(); fetchCounts(); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ─── Summary Stat Cards ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pending Review', value: counts.pending, color: '#D97706', bg: '#FEF3C7', icon: Clock },
          { label: 'Approved',       value: counts.approved, color: '#15803D', bg: '#DCFCE7', icon: CheckCircle2 },
          { label: 'Rejected',       value: counts.rejected, color: '#B91C1C', bg: '#FEE2E2', icon: XCircle },
          { label: 'Total',          value: counts.total,    color: '#4F46E5', bg: '#EEF2FF', icon: FileText }
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Alerts ──────────────────────────────────────────────────── */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#B91C1C' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#15803D' }}>
          <CheckCircle2 size={15} /> {successMsg}
        </div>
      )}

      {/* ─── Filter Tabs + Search ─────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {/* Tab strip */}
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '14px 18px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: statusFilter === tab.key ? 700 : 500,
                  color: statusFilter === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: statusFilter === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    padding: '1px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
                    background: statusFilter === tab.key ? 'var(--accent)' : '#F1F5F9',
                    color: statusFilter === tab.key ? '#fff' : 'var(--text-muted)'
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email..."
                style={{
                  paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                  borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5,
                  background: 'var(--bg-cream)', color: 'var(--text-primary)', outline: 'none', width: 220
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── Table ─────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <RefreshCw size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
            <br />Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Trash2 size={20} color="#94A3B8" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>No requests found</div>
            <div style={{ fontSize: 12.5 }}>
              {statusFilter === 'pending' ? 'No pending deletion requests at this time.' : `No ${statusFilter} requests to display.`}
            </div>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1fr 140px',
              padding: '10px 20px', background: 'var(--bg-cream)',
              borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              <span>Student</span>
              <span>Email / Username</span>
              <span>Requested On</span>
              <span>Status</span>
              <span>Reviewed By</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {/* Table rows */}
            {filteredRequests.map(r => (
              <div key={r._id}>
                <div
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1fr 140px',
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    alignItems: 'center', cursor: 'pointer',
                    background: expandedId === r._id ? '#F8FAFC' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                  onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                >
                  {/* Student name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13, color: '#4F46E5'
                    }}>
                      {(r.studentName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{r.studentName || '—'}</div>
                      {r.reason && <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</div>}
                    </div>
                  </div>

                  {/* Email / Username */}
                  <div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{r.studentEmail || '—'}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>@{r.studentUsername || '—'}</div>
                  </div>

                  {/* Requested On */}
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{fmt(r.createdAt)}</div>

                  {/* Status */}
                  <div><StatusBadge status={r.status} /></div>

                  {/* Reviewed By */}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.reviewedBy?.name || (r.status === 'pending' ? '—' : 'Admin')}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }} onClick={e => e.stopPropagation()}>
                    {r.status === 'pending' && (
                      <>
                        {/* Only Admin can approve */}
                        {user?.role === 'Admin' && (
                          <button
                            id={`btn-approve-${r._id}`}
                            onClick={() => openActionModal('approve', r)}
                            title="Approve Deletion"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 6, border: '1px solid #86EFAC',
                              background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                        )}
                        <button
                          id={`btn-reject-${r._id}`}
                          onClick={() => openActionModal('reject', r)}
                          title="Reject Request"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 6, border: '1px solid #FCA5A5',
                            background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                    >
                      <ChevronDown size={14} style={{ transform: expandedId === r._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail Row */}
                {expandedId === r._id && (
                  <div style={{
                    padding: '16px 24px 20px 64px',
                    background: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)',
                    borderBottom: '1px solid var(--border)',
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Deletion Reason</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{r.reason || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reason provided</span>}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Timeline</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <div>📋 Submitted: {fmtTime(r.createdAt)}</div>
                        {r.reviewedAt && <div>⚖️ Reviewed: {fmtTime(r.reviewedAt)}</div>}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Admin Note</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>{r.adminNote || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Action Confirmation Modal ─────────────────────────────── */}
      {actionModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
            border: `1.5px solid ${actionModal.type === 'approve' ? '#86EFAC' : '#FCA5A5'}`,
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              background: actionModal.type === 'approve' ? '#F0FDF4' : '#FEF2F2',
              borderBottom: `1px solid ${actionModal.type === 'approve' ? '#BBF7D0' : '#FECACA'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: actionModal.type === 'approve' ? '#DCFCE7' : '#FEE2E2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {actionModal.type === 'approve'
                    ? <CheckCircle2 size={18} color="#15803D" />
                    : <XCircle size={18} color="#B91C1C" />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: actionModal.type === 'approve' ? '#14532D' : '#7F1D1D' }}>
                    {actionModal.type === 'approve' ? 'Approve Account Deletion' : 'Reject Deletion Request'}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    {actionModal.request.studentName}
                  </div>
                </div>
              </div>
              <button onClick={closeActionModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Warning (approve only) */}
              {actionModal.type === 'approve' && (
                <div style={{
                  display: 'flex', gap: 10, padding: '12px 14px',
                  background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8
                }}>
                  <ShieldAlert size={16} color="#C2410C" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 12.5, color: '#7C2D12', lineHeight: 1.6 }}>
                    <strong>⚠️ Irreversible Action!</strong> Approving this request will permanently delete the student's account data from the system
                    and archive it in the <code style={{ background: '#FEE2E2', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>deleted_users</code> collection.
                    This cannot be undone without manual database restoration.
                  </div>
                </div>
              )}

              {/* Student info */}
              <div style={{
                padding: '12px 16px', background: '#F8FAFC',
                border: '1px solid #E2E8F0', borderRadius: 8,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10
              }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Student</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{actionModal.request.studentName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Email</div>
                  <div style={{ fontSize: 12.5, color: '#334155' }}>{actionModal.request.studentEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Username / Reg ID</div>
                  <div style={{ fontSize: 12.5, color: '#334155' }}>@{actionModal.request.studentUsername}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Requested On</div>
                  <div style={{ fontSize: 12.5, color: '#334155' }}>{fmt(actionModal.request.createdAt)}</div>
                </div>
              </div>

              {/* Student's reason */}
              {actionModal.request.reason && (
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 5 }}>Student's Reason</div>
                  <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6, padding: '8px 12px', background: '#F8FAFC', borderRadius: 6, borderLeft: '3px solid #CBD5E1' }}>
                    {actionModal.request.reason}
                  </div>
                </div>
              )}

              {/* Admin note */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Admin Note <span style={{ color: '#94A3B8', fontWeight: 500 }}>(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder={actionModal.type === 'approve' ? 'e.g. Account deletion approved as per policy...' : 'e.g. Request rejected — pending dues...'}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                    border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12.5,
                    fontFamily: 'inherit', color: '#0F172A', background: '#F8FAFC',
                    resize: 'vertical', outline: 'none'
                  }}
                />
              </div>

              {actionError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#B91C1C' }}>
                  <AlertCircle size={14} /> {actionError}
                </div>
              )}

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button
                  onClick={closeActionModal}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: '1px solid #E2E8F0',
                    background: '#fff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  id={`btn-confirm-${actionModal.type}`}
                  onClick={handleAction}
                  disabled={actionLoading}
                  style={{
                    padding: '9px 22px', borderRadius: 8, border: 'none',
                    background: actionModal.type === 'approve' ? '#16A34A' : '#DC2626',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    opacity: actionLoading ? 0.7 : 1
                  }}
                >
                  {actionLoading
                    ? 'Processing...'
                    : actionModal.type === 'approve'
                      ? <><CheckCircle2 size={14} /> Confirm Approval</>
                      : <><XCircle size={14} /> Confirm Rejection</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteRequests;
