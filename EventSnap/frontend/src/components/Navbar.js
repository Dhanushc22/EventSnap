import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, User, LogOut, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-card sticky top-4 mx-4 z-50 mb-4"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg shadow-purple-500/50"
            >
              <Camera className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl font-black gradient-text hidden sm:block">EventSnap</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={
                      user?.type === 'admin' ? '/admin-dashboard' : 
                      user?.type === 'host' ? '/host-dashboard' : 
                      '/dashboard'
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      (user?.type === 'admin' && isActive('/admin-dashboard')) ||
                      (user?.type === 'host' && isActive('/host-dashboard')) ||
                      (user?.type !== 'admin' && user?.type !== 'host' && isActive('/dashboard'))
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                </motion.div>
                
                <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white font-semibold">{user?.name}</span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/')
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:block">Home</span>
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/login')
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;