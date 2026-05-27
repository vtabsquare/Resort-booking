import React, { useState, useMemo } from 'react';
import { 
  Star, ChevronLeft, ChevronRight, Info, ShieldAlert, CalendarRange, 
  Wifi, Waves, Sparkles, UtensilsCrossed, UserCheck, Dumbbell, Ship, GlassWater, Compass, Wind 
} from 'lucide-react';
import { roomsData } from '../data/resortData';
import SearchBar from '../components/SearchBar';
import { getRoomPriceForActiveSeason } from '../services/pricing';

// Helper to map amenity ID to Lucide Icon
export function getAmenityIcon(id, className = "h-5 w-5") {
  switch (id) {
    case 'wifi': return <Wifi className={className} />;
    case 'pool': return <Waves className={className} />;
    case 'ayurveda': return <Sparkles className={className} />;
    case 'dining': return <UtensilsCrossed className={className} />;
    case 'butler': return <UserCheck className={className} />;
    case 'yoga': return <Dumbbell className={className} />;
    case 'shuttle': return <Ship className={className} />;
    case 'bar': return <GlassWater className={className} />;
    case 'tours': return <Compass className={className} />;
    case 'ac': return <Wind className={className} />;
    default: return <Compass className={className} />;
  }
}

// Map amenity ID to Lucide Icon without fallback
export function getLucideIconForId(id, className = "h-5 w-5") {
  const normalizedId = String(id).toLowerCase().trim();
  switch (normalizedId) {
    case 'wifi': return <Wifi className={className} />;
    case 'pool': return <Waves className={className} />;
    case 'ayurveda': return <Sparkles className={className} />;
    case 'dining': return <UtensilsCrossed className={className} />;
    case 'butler': return <UserCheck className={className} />;
    case 'yoga': return <Dumbbell className={className} />;
    case 'shuttle':
    case 'boat': return <Ship className={className} />;
    case 'bar': return <GlassWater className={className} />;
    case 'tours':
    case 'cruise': return <Compass className={className} />;
    case 'ac': return <Wind className={className} />;
    default: return null;
  }
}

// Render icon: check Lucide map first, then fall back to emoji from amenitiesList
export function renderAmenityIcon(amenityId, amenitiesList = [], className = "h-5 w-5") {
  const found = amenitiesList.find(a => a.id === amenityId || a.name === amenityId);
  const targetId = found ? found.id : amenityId;
  const lucideIcon = getLucideIconForId(targetId, className);
  if (lucideIcon) return lucideIcon;
  
  if (found && found.icon) {
    return <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{found.icon}</span>;
  }
  return <Compass className={className} />;
}

