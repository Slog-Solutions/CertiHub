"use client";

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { API_BASE_URL } from './config';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters';
import Users from './pages/Users';
import Registration from './pages/Registration';
import CourseLinks from './pages/CourseLinks';
import Fees from './pages/Fees';
import Discounts from './pages/Discounts';
import Enquiries from './pages/Enquiries';
import Certificates from './pages/Certificates';
import Reports from './pages/Reports';
import Backup from './pages/Backup';
import Notifications from './pages/Notifications';
import PublicRegistration from './pages/PublicRegistration';

// Import Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WebNavbar from './components/WebNavbar';
import WebFooter from './components/WebFooter';

// Public Layout Wrapper
const PublicLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'var(--font-outfit)', background: 'var(--bg-cream)' }}>
      <WebNavbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <WebFooter />
    </div>
  );
};
import './index.css';

// Configure Axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Auth Guard: Directs unauthenticated traffic to /login
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading session...</span>
      </div>
    );
  }
  return token ? children : <Navigate to="/login" replace />;
};

// Role Guard: Restricts admin routes from Staff roles
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checking access...</span>
      </div>
    );
  }
  return user && user.role === 'Admin' ? children : <Navigate to="/dashboard" replace />;
};

// Standard Admin/Staff panel dashboard layout
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(typeof window !== 'undefined' ? window.innerWidth > 1024 : false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-shell" style={{ fontFamily: 'var(--font-outfit)', overflowX: 'hidden' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-wrapper">
        <Header onMenuClick={() => setSidebarOpen(true)} sidebarOpen={sidebarOpen} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg-cream)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Admin only views */}
            <Route path="/masters" element={<AdminRoute><Masters /></AdminRoute>} />
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/backup" element={<AdminRoute><Backup /></AdminRoute>} />
            
            {/* Common dashboard views */}
            <Route path="/registration" element={<Registration />} />
            <Route path="/course-links" element={<CourseLinks />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports/fee-collection" element={<Reports type="fee-collection" />} />
            <Route path="/reports/date-wise-fee" element={<Reports type="date-wise" />} />
            <Route path="/reports/course" element={<Reports type="courses" />} />
            <Route path="/reports/course-students" element={<Reports type="course-students" />} />
            <Route path="/reports" element={<Navigate to="/reports/fee-collection" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function AdminApp() {
  // Synchronize Axios defaults when client mounts
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PublicLayout><PublicRegistration /></PublicLayout>} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
