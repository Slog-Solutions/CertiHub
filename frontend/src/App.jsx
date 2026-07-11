import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WebNavbar from './components/WebNavbar';
import WebFooter from './components/WebFooter';

// Public Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Courses from './pages/Courses';

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
  const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth > 1024);

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

// Wrapper to force remount of verification page on URL param changes
const VerifyCertificateWrapper = () => {
  const { id } = useParams();
  return <VerifyCertificate key={id || 'search'} />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
          <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
          <Route path="/verify" element={<PublicLayout><VerifyCertificateWrapper /></PublicLayout>} />
          <Route path="/verify/:id" element={<PublicLayout><VerifyCertificateWrapper /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><PublicRegistration /></PublicLayout>} />

          {/* Secure Portal Dashboard layout (Contains subroutes) */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
