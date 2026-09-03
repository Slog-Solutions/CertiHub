import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, GraduationCap, Briefcase, Lock, User, Mail, Phone, MapPin,
  AlertCircle, ArrowRight, Loader, Eye, EyeOff, Globe, BookOpen, CheckCircle, FileText
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   DESIGN SYSTEM — User Login Split-Screen Layout
───────────────────────────────────────────────────────── */
const FONT = "'Noto Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const C = {
  primary: '#6366F1',         // Slog Solutions Primary Indigo
  primaryDark: '#4F46E5',
  primarySoft: '#EEF2FF',
  ink: '#0F172A',              // Dark Slate Headlines
  body: '#1E293B',             // Dark Slate Body Text
  muted: '#334155',            // High Contrast Subtitles & Labels
  border: '#E2E8F0',           // Input Borders
  bg: '#FFFFFF',               // Form Card Background
  pageBg: '#F8FAFC',           // Outer Container Page Background
  cardBg: '#EEF2FF',           // Right Card Soft Indigo Background
  darkBtn: '#000000',          // Primary CTA Capsule Button Background
  greenAccent: '#22C55E',      // Green CTA Link Accent
  redSoft: '#FEF2F2',
  redText: '#B91C1C',
  greenSoft: '#F0FDF4',
  greenText: '#15803D'
};

const RADIUS = { sm: 10, md: 16, lg: 28, pill: 999 };

