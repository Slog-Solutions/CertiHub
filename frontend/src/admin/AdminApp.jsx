"use client";

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { API_BASE_URL } from './config';

// Import Views
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Masters from './views/Masters';
import Users from './views/Users';
import Batches from './views/Batches';
import Registration from './views/Registration';
import CourseLinks from './views/CourseLinks';
import Fees from './views/Fees';
import Discounts from './views/Discounts';
import Enquiries from './views/Enquiries';
import Certificates from './views/Certificates';
import Reports from './views/Reports';
import Backup from './views/Backup';
import Notifications from './views/Notifications';
import MarketingNotifications from './views/MarketingNotifications';
import PublicRegistration from './views/PublicRegistration';
import PublicBootcampRegistration from './views/PublicBootcampRegistration';
import Projects from './views/Projects';
import ManageCourses from './views/ManageCourses';
import DeleteRequests from './views/DeleteRequests';
import AppVersions from './views/AppVersions';

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

// Auth Guard: Directs unauthenticated traffic to /login and restricts to Admin/Staff
const ProtectedRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading session...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access to Admin, Staff, and Director roles only
  if (!['Admin', 'Staff', 'Director'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
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
            <Route path="/batches" element={<AdminRoute><Batches /></AdminRoute>} />
            <Route path="/delete-requests" element={<AdminRoute><DeleteRequests /></AdminRoute>} />
            
            {/* Common dashboard views */}
            <Route path="/registration" element={<Registration />} />
            <Route path="/course-links" element={<CourseLinks />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/app-versions" element={<AdminRoute><AppVersions /></AdminRoute>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/marketing" element={<MarketingNotifications />} />
            <Route path="/courses" element={<ManageCourses />} />
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
            <Route path="/bootcamp-register" element={<PublicLayout><PublicBootcampRegistration /></PublicLayout>} />
            <Route path="/register/bootcamp" element={<PublicLayout><PublicBootcampRegistration /></PublicLayout>} />
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
