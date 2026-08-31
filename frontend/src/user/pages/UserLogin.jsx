import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Briefcase, Lock, User, Mail, Phone, MapPin, AlertCircle, ArrowRight, Loader } from 'lucide-react';

const UserLogin = () => {
  const { login, api } = useAuth();
  const navigate = useNavigate();

  // Active tab: 'student' or 'teacher'
  const [activeTab, setActiveTab] = useState('student');
  // Sub-state for student: 'login' or 'register'
  const [studentMode, setStudentMode] = useState('login');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      
      // Verification of role matching activeTab
      if (activeTab === 'student' && data.user.role !== 'Student') {
        throw new Error('This account does not belong to a Candidate.');
      }
      if (activeTab === 'teacher' && data.user.role !== 'Teacher') {
        throw new Error('This account does not belong to an Expert.');
      }

      setSuccess('Logged in successfully!');
      
      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === 'Student') {
          navigate('/user/student/dashboard');
        } else if (data.user.role === 'Teacher') {
          navigate('/user/teacher/dashboard');
        }
      }, 800);
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
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register-student', registerData);
      setSuccess('Registration successful! Please log in below.');
      
      // Shift to login mode and pre-fill credentials
      setLoginData({ username: registerData.username, password: '' });
      setStudentMode('login');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Username might be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="min-height-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--bg-cream)] to-emerald-500/5 transition-all duration-300" style={{ fontFamily: 'var(--font-outfit)', minHeight: '100vh' }}>
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle decorative background blur glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand/Header */}
        <div className="text-center space-y-2 relative">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-emerald-500/20">
            SS
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-dark)] tracking-tight">Slog Solutions</h2>
          <p className="text-xs text-[var(--text-muted)]">Batch Learning & Resource Distribution Portal</p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-[var(--bg-cream)] p-1 rounded-2xl border border-[var(--border-color)]/60 relative">
          <button
            onClick={() => {
              setActiveTab('student');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'student'
                ? 'bg-[var(--bg-card)] text-emerald-500 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-dark)]'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Candidate Login
          </button>
          <button
            onClick={() => {
              setActiveTab('teacher');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'teacher'
                ? 'bg-[var(--bg-card)] text-emerald-500 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-dark)]'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Expert Login
          </button>
        </div>

        {/* Inner switch for Student Login/Register */}
        {activeTab === 'student' && (
          <div className="flex justify-center gap-4 text-xs">
            <button
              onClick={() => { setStudentMode('login'); setError(''); }}
              className={`pb-1 font-bold ${studentMode === 'login' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-[var(--text-muted)]'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setStudentMode('register'); setError(''); }}
              className={`pb-1 font-bold ${studentMode === 'register' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-[var(--text-muted)]'}`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-500">
            <ArrowRight className="h-4 w-4 shrink-0 animate-pulse" />
            <span>{success}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {(activeTab === 'teacher' || (activeTab === 'student' && studentMode === 'login')) ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                />
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STUDENT REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                  <User className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Username *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="johndoe12"
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                  <User className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={registerData.mobile}
                  onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                />
                <Phone className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Address</label>
              <div className="relative">
                <textarea
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  placeholder="Enter your address..."
                  rows="2"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-cream)] py-2 pl-10 pr-4 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none resize-none"
                />
                <MapPin className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register Candidate Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
