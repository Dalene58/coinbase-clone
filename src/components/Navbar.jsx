import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* Logo Icon - Clickable to Home */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <h1 className="text-[28px] font-semibold leading-9">Vrypto</h1>
            </div>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
            <Link to="/asset/bitcoin" className="text-gray-600 hover:text-blue-600 font-medium transition">Bitcoin</Link>
            <Link to="/asset/ethereum" className="text-gray-600 hover:text-blue-600 font-medium transition">Ethereum</Link>
            <Link to="/crypto" className="text-gray-600 hover:text-blue-600 font-medium transition">Crypto</Link>
            <Link to="/explore" className="text-gray-600 hover:text-blue-600 font-medium transition">Explore</Link>
            <Link to="/learn" className="text-gray-600 hover:text-blue-600 font-medium transition">Learn</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-medium transition">Profile</Link>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/signin" className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium transition">
              Log in
            </Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold text-sm transition shadow-sm">
              Sign up
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link to="/" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/asset/bitcoin" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Bitcoin</Link>
            <Link to="/asset/ethereum" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Ethereum</Link>
            <Link to="/crypto" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Crypto</Link>
            <Link to="/explore" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
            <Link to="/learn" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Learn</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 py-1" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
            <div className="pt-2 flex gap-3">
              <Link to="/signin" className="flex-1 text-gray-600 hover:text-blue-600 py-2 border border-gray-200 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/signup" className="flex-1 bg-blue-600 text-white py-2 rounded-full font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}