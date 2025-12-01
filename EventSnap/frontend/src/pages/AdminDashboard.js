import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, Camera, Users, QrCode, Eye, Download, Sparkles, TrendingUp, Activity, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch admin events (all events including host-created)
  const {
    data: adminEventsData,
    isLoading: isLoadingAdmin,
    error: adminError
  } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => eventsAPI.getAdminEvents()
  });

  // Fetch organizer events (events created by current user)
  const {
    data: organizerEventsData,
    isLoading: isLoadingOrganizer,
    error: organizerError
  } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => eventsAPI.getOrganizerEvents()
  });

  const isLoading = isLoadingAdmin || isLoadingOrganizer;
  const error = adminError || organizerError;

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId) => eventsAPI.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
      queryClient.invalidateQueries(['organizer-events']);
      toast.success('Event deleted successfully!');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
      setDeleteConfirm(null);
    }
  });

  const handleDeleteClick = (event) => {
    setDeleteConfirm(event);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm._id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-600">Error loading events: {error?.message}</div>;

  // Extract events from both APIs with safe fallbacks
  const adminEvents = Array.isArray(adminEventsData?.data?.data?.events) 
    ? adminEventsData.data.data.events 
    : Array.isArray(adminEventsData?.data?.data) 
    ? adminEventsData.data.data 
    : [];

  const organizerEvents = Array.isArray(organizerEventsData?.data?.data?.events) 
    ? organizerEventsData.data.data.events 
    : Array.isArray(organizerEventsData?.data?.data) 
    ? organizerEventsData.data.data 
    : [];
  
  // Combine events from both sources and remove duplicates
  const eventsMap = new Map();
  
  // Add admin events first (host-created events)
  adminEvents.forEach(event => {
    if (event && event._id) {
      eventsMap.set(event._id, { ...event, source: 'admin' });
    }
  });
  
  // Add organizer events (organizer-created events)
  organizerEvents.forEach(event => {
    if (event && event._id) {
      eventsMap.set(event._id, { ...event, source: 'organizer' });
    }
  });
  
  // Convert map back to array and sort by creation date (newest first)
  const events = Array.from(eventsMap.values()).sort((a, b) => 
    new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  console.log('Combined events data:', { 
    adminEvents: adminEvents.length, 
    organizerEvents: organizerEvents.length, 
    totalEvents: events.length,
    events 
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-purple-400" />
            </motion.div>
            <h1 className="text-5xl font-black gradient-text">Welcome back, {user?.name}!</h1>
          </div>
          <p className="text-white/70 text-xl">Manage your events and photo collections</p>
        </motion.div>

        {/* Quick Stats */}
        {Array.isArray(events) && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/60 mb-2">Total Events</p>
                  <p className="text-4xl font-black text-white mb-1">{events.length}</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Active</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg shadow-blue-500/50">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ delay: 0.1 }}
              className="glass-card group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/60 mb-2">Total Photos</p>
                  <p className="text-4xl font-black text-white mb-1">
                    {events.reduce((sum, event) => sum + (event?.stats?.totalPhotos || 0), 0)}
                  </p>
                  <div className="flex items-center text-purple-400 text-sm">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>Collected</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg shadow-purple-500/50">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ delay: 0.2 }}
              className="glass-card group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/60 mb-2">Active Events</p>
                  <p className="text-4xl font-black text-white mb-1">
                    {events.filter(event => event?.isActive).length}
                  </p>
                  <div className="flex items-center text-green-400 text-sm">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>Live Now</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg shadow-green-500/50">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 flex flex-wrap gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/create-event"
              className="inline-flex items-center space-x-2 btn btn-primary group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
              <span>Create New Event</span>
            </Link>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                await eventsAPI.regenerateQRCodes();
                alert('QR codes regenerated successfully! New events will use the current network URL.');
                window.location.reload();
              } catch (error) {
                alert('Failed to regenerate QR codes. Please try again.');
              }
            }}
            className="inline-flex items-center space-x-2 btn btn-secondary"
          >
            <QrCode className="h-5 w-5" />
            <span>Regenerate QR Codes</span>
          </motion.button>
        </motion.div>

      {/* Events Grid */}
        {!Array.isArray(events) || events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="glass-card inline-block p-8 mb-6"
            >
              <Camera className="h-24 w-24 text-purple-400 mx-auto" />
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-3">No events yet</h3>
            <p className="text-white/60 text-lg mb-8">Create your first event to start collecting photos</p>
            <Link to="/create-event" className="btn btn-primary text-lg px-8">
              <Plus className="mr-2" />
              Create Your First Event
            </Link>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {Array.isArray(events) && events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="glass-card group hover:neon-border"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-3 truncate">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    event.source === 'admin' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {event.source === 'admin' ? 'Host Event' : 'Organizer Event'}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    event.isActive 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {event.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
              
              {event.description && (
                <p className="text-white/70 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-white/60">
                  <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-white/80">{format(new Date(event.date), 'PPP')}</span>
                </div>
                
                <div className="flex items-center text-sm text-white/60">
                  <div className="bg-pink-500/20 p-2 rounded-lg mr-3">
                    <Camera className="h-4 w-4 text-pink-400" />
                  </div>
                  <span className="text-white/80">{event.stats?.totalPhotos || 0} photos collected</span>
                </div>
                
                <div className="flex items-center text-sm text-white/60">
                  <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                    <QrCode className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-white/80 font-mono">{event.eventId}</span>
                </div>
              </div>
              
        
              
              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <Link
                  to={`/event/${event._id}`}
                  className="flex-1 btn btn-primary text-center text-sm flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span>View</span>
                </Link>
                
                <a
                  href={`/gallery/${event.eventId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm px-4 flex items-center"
                >
                  Gallery
                </a>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteClick(event)}
                  className="btn bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 text-sm px-4"
                  title="Delete Event"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={handleCancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card max-w-md w-full p-8"
              >
                <div className="flex items-start mb-6">
                  <div className="bg-red-500/20 p-3 rounded-full mr-4">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Delete Event?</h3>
                    <p className="text-white/70 text-sm">
                      Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirm.title}"</span>?
                    </p>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                  <p className="text-red-300 text-sm flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      This action cannot be undone. All photos and data associated with this event will be permanently deleted.
                    </span>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 btn bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    {deleteMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Event
                      </span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;