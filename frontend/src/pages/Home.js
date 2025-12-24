import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, QrCode, Users, Download, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const heroRef = useRef(null);
  
  useEffect(() => {
    // Mouse move parallax effect
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPos = (clientX / innerWidth - 0.5) * 20;
        const yPos = (clientY / innerHeight - 0.5) * 20;
        heroRef.current.style.transform = `translate(${xPos}px, ${yPos}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
              <span className="text-sm text-white/80">Next-Gen Event Photo Collection</span>
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl md:text-9xl font-black mb-8 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite'
              }}
            >
              EventSnap
            </motion.h1>
            
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl md:text-5xl mb-10 font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Capture Every Moment.<br/>
              <span className="text-2xl md:text-4xl text-purple-400">QR-Based Photo Collection</span>
            </motion.p>
            
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl mb-12 text-white/80 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Transform your events into unforgettable memories. Generate stunning QR codes, 
              collect photos instantly, and create beautiful galleries—all in seconds.
            </motion.p>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="space-y-4 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center"
            >
              <Link
                to="/create-event"
                className="group inline-flex items-center btn btn-primary text-lg shadow-2xl"
              >
                <span>Create Event</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center btn btn-secondary text-lg"
              >
                <span>Sign In</span>
              </Link>
            </motion.div>

            {/* Floating 3D Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-20 left-10 hidden lg:block"
            >
              <div className="glass-card p-6 w-20 h-20 flex items-center justify-center">
                <Camera className="w-10 h-10 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-40 right-10 hidden lg:block"
            >
              <div className="glass-card p-6 w-20 h-20 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-pink-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="py-32 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-20">
            <motion.h2 
              className="text-6xl md:text-7xl font-black mb-6 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              How It Works
            </motion.h2>
            <p className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto font-semibold">
              Three simple steps to magic ✨
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass-card text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/50"
              >
                <Camera className="h-10 w-10 text-white" />
              </motion.div>
              <div className="text-4xl font-bold text-purple-400 mb-4">01</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Create Event</h3>
              <p className="text-white/70 leading-relaxed">
                Set up your event with a title, date, and description. 
                Get an instant QR code for photo collection.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass-card text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-pink-500 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-pink-500/50"
              >
                <QrCode className="h-10 w-10 text-white" />
              </motion.div>
              <div className="text-4xl font-bold text-pink-400 mb-4">02</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Share QR Code</h3>
              <p className="text-white/70 leading-relaxed">
                Place the QR code at your venue or share it digitally. 
                Participants scan to instantly access the upload page.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass-card text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/50"
              >
                <Users className="h-10 w-10 text-white" />
              </motion.div>
              <div className="text-4xl font-bold text-green-400 mb-4">03</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Collect Photos</h3>
              <p className="text-white/70 leading-relaxed">
                View, manage, and download all uploaded photos from your 
                organized dashboard. No app installation required!
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Why Choose EventSnap */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="py-32 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-20">
            <motion.div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-full border border-purple-500/30 mb-8">
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-sm font-bold text-white tracking-wider uppercase">Why Choose EventSnap</span>
            </motion.div>
            <motion.h2 
              className="text-6xl md:text-8xl font-black mb-8 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Built for Modern Events
            </motion.h2>
            <p className="text-2xl md:text-3xl text-white/70 max-w-4xl mx-auto font-semibold">
              Everything you need to create memorable experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card group hover:neon-border"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Instant QR Codes</h3>
              <p className="text-white/70 leading-relaxed">
                Generate unique QR codes for each event that link directly to the upload page.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card group hover:neon-border"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Privacy Control</h3>
              <p className="text-white/70 leading-relaxed">
                Approve photos before they appear in the public gallery. Full control over content.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card group hover:neon-border"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Bulk Download</h3>
              <p className="text-white/70 leading-relaxed">
                Download individual photos or create archives of multiple photos at once.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card group hover:neon-border"
            >
              <div className="bg-gradient-to-br from-red-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/50">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Anonymous Upload</h3>
              <p className="text-white/70 leading-relaxed">
                Participants can upload photos without creating accounts or installing apps.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card group hover:neon-border"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/50">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Photo Management</h3>
              <p className="text-white/70 leading-relaxed">
                Organize, approve, and manage all event photos from one central dashboard.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass-card group hover:neon-border"
            >
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/50">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Real-time Updates</h3>
              <p className="text-white/70 leading-relaxed">
                See photos as they're uploaded in real-time during your event.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full filter blur-3xl opacity-30"
          ></motion.div>
          
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f093fb 50%, #4facfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ready to Create Magic?
          </motion.h2>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl text-white/90 mb-12 font-bold"
          >
            Join 10,000+ event organizers worldwide 🌍
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/create-event"
              className="group inline-flex items-center btn btn-primary text-xl px-12 py-4 pulse-glow"
            >
              <span>Start Your First Event</span>
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              >
                <Camera className="h-8 w-8 text-purple-400" />
              </motion.div>
              <span className="text-2xl font-bold gradient-text">EventSnap</span>
            </div>
            <p className="text-white/60 text-lg mb-8">
              Making event photo collection simple, beautiful, and effortless.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-white/60 hover:text-purple-400 transition-colors"
              >
                Privacy
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-white/60 hover:text-purple-400 transition-colors"
              >
                Terms
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-white/60 hover:text-purple-400 transition-colors"
              >
                Contact
              </motion.a>
            </div>
            <div className="mt-8 text-white/40 text-sm">
              © 2025 EventSnap. All rights reserved.
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Home;