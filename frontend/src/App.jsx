import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
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
import VerifyCertificate from './pages/VerifyCertificate';
import PublicRegistration from './pages/PublicRegistration';

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
  return user && user.role === 'Admin' ? children : <Navigate to="/" replace />;
};

// Standard Admin/Staff panel dashboard layout
const DashboardLayout = () => {
  return (
    <div className="app-shell" style={{ fontFamily: 'var(--font-outfit)', overflowX: 'hidden' }}>
      <Sidebar />
      <div className="page-wrapper">
        <Header />
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
            <Route path="/reports" element={<Reports />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Views */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:id" element={<VerifyCertificate />} />
          <Route path="/register" element={<PublicRegistration />} />

          {/* Secure Portal Dashboard layout (Contains subroutes) */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
