'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Briefcase, Lock, User, Mail, Phone,
  MapPin, AlertCircle, ArrowRight, Loader2, Shield,
  CheckCircle2, Eye, EyeOff,
} from 'lucide-react';

/* ══════════════════════════════════════════
   THEME CONFIG
══════════════════════════════════════════ */
const THEMES = {
  student: {
    key: 'student',
    label: 'Candidate Portal',
    Icon: GraduationCap,
    accent: '#34d399',
    accentDeep: '#10b981',
    accentText: '#6ee7b7',
    glow: 'rgba(52,211,153,0.18)',
    ring: '0 0 0 3px rgba(52,211,153,0.20)',
    inputFocusBg: 'rgba(52,211,153,0.06)',
    btnGrad: 'linear-gradient(135deg,#059669 0%,#34d399 100%)',
    btnShadow: '0 6px 28px rgba(16,185,129,0.45)',
    blob1color: 'radial-gradient(circle, #064e3b 0%, transparent 70%)',
    blob2color: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
    activeBorder: 'rgba(52,211,153,0.30)',
  },
  teacher: {
    key: 'teacher',
    label: 'Expert Portal',
    Icon: Briefcase,
    accent: '#a78bfa',
    accentDeep: '#8b5cf6',
    accentText: '#c4b5fd',
    glow: 'rgba(167,139,250,0.18)',
    ring: '0 0 0 3px rgba(167,139,250,0.20)',
    inputFocusBg: 'rgba(167,139,250,0.06)',
    btnGrad: 'linear-gradient(135deg,#6d28d9 0%,#a78bfa 100%)',
    btnShadow: '0 6px 28px rgba(139,92,246,0.45)',
    blob1color: 'radial-gradient(circle, #2e1065 0%, transparent 70%)',
    blob2color: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
    activeBorder: 'rgba(167,139,250,0.30)',
  },
};