// Helper to get date availability list night-by-night
export function getRoomNightsAvailability(room, checkIn, checkOut, bookings) {
  if (!checkIn || !checkOut) return [];
  const dates = [];
  let current = new Date(checkIn);
  const end = new Date(checkOut);
  
  if (isNaN(current.getTime()) || isNaN(end.getTime()) || current >= end) return [];
  
  let safetyCounter = 0;
  while (current < end && safetyCounter < 31) {
    safetyCounter++;
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const formattedDate = current.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    
    const isBooked = bookings.some(b => {
      if (b.roomName.trim().toLowerCase() !== room.name.trim().toLowerCase()) return false;
      if (String(b.status).trim().toLowerCase() !== 'confirmed') return false;
      return dateStr >= b.checkIn && dateStr < b.checkOut;
    });

    dates.push({ dateStr, formattedDate, isBooked });
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function RoomsList({ 
  rooms = roomsData, 
  bookings = [],
  setView, 
  setSelectedRoomId, 
  searchParams, 
  setSearchParams,
  seasonalMultiplier = 1.0,
  amenitiesList = []
}) {
  const [sortBy, setSortBy] = useState('price-asc');

  // Maintain active image index for each room card
  const [activeImageIndices, setActiveImageIndices] = useState(
    rooms.reduce((acc, room) => {
      acc[room.id] = 0;
      return acc;
    }, {})
  );

  // Handle image carousel controls
  const handlePrevImage = (roomId, imagesLength, e) => {
    e.stopPropagation();
    setActiveImageIndices(prev => {
      const currentIndex = prev[roomId] || 0;
      const nextIndex = currentIndex === 0 ? imagesLength - 1 : currentIndex - 1;
      return { ...prev, [roomId]: nextIndex };
    });
  };

  const handleNextImage = (roomId, imagesLength, e) => {
    e.stopPropagation();
    setActiveImageIndices(prev => {
      const currentIndex = prev[roomId] || 0;
      const nextIndex = currentIndex === imagesLength - 1 ? 0 : currentIndex + 1;
      return { ...prev, [roomId]: nextIndex };
    });
  };

  const handleViewDetails = (roomId) => {
    setSelectedRoomId(roomId);
    setView('room-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered & Sorted Rooms list based purely on Guest Search criteria
  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => {
        // Guests search capacity check
        if (searchParams) {
          const adultsSearch = parseInt(searchParams.adults) || 0;
          const kidsSearch = parseInt(searchParams.children) || 0;
          const roomsSearch = parseInt(searchParams.rooms) || 1;
          
          // Check if room fits the average occupancy per booked room unit requested
          if (room.maxOccupancy?.adults && room.maxOccupancy.adults < Math.ceil(adultsSearch / roomsSearch)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = getRoomPriceForActiveSeason(a, seasonalMultiplier);
        const priceB = getRoomPriceForActiveSeason(b, seasonalMultiplier);
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured/default
      });
  }, [rooms, bookings, sortBy, searchParams, seasonalMultiplier]);

  // If search parameters are not set, display the Search availability Gate first
  if (!searchParams) {
    return (
      <div className="bg-gray-50/50 min-h-[80vh] flex items-center justify-center px-4 py-16 font-sans">
        <div className="max-w-6xl w-full bg-white rounded-3xl border border-gray-200/30 p-8 md:p-12 shadow-sm text-center space-y-8 animate-fade-in admin-card-hover">
          <div className="w-16 h-16 rounded-full bg-luxury-navy text-luxury-gold flex items-center justify-center mx-auto border border-luxury-gold/30">
            <CalendarRange className="h-7 w-7" />
          </div>
          
          <div className="space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-navy uppercase tracking-wider">Check Real-Time Availability</h2>
            <p className="text-gray-500 text-xs sm:text-sm font-light max-w-lg mx-auto">
              Welcome to Eden Spot Homestay. Please select your dates and details below to unlock available mountain suites and cottages.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <SearchBar onSearch={(params) => setSearchParams(params)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen font-sans">
      
      {/* Search status ribbon bar */}
      <div className="bg-primary-50 border-b border-primary-100 text-primary-900 py-3 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="font-medium">
              Villas available in <span className="font-bold text-luxury-navy">{searchParams.place}</span> for <span className="font-bold">{searchParams.checkIn}</span> to <span className="font-bold">{searchParams.checkOut}</span> • {searchParams.adults} Adults, {searchParams.children} Children ({searchParams.rooms} Room)
            </p>
          </div>
          <button 
            onClick={() => setSearchParams(null)} 
            className="text-primary-600 hover:text-primary-700 font-bold uppercase tracking-widest text-[10px] underline"
          >
            Modify Search
          </button>
        </div>
      </div>

      {/* Main Listing Grid - Centered & Spacious */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page title and sorting bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="font-serif text-3xl font-bold text-luxury-navy mb-1.5">Available Accommodations</h1>
            <p className="text-gray-500 text-xs font-light">Select a room style below to begin customizing your regional dining and local Kerala excursions.</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-gray-400 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg text-xs font-semibold px-3 py-2 text-gray-700 focus:outline-none focus:border-luxury-gold"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Room cards display container */}
        <main className="space-y-6">
          {filteredRooms.length === 0 ? (
            <div className="bg-white border border-gray-200/30 rounded-2xl py-20 px-4 text-center space-y-4 shadow-sm">
              <ShieldAlert className="h-10 w-10 text-luxury-gold mx-auto" />
              <h3 className="font-serif text-lg font-bold text-luxury-navy">No Accommodations Available</h3>
              <p className="text-gray-500 text-xs font-light max-w-sm mx-auto">
                No rooms fit the requested guest capacity configurations. Try adjusting your guest count or room counts.
              </p>
              <button
                onClick={() => setSearchParams(null)}
                className="bg-luxury-navy text-white text-xs uppercase tracking-widest font-bold px-6 py-2.5 rounded-lg border border-luxury-gold/30 hover:border-luxury-gold"
              >
                Modify Search Details
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const imgIdx = activeImageIndices[room.id] || 0;
              return (
                <div 
                  key={room.id}
                  className="bg-white rounded-2xl border border-gray-200/30 shadow-sm overflow-hidden flex flex-col md:flex-row admin-card-hover animate-fade-in"
                >
                  
                  {/* Room Carousel Container */}
                  <div className="relative w-full md:w-80 lg:w-[380px] h-64 md:h-auto shrink-0 overflow-hidden bg-gray-100 group">
                    <img 
                      src={(room.images || [])[imgIdx] || ''} 
                      alt={room.name} 
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    
                    {/* Carousel Arrow Buttons */}
                    <button
                      onClick={(e) => handlePrevImage(room.id, (room.images || []).length, e)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-luxury-navy flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={(e) => handleNextImage(room.id, (room.images || []).length, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-luxury-navy flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-10">
                      {(room.images || []).map((_, idx) => (
                        <span 
                          key={idx}
                          className={`block w-1.5 h-1.5 rounded-full transition-colors ${
                            idx === imgIdx ? 'bg-white scale-120' : 'bg-white/45'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Type Ribbon */}
                    <div className="absolute top-4 left-4 bg-luxury-navy/85 backdrop-blur-sm px-2.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-widest border border-luxury-gold/20">
                      {room.category}
                    </div>
                  </div>

                  {/* Room Details Content Card */}
                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6">
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 
                          className="font-serif text-lg md:text-xl font-bold text-luxury-navy hover:text-luxury-gold transition-colors duration-200 cursor-pointer" 
                          onClick={() => handleViewDetails(room.id)}
                        >
                          {room.name}
                        </h3>
                        <div className="flex items-center text-xs space-x-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                          <Star className="h-3 w-3 text-luxury-gold fill-luxury-gold" />
                          <span className="font-semibold text-luxury-navy">{room.rating.toFixed(1)}</span>
                          <span className="text-gray-400">({room.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Room Specifications Row */}
                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-[11px] text-emerald-700 font-medium">
                        <span>Size: <strong className="font-bold text-emerald-900">{room.size} sq ft</strong></span>
                        <span>•</span>
                        <span>View: <strong className="font-bold text-emerald-900">{room.view}</strong></span>
                        <span>•</span>
                        <span>Bed: <strong className="font-bold text-emerald-900">{room.bedType}</strong></span>
                        <span>•</span>
                        <span>Max Capacity: <strong className="font-bold text-emerald-900">{room.maxOccupancy?.adults ?? '?'} Adults</strong></span>
                      </div>

                      <p className="text-gray-900 text-xs font-normal leading-relaxed line-clamp-3">
                        {room.description}
                      </p>
                    </div>

                    {/* Date Availability Badges */}
                    {searchParams && searchParams.checkIn && searchParams.checkOut && (
                      <div className="space-y-2 py-2 border-t border-b border-gray-100 bg-gray-50/50 p-3 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-luxury-navy flex items-center gap-1">
                          <span>📅</span> Selected Dates Status:
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {getRoomNightsAvailability(room, searchParams.checkIn, searchParams.checkOut, bookings).map((night) => (
                            <span 
                              key={night.dateStr}
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                night.isBooked 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${night.isBooked ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                              {night.formattedDate}: {night.isBooked ? 'Booked' : 'Available'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Included Amenities Row */}
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-900">Villa Amenities</p>
                      <div className="flex space-x-3.5 text-gray-800">
                        {(room.amenities || []).map((amenityId) => {
                          const found = amenitiesList.find(a => a.id === amenityId || a.name === amenityId);
                          const displayName = found ? found.name : amenityId;
                          return (
                            <div key={amenityId} title={displayName} className="hover:text-luxury-gold transition-colors">
                              {renderAmenityIcon(amenityId, amenitiesList, "h-4.5 w-4.5")}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pricing block and button */}
                    <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] text-gray-800 font-bold uppercase tracking-wider leading-none">Starting from</p>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="font-serif font-bold text-2xl text-rose-700">₹{getRoomPriceForActiveSeason(room, seasonalMultiplier).toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-800 font-bold">/ night</span>
                        </div>
                      </div>

                      <div className="flex space-x-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleViewDetails(room.id)}
                          className="w-full sm:w-auto bg-luxury-navy hover:bg-primary-600 text-white font-sans text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-lg border border-luxury-gold/20 hover:border-luxury-gold transition-all duration-200"
                        >
                          Customize & Book
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </main>

      </div>

    </div>
  );
}
