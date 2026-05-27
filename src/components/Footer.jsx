import React from 'react';
import { Mail, Phone, MapPin, Compass, Calendar, ArrowUp } from 'lucide-react';
import { resortDetails } from '../data/resortData';

export default function Footer({ setView }) {
  const currentYear = new Date().getFullYear();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-luxury-navy text-gray-300 font-sans border-t border-luxury-gold/20">
      
      {/* Top Banner with map info and newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-gray-800">
        
        {/* Left Column: Brand details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center space-x-3 md:space-x-4 py-1">
            <img 
              src="/logo.png" 
              alt="Eden Spot Homestay Logo" 
              className="h-14 md:h-18 w-auto object-contain brightness-0 invert"
            />
            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-xl md:text-2xl tracking-[0.05em] uppercase leading-none text-white">
                Eden Spot
              </span>
              <span className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] uppercase mt-1 md:mt-1.5 font-bold font-sans text-white/80">
                Homestay
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            {resortDetails.tagline}. Discover a peaceful home away from home, nestled in the green sandalwood valleys of Marayoor.
          </p>
          
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start space-x-3 text-sm text-gray-400">
              <MapPin className="h-5 w-5 text-luxury-gold shrink-0 mt-0.5" />
              <span>{resortDetails.address}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Phone className="h-4 w-4 text-luxury-gold shrink-0" />
              <span>{resortDetails.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Mail className="h-4 w-4 text-luxury-gold shrink-0" />
              <span>{resortDetails.email}</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Quick Links */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-serif text-white font-medium text-sm tracking-wider uppercase mb-5">Discover</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => {setView('home'); window.scrollTo({top:0, behavior:'smooth'})}} className="hover:text-luxury-gold transition-colors duration-200">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => {setView('rooms'); window.scrollTo({top:0, behavior:'smooth'})}} className="hover:text-luxury-gold transition-colors duration-200">
                  Rooms & Villas
                </button>
              </li>
              <li>
                <a href="#highlights" className="hover:text-luxury-gold transition-colors duration-200">
                  Activities
                </a>
              </li>
              <li>
                <a href="#amenities" className="hover:text-luxury-gold transition-colors duration-200">
                  Spa & Wellness
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-white font-medium text-sm tracking-wider uppercase mb-5">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-luxury-gold transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors duration-200">Terms of Use</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors duration-200">Sitemap</a></li>
              <li><button onClick={() => {setView('admin'); window.scrollTo({top:0, behavior:'smooth'})}} className="hover:text-luxury-gold transition-colors duration-200 text-luxury-gold text-left">Admin Login</button></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Stylized map preview and coordinates */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-serif text-white font-medium text-sm tracking-wider uppercase">Our Mountain Sanctuary</h3>
          <div className="relative rounded-xl overflow-hidden h-40 border border-gray-800 shadow-inner group">
            {/* Elegant map styling container */}
            <div className="absolute inset-0 bg-slate-900 flex flex-col justify-center items-center text-center p-4">
              <Compass className="h-8 w-8 text-luxury-gold mb-2 animate-spin-slow" />
              <p className="text-xs text-white uppercase tracking-widest font-semibold">{resortDetails.location}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">10.2706° N, 77.1614° E</p>
              <div className="mt-3 text-[10px] text-luxury-gold px-3 py-1 bg-white/5 rounded-full border border-luxury-gold/20">
                Sandalwood Valley Transfers Available
              </div>
            </div>
            
            {/* Background water effects */}
            <div className="absolute inset-0 opacity-20 bg-cover pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=400&q=80')` }}></div>
          </div>
          
          <div className="flex space-x-4 pt-2">
            <a href="#" className="w-8 h-8 rounded-full border border-gray-800 hover:border-luxury-gold flex items-center justify-center text-gray-400 hover:text-luxury-gold transition-all duration-300" title="Instagram">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-gray-800 hover:border-luxury-gold flex items-center justify-center text-gray-400 hover:text-luxury-gold transition-all duration-300" title="Facebook">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-gray-800 hover:border-luxury-gold flex items-center justify-center text-gray-400 hover:text-luxury-gold transition-all duration-300" title="Excursions">
              <Compass className="h-4 w-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom section with copyright and top arrow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© {currentYear} {resortDetails.name}. All Rights Reserved. Designed for Luxury Escapes.</p>
        <button 
          onClick={handleScrollTop}
          className="mt-4 md:mt-0 flex items-center space-x-1.5 hover:text-luxury-gold transition-colors duration-200"
        >
          <span>Scroll to Top</span>
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>

    </footer>
  );
}
