import React from 'react';
import { Award, Compass, Sparkles, UtensilsCrossed, UserCheck } from 'lucide-react';
import { resortDetails } from '../data/resortData';
import SearchBar from '../components/SearchBar';

export default function Home({ setView, setSelectedRoomId, searchParams, setSearchParams, heroBackground }) {
  
  const handleSearch = (params) => {
    setSearchParams(params);
    setView('rooms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* HERO SECTION WITH SEARCH BAR */}
      <div className="relative h-[90vh] min-h-[600px] flex items-center justify-center">
        {/* Background Image with elegant overlay isolated inside overflow-hidden to prevent zoom spills */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105"
            style={{ backgroundImage: `url('${heroBackground || '/landing_page.webp'}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-navy/60 via-luxury-navy/40 to-luxury-navy/75"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative max-w-6xl mx-auto px-4 text-center z-10 text-white space-y-6 animate-fade-in mt-[-40px]">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-luxury-navy/60 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-[0.25em] text-luxury-lightgold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            <Award className="h-4 w-4 text-luxury-gold shrink-0 mr-1" />
            <span>Condé Nast Traveler Rated Homestay in Kerala</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_4px_6px_rgba(11,26,48,0.5)]">
            Eden Spot <br />
            <span className="font-serif italic font-normal text-luxury-lightgold">Homestay</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white font-medium tracking-wide leading-relaxed drop-shadow-[0_2px_4px_rgba(11,26,48,0.8)]">
            Enter your dates and guest count below to check real-time availability and customize your homestay experience.
          </p>

          {/* Search Bar container - desktop absolute and mobile inline */}
          <div className="w-full max-w-6xl mx-auto px-4 pt-6">
            <SearchBar onSearch={handleSearch} initialParams={searchParams} />
          </div>
        </div>
      </div>

    </div>
  );
}
