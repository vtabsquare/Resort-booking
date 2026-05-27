import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, Calendar, Users, MapPin, CheckCircle, Info,
  ChevronLeft, ArrowLeft, ShieldCheck, Heart, Coffee, Compass, Car
} from 'lucide-react';
import { roomsData, mockReviews, resortDetails } from '../data/resortData';
import { getAmenityIcon, renderAmenityIcon, getRoomNightsAvailability } from './RoomsList';
import { getRoomPriceForActiveSeason } from '../services/pricing';

export default function RoomDetails({ 
  dbRooms = roomsData, 
  bookings = [],
  roomId, 
  setView, 
  onBackClick, 
  searchParams, 
  setSearchParams, 
  onProceedToCheckout,
  foodPackages = [],
  sightseeingPackages = [],
  vehicles = [],
  seasonalMultiplier = 1.0,
  amenitiesList = [],
  discountEnabled = false,
  activeDiscountType = 'standard',
  discountLow = 0,
  discountStandard = 0,
  discountPeak = 0,
  gstRate = 12
}) {
  
  // Find room details from dataset — safe fallback to empty shell if nothing found yet
  const room = useMemo(() => {
    const found = dbRooms.find(r => r.id === roomId) || dbRooms[0];
    if (!found) return { id: '', name: '', category: '', view: '', size: 0, bedType: '', description: '', rating: 5, reviewsCount: 0, images: [], amenities: [], price: 0, priceLow: 0, pricePeak: 0 };
    return {
      ...found,
      images: Array.isArray(found.images) ? found.images : [],
      amenities: Array.isArray(found.amenities) ? found.amenities : [],
    };
  }, [dbRooms, roomId]);

  // Gallery Active Image — safe default
  const [activeImage, setActiveImage] = useState(room.images[0] || '');

  // Update active image when room ID changes
  useEffect(() => {
    setActiveImage(room.images[0] || '');
  }, [room]);

  // Form Booking Parameters
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(searchParams?.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams?.checkOut || tomorrowStr);
  const [adults, setAdults] = useState(searchParams?.adults || 2);
  const [children, setChildren] = useState(searchParams?.children || 0);
  const [rooms, setRooms] = useState(searchParams?.rooms || 1);

  // Calculate Nights count
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // --- PER-DAY FOOD SELECTIONS ---
  const breakfastOptions = useMemo(() => foodPackages.filter(f => String(f.type || '').trim().toLowerCase() === 'breakfast'), [foodPackages]);
  const lunchOptions    = useMemo(() => foodPackages.filter(f => String(f.type || '').trim().toLowerCase() === 'lunch'),    [foodPackages]);
  const dinnerOptions   = useMemo(() => foodPackages.filter(f => String(f.type || '').trim().toLowerCase() === 'dinner'),   [foodPackages]);

  const getCombosForPackage = (pkg, isVeg) => {
    if (!pkg) return [];
    return isVeg
      ? [pkg.veg1, pkg.veg2, pkg.veg3].filter(Boolean)
      : [pkg.nv1,  pkg.nv2,  pkg.nv3].filter(Boolean);
  };

  const makeEmptyDayFood = () => ({
    breakfastFoodType: 'veg',
    lunchFoodType: 'veg',
    dinnerFoodType: 'veg',
    includeBreakfast: false, selectedBreakfastId: breakfastOptions[0]?.id || '', selectedBreakfast: '',
    includeLunch:     false, selectedLunchId:     lunchOptions[0]?.id    || '', selectedLunch:     '',
    includeDinner:    false, selectedDinnerId:    dinnerOptions[0]?.id   || '', selectedDinner:    '',
  });

  const [includeFood, setIncludeFood]           = useState(false);
  const [dayFoodSelections, setDayFoodSelections] = useState([]);
  const [expandedDayIdx, setExpandedDayIdx]      = useState(0);

  // Resize dayFoodSelections when nights or options change
  useEffect(() => {
    setDayFoodSelections(prev => {
      return Array.from({ length: Math.max(nights, 1) }, (_, i) => {
        const existing = prev[i];
        const defaultBreakfast = breakfastOptions[0];
        const defaultLunch = lunchOptions[0];
        const defaultDinner = dinnerOptions[0];
        
        const breakfastCombo = defaultBreakfast ? getCombosForPackage(defaultBreakfast, true)[0] || '' : '';
        const lunchCombo = defaultLunch ? getCombosForPackage(defaultLunch, true)[0] || '' : '';
        const dinnerCombo = defaultDinner ? getCombosForPackage(defaultDinner, true)[0] || '' : '';

        if (!existing) {
          return {
            breakfastFoodType: 'veg',
            lunchFoodType: 'veg',
            dinnerFoodType: 'veg',
            includeBreakfast: false, selectedBreakfastId: defaultBreakfast?.id || '', selectedBreakfast: breakfastCombo,
            includeLunch:     false, selectedLunchId:     defaultLunch?.id    || '', selectedLunch:     lunchCombo,
            includeDinner:    false, selectedDinnerId:    defaultDinner?.id   || '', selectedDinner:    dinnerCombo,
          };
        }

        // If existing exists but was initialized when options were not loaded yet, update them
        const updated = { ...existing };
        if (!updated.selectedBreakfastId && defaultBreakfast) {
          updated.selectedBreakfastId = defaultBreakfast.id;
          updated.selectedBreakfast = breakfastCombo;
        }
        if (!updated.selectedLunchId && defaultLunch) {
          updated.selectedLunchId = defaultLunch.id;
          updated.selectedLunch = lunchCombo;
        }
        if (!updated.selectedDinnerId && defaultDinner) {
          updated.selectedDinnerId = defaultDinner.id;
          updated.selectedDinner = dinnerCombo;
        }
        return updated;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nights, breakfastOptions, lunchOptions, dinnerOptions]);

  // Helper: update a single field on one day
  const updateDayFood = (dayIdx, field, value) => {
    setDayFoodSelections(prev => {
      const next = prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const updated = { ...d, [field]: value };
        if (field === 'includeBreakfast' && value && !updated.selectedBreakfast) {
          const pkg = breakfastOptions.find(o => o.id === updated.selectedBreakfastId) || breakfastOptions[0];
          if (pkg) {
            const combos = getCombosForPackage(pkg, (updated.breakfastFoodType || 'veg') === 'veg');
            updated.selectedBreakfast = combos[0] || '';
          }
        }
        if (field === 'includeLunch' && value && !updated.selectedLunch) {
          const pkg = lunchOptions.find(o => o.id === updated.selectedLunchId) || lunchOptions[0];
          if (pkg) {
            const combos = getCombosForPackage(pkg, (updated.lunchFoodType || 'veg') === 'veg');
            updated.selectedLunch = combos[0] || '';
          }
        }
        if (field === 'includeDinner' && value && !updated.selectedDinner) {
          const pkg = dinnerOptions.find(o => o.id === updated.selectedDinnerId) || dinnerOptions[0];
          if (pkg) {
            const combos = getCombosForPackage(pkg, (updated.dinnerFoodType || 'veg') === 'veg');
            updated.selectedDinner = combos[0] || '';
          }
        }
        return updated;
      });
      return next;
    });
  };

  // When package selection changes for a day, auto-select first combo
  const handleBreakfastPkgChange = (dayIdx, pkgId) => {
    const pkg = breakfastOptions.find(o => o.id === pkgId);
    const day  = dayFoodSelections[dayIdx];
    if (!pkg || !day) return;
    const combos = getCombosForPackage(pkg, (day.breakfastFoodType || 'veg') === 'veg');
    setDayFoodSelections(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, selectedBreakfastId: pkgId, selectedBreakfast: combos[0] || '' } : d
    ));
  };
  const handleLunchPkgChange = (dayIdx, pkgId) => {
    const pkg = lunchOptions.find(o => o.id === pkgId);
    const day  = dayFoodSelections[dayIdx];
    if (!pkg || !day) return;
    const combos = getCombosForPackage(pkg, (day.lunchFoodType || 'veg') === 'veg');
    setDayFoodSelections(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, selectedLunchId: pkgId, selectedLunch: combos[0] || '' } : d
    ));
  };
  const handleDinnerPkgChange = (dayIdx, pkgId) => {
    const pkg = dinnerOptions.find(o => o.id === pkgId);
    const day  = dayFoodSelections[dayIdx];
    if (!pkg || !day) return;
    const combos = getCombosForPackage(pkg, (day.dinnerFoodType || 'veg') === 'veg');
    setDayFoodSelections(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, selectedDinnerId: pkgId, selectedDinner: combos[0] || '' } : d
    ));
  };

  // When foodType changes for a single meal of a day reset combo
  const handleMealFoodType = (dayIdx, meal, type) => {
    setDayFoodSelections(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const isVeg = type === 'veg';
      if (meal === 'breakfast') {
        const pkg = breakfastOptions.find(o => o.id === d.selectedBreakfastId) || breakfastOptions[0];
        const combos = getCombosForPackage(pkg, isVeg);
        return {
          ...d,
          breakfastFoodType: type,
          selectedBreakfast: combos[0] || '',
        };
      } else if (meal === 'lunch') {
        const pkg = lunchOptions.find(o => o.id === d.selectedLunchId) || lunchOptions[0];
        const combos = getCombosForPackage(pkg, isVeg);
        return {
          ...d,
          lunchFoodType: type,
          selectedLunch: combos[0] || '',
        };
      } else if (meal === 'dinner') {
        const pkg = dinnerOptions.find(o => o.id === d.selectedDinnerId) || dinnerOptions[0];
        const combos = getCombosForPackage(pkg, isVeg);
        return {
          ...d,
          dinnerFoodType: type,
          selectedDinner: combos[0] || '',
        };
      }
      return d;
    }));
  };

  // Apply Day 1 to all days
  const applyDay1ToAll = () => {
    if (dayFoodSelections.length < 2) return;
    const template = dayFoodSelections[0];
    setDayFoodSelections(prev => prev.map(() => ({ ...template })));
  };

  // Compute per-day food cost for amount split
  const perDayFoodCosts = useMemo(() => {
    if (!includeFood) return [];
    const guestCount = adults + children;
    return dayFoodSelections.map(day => {
      const bPkg = breakfastOptions.find(o => o.id === day.selectedBreakfastId);
      const lPkg = lunchOptions.find(o => o.id === day.selectedLunchId);
      const nPkg = dinnerOptions.find(o => o.id === day.selectedDinnerId);
      let cost = 0;
      if (day.includeBreakfast && bPkg) cost += Number(bPkg.price) || 0;
      if (day.includeLunch     && lPkg) cost += Number(lPkg.price) || 0;
      if (day.includeDinner    && nPkg) cost += Number(nPkg.price) || 0;
      return cost * guestCount;
    });
  }, [includeFood, dayFoodSelections, breakfastOptions, lunchOptions, dinnerOptions, adults, children]);

  // --- DYNAMIC SIGHTSEEING SELECTIONS ---
  const [includeSightseeing, setIncludeSightseeing] = useState(false);
  const [selectedSightseeingPackageId, setSelectedSightseeingPackageId] = useState('');

  useEffect(() => {
    if (sightseeingPackages.length > 0 && !selectedSightseeingPackageId) {
      setSelectedSightseeingPackageId(sightseeingPackages[0].id);
    }
  }, [sightseeingPackages, selectedSightseeingPackageId]);

  const activePackage = useMemo(() => {
    return sightseeingPackages.find(p => p.id === selectedSightseeingPackageId) || sightseeingPackages[0];
  }, [sightseeingPackages, selectedSightseeingPackageId]);

  const packagePrice = useMemo(() => {
    if (!activePackage) return 0;
    if (seasonalMultiplier === 0.9) {
      return Number(activePackage.priceLow) || Math.round(Number(activePackage.price) * 0.9);
    } else if (seasonalMultiplier === 1.15) {
      return Number(activePackage.pricePeak) || Math.round(Number(activePackage.price) * 1.15);
    } else {
      return Number(activePackage.priceStandard) || Number(activePackage.price) || 0;
    }
  }, [activePackage, seasonalMultiplier]);

  // Reviews filtering for this specific room
  const roomReviews = useMemo(() => {
    return mockReviews.filter(rev => 
      rev.room.toLowerCase().includes(room.name.toLowerCase()) || 
      rev.room.toLowerCase().includes(room.category.toLowerCase())
    );
  }, [room]);


  // Calculate customized price modifiers
  const pricingSummary = useMemo(() => {
    const actualRoomPrice = getRoomPriceForActiveSeason(room, seasonalMultiplier);
    const roomCost = actualRoomPrice * nights * rooms;

    // Food cost = sum of all per-day costs (already guest-scaled in perDayFoodCosts)
    const foodCost = includeFood ? perDayFoodCosts.reduce((s, c) => s + c, 0) : 0;

    // Sightseeing Pricing:
    let sightseeingCost = 0;
    if (includeSightseeing && activePackage) {
      sightseeingCost = packagePrice;
    }

    // Discount Calculation:
    let discountAmount = 0;
    if (discountEnabled) {
      if (activeDiscountType === 'low')        discountAmount = discountLow;
      else if (activeDiscountType === 'peak')  discountAmount = discountPeak;
      else                                     discountAmount = discountStandard;
    }

    const subtotalNoDiscount = roomCost + foodCost + sightseeingCost;
    const subtotal   = Math.max(0, subtotalNoDiscount - discountAmount);
    const luxuryTax  = subtotal * (gstRate / 100);
    const total      = subtotal + luxuryTax;

    return { roomCost, foodCost, sightseeingCost, discount: discountAmount, subtotal, luxuryTax, total };
  }, [room, nights, rooms, adults, children, includeFood, perDayFoodCosts, includeSightseeing, activePackage, packagePrice, discountEnabled, activeDiscountType, discountLow, discountStandard, discountPeak]);

  const selectedNightsAvailability = useMemo(() => {
    return getRoomNightsAvailability(room, checkIn, checkOut, bookings);
  }, [room, checkIn, checkOut, bookings]);

  const isDatesOccupied = useMemo(() => {
    return selectedNightsAvailability.some(n => n.isBooked);
  }, [selectedNightsAvailability]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out date must occur after Check-in date.");
      return;
    }

    if (isDatesOccupied) {
      alert("❌ This room is already booked for the selected dates. Please choose another date range or check other rooms.");
      return;
    }

    // Sync searchParams globally
    setSearchParams({
      checkIn,
      checkOut,
      adults,
      children,
      rooms
    });

    // Construct per-day food summary
    const perDayFoodSummary = includeFood ? dayFoodSelections.map((day, i) => {
      const bPkg = breakfastOptions.find(o => o.id === day.selectedBreakfastId);
      const lPkg = lunchOptions.find(o => o.id === day.selectedLunchId);
      const nPkg = dinnerOptions.find(o => o.id === day.selectedDinnerId);
      const meals = [];
      if (day.includeBreakfast && bPkg) meals.push(`Breakfast: ${day.selectedBreakfast || bPkg.name} (${(day.breakfastFoodType || 'veg') === 'veg' ? 'Veg' : 'Non-Veg'})`);
      if (day.includeLunch     && lPkg) meals.push(`Lunch: ${day.selectedLunch || lPkg.name} (${(day.lunchFoodType || 'veg') === 'veg' ? 'Veg' : 'Non-Veg'})`);
      if (day.includeDinner    && nPkg) meals.push(`Dinner: ${day.selectedDinner || nPkg.name} (${(day.dinnerFoodType || 'veg') === 'veg' ? 'Veg' : 'Non-Veg'})`);
      return { day: i + 1, foodType: 'custom', meals, cost: perDayFoodCosts[i] || 0 };
    }) : [];

    // Construct sightseeing selection summary
    const sightseeingSelection = includeSightseeing && activePackage ? {
      id: activePackage.id,
      name: activePackage.name,
      description: activePackage.description,
      places: activePackage.places,
      image: activePackage.image,
      price: packagePrice
    } : null;

    // Send complete packet to checkout page
    onProceedToCheckout({
      room: {
        ...room,
        price: getRoomPriceForActiveSeason(room, seasonalMultiplier)
      },
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      rooms,
      selectedFoodPackage: includeFood && perDayFoodSummary.some(d => d.meals.length > 0) ? {
        label: `${nights}-day meal plan`,
        perDay: perDayFoodSummary,
        details: perDayFoodSummary
          .filter(d => d.meals.length > 0)
          .map(d => `Day ${d.day}: ${d.meals.join(', ')}`)
          .join(' | '),
        totalCost: pricingSummary.foodCost,
      } : null,
      selectedSightseeing: sightseeingSelection,
      selectedVehicle: null,
      pricing: pricingSummary
    });
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-16">
      
      {/* Back navigation bar */}
      <div className="border-b border-gray-100 py-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-3 text-xs font-semibold text-gray-600">
          <button 
            onClick={onBackClick}
            className="flex items-center space-x-1.5 hover:text-luxury-gold transition-colors duration-200"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Accommodations</span>
          </button>
          <span>/</span>
          <span className="text-luxury-navy font-bold uppercase tracking-wider">{room.name}</span>
        </div>
      </div>

      {/* 1. ROOM IMAGES */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 mt-6">
        <div className="space-y-3">
          {/* Active Image Panel */}
          <div className="relative h-96 sm:h-[500px] w-full overflow-hidden sm:rounded-2xl shadow-md bg-gray-100">
            <img 
              src={activeImage} 
              alt={room.name} 
              className="w-full h-full object-cover transition-all duration-500" 
            />
            
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm border border-gray-200/30 px-4 py-1.5 rounded-full text-xs font-serif font-bold text-luxury-navy uppercase tracking-widest">
              {room.category}
            </div>

            <button 
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/30 flex items-center justify-center text-gray-500 hover:text-rose-500 hover:scale-105 transition-all duration-200"
              title="Add to wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnails Row */}
          <div className="flex space-x-3 px-4 sm:px-0 overflow-x-auto pb-2 shrink-0">
            {(room.images || []).map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImage === img ? 'border-luxury-gold shadow' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DUAL COLUMN DETAILS & CUSTOMIZER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Customized options, amenities list, reviews, maps */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Header Description */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold">{room.view}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{room.size} sq ft</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{room.bedType}</span>
            </div>
            
            <h2 className="font-serif text-3xl font-bold text-luxury-navy leading-tight">{room.name}</h2>
            
            <div className="flex items-center space-x-2 pb-2">
              <div className="flex text-luxury-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4.5 w-4.5 shrink-0 ${i < Math.floor(room.rating) ? 'fill-luxury-gold' : ''}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-luxury-navy">{room.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({room.reviewsCount} reviews)</span>
            </div>

            <p className="text-gray-600 text-sm font-light leading-relaxed">
              {room.description}
            </p>
          </div>


          {/* ALL AMENITIES LIST */}
          <div className="space-y-5">
            <h3 className="font-serif text-lg font-bold text-luxury-navy uppercase tracking-wide">Amenities Listed</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(room.amenities || []).map((amenityId) => {
                const details = amenitiesList.find(a => a.id === amenityId || a.name === amenityId);
                return (
                  <div 
                    key={amenityId} 
                    className="p-4 border border-gray-100 rounded-xl bg-white flex items-center space-x-3 shadow-xs"
                  >
                    <div className="text-luxury-gold">
                      {renderAmenityIcon(amenityId, amenitiesList, "h-5 w-5")}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{details?.name || amenityId}</span>
                  </div>
                );
              })}
            </div>
          </div>
                  {/* FOOD PREFERENCES */}
          <div className="space-y-6 pt-6 border-t border-gray-200/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coffee className="h-5 w-5 text-luxury-gold" />
                <h3 className="font-serif text-lg font-bold text-luxury-navy">Meal Preferences</h3>
              </div>
            </div>
            <p className="text-gray-500 text-xs font-light">Choose your meal plan for each day of your stay. Billed per guest.</p>

            {/* Include / No Food toggle */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIncludeFood(false)}
                className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  !includeFood
                    ? 'border-gray-400 bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                🚫 No Food Needed
              </button>
              <button
                type="button"
                onClick={() => setIncludeFood(true)}
                className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  includeFood
                    ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy'
                    : 'border-gray-200 text-gray-400 hover:border-luxury-gold/50'
                }`}
              >
                🍽️ Include Food
              </button>
            </div>

            {/* Per-day panels */}
            {includeFood && dayFoodSelections.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                {/* Apply all shortcut – only when multi-day */}
                {nights > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={applyDay1ToAll}
                      className="text-[10px] font-bold text-luxury-gold underline underline-offset-2 hover:text-luxury-navy transition-colors cursor-pointer"
                    >
                      ↳ Apply Day 1 selection to all days
                    </button>
                  </div>
                )}

                {dayFoodSelections.map((day, dayIdx) => {
                  const bPkg = breakfastOptions.find(o => o.id === day.selectedBreakfastId) || breakfastOptions[0];
                  const lPkg = lunchOptions.find(o => o.id === day.selectedLunchId)         || lunchOptions[0];
                  const nPkg = dinnerOptions.find(o => o.id === day.selectedDinnerId)        || dinnerOptions[0];
                  
                  const selectedMealTypes = [];
                  if (day.includeBreakfast) selectedMealTypes.push(day.breakfastFoodType || 'veg');
                  if (day.includeLunch) selectedMealTypes.push(day.lunchFoodType || 'veg');
                  if (day.includeDinner) selectedMealTypes.push(day.dinnerFoodType || 'veg');
                  
                  const isAllVeg = selectedMealTypes.length === 0 || selectedMealTypes.every(t => t === 'veg');
                  const isAllNonVeg = selectedMealTypes.length > 0 && selectedMealTypes.every(t => t === 'non-veg');

                  const dayDate = (() => {
                    const d = new Date(checkIn);
                    d.setDate(d.getDate() + dayIdx);
                    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                  })();
                  const dayTotal = perDayFoodCosts[dayIdx] || 0;
                  const isOpen = expandedDayIdx === dayIdx;

                  return (
                    <div
                      key={dayIdx}
                      className={`rounded-2xl border-2 overflow-hidden transition-all ${
                        isOpen ? 'border-luxury-gold shadow-sm' : 'border-gray-200'
                      }`}
                    >
                      {/* Day header */}
                      <button
                        type="button"
                        onClick={() => setExpandedDayIdx(isOpen ? -1 : dayIdx)}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-white cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isOpen ? 'bg-luxury-gold text-white' : 'bg-gray-100 text-gray-500'
                          }`}>Day {dayIdx + 1}</span>
                          <span className="text-xs font-bold text-luxury-navy">{dayDate}</span>
                          {dayTotal > 0 && (
                            <span className="text-[10px] text-emerald-600 font-semibold">₹{dayTotal.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMealTypes.length > 0 && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isAllVeg ? 'bg-emerald-100 text-emerald-700' :
                              isAllNonVeg ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isAllVeg ? '🥦 Veg' : isAllNonVeg ? '🍗 Non-Veg' : '🍽️ Mixed'}
                            </span>
                          )}
                          <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-2 bg-gray-50/40 space-y-5 border-t border-gray-100">
                          {/* Meal cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                            {/* ── Breakfast ── */}
                            {(() => {
                              const isBfVeg = (day.breakfastFoodType || 'veg') === 'veg';
                              const combos = bPkg ? getCombosForPackage(bPkg, isBfVeg) : [];
                              return (
                                <div className={`p-3.5 rounded-xl border transition-all ${
                                  day.includeBreakfast ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200 bg-white'
                                }`}>
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-luxury-navy">🍳 Breakfast</span>
                                    {bPkg && <span className="text-[10px] font-mono text-luxury-gold">₹{bPkg.price}/guest</span>}
                                  </div>
                                  
                                  {/* Veg / Non-Veg toggle for Breakfast */}
                                  <div className="flex space-x-1 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => handleMealFoodType(dayIdx, 'breakfast', 'veg')}
                                      className={`flex-1 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                        isBfVeg ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-400 hover:border-emerald-300'
                                      }`}
                                    >🥦 Veg</button>
                                    <button
                                      type="button"
                                      onClick={() => handleMealFoodType(dayIdx, 'breakfast', 'non-veg')}
                                      className={`flex-1 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                        !isBfVeg ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-gray-200 text-gray-400 hover:border-rose-300'
                                      }`}
                                    >🍗 Non-Veg</button>
                                  </div>

                                  {/* Don't want / Include buttons */}
                                  <div className="flex space-x-1.5 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => updateDayFood(dayIdx, 'includeBreakfast', false)}
                                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                                        !day.includeBreakfast ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400'
                                      }`}
                                    >Don't Want</button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!day.selectedBreakfastId && breakfastOptions[0]) handleBreakfastPkgChange(dayIdx, breakfastOptions[0].id);
                                        updateDayFood(dayIdx, 'includeBreakfast', true);
                                      }}
                                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                                        day.includeBreakfast ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-gray-200 text-gray-400'
                                      }`}
                                    >Include</button>
                                  </div>
                                  {/* Combos */}
                                  {day.includeBreakfast && bPkg && (
                                    <div className="mt-2.5 space-y-1.5">
                                      {breakfastOptions.length > 1 && (
                                        <select
                                          value={day.selectedBreakfastId}
                                          onChange={e => handleBreakfastPkgChange(dayIdx, e.target.value)}
                                          className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[10px] focus:outline-none focus:border-luxury-gold"
                                        >
                                          {breakfastOptions.map(o => <option key={o.id} value={o.id}>{o.name} (₹{o.price})</option>)}
                                        </select>
                                      )}
                                      <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Choose Combo</p>
                                      {combos.map((combo, ci) => (
                                        <button
                                          key={ci}
                                          type="button"
                                          onClick={() => updateDayFood(dayIdx, 'selectedBreakfast', combo)}
                                          className={`w-full text-left px-2 py-1.5 rounded-lg border text-[9px] font-semibold transition-all ${
                                            day.selectedBreakfast === combo
                                              ? isBfVeg ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-rose-400 bg-rose-50 text-rose-800'
                                              : 'border-gray-200 text-gray-600 bg-white hover:border-luxury-gold'
                                          }`}
                                        >
                                          <span className="text-[7px] text-gray-400 mr-1">C{ci+1}:</span>{combo}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* ── Lunch ── */}
                            {(() => {
                              const isLnHad = (day.lunchFoodType || 'veg') === 'veg';
                              const combos = lPkg ? getCombosForPackage(lPkg, isLnHad) : [];
                              return (
                                <div className={`p-3.5 rounded-xl border transition-all ${
                                  day.includeLunch ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200 bg-white'
                                }`}>
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-luxury-navy">🍛 Lunch</span>
                                    {lPkg && <span className="text-[10px] font-mono text-luxury-gold">₹{lPkg.price}/guest</span>}
                                  </div>

                                  {/* Veg / Non-Veg toggle for Lunch */}
                                  <div className="flex space-x-1 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => handleMealFoodType(dayIdx, 'lunch', 'veg')}
                                      className={`flex-1 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                        isLnHad ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-400 hover:border-emerald-300'
                                      }`}
                                    >🥦 Veg</button>
                                    <button
                                      type="button"
                                      onClick={() => handleMealFoodType(dayIdx, 'lunch', 'non-veg')}
                                      className={`flex-1 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                        !isLnHad ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-gray-200 text-gray-400 hover:border-rose-300'
                                      }`}
                                    >🍗 Non-Veg</button>
                                  </div>

                                  <div className="flex space-x-1.5 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => updateDayFood(dayIdx, 'includeLunch', false)}
                                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                                        !day.includeLunch ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400'
                                      }`}
                                    >Don't Want</button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!day.selectedLunchId && lunchOptions[0]) handleLunchPkgChange(dayIdx, lunchOptions[0].id);
                                        updateDayFood(dayIdx, 'includeLunch', true);
                                      }}
                                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                                        day.includeLunch ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-gray-200 text-gray-400'
                                      }`}
                                    >Include</button>
                                  </div>
                                  {day.includeLunch && lPkg && (
                                    <div className="mt-2.5 space-y-1.5">
                                      {lunchOptions.length > 1 && (
                                        <select
                                          value={day.selectedLunchId}
                                          onChange={e => handleLunchPkgChange(dayIdx, e.target.value)}
                                          className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[10px] focus:outline-none focus:border-luxury-gold"
                                        >
                                          {lunchOptions.map(o => <option key={o.id} value={o.id}>{o.name} (₹{o.price})</option>)}
                                        </select>
                                      )}
                                      <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Choose Combo</p>
                                      {combos.map((combo, ci) => (
                                        <button
                                          key={ci}
                                          type="button"
                                          onClick={() => updateDayFood(dayIdx, 'selectedLunch', combo)}
                                          className={`w-full text-left px-2 py-1.5 rounded-lg border text-[9px] font-semibold transition-all ${
                                            day.selectedLunch === combo
                                              ? isLnHad ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-rose-400 bg-rose-50 text-rose-800'
                                              : 'border-gray-200 text-gray-600 bg-white hover:border-luxury-gold'
                                          }`}
                                        >
                                          <span className="text-[7px] text-gray-400 mr-1">C{ci+1}:</span>{combo}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* ── Dinner ── */}
                            {(() => {
                              const isDnHad = (day.dinnerFoodType || 'veg') === 'veg';
                              const combos = nPkg ? getCombosForPackage(nPkg, isDnHad) : [];
                              return (
                                <div className={`p-3.5 rounded-xl border transition-all ${
                                  day.includeDinner ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200 bg-white'
                                }`}>
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-luxury-navy">🌙 Dinner</span>
                                    {nPkg && <span className="text-[10px] font-mono text-luxury-gold">₹{nPkg.price}/guest</span>}
                                  </div>

                                  {/* Veg / Non-Veg toggle for Dinner */}
                                  <div className="flex space-x-1 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => handleMealFoodType(dayIdx, 'dinner', 'veg')}
                                      className={`flex-1 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                        isDnHad ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-400 hover:border-emerald-300'
                                      }`}
                                    >🥦 Veg</button>
                                    <button
                                      type="button"
                                      onClick={() => handleMealFoodType(dayIdx, 'dinner', 'non-veg')}
                                      className={`flex-1 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                        !isDnHad ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-gray-200 text-gray-400 hover:border-rose-300'
                                      }`}
                                    >🍗 Non-Veg</button>
                                  </div>

                                  <div className="flex space-x-1.5 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => updateDayFood(dayIdx, 'includeDinner', false)}
                                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                                        !day.includeDinner ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400'
                                      }`}
                                    >Don't Want</button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!day.selectedDinnerId && dinnerOptions[0]) handleDinnerPkgChange(dayIdx, dinnerOptions[0].id);
                                        updateDayFood(dayIdx, 'includeDinner', true);
                                      }}
                                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                                        day.includeDinner ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy' : 'border-gray-200 text-gray-400'
                                      }`}
                                    >Include</button>
                                  </div>
                                  {day.includeDinner && nPkg && (
                                    <div className="mt-2.5 space-y-1.5">
                                      {dinnerOptions.length > 1 && (
                                        <select
                                          value={day.selectedDinnerId}
                                          onChange={e => handleDinnerPkgChange(dayIdx, e.target.value)}
                                          className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[10px] focus:outline-none focus:border-luxury-gold"
                                        >
                                          {dinnerOptions.map(o => <option key={o.id} value={o.id}>{o.name} (₹{o.price})</option>)}
                                        </select>
                                      )}
                                      <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Choose Combo</p>
                                      {combos.map((combo, ci) => (
                                        <button
                                          key={ci}
                                          type="button"
                                          onClick={() => updateDayFood(dayIdx, 'selectedDinner', combo)}
                                          className={`w-full text-left px-2 py-1.5 rounded-lg border text-[9px] font-semibold transition-all ${
                                            day.selectedDinner === combo
                                              ? isDnHad ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-rose-400 bg-rose-50 text-rose-800'
                                              : 'border-gray-200 text-gray-600 bg-white hover:border-luxury-gold'
                                          }`}
                                        >
                                          <span className="text-[7px] text-gray-400 mr-1">C{ci+1}:</span>{combo}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIGHTSEEING CONFIGURATION */}
          <div className="space-y-6 pt-6 border-t border-gray-200/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="h-5 w-5 text-luxury-gold" />
                <h3 className="font-serif text-lg font-bold text-luxury-navy">Kerala Sightseeing Excursions</h3>
              </div>
              
              <label className="flex items-center space-x-2 text-xs font-bold text-luxury-navy cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={includeSightseeing}
                  onChange={() => setIncludeSightseeing(!includeSightseeing)}
                  className="rounded text-primary-500 focus:ring-primary-500 h-5 w-5 border-gray-300"
                />
                <span>Include Sightseeing</span>
              </label>
            </div>
            <p className="text-gray-500 text-xs font-light mt-1">
              Select if you would like to explore local Kerala attractions. Customize your transport style and destinations below.
            </p>

            {includeSightseeing && (
              <div className="p-6 bg-white border border-gray-200/30 rounded-2xl shadow-xs space-y-4 animate-fade-in admin-card-hover">
                <label className="block text-xs uppercase tracking-wider font-bold text-luxury-navy">Choose Your Jeep Tour Package</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sightseeingPackages.map((pkg) => {
                    const active = selectedSightseeingPackageId === pkg.id;
                    
                    // Determine price for this season
                    let activePrice = Number(pkg.priceStandard) || Number(pkg.price) || 0;
                    let seasonLabel = "Standard Rate";
                    let seasonBadgeColor = "bg-gray-100 text-gray-700";
                    
                    if (seasonalMultiplier === 0.9) {
                      activePrice = Number(pkg.priceLow) || Math.round(activePrice * 0.9);
                      seasonLabel = "Low Season Discount";
                      seasonBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    } else if (seasonalMultiplier === 1.15) {
                      activePrice = Number(pkg.pricePeak) || Math.round(activePrice * 1.15);
                      seasonLabel = "Peak Season Rate";
                      seasonBadgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                    }
                    
                    return (
                      <div 
                        key={pkg.id}
                        onClick={() => setSelectedSightseeingPackageId(pkg.id)}
                        className={`rounded-2xl overflow-hidden border-2 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                          active 
                            ? 'border-luxury-gold bg-luxury-gold/5 shadow-xs scale-[1.01]' 
                            : 'border-gray-200 bg-white hover:border-luxury-gold/55'
                        }`}
                      >
                        <div>
                          {pkg.image && (
                            <div className="h-44 overflow-hidden relative bg-gray-50/50">
                              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-contain" />
                              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                                🚙 4x4 Jeep Included
                              </div>
                            </div>
                          )}
                          <div className="p-5 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-serif font-bold text-luxury-navy">{pkg.name}</h4>
                              <span className={`text-[8px] font-bold border uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${seasonBadgeColor}`}>
                                {seasonLabel}
                              </span>
                            </div>
                            
                            {pkg.description && (
                              <p className="text-[11px] text-gray-550 font-light leading-relaxed">{pkg.description}</p>
                            )}

                            {pkg.places && (() => {
                              let placeImgsObj = {};
                              try {
                                placeImgsObj = typeof pkg.placeImages === 'string' ? JSON.parse(pkg.placeImages || '{}') : (pkg.placeImages || {});
                              } catch (e) {
                                placeImgsObj = {};
                              }
                              return (
                                <div className="space-y-1.5 pt-2">
                                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Included places ({pkg.places.split(',').length}):</p>
                                  <div className="flex flex-wrap gap-2">
                                    {pkg.places.split(',').map((place, pIdx) => {
                                      const cleanName = place.trim();
                                      const imgUrl = placeImgsObj[cleanName];
                                      return (
                                        <div key={pIdx} className="flex items-center space-x-1.5 bg-luxury-gold/10 text-luxury-navy font-semibold px-2 py-1 rounded-lg border border-luxury-gold/15 text-[10px]">
                                          {imgUrl ? (
                                            <img src={imgUrl} alt={cleanName} className="w-5 h-5 object-cover rounded-md border border-luxury-gold/20 shrink-0" />
                                          ) : (
                                            <span>📍</span>
                                          )}
                                          <span>{cleanName}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div className="p-5 pt-0 border-t border-gray-50 mt-3 flex justify-between items-center bg-gray-50/20">
                          <div className="flex items-baseline space-x-1 pt-3">
                            <span className="text-lg font-serif font-bold text-luxury-gold">₹{activePrice.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-gray-450 font-light">flat rate</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider pt-3 ${active ? 'text-luxury-navy' : 'text-gray-400'}`}>
                            {active ? '✓ Selected' : 'Select Package'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* GUEST REVIEWS */}
          <div className="space-y-6 pt-6 border-t border-gray-200/30">
            <h3 className="font-serif text-lg font-bold text-luxury-navy uppercase tracking-wide">Resident Reviews</h3>
            {roomReviews.length === 0 ? (
              <p className="text-gray-405 text-xs font-light italic">No direct reviews registered yet for this room type. Our residents report exceptional comfort.</p>
            ) : (
              <div className="space-y-4">
                {roomReviews.map((rev) => (
                  <div key={rev.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <img src={rev.avatar} alt={rev.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <h5 className="text-xs font-bold text-luxury-navy">{rev.name}</h5>
                          <span className="text-[9px] text-gray-400 font-mono">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex text-luxury-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 shrink-0 ${i < Math.floor(rev.rating) ? 'fill-luxury-gold' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs font-light mt-3 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GOOGLE MAPS IFRAME EMBED */}
          <div className="space-y-5 pt-6 border-t border-gray-200/30">
            <h3 className="font-serif text-lg font-bold text-luxury-navy uppercase tracking-wide">Resort Location</h3>
            <div className="flex items-start space-x-2.5 text-xs text-gray-500">
              <MapPin className="h-4.5 w-4.5 text-luxury-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-luxury-navy">{resortDetails.location}</p>
                <p className="font-light mt-0.5">{resortDetails.address}</p>
              </div>
            </div>
            
            {/* Real Google Maps responsive iframe */}
            <div className="rounded-2xl overflow-hidden border border-gray-200/30 shadow-sm h-72 admin-card-hover">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.1322238461943!2d76.42159637587787!3d9.505086890577532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087df8646b9a89%3A0xb3ba1a166cb3f9cf!2sKumarakom%20Backwaters!5e0!3m2!1sen!2sin!4v1716200000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Kumarakom Backwaters Location Map"
              ></iframe>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY DYNAMIC CHECKOUT PRICING SUMMARY */}
        <div id="booking-card-anchor" className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/30 p-6 shadow-md space-y-5 admin-card-hover">
            
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">Nightly rate</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="font-serif font-bold text-3xl text-luxury-navy">₹{getRoomPriceForActiveSeason(room, seasonalMultiplier).toLocaleString('en-IN')}</span>
                <span className="text-xs text-gray-550 font-light">/ night</span>
              </div>
            </div>

            {/* Check availability inputs */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Check-In</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs font-bold text-luxury-navy focus:outline-none bg-transparent pt-0.5 border-0 focus:ring-0 cursor-pointer"
                    required
                  />
                </div>
                <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Check-Out</label>
                  <input
                    type="date"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs font-bold text-luxury-navy focus:outline-none bg-transparent pt-0.5 border-0 focus:ring-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Adults</label>
                  <select 
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value))}
                    className="w-full text-xs font-bold text-luxury-navy focus:outline-none bg-transparent pt-0.5 border-0 cursor-pointer"
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Children</label>
                  <select 
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value))}
                    className="w-full text-xs font-bold text-luxury-navy focus:outline-none bg-transparent pt-0.5 border-0 cursor-pointer"
                  >
                    {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Rooms</label>
                  <select 
                    value={rooms}
                    onChange={(e) => setRooms(parseInt(e.target.value))}
                    className="w-full text-xs font-bold text-luxury-navy focus:outline-none bg-transparent pt-0.5 border-0 cursor-pointer"
                  >
                    {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {/* Selected Dates Status timeline inside Details form */}
              {checkIn && checkOut && new Date(checkIn) < new Date(checkOut) && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Date-by-Date Availability</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNightsAvailability.map((night) => (
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

              <div className="pt-4 border-t border-gray-100 space-y-2.5">
                <div className="flex justify-between text-xs text-gray-550">
                  <span>Room Cost (₹{getRoomPriceForActiveSeason(room, seasonalMultiplier).toLocaleString('en-IN')} x {nights} nights)</span>
                  <span className="font-semibold text-luxury-navy">₹{pricingSummary.roomCost.toLocaleString('en-IN')}</span>
                </div>
                
                {includeFood && pricingSummary.foodCost > 0 && dayFoodSelections.map((day, di) => {
                  const dc = perDayFoodCosts[di] || 0;
                  if (dc === 0) return null;
                  const meals = [];
                  const bPkg = breakfastOptions.find(o => o.id === day.selectedBreakfastId);
                  const lPkg = lunchOptions.find(o => o.id === day.selectedLunchId);
                  const nPkg = dinnerOptions.find(o => o.id === day.selectedDinnerId);
                  if (day.includeBreakfast && bPkg) meals.push(`Breakfast (${(day.breakfastFoodType || 'veg') === 'veg' ? 'Veg' : 'Non-Veg'})`);
                  if (day.includeLunch     && lPkg) meals.push(`Lunch (${(day.lunchFoodType || 'veg') === 'veg' ? 'Veg' : 'Non-Veg'})`);
                  if (day.includeDinner    && nPkg) meals.push(`Dinner (${(day.dinnerFoodType || 'veg') === 'veg' ? 'Veg' : 'Non-Veg'})`);
                  const dayDate = (() => {
                    const d = new Date(checkIn);
                    d.setDate(d.getDate() + di);
                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  })();
                  return (
                    <div key={di} className="flex justify-between text-xs text-gray-550">
                      <div>
                        <span className="block font-medium">Day {di + 1} Meals ({dayDate})</span>
                        <span className="text-[10px] text-gray-400">{meals.join(' + ')}</span>
                      </div>
                      <span className="font-semibold text-luxury-navy">₹{dc.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}

                {pricingSummary.sightseeingCost > 0 && (
                  <div className="flex justify-between text-xs text-gray-550">
                    <div>
                      <span className="block font-medium">Jeep Tour: {activePackage?.name || 'Sightseeing'}</span>
                      <span className="text-[10px] text-gray-400">4x4 Jeep & Driver included</span>
                    </div>
                    <span className="font-semibold text-luxury-navy">₹{pricingSummary.sightseeingCost.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-550 pt-1">
                  <span>Luxury Hotel Tax ({gstRate}% GST)</span>
                  <span className="font-semibold text-luxury-navy">₹{pricingSummary.luxuryTax.toLocaleString('en-IN')}</span>
                </div>

                {pricingSummary.discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1.5 mt-1.5">
                    <span className="flex items-center space-x-1">
                      <span>🏷️</span>
                      <span>Discount Applied</span>
                    </span>
                    <span>-₹{pricingSummary.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-luxury-navy pt-3 border-t border-gray-200/30">
                  <span>Total Amount</span>
                  <span className="font-serif text-lg text-luxury-gold">₹{pricingSummary.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {isDatesOccupied && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2 font-medium animate-fade-in">
                  <span className="text-sm">⚠️</span>
                  <div>
                    <p className="font-bold">Dates Already Booked</p>
                    <p className="text-[10px] text-rose-600 font-normal mt-0.5">
                      The following selected dates are already reserved for this room:
                      <strong className="block mt-1 text-rose-750 font-extrabold uppercase">
                        {selectedNightsAvailability.filter(n => n.isBooked).map(n => n.formattedDate).join(', ')}
                      </strong>
                      Please adjust your check-in or check-out date.
                    </p>
                  </div>
                </div>
              )}

              {/* Request Booking Action Button */}
              <button
                type="submit"
                disabled={isDatesOccupied}
                className={`w-full font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-xl shadow-md transition-all duration-200 border ${
                  isDatesOccupied
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-primary-500 hover:bg-primary-600 text-white border-primary-600 hover:shadow-lg'
                }`}
              >
                {isDatesOccupied ? 'Dates Unavailable' : 'Proceed to Checkout'}
              </button>

            </form>

            <div className="flex items-start space-x-2 pt-2 text-[10px] text-gray-400">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <p className="leading-tight">A request email will be sent to the owner with guest details. No charges are applied until owner confirmation.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