/* ══════════════════════════════════════════
   AURORA BLOB
══════════════════════════════════════════ */
const AuroraBlob = ({ gradient, style, duration = 14 }) => (
  <motion.div
    style={{
      position: 'fixed',
      borderRadius: '50%',
      background: gradient,
      filter: 'blur(90px)',
      opacity: 0.7,
      ...style,
    }}
    animate={{ x: [0, 35, -20, 25, 0], y: [0, -28, 18, -12, 0], scale: [1, 1.1, 0.93, 1.06, 1] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ══════════════════════════════════════════
   DARK INPUT
══════════════════════════════════════════ */
const DarkInput = ({ label, icon: Icon, accent, ring, inputFocusBg, type = 'text', value, onChange, placeholder, required, rightEl, textarea, rows = 2 }) => {
  const [focused, setFocused] = useState(false);
  const baseStyle = {
    width: '100%',
    padding: '13px 14px 13px 44px',
    paddingRight: rightEl ? 46 : 14,
    borderRadius: 12,
    border: `1.5px solid ${focused ? accent : 'rgba(255,255,255,0.10)'}`,
    background: focused ? inputFocusBg : 'rgba(255,255,255,0.04)',
    fontSize: 13.5,
    fontWeight: 500,
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
    boxShadow: focused ? ring : 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'none',
    display: 'block',
    caretColor: accent,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{ position: 'absolute', left: 14, top: textarea ? 14 : '50%', transform: textarea ? 'none' : 'translateY(-50%)', color: focused ? accent : 'rgba(148,163,184,0.5)', transition: 'color 0.2s', zIndex: 1, pointerEvents: 'none' }} />
        {textarea ? (
          <textarea rows={rows} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder={placeholder} style={baseStyle} />
        ) : (
          <input type={type} required={required} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder={placeholder} style={baseStyle} />
        )}
        {rightEl && (
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', paddingRight: 12 }}>
            {rightEl}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const UserLogin = () => {
  const { login, api } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('student');
  const [studentMode, setStudentMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [regData, setRegData] = useState({ username: '', password: '', name: '', email: '', mobile: '', address: '' });

  const theme = THEMES[activeTab];
  const showLoginForm = activeTab === 'teacher' || (activeTab === 'student' && studentMode === 'login');

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const data = await login(loginData.username, loginData.password);
      if (activeTab === 'student' && data.user.role !== 'Student') throw new Error('Account does not belong to a Candidate.');
      if (activeTab === 'teacher' && data.user.role !== 'Teacher') throw new Error('Account does not belong to an Expert.');
      setSuccess('Access granted! Redirecting…');
      setTimeout(() => {
        if (data.user.role === 'Student') navigate('/user/student/dashboard');
        else if (data.user.role === 'Teacher') navigate('/user/teacher/dashboard');
      }, 900);
    } catch (err) { setError(err.message || 'Login failed. Check your credentials.'); setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    if (!regData.username || !regData.password || !regData.name || !regData.email) {
      setError('Fill in all required fields.'); setLoading(false); return;
    }
    try {
      await api.post('/auth/register-student', regData);
      setSuccess('Account created! Please sign in.');
      setLoginData({ username: regData.username, password: '' });
      setStudentMode('login'); setLoading(false);
    } catch (err) { setError(err.response?.data?.error || 'Registration failed. Username may be taken.'); setLoading(false); }
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.6)', display: 'flex', padding: 4, transition: 'color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.color = theme.accent}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.6)'}>
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px 16px', overflow: 'hidden' }}>

      {/* ── Base dark gradient ── */}
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #060b14 0%, #0a1020 40%, #080e1c 100%)', zIndex: 0 }} />

      {/* ── Aurora blobs (change with tab) ── */}
      <AnimatePresence>
        <AuroraBlob key={`b1-${activeTab}`} gradient={theme.blob1color} style={{ width: 600, height: 600, top: '-20%', left: '-15%', opacity: 0.65 }} duration={18} />
        <AuroraBlob key={`b2-${activeTab}`} gradient={theme.blob2color} style={{ width: 420, height: 420, bottom: '-15%', right: '-10%', opacity: 0.50 }} duration={13} />
        <AuroraBlob key={`b3-${activeTab}`} gradient="radial-gradient(circle, #1e293b 0%, transparent 70%)" style={{ width: 350, height: 350, top: '35%', left: '45%', opacity: 0.8 }} duration={20} />
      </AnimatePresence>

      {/* ── Star dots ── */}
      {[...Array(22)].map((_, i) => (
        <motion.div key={i}
          style={{
            position: 'fixed',
            width: i % 3 === 0 ? 2 : 1,
            height: i % 3 === 0 ? 2 : 1,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            left: `${(i * 4.7 + 3) % 100}%`,
            top: `${(i * 7.3 + 5) % 100}%`,
            zIndex: 1,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* ══════════ GLASS MODAL CARD ══════════ */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: showLoginForm ? 440 : 500,
          background: 'rgba(13,20,38,0.80)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: 28,
          border: `1px solid ${theme.activeBorder}`,
          boxShadow: `0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)`,
          overflow: 'hidden',
        }}
      >
        {/* ── Accent gradient bar at top ── */}
        <motion.div
          key={activeTab + '-bar'}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: 3, background: theme.btnGrad, transformOrigin: 'left' }}
        />

        {/* ── Subtle inner glow at top ── */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 120,
          background: `radial-gradient(ellipse, ${theme.glow} 0%, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ padding: '32px 38px 38px', position: 'relative', zIndex: 1 }}>

          {/* ── Brand Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              style={{
                width: 50, height: 50, borderRadius: 15, flexShrink: 0,
                background: theme.btnGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 900, color: '#fff',
                boxShadow: theme.btnShadow,
              }}
            >SS</motion.div>
            <div>
              <h1 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px', margin: 0, lineHeight: 1.2 }}>
                Slog Solutions
              </h1>
              <p style={{ fontSize: 11.5, color: 'rgba(148,163,184,0.65)', margin: 0, marginTop: 3, fontWeight: 400 }}>
                Batch Learning & Resource Portal
              </p>
            </div>
            {/* Live indicator */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent }}
              />
              <span style={{ fontSize: 10, color: theme.accentText, fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 22 }} />

          {/* ── Role Tabs ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255,255,255,0.04)', borderRadius: 14,
            padding: 4, marginBottom: 22, position: 'relative',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <motion.div layout
              style={{
                position: 'absolute', top: 4, bottom: 4,
                left: activeTab === 'student' ? 4 : '50%',
                width: 'calc(50% - 4px)',
                borderRadius: 11,
                background: theme.btnGrad,
                zIndex: 0,
                boxShadow: theme.btnShadow,
              }}
              transition={{ type: 'spring', stiffness: 450, damping: 38 }}
            />
            {Object.values(THEMES).map(t => {
              const Icon = t.Icon;
              const isActive = activeTab === t.key;
              return (
                <button key={t.key}
                  onClick={() => { setActiveTab(t.key); setError(''); setSuccess(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '10.5px 0', borderRadius: 11,
                    fontSize: 12.5, fontWeight: 700,
                    border: 'none', cursor: 'pointer', background: 'transparent',
                    color: isActive ? '#fff' : 'rgba(148,163,184,0.55)',
                    position: 'relative', zIndex: 1,
                    transition: 'color 0.3s', fontFamily: 'inherit',
                  }}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* ── Student: Sign In / Create Account ── */}
          <AnimatePresence>
            {activeTab === 'student' && (
              <motion.div key="student-sub"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden', marginBottom: 20 }}
              >
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[{ k: 'login', l: 'Sign In' }, { k: 'register', l: 'Create Account' }].map(m => (
                    <button key={m.k}
                      onClick={() => { setStudentMode(m.k); setError(''); }}
                      style={{
                        flex: 1, padding: '8.5px 0', borderRadius: 8,
                        fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: studentMode === m.k ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: studentMode === m.k ? theme.accentText : 'rgba(148,163,184,0.5)',
                        boxShadow: studentMode === m.k ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                        transition: 'all 0.2s', fontFamily: 'inherit',
                      }}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Feedback Messages ── */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, padding: '12px 14px', marginBottom: 16, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}
              >
                <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: '#fca5a5', fontWeight: 500 }}>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div key="succ"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, padding: '12px 14px', marginBottom: 16, background: theme.glow, border: `1px solid ${theme.activeBorder}` }}
              >
                <CheckCircle2 size={15} style={{ color: theme.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: theme.accentText, fontWeight: 500 }}>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════ FORMS ══════════ */}
          <AnimatePresence mode="wait">
            {showLoginForm ? (
              <motion.form key={`login-${activeTab}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onSubmit={handleLogin}
              >
                <DarkInput label="Username" icon={User} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                  value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username" required />
                <DarkInput label="Password" icon={Lock} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                  type={showPass ? 'text' : 'password'}
                  value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password" required
                  rightEl={<EyeBtn show={showPass} toggle={() => setShowPass(p => !p)} />} />

                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.012, boxShadow: theme.btnShadow } : {}}
                  whileTap={!loading ? { scale: 0.988 } : {}}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 13,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? 'rgba(255,255,255,0.08)' : theme.btnGrad,
                    color: loading ? 'rgba(148,163,184,0.5)' : '#fff',
                    fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: loading ? 'none' : theme.btnShadow,
                    transition: 'background 0.3s, color 0.3s',
                    marginTop: 8, fontFamily: 'inherit',
                  }}
                >
                  {loading ? <><Loader2 size={16} style={{ animation: 'ulogin-spin 1s linear infinite' }} /> Authenticating…</>
                    : <>Access Portal <ArrowRight size={16} /></>}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="register"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onSubmit={handleRegister}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <DarkInput label="Full Name *" icon={User} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                    value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} placeholder="John Doe" required />
                  <DarkInput label="Username *" icon={User} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                    value={regData.username} onChange={e => setRegData({ ...regData, username: e.target.value })} placeholder="johndoe12" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <DarkInput label="Email *" icon={Mail} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                    type="email" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} placeholder="john@email.com" required />
                  <DarkInput label="Password *" icon={Lock} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                    type={showRegPass ? 'text' : 'password'} value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })} placeholder="••••••••" required
                    rightEl={<EyeBtn show={showRegPass} toggle={() => setShowRegPass(p => !p)} />} />
                </div>
                <DarkInput label="Mobile" icon={Phone} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                  value={regData.mobile} onChange={e => setRegData({ ...regData, mobile: e.target.value })} placeholder="10-digit mobile" />
                <DarkInput label="Address" icon={MapPin} accent={theme.accent} ring={theme.ring} inputFocusBg={theme.inputFocusBg}
                  value={regData.address} onChange={e => setRegData({ ...regData, address: e.target.value })} placeholder="Your address…" textarea rows={2} />

                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.012, boxShadow: theme.btnShadow } : {}}
                  whileTap={!loading ? { scale: 0.988 } : {}}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 13,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? 'rgba(255,255,255,0.08)' : theme.btnGrad,
                    color: loading ? 'rgba(148,163,184,0.5)' : '#fff',
                    fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: loading ? 'none' : theme.btnShadow,
                    transition: 'background 0.3s',
                    marginTop: 4, fontFamily: 'inherit',
                  }}
                >
                  {loading ? <><Loader2 size={16} style={{ animation: 'ulogin-spin 1s linear infinite' }} /> Creating…</>
                    : <>Create Account <ArrowRight size={16} /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Footer ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22 }}>
            <Shield size={11} style={{ color: 'rgba(148,163,184,0.3)' }} />
            <span style={{ fontSize: 10.5, color: 'rgba(148,163,184,0.3)', fontWeight: 500, letterSpacing: '0.03em' }}>
              256-bit SSL encrypted · Slog Solutions v1.0
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom ambient text ── */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{ position: 'fixed', bottom: 18, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.12)', fontWeight: 500, zIndex: 10, letterSpacing: '0.04em' }}
      >
        © 2026 Slog Solutions Pvt. Ltd. · All rights reserved
      </motion.p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes ulogin-spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.35); font-weight: 400; }
        input:focus, textarea:focus { outline: none; }
        input { color-scheme: dark; }
        textarea { color-scheme: dark; }
      `}</style>
    </div>
  );
};

export default UserLogin;
