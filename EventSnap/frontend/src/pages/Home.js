import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, QrCode, Users, Download, Shield, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              EventSnap
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              QR-Based Event Photo Collection Made Simple
            </p>
            <p className="text-lg mb-12 text-blue-50 max-w-3xl mx-auto">
              Create events, generate QR codes, and let participants upload photos effortlessly. 
              Perfect for weddings, parties, conferences, and any gathering where memories matter.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/signup"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to collect all your event photos in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Create Event</h3>
              <p className="text-gray-600">
                Set up your event with a title, date, and description. 
                Get an instant QR code for photo collection.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Share QR Code</h3>
              <p className="text-gray-600">
                Place the QR code at your venue or share it digitally. 
                Participants scan to instantly access the upload page.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Collect Photos</h3>
              <p className="text-gray-600">
                View, manage, and download all uploaded photos from your 
                organized dashboard. No app installation required!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to manage event photos efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <QrCode className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant QR Codes</h3>
              <p className="text-gray-600">
                Generate unique QR codes for each event that link directly to the upload page.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Privacy Control</h3>
              <p className="text-gray-600">
                Approve photos before they appear in the public gallery. Full control over content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Download className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bulk Download</h3>
              <p className="text-gray-600">
                Download individual photos or create archives of multiple photos at once.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-10 w-10 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Anonymous Upload</h3>
              <p className="text-gray-600">
                Participants can upload photos without creating accounts or installing apps.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Camera className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Photo Management</h3>
              <p className="text-gray-600">
                Organize, approve, and manage all event photos from one central dashboard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Zap className="h-10 w-10 text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                See photos as they're uploaded in real-time during your event.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Collect Your Event Photos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of event organizers who trust EventSnap for their photo collection needs.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            Start Your First Event
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Camera className="h-6 w-6" />
              <span className="text-lg font-bold">EventSnap</span>
            </div>
            <p className="text-gray-400">
              Making event photo collection simple and effortless.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;