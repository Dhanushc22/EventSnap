import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, FileText, User, Sparkles, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../services/api';

const CreateEventPublic = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    hostEmail: '',
    description: '',
    password: '',
    date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eventId, setEventId] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 Form submission started');
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.eventName || !formData.hostEmail || !formData.description || !formData.password || !formData.date) {
        console.warn('❌ Validation failed: Missing fields', { formData });
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        console.warn('❌ Password validation failed: Too short');
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      console.log('✅ Validation passed');
      console.log('📝 API base URL:', API.defaults.baseURL);
      
      const requestPayload = {
        title: formData.eventName,
        hostEmail: formData.hostEmail,
        description: formData.description,
        password: formData.password,
        date: formData.date
      };
      
      console.log('🔍 Full request URL:', API.defaults.baseURL + '/dual-auth/host/create-event');
      console.log('📦 Request payload:', requestPayload);

      console.log('📤 Sending POST request...');
      const response = await API.post('/dual-auth/host/create-event', requestPayload);
      console.log('✅ Success! API Response:', response.data);

      if (response.data.success) {
        console.log('🎉 Event created successfully');
        setSuccess('✅ Event created successfully! Check your email for Event ID and login details.');
        
        // Clear form
        setFormData({
          eventName: '',
          hostEmail: '',
          description: '',
          password: '',
          date: ''
        });

        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      console.error('❌ ERROR - Create event failed');
      console.error('❌ Error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Request URL:', error.config?.url);
      console.error('❌ Request method:', error.config?.method);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
      setError(errorMessage);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-2xl w-full mx-auto space-y-8 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-white/70 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="inline-block mb-6"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl shadow-purple-500/50">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-black gradient-text mb-4">
            Create New Event
          </h2>
          <p className="text-xl text-white/80 max-w-xl mx-auto">
            Fill in the details below. The host will receive login credentials via email.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card bg-red-500/20 border-red-500/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card bg-green-500/20 border-green-500/30 space-y-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-300">{success}</p>
                {eventId && (
                  <div className="space-y-3 mt-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                      <p className="text-xs text-white/60 font-medium mb-2">Event ID</p>
                      <p className="text-xl font-mono font-bold text-white break-all">{eventId}</p>
                      <p className="text-xs text-white/50 mt-2">Share this with your event host</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                      <p className="text-xs text-white/60 font-medium mb-2">Password</p>
                      <p className="text-xl font-mono font-bold text-white">{formData.password}</p>
                      <p className="text-xs text-white/50 mt-2">Share this securely with your event host</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-green-400 mt-4">Redirecting to login in 5 seconds...</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="eventName" className="block text-sm font-semibold text-white mb-3">
                Event Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                <input
                  id="eventName"
                  name="eventName"
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="e.g., Summer Wedding 2025"
                />
              </div>
            </div>

            <div>
              <label htmlFor="hostEmail" className="block text-sm font-semibold text-white mb-3">
                Event Host Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                <input
                  id="hostEmail"
                  name="hostEmail"
                  type="email"
                  required
                  value={formData.hostEmail}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="host@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-3">
                Event Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 h-5 w-5 text-white/60 pointer-events-none" />
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm resize-none transition-all"
                  placeholder="Describe your event and what makes it special..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                Event Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">This will be the login password for the event host</p>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-white mb-3">
                Event Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Event...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Event
                </span>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateEventPublic;