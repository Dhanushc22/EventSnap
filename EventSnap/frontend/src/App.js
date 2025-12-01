import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HostDashboard from './pages/HostDashboard';
import CreateEventPublic from './pages/CreateEventPublic';
import EventDetails from './pages/EventDetails';
import PhotoUpload from './pages/PhotoUpload';
import Gallery from './pages/Gallery';

// Protected Route Component
const ProtectedRoute = ({ children, requiredType = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user type if specified
  if (requiredType && user?.type !== requiredType) {
    // Redirect to appropriate dashboard based on user type
    if (user?.type === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user?.type === 'host') {
      return <Navigate to="/host-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect to appropriate dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on user type
    if (user?.type === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user?.type === 'host') {
      return <Navigate to="/host-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  // Set participant mode when accessing upload/gallery pages
  useEffect(() => {
    if (location.pathname.startsWith('/upload/') || location.pathname.startsWith('/gallery/')) {
      const eventId = location.pathname.split('/')[2];
      sessionStorage.setItem('participantMode', 'true');
      sessionStorage.setItem('participantEventId', eventId);
    }
  }, [location.pathname]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user is in participant mode
  const isParticipantMode = sessionStorage.getItem('participantMode') === 'true';
  const participantEventId = sessionStorage.getItem('participantEventId');

  // If in participant mode, restrict access to only their event
  if (isParticipantMode) {
    const currentPath = location.pathname;
    const isAllowedPath = (
      currentPath === `/upload/${participantEventId}` || 
      currentPath === `/gallery/${participantEventId}`
    );

    if (!isAllowedPath) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              You can only access the specific event you scanned the QR code for.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = `/upload/${participantEventId}`}
                className="w-full btn btn-primary"
              >
                Return to Event Upload
              </button>
              <button
                onClick={() => window.location.href = `/gallery/${participantEventId}`}
                className="w-full btn btn-secondary"
              >
                View Event Gallery
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/upload/:eventId" element={<PhotoUpload />} />
          <Route path="/gallery/:eventId" element={<Gallery />} />
          <Route path="*" element={<Navigate to={`/upload/${participantEventId}`} replace />} />
        </Routes>
      </div>
    );
  }

  // Normal mode with navigation for organizers
  return (
    <div className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <Home />
              </motion.div>
            } 
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <Login />
                </motion.div>
              </PublicRoute>
            }
          />
          <Route 
            path="/create-event" 
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <CreateEventPublic />
              </motion.div>
            } 
          />

          {/* Photo Upload and Gallery - Will trigger participant mode */}
          <Route 
            path="/upload/:eventId" 
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <PhotoUpload />
              </motion.div>
            } 
          />
          <Route 
            path="/gallery/:eventId" 
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <Gallery />
              </motion.div>
            } 
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredType="admin">
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <AdminDashboard />
                </motion.div>
              </ProtectedRoute>
            }
          />

          {/* Host Protected Routes */}
          <Route
            path="/host-dashboard"
            element={
              <ProtectedRoute requiredType="host">
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <HostDashboard />
                </motion.div>
              </ProtectedRoute>
            }
          />

          {/* Organizer Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <AdminDashboard />
                </motion.div>
              </ProtectedRoute>
            }
          />

          {/* Event Details - Admin and Organizer only (not hosts) */}
          <Route
            path="/event/:id"
            element={
              <ProtectedRoute>
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <EventDetails />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/event/:id/details"
            element={
              <ProtectedRoute requiredType="admin">
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <EventDetails />
                </motion.div>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;