import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Hash, Sparkles, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'host'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    eventId: '',
    eventPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      
      if (loginType === 'admin') {
        // Admin login
        console.log('Attempting admin login with:', { email: formData.email });
        response = await API.post('/dual-auth/admin/login', {
          email: formData.email,
          password: formData.password
        });
        console.log('Admin login response:', response.data);
      } else {
        // Host login
        console.log('Attempting host login with:', { eventId: formData.eventId });
        response = await API.post('/dual-auth/host/login', {
          eventId: formData.eventId,
          password: formData.eventPassword
        });
        console.log('Host login response:', response.data);
      }

      if (response.data.success) {
        // Store the token in cookies
        Cookies.set('token', response.data.token, { expires: 7 });
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Also set in auth context
        setUser(response.data.user);
        
        // Navigate based on user type
        if (loginType === 'admin') {
          console.log('Admin login successful, navigating to /admin-dashboard');
          navigate('/admin-dashboard');
        } else {
          console.log('Host login successful, navigating to /host-dashboard');
          navigate('/host-dashboard');
        }
      }
    } catch (error) {
      console.error('Login error full details:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        ></motion.div>
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        ></motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl shadow-purple-500/50"
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
            Welcome Back
          </h2>
          
          <p className="text-white/70 text-lg">
            Sign in to continue to EventSnap
          </p>
        </motion.div>

        {/* Login Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('host')}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                loginType === 'host'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Event Host Login
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-white/60"
        >
          {loginType === 'admin' ? (
            'Enter your admin credentials to access the system'
          ) : (
            'Enter your Event ID and password to access your event'
          )}
        </motion.p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card bg-red-500/10 border-red-500/30 p-4"
            >
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="glass-card space-y-6">
            <AnimatePresence mode="wait">
              {loginType === 'admin' ? (
                // Admin Login Form
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-12 input"
                        placeholder="admin@eventsnap.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-12 pr-12 input"
                        placeholder="Enter your password"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Host Login Form
                <motion.div
                  key="host"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="eventId" className="block text-sm font-semibold text-white mb-2">
                      Event ID
                    </label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-4 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                      <input
                        id="eventId"
                        name="eventId"
                        type="text"
                        required
                        value={formData.eventId}
                        onChange={handleChange}
                        className="pl-12 input"
                        placeholder="evt_123456_abc"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="eventPassword" className="block text-sm font-semibold text-white mb-2">
                      Event Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                      <input
                        id="eventPassword"
                        name="eventPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.eventPassword}
                        onChange={handleChange}
                        className="pl-12 pr-12 input"
                        placeholder="Enter your event password"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-3"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {loginType === 'admin' ? 'Admin' : 'Host'}</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm">
            Don't have an account?{' '}
            <Link to="/create-event" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Create an Event
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;