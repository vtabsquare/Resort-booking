import React, { useState } from 'react';
import { Menu, X, Anchor, Calendar, ShieldCheck, Compass, MapPin } from 'lucide-react';

export default function Navbar({ currentView, setView, onBookClick, customerUser, onOpenLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', view: 'home' },
    { label: 'Admin Portal', view: 'admin' }
  ];

  const handleNavClick = (view, hash) => {
    setView(view);
    setMobileMenuOpen(false);
    
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={currentView === 'home' ? "absolute top-0 left-0 w-full z-50 bg-transparent border-b border-white/10 transition-all duration-300" : "sticky top-0 z-50 w-full glassmorphism border-b border-gray-100/80 transition-all duration-300"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          
          {/* Logo Branding */}
          <div 
            className="flex items-center space-x-3 md:space-x-4 cursor-pointer group py-1"
            onClick={() => handleNavClick('home')}
          >
            <img 
              src="/logo.png" 
              alt="Eden Spot Homestay Logo" 
              className={`h-14 md:h-18 w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
                currentView === 'home' ? 'brightness-0 invert' : 'brightness-0'
              }`}
            />
            <div className="flex flex-col">
              <span className={`font-serif font-extrabold text-xl md:text-2xl tracking-[0.05em] uppercase leading-none transition-colors duration-300 ${
                currentView === 'home' ? 'text-white' : 'text-black'
              }`}>
                Eden Spot
              </span>
              <span className={`text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] uppercase mt-1 md:mt-1.5 font-bold font-sans transition-colors duration-300 ${
                currentView === 'home' ? 'text-white/85' : 'text-gray-800'
              }`}>
                Homestay
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.view, item.hash)}
                className={`font-sans text-xs uppercase tracking-widest font-medium hover:text-luxury-gold transition-colors duration-200 relative py-2 ${
                  currentView === item.view && !item.hash
                    ? 'text-luxury-gold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[1px] after:bg-luxury-gold'
                    : currentView === 'home' ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            {customerUser ? (
              <button
                onClick={() => handleNavClick('my-bookings')}
                className={`font-sans text-xs uppercase tracking-widest font-bold hover:text-luxury-gold transition-all duration-200 px-3.5 py-1.5 border border-luxury-gold/50 rounded-xl bg-luxury-navy/10 flex items-center space-x-1 cursor-pointer ${
                  currentView === 'my-bookings'
                    ? 'text-luxury-gold border-luxury-gold bg-luxury-gold/10'
                    : currentView === 'home' ? 'text-white border-white/20' : 'text-luxury-navy border-gray-200'
                }`}
              >
                <span>👤</span>
                <span>{customerUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className={`font-sans text-xs uppercase tracking-widest font-semibold hover:text-luxury-gold transition-all duration-200 px-3.5 py-1.5 border rounded-xl cursor-pointer ${
                  currentView === 'home' ? 'text-white/90 border-white/20 hover:border-white' : 'text-gray-600 border-gray-200 hover:border-luxury-gold'
                }`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none hover:text-luxury-gold ${currentView === 'home' ? 'text-white' : 'text-gray-500'}`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6 stroke-[1.5]" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6 stroke-[1.5]" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Slidedown */}
      <div 
        className={`md:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out origin-top overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100 py-6' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 space-y-4">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.view, item.hash)}
              className={`block w-full text-left font-sans text-sm uppercase tracking-wider font-semibold py-2 border-b border-gray-50 hover:text-luxury-gold ${
                currentView === item.view && !item.hash ? 'text-luxury-gold font-bold' : 'text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          {customerUser ? (
            <button
              onClick={() => handleNavClick('my-bookings')}
              className="block w-full text-left font-sans text-sm uppercase tracking-wider font-bold py-2 border-b border-gray-50 text-luxury-navy flex items-center space-x-1.5"
            >
              <span>👤</span>
              <span>Profile ({customerUser.name})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="block w-full text-left font-sans text-sm uppercase tracking-wider font-semibold py-2 border-b border-gray-50 text-gray-700"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
