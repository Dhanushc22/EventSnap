import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import PhotoUpload from './pages/PhotoUpload';
import Gallery from './pages/Gallery';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Photo Upload and Gallery - Will trigger participant mode */}
        <Route path="/upload/:eventId" element={<PhotoUpload />} />
        <Route path="/gallery/:eventId" element={<Gallery />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;