const UserLogin = () => {
  const { login, api } = useAuth();
  const navigate = useNavigate();

  // Active tab: 'student' (Candidate) or 'teacher' (Expert)
  const [activeTab, setActiveTab] = useState('student');
  // Student mode: 'login' or 'register'
  const [studentMode, setStudentMode] = useState('login');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    mobile: '',
    address: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await login(loginData.username, loginData.password);

      if (activeTab === 'student' && data.user.role !== 'Student') {
        throw new Error('This account does not belong to a Candidate.');
      }
      if (activeTab === 'teacher' && data.user.role !== 'Teacher') {
        throw new Error('This account does not belong to an Expert Instructor.');
      }

      setSuccess('Logged in successfully! Redirecting...');

      setTimeout(() => {
        if (data.user.role === 'Student') {
          navigate('/user/student/dashboard');
        } else if (data.user.role === 'Teacher') {
          navigate('/user/teacher/dashboard');
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!registerData.username || !registerData.password || !registerData.name || !registerData.email) {
      setError('Please fill in all required fields: Full Name, Username, Email, and Password.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register-student', registerData);
      setSuccess('Registration successful! Please sign in with your username.');
      setLoginData({ username: registerData.username, password: '' });
      setStudentMode('login');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Username might be taken.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: FONT
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #94A3B8; font-family: ${FONT}; }
        .login-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          width: 100%;
          max-width: 1040px;
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }
        .pill-input {
          width: 100%;
          padding: 13px 22px;
          border-radius: 999px;
          border: 1px solid ${C.border};
          background: #FFFFFF;
          color: ${C.ink};
          font-size: 13.5px;
          outline: none;
          transition: all 0.15s ease;
        }
        .pill-input:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
        }
        @media (max-width: 900px) {
          .login-grid { grid-template-columns: 1fr; }
          .login-showcase-col { display: none !important; }
        }
      `}</style>

      {/* Main Split-Screen Outer Container */}
      <div className="login-grid">

        {/* ── LEFT COLUMN: AUTH FORM ── */}
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Top Brand Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <img src="/logo.png" alt="Slog Solutions" style={{ height: 36, maxWidth: '100%', objectFit: 'contain', display: 'block', marginBottom: 4 }} />
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PORTAL AUTHENTICATION</div>
            </div>

            <button onClick={() => window.open('/', '_blank')} title="Go to Home" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
              <Globe size={14} /> Website
            </button>
          </div>

          {/* Role Pill Switcher (Candidate Portal vs Expert Portal) */}
          <div style={{
            background: '#F1F5F9', borderRadius: RADIUS.pill, padding: 4, display: 'flex', gap: 4, marginBottom: 20
          }}>
            <button
              onClick={() => { setActiveTab('student'); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '9px 16px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
                background: activeTab === 'student' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'student' ? C.ink : C.muted,
                fontWeight: activeTab === 'student' ? 800 : 600, fontSize: 12.5,
                boxShadow: activeTab === 'student' ? '0 2px 8px rgba(15,23,42,0.06)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap size={15} color={activeTab === 'student' ? C.primary : C.muted} /> Candidate Portal
            </button>

            <button
              onClick={() => { setActiveTab('teacher'); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '9px 16px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
                background: activeTab === 'teacher' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'teacher' ? C.ink : C.muted,
                fontWeight: activeTab === 'teacher' ? 800 : 600, fontSize: 12.5,
                boxShadow: activeTab === 'teacher' ? '0 2px 8px rgba(15,23,42,0.06)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s ease'
              }}
            >
              <Briefcase size={15} color={activeTab === 'teacher' ? C.primary : C.muted} /> Expert Portal
            </button>
          </div>

          {/* Main Title & Subtitle */}
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: C.ink, marginBottom: 6, letterSpacing: '-0.8px' }}>
              {activeTab === 'student' ? (studentMode === 'login' ? 'Welcome back!' : 'Create Candidate Account') : 'Expert Portal Login'}
            </h1>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: 0 }}>
              {activeTab === 'student'
                ? (studentMode === 'login'
                  ? 'Simplify your learning & candidate certification workflow with Slog Solutions.'
                  : 'Register your candidate account to access course batches and study materials.')
                : 'Log in with your instructor account to manage assigned batches and curriculum.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
              borderRadius: RADIUS.sm, background: C.redSoft, color: C.redText, fontSize: 12.5, marginBottom: 14
            }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
              borderRadius: RADIUS.sm, background: C.greenSoft, color: C.greenText, fontSize: 12.5, marginBottom: 14
            }}>
              <ArrowRight size={15} /> {success}
            </div>
          )}

          {/* LOGIN FORM MODE */}
          {(activeTab === 'teacher' || (activeTab === 'student' && studentMode === 'login')) ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="pill-input"
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact your batch administrator to reset your credentials.'); }}
                    style={{ fontSize: 12, fontWeight: 700, color: C.ink, textDecoration: 'none' }}>
                    Forgot Password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="pill-input"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: C.muted
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Primary Dark Capsule Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: RADIUS.pill,
                  background: C.darkBtn, color: '#ffffff', fontSize: 13.5, fontWeight: 700,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'all 0.15s ease', marginTop: 6,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Loader size={16} className="animate-spin" /> Authenticating...
                  </span>
                ) : (
                  'Login to Portal'
                )}
              </button>

              {/* Candidate Registration Toggle */}
              {activeTab === 'student' && (
                <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: C.muted }}>
                  Not a member?{' '}
                  <button
                    type="button"
                    onClick={() => { setStudentMode('register'); setError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.greenAccent, fontWeight: 700 }}
                  >
                    Register now
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* CANDIDATE REGISTER FORM MODE */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="pill-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="pill-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="pill-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="pill-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Mobile Number (Optional)</label>
                <input
                  type="text"
                  placeholder="10-digit mobile number"
                  value={registerData.mobile}
                  onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
                  className="pill-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Address (Optional)</label>
                <textarea
                  placeholder="Enter address details..."
                  rows={2}
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 18px', borderRadius: 18,
                    border: `1px solid ${C.border}`, fontSize: 12.5, color: C.ink, outline: 'none', resize: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: RADIUS.pill,
                  background: C.darkBtn, color: '#ffffff', fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                {loading ? 'Creating Candidate Account...' : 'Register Candidate Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12.5, color: C.muted }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setStudentMode('login'); setError(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontWeight: 700 }}
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 20, fontSize: 11, color: C.muted, textAlign: 'center' }}>
            Slog Solutions · Enterprise Authentication
          </div>

        </div>

        {/* ── RIGHT COLUMN: PRODUCT SHOWCASE CARD ── */}
        <div className="login-showcase-col" style={{
          background: C.cardBg, margin: 16, borderRadius: 24, padding: '36px 32px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden'
        }}>
          
          {/* Top Floating Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              background: '#ffffff', borderRadius: RADIUS.pill, padding: '6px 14px',
              fontSize: 11.5, fontWeight: 700, color: C.primaryDark, boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
              Slog Solutions Portal
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <img src="/logo.png" alt="Slog Solutions" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Center Graphic & Floating Portal Feature Cards */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
            
            {/* SVG Background Illustration */}
            <div style={{ position: 'relative', width: 220, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
                <path d="M40,130 C20,80 60,20 110,30 C160,40 190,90 170,140 C150,180 60,170 40,130 Z" fill="#EEF2FF" />
                <circle cx="110" cy="90" r="48" fill="#6366F1" opacity="0.12" />
              </svg>

              {/* Main Icon */}
              <div style={{
                position: 'absolute', top: 35, width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
              }}>
                <GraduationCap size={40} strokeWidth={2} />
              </div>
            </div>

            {/* Floating Portal Feature Micro-Card */}
            <div style={{
              background: '#FFFFFF', borderRadius: 20, padding: '16px 20px',
              boxShadow: '0 12px 32px rgba(15,23,42,0.08)', border: '1px solid rgba(15,23,42,0.05)',
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', maxWidth: 280, marginTop: -15, zIndex: 10
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: C.greenSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.greenText, flexShrink: 0
              }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Syllabus &amp; Tasks</div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Batch Curriculum Sync</div>
                <div style={{ fontSize: 10.5, color: C.primaryDark, fontWeight: 700, marginTop: 2 }}>✓ Direct Expert Doubts</div>
              </div>
            </div>

          </div>

          {/* Bottom Carousel Pagination Dots & Slogan */}
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: '#CBD5E1' }} />
              <span style={{ width: 22, height: 8, borderRadius: 999, background: C.ink }} />
              <span style={{ width: 8, height: 8, borderRadius: 999, background: '#CBD5E1' }} />
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 800, color: C.ink, lineHeight: 1.35, letterSpacing: '-0.4px', margin: 0 }}>
              Make your work easier and organized with Slog Solutions
            </h3>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserLogin;