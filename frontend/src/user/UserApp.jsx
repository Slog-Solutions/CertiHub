"use client";

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { API_BASE_URL } from '@/admin/config';
import '@/admin/index.css';

// Import Pages
import UserLogin from './pages/UserLogin';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import BulkRegisterDashboard from './pages/BulkRegisterDashboard';

// Configure Axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Route wrapper to check authentication
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading session...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/user/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If they have a different role, send them to their corresponding dashboard
    if (user.role === 'Student') {
      return <Navigate to="/user/student/dashboard" replace />;
    } else if (user.role === 'Teacher') {
      return <Navigate to="/user/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/user/login" replace />;
    }
  }

  return children;
};

// Top-level redirection helper
const InitialRedirect = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checking access...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/user/login" replace />;
  }

  if (user.role === 'Student') {
    return <Navigate to="/user/student/dashboard" replace />;
  } else if (user.role === 'Teacher') {
    return <Navigate to="/user/teacher/dashboard" replace />;
  } else {
    // Admins and Staff are sent to default admin panel
    window.location.href = '/dashboard';
    return null;
  }
};

export default function UserApp() {
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/user/login" element={<UserLogin />} />
            
            <Route
              path="/user/student/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/teacher/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['Teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/teacher/bulk-register"
              element={
                <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'Staff']}>
                  <BulkRegisterDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/user/*" element={<InitialRedirect />} />
            <Route path="*" element={<Navigate to="/user/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
