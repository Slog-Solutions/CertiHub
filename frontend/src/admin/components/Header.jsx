import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Clock, User, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_LABELS = {
  '/':             { title: 'Dashboard', subtitle: 'Overview of platform activity' },
  '/masters':      { title: 'Masters Configuration', subtitle: 'Manage lookup data and dropdown options' },
  '/users':        { title: 'User Management', subtitle: 'Add and manage system users' },
  '/registration': { title: 'Candidate Registration', subtitle: 'Register new and existing candidates' },
  '/course-links': { title: 'Course Link Generator', subtitle: 'Generate unique enrollment links' },
  '/fees':         { title: "Candidate's Fee", subtitle: 'Track and manage fee installments' },
  '/discounts':    { title: 'Fee Discounts', subtitle: 'Apply tuition discount adjustments' },
  '/enquiries':    { title: 'Enquiry CRM', subtitle: 'Manage incoming lead enquiries' },
  '/certificates': { title: 'Certificates', subtitle: 'Upload and manage automated certificates' },
  '/reports':      { title: 'Reports', subtitle: 'View system aggregation and audit logs' },
  '/backup':       { title: 'Daily Backup', subtitle: 'Database backup and restore management' },
};

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const page = PAGE_LABELS[location.pathname] ?? { title: 'Slog Solutions', subtitle: '' };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="navbar-certyhub">
      {/* Left: Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {!sidebarOpen && (
          <button
            className="nav-icon-btn"
            onClick={onMenuClick}
            title="Open Sidebar"
            style={{ marginRight: 4 }}
          >
            <Menu size={18} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {page.title}
          </h2>
          {page.subtitle && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 400 }}>
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}
          className="hidden sm:flex">
          <Clock size={13} color="var(--primary)" />
          <span>{dateStr}</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} className="hidden sm:block" />

        {/* Theme toggle */}
        <button
          className="nav-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* User Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '5px 12px 5px 5px',
          border: '1px solid var(--border-color)',
          borderRadius: 40,
          background: 'var(--bg-card)',
          cursor: 'default',
        }}>
          <div className="avatar-circle" style={{ width: 30, height: 30, fontSize: 12 }}>
            {user?.name?.charAt(0)?.toUpperCase() ?? <User size={14} />}
          </div>
          <div className="hidden sm:block" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', lineHeight: 1.2, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
