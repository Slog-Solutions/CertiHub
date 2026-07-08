import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Settings,
  Users,
  UserPlus,
  Link,
  CreditCard,
  Percent,
  MessageSquare,
  Award,
  BarChart3,
  Database,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenu = [
    { name: 'Dashboard',       path: '/',            icon: LayoutDashboard },
    { name: 'Masters',         path: '/masters',     icon: Settings },
    { name: 'Users',           path: '/users',       icon: Users },
    { name: 'Registration',    path: '/registration',icon: UserPlus },
    { name: 'Course Links',    path: '/course-links',icon: Link },
    { name: "Student's Fee",   path: '/fees',        icon: CreditCard },
    { name: 'Fee Discount',    path: '/discounts',   icon: Percent },
    { name: 'Enquiry CRM',     path: '/enquiries',   icon: MessageSquare },
    { name: 'Certificates',    path: '/certificates',icon: Award },
    { name: 'Reports',         path: '/reports',     icon: BarChart3 },
    { name: 'Daily Backup',    path: '/backup',      icon: Database },
  ];

  const staffMenu = [
    { name: 'Dashboard',       path: '/',            icon: LayoutDashboard },
    { name: 'Registration',    path: '/registration',icon: UserPlus },
    { name: 'Course Links',    path: '/course-links',icon: Link },
    { name: "Student's Fee",   path: '/fees',        icon: CreditCard },
    { name: 'Fee Discount',    path: '/discounts',   icon: Percent },
    { name: 'Enquiry CRM',     path: '/enquiries',   icon: MessageSquare },
    { name: 'Certificates',    path: '/certificates',icon: Award },
    { name: 'Reports',         path: '/reports',     icon: BarChart3 },
  ];

  const menuItems = user?.role === 'Admin' ? adminMenu : staffMenu;

  return (
    <aside className="sidebar-certyhub">
      {/* Brand */}
      <div className="sidebar-brand">
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
        }}>
          SS
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-dark)', lineHeight: 1.2 }}>
            Slog Solutions
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
            Management Portal
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="sidebar-user-card">
        <div className="avatar-circle" style={{ width: 34, height: 34, fontSize: 13 }}>
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
            <ShieldCheck size={10} color="var(--primary)" />
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <item.icon size={16} style={{ flexShrink: 0 }} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '8px 14px 16px', flexShrink: 0 }}>
        <div className="sidebar-divider" style={{ marginLeft: 0, marginRight: 0 }} />
        <button className="sidebar-logout" onClick={handleLogout} style={{ marginTop: 8 }}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
