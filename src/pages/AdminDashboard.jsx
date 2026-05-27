import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, BedDouble, IndianRupee,
  FileSpreadsheet, Star, Image, Check, X, XCircle,
  Users, Plus, Upload, Trash2, ShieldAlert, Info,
  Printer, LogOut, ChevronRight, Edit2, MapPin, Package,
  UtensilsCrossed, Compass, Car, Percent, QrCode, Eye, EyeOff, FileText
} from 'lucide-react';
import { foodPackages as initialFoodPackages, sightseeingPackages as initialSightseeing } from '../data/resortData';
import api from '../services/api';
import { getRoomPriceForActiveSeason } from '../services/pricing';

// ─── Small helper: star row ──────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < rating ? 'fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

// ─── Inline edit form for food packages ─────────────────────────────────────
function EditFoodForm({ pkg, onSave, onCancel }) {
  const [f, setF] = useState({
    name: pkg.name,
    price: pkg.price,
    type: pkg.type || 'breakfast',
    description: pkg.description || '',
    veg1: pkg.veg1 || '', veg2: pkg.veg2 || '', veg3: pkg.veg3 || '',
    nv1:  pkg.nv1  || '', nv2:  pkg.nv2  || '', nv3:  pkg.nv3  || '',
  });

  return (
    <div className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Meal Name</label>
          <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="Standard Breakfast" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Meal Type</label>
          <select value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Price (₹)</label>
          <input type="number" value={f.price} onChange={e => setF(p => ({ ...p, price: e.target.value }))} placeholder="Price ₹" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Description</label>
          <input value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-3">
        <p className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Meal Combos</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-emerald-600 uppercase">🥦 Veg — 3 Combos</p>
            <input value={f.veg1} onChange={e => setF(p => ({ ...p, veg1: e.target.value }))} placeholder="Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
            <input value={f.veg2} onChange={e => setF(p => ({ ...p, veg2: e.target.value }))} placeholder="Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
            <input value={f.veg3} onChange={e => setF(p => ({ ...p, veg3: e.target.value }))} placeholder="Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-rose-500 uppercase">🍗 Non-Veg — 3 Combos</p>
            <input value={f.nv1} onChange={e => setF(p => ({ ...p, nv1: e.target.value }))} placeholder="Non-Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
            <input value={f.nv2} onChange={e => setF(p => ({ ...p, nv2: e.target.value }))} placeholder="Non-Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
            <input value={f.nv3} onChange={e => setF(p => ({ ...p, nv3: e.target.value }))} placeholder="Non-Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
          </div>
        </div>
      </div>

      <div className="flex space-x-2 pt-1">
        <button onClick={() => onSave(pkg.id, f)} className="bg-luxury-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg">Save</button>
        <button onClick={onCancel} className="text-xs text-gray-500 underline">Cancel</button>
      </div>
    </div>
  );
}

// ─── Inline edit form for sightseeing (Jeep Tour Packages) ──────────────────
function EditSightseeingForm({ tour, onSave, onCancel }) {
  const [f, setF] = useState({
    name: tour.name || '',
    description: tour.description || '',
    places: tour.places || '',
    image: tour.image || '',
    priceStandard: tour.priceStandard || 0,
    priceLow: tour.priceLow || 0,
    pricePeak: tour.pricePeak || 0
  });

  const initialPlaceImages = (() => {
    if (typeof tour.placeImages === 'string') {
      try { return JSON.parse(tour.placeImages || '{}'); } catch(e) { return {}; }
    }
    return tour.placeImages || {};
  })();
  const [placeImages, setPlaceImages] = useState(initialPlaceImages);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setF(p => ({ ...p, image: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const placesList = f.places.split(',').map(p => p.trim()).filter(Boolean);

  const handlePlaceImageChange = (place, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPlaceImages(prev => ({
          ...prev,
          [place]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePlaceImage = (place) => {
    setPlaceImages(prev => {
      const copy = { ...prev };
      delete copy[place];
      return copy;
    });
  };

  return (
    <div className="space-y-3 text-left">
      <div>
        <label className="text-[10px] uppercase font-bold text-gray-400">Package Name</label>
        <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="Tour name" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
      </div>
      <div>
        <label className="text-[10px] uppercase font-bold text-gray-400">Description</label>
        <textarea value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows="2" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
      </div>
      <div>
        <label className="text-[10px] uppercase font-bold text-gray-400">Places (comma-separated)</label>
        <input value={f.places} onChange={e => setF(p => ({ ...p, places: e.target.value }))} placeholder="e.g. Tea Gardens, Echo Point, Mattupetty Dam" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
      </div>
      
      {/* Place Photos Uploader */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-gray-400 block">Place Photos</label>
        {placesList.length === 0 ? (
          <p className="text-[10px] text-gray-400 italic">Enter places above to upload photos for them.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-150">
            {placesList.map(place => (
              <div key={place} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200">
                {placeImages[place] ? (
                  <div className="relative h-10 w-10 rounded overflow-hidden shrink-0 group">
                    <img src={placeImages[place]} alt={place} className="h-full w-full object-contain bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => handleRemovePlaceImage(place)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] transition-opacity duration-150 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center shrink-0 text-xs">
                    📍
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-luxury-navy truncate">{place}</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePlaceImageChange(place, e)}
                    className="block w-full text-[9px] text-gray-500 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[8px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Standard Price (₹)</label>
          <input type="number" value={f.priceStandard} onChange={e => setF(p => ({ ...p, priceStandard: e.target.value }))} placeholder="Standard Price ₹" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Low Price (₹)</label>
          <input type="number" value={f.priceLow} onChange={e => setF(p => ({ ...p, priceLow: e.target.value }))} placeholder="Low Price ₹" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400">Peak Price (₹)</label>
          <input type="number" value={f.pricePeak} onChange={e => setF(p => ({ ...p, pricePeak: e.target.value }))} placeholder="Peak Price ₹" className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Package Image</label>
        {f.image && (
          <img src={f.image} alt="Preview" className="h-32 w-full object-contain bg-gray-50 rounded-lg border" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-550 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer" />
      </div>

      <div className="flex space-x-2 pt-1">
        <button onClick={() => onSave(tour.id, { ...f, placeImages: JSON.stringify(placeImages) })} className="bg-luxury-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-luxury-navy/80 cursor-pointer">Save</button>
        <button onClick={onCancel} className="text-xs text-gray-550 underline cursor-pointer">Cancel</button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboard({
  rooms,
  setRooms,
  bookings,
  setBookings,
  reviews,
  setReviews,
  setView,
  foodPackages,
  setFoodPackages,
  sightseeingPackages,
  setSightseeingPackages,

  galleryImages,
  setGalleryImages,
  seasonalMultiplier,
  setSeasonalMultiplier,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  amenities,
  setAmenities,
  landingPageBackground,
  setLandingPageBackground,
  discountEnabled,
  setDiscountEnabled,
  activeDiscountType,
  setActiveDiscountType,
  discountLow,
  setDiscountLow,
  discountStandard,
  setDiscountStandard,
  discountPeak,
  setDiscountPeak,
  qrScanners = [],
  setQrScanners,
  gstRate,
  setGstRate
}) {

  const [activeTab, setActiveTab] = useState('overview');
  const [localGstRate, setLocalGstRate] = useState(gstRate);

  useEffect(() => {
    setLocalGstRate(gstRate);
  }, [gstRate]);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [bookingSearchId, setBookingSearchId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const monthlyStats = useMemo(() => {
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
    const totalRooms = Math.max(rooms.length, 1);

    const getWeekStats = (startDay, endDay) => {
      const startRange = new Date(year, selectedMonth, startDay);
      const endRange = new Date(year, selectedMonth, endDay, 23, 59, 59);
      const daysInWeek = endDay - startDay + 1;
      const totalAvailableRoomNights = daysInWeek * totalRooms;

      let nightsBooked = 0;
      let revenue = 0;

      bookings.forEach(b => {
        if (b.status !== 'Confirmed' && b.status !== 'Checked Out') return;
        
        // Revenue: attribute to check-in date
        const checkInDate = new Date(b.checkIn);
        if (checkInDate >= startRange && checkInDate <= endRange) {
          revenue += b.totalAmount;
        }

        // Occupancy: count overlapping days
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        
        const overlapStart = new Date(Math.max(checkIn.getTime(), startRange.getTime()));
        const overlapEnd = new Date(Math.min(checkOut.getTime(), endRange.getTime()));
        
        if (overlapStart < overlapEnd) {
          const diffTime = Math.abs(overlapEnd - overlapStart);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          nightsBooked += diffDays;
        }
      });

      const occupancy = Math.min(100, Math.round((nightsBooked / totalAvailableRoomNights) * 100));
      return { occupancy, revenue };
    };

    const w1 = getWeekStats(1, 7);
    const w2 = getWeekStats(8, 14);
    const w3 = getWeekStats(15, 21);
    const w4 = getWeekStats(22, daysInMonth);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthName = monthNames[selectedMonth] || '';

    return [
      { label: `Week 1 (${currentMonthName} 1–7)`, occupancy: w1.occupancy, revenue: w1.revenue },
      { label: `Week 2 (${currentMonthName} 8–14)`, occupancy: w2.occupancy, revenue: w2.revenue },
      { label: `Week 3 (${currentMonthName} 15–21)`, occupancy: w3.occupancy, revenue: w3.revenue },
      { label: `Week 4 (${currentMonthName} 22–${daysInMonth})`, occupancy: w4.occupancy, revenue: w4.revenue },
    ];
  }, [bookings, rooms, selectedMonth]);

  useEffect(() => {
    if (activeTab === 'members') {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
          const data = await api.getAll('Customers');
          setMembers(data || []);
        } catch (e) {
          console.error("Failed to load customers:", e);
        } finally {
          setLoadingMembers(false);
        }
      };
      fetchMembers();
    }
  }, [activeTab]);

  // Bill Editor Modal States
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);
  const [billFormData, setBillFormData] = useState({
    roomRate: 0,
    nights: 1,
    rooms: 1,
    roomCost: 0,
    foodCost: 0,
    sightseeingCost: 0,
    discount: 0,
    extras: [], // array of { name: '', price: 0 }
    subtotal: 0,
    luxuryTax: 0,
    total: 0
  });
  const [isSavingBill, setIsSavingBill] = useState(false);
  const [newExtra, setNewExtra] = useState({ name: '', price: '' });

  // Serialization/deserialization helpers for ||BILL_JSON||
  const parseBookingBill = (specialRequestsStr) => {
    if (!specialRequestsStr) return null;
    const parts = String(specialRequestsStr).split('||BILL_JSON||');
    if (parts.length < 2) return null;
    try {
      return JSON.parse(parts[1].trim());
    } catch (e) {
      console.error('Failed to parse bill JSON in frontend:', e);
      return null;
    }
  };

  const getOriginalSpecialRequests = (specialRequestsStr) => {
    if (!specialRequestsStr) return '';
    return String(specialRequestsStr).split('||BILL_JSON||')[0].trim();
  };

  const openBillEditor = (b) => {
    setSelectedBookingForBill(b);
    const existingBill = parseBookingBill(b.specialRequests);
    
    // Calculate nights from checkIn/checkOut
    let calculatedNights = 1;
    try {
      const d1 = new Date(b.checkIn);
      const d2 = new Date(b.checkOut);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      calculatedNights = diffDays || 1;
    } catch (err) {
      calculatedNights = 1;
    }

    if (existingBill) {
      setBillFormData({
        roomRate: existingBill.roomRate || 0,
        nights: existingBill.nights || calculatedNights,
        rooms: existingBill.rooms || 1,
        roomCost: existingBill.roomCost || 0,
        foodCost: existingBill.foodCost || 0,
        sightseeingCost: existingBill.sightseeingCost || 0,
        discount: existingBill.discount || 0,
        extras: existingBill.extras || [],
        subtotal: existingBill.subtotal || 0,
        luxuryTax: existingBill.luxuryTax || 0,
        total: existingBill.total || 0
      });
    } else {
      // Calculate estimations based on room packages / dashboard values
      let prefilledFoodCost = 0;
      if (b.food && b.food !== 'None') {
        const foundPkg = (foodPackages || []).find(p => p.name.trim().toLowerCase() === b.food.trim().toLowerCase());
        if (foundPkg) prefilledFoodCost = Number(foundPkg.price) || 0;
      }
      
      let prefilledSightseeingCost = 0;
      if (b.sightseeing && b.sightseeing !== 'None') {
        const foundPkg = (sightseeingPackages || []).find(p => p.name.trim().toLowerCase() === b.sightseeing.trim().toLowerCase());
        if (foundPkg) prefilledSightseeingCost = Number(foundPkg.price) || 0;
      }

      const initialTotal = Number(b.totalAmount) || 0;
      const rateVal = b.gstRate ? Number(b.gstRate) : gstRate;
      const initialSubtotal = Math.round(initialTotal / (1 + rateVal / 100));
      
      // Attempt to calculate room cost as subtotal - foodCost - sightseeingCost
      const initialRoomCost = Math.max(0, initialSubtotal - prefilledFoodCost - prefilledSightseeingCost);
      const roomRateEst = Math.round(initialRoomCost / calculatedNights);

      setBillFormData({
        roomRate: roomRateEst,
        nights: calculatedNights,
        rooms: 1,
        roomCost: roomRateEst * calculatedNights,
        foodCost: prefilledFoodCost,
        sightseeingCost: prefilledSightseeingCost,
        discount: 0,
        extras: [],
        subtotal: initialSubtotal,
        luxuryTax: Math.round(initialSubtotal * (rateVal / 100)),
        total: initialTotal
      });
    }
    setNewExtra({ name: '', price: '' });
    setIsBillModalOpen(true);
  };

  const updateBillTotals = (updatedFields) => {
    setBillFormData(prev => {
      const merged = { ...prev, ...updatedFields };
      const roomCost = Number(merged.roomRate) * Number(merged.nights) * Number(merged.rooms);
      const foodCost = Number(merged.foodCost) || 0;
      const sightseeingCost = Number(merged.sightseeingCost) || 0;
      const extrasSum = (merged.extras || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      const discount = Number(merged.discount) || 0;
      
      const rateVal = selectedBookingForBill?.gstRate ? Number(selectedBookingForBill.gstRate) : gstRate;
      const subtotal = roomCost + foodCost + sightseeingCost + extrasSum - discount;
      const luxuryTax = Math.round(subtotal * (rateVal / 100));
      const total = subtotal + luxuryTax;
      
      return {
        ...merged,
        roomCost,
        subtotal,
        luxuryTax,
        total
      };
    });
  };

  const handleAddExtra = () => {
    if (!newExtra.name.trim() || !newExtra.price) return;
    const priceVal = Number(newExtra.price) || 0;
    const updatedExtras = [...billFormData.extras, { name: newExtra.name.trim(), price: priceVal }];
    updateBillTotals({ extras: updatedExtras });
    setNewExtra({ name: '', price: '' });
  };

  const handleRemoveExtra = (index) => {
    const updatedExtras = billFormData.extras.filter((_, i) => i !== index);
    updateBillTotals({ extras: updatedExtras });
  };

  const handleSaveAndSendBill = async () => {
    if (!selectedBookingForBill) return;
    setIsSavingBill(true);
    try {
      const originalText = getOriginalSpecialRequests(selectedBookingForBill.specialRequests);
      const updatedSpecialRequests = (originalText ? originalText + ' ' : '') + '||BILL_JSON||' + JSON.stringify(billFormData);
      
      // 1. Save changes to DB (PUT request to update specialRequests and totalAmount)
      const updateData = {
        ...selectedBookingForBill,
        specialRequests: updatedSpecialRequests,
        totalAmount: billFormData.total
      };
      
      const updated = await api.update('bookings', selectedBookingForBill.id, updateData);
      
      // Update state local list
      setBookings(prev => prev.map(b => b.id === selectedBookingForBill.id ? { ...b, specialRequests: updatedSpecialRequests, totalAmount: billFormData.total } : b));
      
      // 2. Trigger send bill email
      await api.sendFinalBill(selectedBookingForBill.id);
      
      alert('Final Bill invoice successfully saved and email dispatched to the guest!');
      setIsBillModalOpen(false);
    } catch (err) {
      console.error('Failed to save & send bill:', err);
      alert('Failed to save and send bill. Please check console logs and try again.');
    } finally {
      setIsSavingBill(false);
    }
  };

  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const formatDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const calendarDays = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      const d = new Date(calendarStartDate);
      d.setDate(calendarStartDate.getDate() + i);
      return d;
    });
  }, [calendarStartDate]);

  // Rooms & Pricing
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [tempPrices, setTempPrices] = useState({ price: 0, priceLow: 0, pricePeak: 0 });

  // Amenities CRUD
  const [showAddAmenity, setShowAddAmenity] = useState(false);
  const [newAmenity, setNewAmenity] = useState({ id: '', name: '', icon: '' });
  const [editingAmenityId, setEditingAmenityId] = useState(null);
  const [editAmenityData, setEditAmenityData] = useState({ name: '', icon: '' });

  // Room amenities addition inline form
  const [roomAddingCustom, setRoomAddingCustom] = useState(null);
  const [newCustomAmenity, setNewCustomAmenity] = useState({ name: '', icon: '' });

  // Food Packages
  const foodList = foodPackages || [];
  const setFoodList = setFoodPackages;
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '', price: '', type: 'breakfast', description: '',
    veg1: '', veg2: '', veg3: '',
    nv1: '', nv2: '', nv3: ''
  });

  // Sightseeing
  const sightseeingList = sightseeingPackages || [];
  const setSightseeingList = setSightseeingPackages;
  const [editingSightseeingId, setEditingSightseeingId] = useState(null);
  const [showAddSightseeing, setShowAddSightseeing] = useState(false);
  const [newSightseeing, setNewSightseeing] = useState({
    name: '',
    description: '',
    places: '',
    image: '',
    priceStandard: '',
    priceLow: '',
    pricePeak: ''
  });
  const [newPlaceImages, setNewPlaceImages] = useState({});

  // Add Room States
  const [showAddRoom, setShowAddRoom] = useState(false);
  const EMPTY_ROOM = {
    name: '',
    category: 'Luxury Suite',
    bedType: '1 King Bed',
    view: 'Scenic View',
    size: '',
    description: '',
    price: '',
    priceLow: '',
    pricePeak: '',
    amenities: '',
  };
  const [newRoom, setNewRoom] = useState(EMPTY_ROOM);
  const [newRoomImages, setNewRoomImages] = useState([]);

  // Place photo helpers
  const handleNewPlaceImageChange = (place, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPlaceImages(prev => ({
          ...prev,
          [place]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewPlaceImage = (place) => {
    setNewPlaceImages(prev => {
      const copy = { ...prev };
      delete copy[place];
      return copy;
    });
  };



  // Login states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('login'); // 'login' | 'forgot' | 'otp' | 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // QR Scanners
  const [showAddQR, setShowAddQR] = useState(false);
  const [newQR, setNewQR] = useState({ name: '', upiId: '', qrImage: '', isActive: true });
  const [editingQRId, setEditingQRId] = useState(null);
  const [editQRData, setEditQRData] = useState({ name: '', upiId: '', qrImage: '', isActive: true });

  // Discount temporary states
  const [tempDiscountLow, setTempDiscountLow] = useState(discountLow);
  const [tempDiscountStandard, setTempDiscountStandard] = useState(discountStandard);
  const [tempDiscountPeak, setTempDiscountPeak] = useState(discountPeak);

  React.useEffect(() => {
    setTempDiscountLow(discountLow);
  }, [discountLow]);

  React.useEffect(() => {
    setTempDiscountStandard(discountStandard);
  }, [discountStandard]);

  React.useEffect(() => {
    setTempDiscountPeak(discountPeak);
  }, [discountPeak]);

  const handleToggleGlobalDiscount = async () => {
    const nextVal = !discountEnabled;
    setDiscountEnabled(nextVal);
    try {
      await api.update('Discounts', 'discountEnabled', { key: 'discountEnabled', value: String(nextVal) });
    } catch (e) {
      console.error('Failed to update discountEnabled settings:', e);
    }
  };

  const handleUpdateActiveDiscountType = async (type) => {
    setActiveDiscountType(type);
    try {
      await api.update('Discounts', 'activeDiscountType', { key: 'activeDiscountType', value: type });
    } catch (e) {
      console.error('Failed to update activeDiscountType settings:', e);
    }
  };

  const handleSaveDiscountRates = async () => {
    const lowVal = Number(tempDiscountLow) || 0;
    const stdVal = Number(tempDiscountStandard) || 0;
    const peakVal = Number(tempDiscountPeak) || 0;

    setDiscountLow(lowVal);
    setDiscountStandard(stdVal);
    setDiscountPeak(peakVal);

    try {
      await Promise.all([
        api.update('Discounts', 'discountLow', { key: 'discountLow', value: String(lowVal) }),
        api.update('Discounts', 'discountStandard', { key: 'discountStandard', value: String(stdVal) }),
        api.update('Discounts', 'discountPeak', { key: 'discountPeak', value: String(peakVal) })
      ]);
      alert('🏷️ Seasonal discount rates saved successfully!');
    } catch (e) {
      console.error('Failed to save discount rates to settings:', e);
      alert('Error saving discount rates. Please try again.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);
    try {
      await api.login(loginUsername, loginPassword);
      setIsAdminAuthenticated(true);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setResetMessage('');
    setIsSubmittingLogin(true);
    try {
      await api.forgotPassword(resetEmail);
      setLoginMode('otp');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Failed to send OTP. Please verify the email and try again.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setResetMessage('');
    setIsSubmittingLogin(true);
    try {
      const res = await api.verifyOtp(resetEmail, resetOtp);
      setNewUsername(res.current_username || '');
      setResetMessage(res.message || 'OTP verified!');
      setLoginMode('reset');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid OTP. Please check and try again.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setResetMessage('');

    if (!newUsername.trim()) {
      setLoginError('Username cannot be empty.');
      return;
    }
    if (newPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }

    setIsSubmittingLogin(true);
    try {
      const res = await api.resetPassword(resetEmail, newUsername, newPassword);
      alert('Admin credentials updated successfully!');
      setLoginUsername(resetEmail);
      setLoginPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setResetOtp('');
      setNewUsername('');
      setResetEmail('');
      setResetMessage('');
      setLoginMode('login');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Failed to update credentials. Please try again.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleUpdateSeasonalMultiplier = async (val) => {
    setSeasonalMultiplier(val);
    try {
      await api.update('settings', 'seasonalMultiplier', { key: 'seasonalMultiplier', value: String(val) });
    } catch (e) {
      console.error('Failed to update seasonal multiplier in settings:', e);
    }
  };

  const handleUpdateGstRate = async (val) => {
    const numericRate = parseFloat(val);
    if (isNaN(numericRate) || numericRate < 0 || numericRate > 100) {
      alert("Please enter a valid GST rate between 0 and 100.");
      return;
    }
    setGstRate(numericRate);
    try {
      await api.update('settings', 'gstRate', { key: 'gstRate', value: String(numericRate) });
      alert(`GST rate successfully updated to ${numericRate}%!`);
    } catch (e) {
      console.error('Failed to update GST rate in settings:', e);
      alert('Error saving GST rate update.');
    }
  };

  // All available amenities palette
  const amenityPalette = amenities || [];

  // ── Rooms handlers ──────────────────────────────────────────────────────────
  const handleEditPrice = (room) => {
    setEditingRoomId(room.id);
    setTempPrices({
      price: room.price || 0,
      priceLow: room.priceLow || Math.round((room.price || 0) * 0.9),
      pricePeak: room.pricePeak || Math.round((room.price || 0) * 1.15)
    });
  };
  const handleSavePrice = async (id) => {
    const price = parseInt(tempPrices.price) || 0;
    const priceLow = parseInt(tempPrices.priceLow) || 0;
    const pricePeak = parseInt(tempPrices.pricePeak) || 0;
    
    setRooms(prev => prev.map(r => r.id === id ? { ...r, price, priceLow, pricePeak } : r));
    setEditingRoomId(null);
    try {
      await api.update('Rooms', id, { price, priceLow, pricePeak });
    } catch(e) {
      console.error('Failed to save price:', e);
    }
  };
  const toggleRoomStatus = async (id) => {
    const room = rooms.find(r => r.id === id);
    const newStatus = !room?.isOccupied;
    setRooms(prev => prev.map(r => r.id === id ? { ...r, isOccupied: newStatus } : r));
    try { await api.update('Rooms', id, { isOccupied: newStatus }); } catch(e) { console.error('Failed to toggle room status:', e); }
  };

  const handleRoomImagesChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewRoomImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewRoomImage = (index) => {
    setNewRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.name || !newRoom.price) {
      alert('Please enter a room name and base price.');
      return;
    }
    
    const cleanId = 'room_' + Date.now();
    const priceVal = parseInt(newRoom.price) || 0;
    
    const roomPayload = {
      id: cleanId,
      name: newRoom.name,
      category: newRoom.category,
      bedType: newRoom.bedType,
      view: newRoom.view,
      size: parseInt(newRoom.size) || 0,
      description: newRoom.description,
      price: priceVal,
      priceLow: parseInt(newRoom.priceLow) || Math.round(priceVal * 0.9),
      pricePeak: parseInt(newRoom.pricePeak) || Math.round(priceVal * 1.15),
      rating: 5.0,
      reviewsCount: 0,
      isOccupied: 'FALSE',
      amenities: newRoom.amenities,
      images: JSON.stringify(newRoomImages)
    };
    
    try {
      const res = await api.create('Rooms', roomPayload);
      if (res && res.data) {
        let returnedImages = res.data.images;
        if (typeof returnedImages === 'string') {
          try { returnedImages = JSON.parse(returnedImages); } catch (e) {
            returnedImages = returnedImages ? returnedImages.split(',').map(s => s.trim()).filter(Boolean) : [];
          }
        }
        let returnedAmenities = res.data.amenities;
        if (typeof returnedAmenities === 'string') {
          returnedAmenities = returnedAmenities ? returnedAmenities.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
        
        const addedRoom = {
          ...res.data,
          price: Number(res.data.price) || 0,
          priceLow: Number(res.data.priceLow) || Math.round(Number(res.data.price) * 0.9),
          pricePeak: Number(res.data.pricePeak) || Math.round(Number(res.data.price) * 1.15),
          size: Number(res.data.size) || 0,
          rating: Number(res.data.rating) || 5.0,
          reviewsCount: Number(res.data.reviewsCount) || 0,
          isOccupied: String(res.data.isOccupied).toLowerCase() === 'true',
          images: returnedImages,
          amenities: returnedAmenities
        };
        
        setRooms(prev => [...prev, addedRoom]);
        alert('🎉 New room/villa added successfully!');
        setNewRoom(EMPTY_ROOM);
        setNewRoomImages([]);
        setShowAddRoom(false);
      }
    } catch (err) {
      console.error('Failed to create new room:', err);
      alert('Error creating new room. Please check backend logs.');
    }
  };

  const deleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      setRooms(prev => prev.filter(r => r.id !== id));
      try {
        await api.remove('Rooms', id);
      } catch (e) {
        console.error('Failed to delete room:', e);
      }
    }
  };

  // ── Bookings handlers ───────────────────────────────────────────────────────
  const updateBookingStatus = async (id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    try { await api.update('Bookings', id, { status }); } catch(e) { console.error('Failed to update booking status:', e); }
  };
  const confirmBooking = (b) => {
    updateBookingStatus(b.id, 'Confirmed');
    alert(`✅ Booking ${b.id} confirmed!\nConfirmation email sent to: ${b.email}`);
  };
  const handleCheckout = async (b) => {
    if (window.confirm(`Are you sure you want to check out guest ${b.guestName}? This will update the booking to 'Checked Out' and trigger a feedback request email.`)) {
      updateBookingStatus(b.id, 'Checked Out');
    }
  };
  const handleApproveCancellation = async (id) => {
    if (window.confirm("Are you sure you want to approve this cancellation request? This will mark the booking as Cancelled and send a confirmation email.")) {
      try {
        const res = await api.approveCancellation(id);
        if (res && res.booking) {
          setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
          alert("Cancellation request approved successfully.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to approve cancellation.");
      }
    }
  };
  const handleRejectCancellation = async (id) => {
    if (window.confirm("Are you sure you want to reject this cancellation request? This will restore the booking to Confirmed and send a notification email.")) {
      try {
        const res = await api.rejectCancellation(id);
        if (res && res.booking) {
          setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed', specialRequests: res.booking.specialRequests } : b));
          alert("Cancellation request rejected successfully.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to reject cancellation.");
      }
    }
  };
  const deleteBooking = async (id) => {
    if (window.confirm('Remove this booking record?')) {
      setBookings(prev => prev.filter(b => b.id !== id));
      try { await api.remove('Bookings', id); } catch(e) { console.error('Failed to delete booking:', e); }
    }
  };

  // ── Reviews handler ─────────────────────────────────────────────────────────
  const toggleReview = async (id) => {
    const review = reviews.find(r => r.id === id);
    const newApproved = !review?.approved;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: newApproved } : r));
    try { await api.update('Reviews', id, { approved: newApproved }); } catch(e) { console.error('Failed to toggle review:', e); }
  };

  // ── Amenities CRUD & Toggle handlers ───────────────────────────────────────
  const toggleAmenity = async (roomId, amenityId) => {
    let updatedAmenities;
    setRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      const amenities = room.amenities || [];
      updatedAmenities = amenities.includes(amenityId) ? amenities.filter(a => a !== amenityId) : [...amenities, amenityId];
      return { ...room, amenities: updatedAmenities };
    }));
    try {
      await api.update('Rooms', roomId, { amenities: updatedAmenities.join(', ') });
    } catch(e) {
      console.error('Failed to toggle amenity:', e);
    }
  };

  const handleCreateAndAssignCustomAmenity = async (roomId) => {
    if (!newCustomAmenity.name || !newCustomAmenity.icon) {
      alert('Please fill out both Name and Icon fields.');
      return;
    }
    const cleanId = newCustomAmenity.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').trim();
    if (!cleanId) {
      alert('Please enter a valid name.');
      return;
    }
    
    // Check if it already exists in the registry
    let exists = amenities.find(a => a.id === cleanId);
    if (!exists) {
      const item = { id: cleanId, name: newCustomAmenity.name, icon: newCustomAmenity.icon };
      setAmenities(prev => [...prev, item]);
      try {
        await api.create('Amenities', item);
      } catch (e) {
        console.error('Failed to create custom amenity in registry:', e);
      }
    }
    
    // Assign it to the specific room
    const targetRoom = rooms.find(r => r.id === roomId);
    if (targetRoom) {
      const currentAmenities = targetRoom.amenities || [];
      if (!currentAmenities.includes(cleanId)) {
        const updated = [...currentAmenities, cleanId];
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, amenities: updated } : r));
        try {
          await api.update('Rooms', roomId, { amenities: updated.join(', ') });
        } catch (e) {
          console.error('Failed to assign custom amenity to room:', e);
        }
      }
    }
    
    setRoomAddingCustom(null);
    setNewCustomAmenity({ name: '', icon: '' });
  };

  const handleAddAmenity = async () => {
    if (!newAmenity.id || !newAmenity.name || !newAmenity.icon) {
      alert('Please fill out all fields: ID, Name, and Icon.');
      return;
    }
    const cleanId = newAmenity.id.toLowerCase().trim();
    if (amenities.some(a => a.id === cleanId)) {
      alert('An amenity with this ID already exists.');
      return;
    }
    const item = { id: cleanId, name: newAmenity.name, icon: newAmenity.icon };
    setAmenities(prev => [...prev, item]);
    setNewAmenity({ id: '', name: '', icon: '' });
    setShowAddAmenity(false);
    try {
      await api.create('Amenities', item);
    } catch(e) {
      console.error('Failed to create amenity:', e);
    }
  };

  const handleEditAmenity = (amenity) => {
    setEditingAmenityId(amenity.id);
    setEditAmenityData({ name: amenity.name, icon: amenity.icon });
  };

  const handleUpdateAmenity = async (id) => {
    if (!editAmenityData.name || !editAmenityData.icon) {
      alert('Please fill out both Name and Icon fields.');
      return;
    }
    const updated = { id, name: editAmenityData.name, icon: editAmenityData.icon };
    setAmenities(prev => prev.map(a => a.id === id ? updated : a));
    setEditingAmenityId(null);
    try {
      await api.update('Amenities', id, updated);
    } catch(e) {
      console.error('Failed to update amenity:', e);
    }
  };

  const handleDeleteAmenity = async (id) => {
    if (window.confirm('Are you sure you want to delete this amenity from the registry? It will also be removed from any assigned rooms.')) {
      setAmenities(prev => prev.filter(a => a.id !== id));
      
      // Clean up rooms that had this amenity assigned
      setRooms(prev => prev.map(room => {
        const roomAmenities = room.amenities || [];
        if (roomAmenities.includes(id)) {
          const updated = roomAmenities.filter(a => a !== id);
          api.update('Rooms', room.id, { amenities: updated.join(', ') }).catch(e => {
            console.error(`Failed to remove deleted amenity from room ${room.id}:`, e);
          });
          return { ...room, amenities: updated };
        }
        return room;
      }));
      
      try {
        await api.remove('Amenities', id);
      } catch(e) {
        console.error('Failed to delete amenity:', e);
      }
    }
  };

  // ── Food handlers ───────────────────────────────────────────────────────────
  const EMPTY_FOOD = {
    name: '', price: '', type: 'breakfast', description: '',
    veg1: '', veg2: '', veg3: '',
    nv1: '', nv2: '', nv3: ''
  };
  const addFood = async () => {
    if (!newFood.name || !newFood.price) return;
    const foodItem = { id: Date.now().toString(), ...newFood, price: parseInt(newFood.price) };
    setFoodList(prev => [...prev, foodItem]);
    setNewFood(EMPTY_FOOD);
    setShowAddFood(false);
    try {
      await api.create('Food', foodItem);
    } catch(e) {
      console.error('Failed to add food:', e);
    }
  };
  const deleteFood = async (id) => {
    if (window.confirm('Delete this food option?')) {
      setFoodList(prev => prev.filter(f => f.id !== id));
      try { await api.remove('Food', id); } catch(e) { console.error('Failed to delete food:', e); }
    }
  };
  const saveFood = async (id, data) => {
    const existing = foodList.find(f => f.id === id);
    const updated = { ...existing, ...data, price: parseInt(data.price) };
    setFoodList(prev => prev.map(f => f.id === id ? updated : f));
    setEditingFoodId(null);
    try {
      await api.update('Food', id, updated);
    } catch(e) {
      console.error('Failed to save food:', e);
    }
  };

  // ── Sightseeing (Jeep Tour Packages) handlers ──────────────────────────────
  const addSightseeing = async () => {
    if (!newSightseeing.name || !newSightseeing.priceStandard) return;
    const sightseeingItem = {
      id: Date.now().toString(),
      ...newSightseeing,
      priceStandard: parseInt(newSightseeing.priceStandard) || 0,
      priceLow: parseInt(newSightseeing.priceLow) || 0,
      pricePeak: parseInt(newSightseeing.pricePeak) || 0,
      placeImages: JSON.stringify(newPlaceImages)
    };
    setSightseeingList(prev => [...prev, sightseeingItem]);
    setNewSightseeing({
      name: '',
      description: '',
      places: '',
      image: '',
      priceStandard: '',
      priceLow: '',
      pricePeak: ''
    });
    setNewPlaceImages({});
    setShowAddSightseeing(false);
    try {
      const res = await api.create('Sightseeing', sightseeingItem);
      if (res && res.data) {
        setSightseeingList(prev => prev.map(s => s.id === sightseeingItem.id ? res.data : s));
      }
    } catch(e) {
      console.error('Failed to add sightseeing package:', e);
    }
  };
  const deleteSightseeing = async (id) => {
    if (window.confirm('Delete this sightseeing package?')) {
      setSightseeingList(prev => prev.filter(s => s.id !== id));
      try { await api.remove('Sightseeing', id); } catch(e) { console.error('Failed to delete sightseeing:', e); }
    }
  };
  const saveSightseeing = async (id, data) => {
    const existing = sightseeingList.find(s => s.id === id);
    const updated = {
      ...existing,
      ...data,
      priceStandard: parseInt(data.priceStandard) || 0,
      priceLow: parseInt(data.priceLow) || 0,
      pricePeak: parseInt(data.pricePeak) || 0
    };
    setSightseeingList(prev => prev.map(s => s.id === id ? updated : s));
    setEditingSightseeingId(null);
    try {
      const res = await api.update('Sightseeing', id, updated);
      if (res && res.data) {
        setSightseeingList(prev => prev.map(s => s.id === id ? res.data : s));
      }
    } catch(e) {
      console.error('Failed to save sightseeing:', e);
    }
  };



  // ── QR Scanners Handlers ───────────────────────────────────────────────────
  const handleQRImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isEdit) {
          setEditQRData(prev => ({ ...prev, qrImage: event.target.result }));
        } else {
          setNewQR(prev => ({ ...prev, qrImage: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQR = async (e) => {
    if (e) e.preventDefault();
    if (!newQR.name || !newQR.upiId) {
      alert("Name and UPI ID are required.");
      return;
    }
    
    let finalQRImage = newQR.qrImage;
    if (!finalQRImage) {
      finalQRImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(newQR.upiId)}&pn=Eden%20Spot%20Homestay`;
    }

    const payload = {
      id: "qr_" + Date.now(),
      name: newQR.name,
      upiId: newQR.upiId,
      qrImage: finalQRImage,
      isActive: String(newQR.isActive)
    };

    try {
      const res = await api.create('QRScanners', payload);
      if (res && res.data) {
        const added = {
          ...res.data,
          isActive: String(res.data.isActive).toLowerCase() === 'true'
        };
        setQrScanners(prev => [...prev, added]);
        setNewQR({ name: '', upiId: '', qrImage: '', isActive: true });
        setShowAddQR(false);
        alert("QR Scanner added successfully!");
      }
    } catch (err) {
      console.error("Failed to create QR scanner:", err);
      alert("Error saving to database.");
    }
  };

  const handleEditQR = (qr) => {
    setEditingQRId(qr.id);
    setEditQRData({ name: qr.name, upiId: qr.upiId, qrImage: qr.qrImage, isActive: qr.isActive });
  };

  const handleUpdateQR = async (id) => {
    if (!editQRData.name || !editQRData.upiId) {
      alert("Name and UPI ID are required.");
      return;
    }

    let finalQRImage = editQRData.qrImage;
    if (!finalQRImage || finalQRImage.startsWith('https://api.qrserver.com/v1/create-qr-code/')) {
      finalQRImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(editQRData.upiId)}&pn=Eden%20Spot%20Homestay`;
    }

    const payload = {
      name: editQRData.name,
      upiId: editQRData.upiId,
      qrImage: finalQRImage,
      isActive: String(editQRData.isActive)
    };

    try {
      await api.update('QRScanners', id, payload);
      setQrScanners(prev => prev.map(q => q.id === id ? { ...q, ...payload, qrImage: finalQRImage, isActive: String(payload.isActive).toLowerCase() === 'true' } : q));
      setEditingQRId(null);
      alert("QR Scanner updated successfully!");
    } catch (err) {
      console.error("Failed to update QR scanner:", err);
      alert("Error saving updates.");
    }
  };

  const toggleQRActive = async (id, currentVal) => {
    const newVal = !currentVal;
    setQrScanners(prev => prev.map(q => q.id === id ? { ...q, isActive: newVal } : q));
    try {
      await api.update('QRScanners', id, { isActive: String(newVal) });
    } catch (err) {
      console.error("Failed to toggle QR active state:", err);
      setQrScanners(prev => prev.map(q => q.id === id ? { ...q, isActive: currentVal } : q));
    }
  };

  const handleDeleteQR = async (id) => {
    if (window.confirm("Are you sure you want to delete this QR scanner?")) {
      setQrScanners(prev => prev.filter(q => q.id !== id));
      try {
        await api.remove('QRScanners', id);
      } catch (err) {
        console.error("Failed to delete QR scanner:", err);
      }
    }
  };

  // ── Gallery handlers ────────────────────────────────────────────────────────
  const handleGalleryUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target.result;
        const newImg = { id: String(Date.now() + Math.random()), url, name: file.name };
        setGalleryImages(prev => [...prev, newImg]);
        try {
          const res = await api.create('Gallery', newImg);
          if (res && res.data) {
            setGalleryImages(prev => prev.map(img => img.id === newImg.id ? res.data : img));
          }
        } catch(e) {
          console.error('Failed to save gallery image to sheet:', e);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const deleteGalleryImage = async (id) => {
    if (window.confirm('Remove this image?')) {
      setGalleryImages(prev => prev.filter(img => img.id !== id));
      try {
        await api.remove('Gallery', id);
      } catch(e) {
        console.error('Failed to delete gallery image:', e);
      }
    }
  };

  const handleSetLandingBackground = async (imageUrl) => {
    setLandingPageBackground(imageUrl);
    try {
      await api.update('settings', 'landingPageBackground', { key: 'landingPageBackground', value: imageUrl });
      alert('🌟 Successfully set image as landing page background!');
    } catch(e) {
      console.error('Failed to set landing page background:', e);
      alert('Error updating background image settings.');
    }
  };

  const handleAssignImageToRoom = async (imageUrl, roomId) => {
    if (!roomId) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const currentImages = room.images || [];
    if (currentImages.includes(imageUrl)) {
      alert('This image is already assigned to this room.');
      return;
    }
    const updatedImages = [...currentImages, imageUrl];
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, images: updatedImages } : r));
    try {
      const res = await api.update('Rooms', roomId, { images: JSON.stringify(updatedImages) });
      if (res && res.data) {
        let returnedImages = res.data.images;
        if (typeof returnedImages === 'string') {
          try {
            returnedImages = JSON.parse(returnedImages);
          } catch (e) {
            returnedImages = returnedImages ? returnedImages.split(',').map(s => s.trim()).filter(Boolean) : [];
          }
        }
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, images: returnedImages } : r));
      }
    } catch(e) {
      console.error('Failed to assign image to room:', e);
      alert('Error updating room images on server.');
    }
  };

  const handleRemoveImageFromRoom = async (imageUrl, roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const currentImages = room.images || [];
    const updatedImages = currentImages.filter(url => url !== imageUrl);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, images: updatedImages } : r));
    try {
      const res = await api.update('Rooms', roomId, { images: JSON.stringify(updatedImages) });
      if (res && res.data) {
        let returnedImages = res.data.images;
        if (typeof returnedImages === 'string') {
          try {
            returnedImages = JSON.parse(returnedImages);
          } catch (e) {
            returnedImages = returnedImages ? returnedImages.split(',').map(s => s.trim()).filter(Boolean) : [];
          }
        }
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, images: returnedImages } : r));
      }
    } catch(e) {
      console.error('Failed to remove image from room:', e);
      alert('Error updating room images on server.');
    }
  };

  // ── Print receipt ───────────────────────────────────────────────────────────
  // Print receipt
  const printReceipt = (b) => {
    const w = window.open('', '_blank');
    if (!w) { alert('Allow popups to print receipt.'); return; }
    
    // Parse customized bill details if they exist in b.specialRequests
    const bill = parseBookingBill(b.specialRequests);
    
    let nights = 1;
    try {
      const d1 = new Date(b.checkIn);
      const d2 = new Date(b.checkOut);
      const diffTime = Math.abs(d2 - d1);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    } catch (e) {
      nights = 1;
    }

    let subtotal = 0;
    let tax = 0;
    let total = Number(b.totalAmount) || 0;
    let discount = 0;
    let billRowsHtml = "";
    
    if (bill) {
      const roomCost = bill.roomCost || 0;
      const foodCost = bill.foodCost || 0;
      const sightseeingCost = bill.sightseeingCost || 0;
      discount = bill.discount || 0;
      const extras = bill.extras || [];
      subtotal = bill.subtotal || 0;
      tax = bill.luxuryTax || 0;
      total = bill.total || 0;
      
      billRowsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong>Room Stay (${b.roomName})</strong><br/>
          <small style="color: #64748b;">₹${Math.round(bill.roomRate).toLocaleString('en-IN')} x ${bill.nights || nights} nights</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
          ₹${Math.round(roomCost).toLocaleString('en-IN')}
        </td>
      </tr>
      `;
      
      if (foodCost > 0) {
        billRowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>Meal / Food Packages</strong><br/>
            <small style="color: #64748b;">${b.food || 'Meal Package'}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
            ₹${Math.round(foodCost).toLocaleString('en-IN')}
          </td>
        </tr>
        `;
      }
      
      if (sightseeingCost > 0) {
        billRowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>Jeep Tour Package</strong><br/>
            <small style="color: #64748b;">${b.sightseeing || 'Jeep Tour'}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
            ₹${Math.round(sightseeingCost).toLocaleString('en-IN')}
          </td>
        </tr>
        `;
      }
      
      extras.forEach(extra => {
        billRowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>➕ ${extra.name}</strong><br/>
            <small style="color: #64748b;">Incidentals / Custom charges</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
            ₹${Math.round(extra.price).toLocaleString('en-IN')}
          </td>
        </tr>
        `;
      });
      
    } else {
      // Fallback defaults
      const rateVal = b.gstRate ? Number(b.gstRate) : gstRate;
      subtotal = Math.round(total / (1 + rateVal / 100));
      tax = Math.round(subtotal * (rateVal / 100));
      
      billRowsHtml += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong>Room Stay & Services (${b.roomName})</strong><br/>
          <small style="color: #64748b;">${b.guests} Guests · ${b.checkIn} to ${b.checkOut}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
          ₹${subtotal.toLocaleString('en-IN')}
        </td>
      </tr>
      `;
      
      if (b.food && b.food !== 'None') {
        billRowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>Meal Plan Package:</strong> ${b.food}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px;">
            Included
          </td>
        </tr>
        `;
      }
      
      if (b.sightseeing && b.sightseeing !== 'None') {
        billRowsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>Sightseeing Jeep Tour:</strong> ${b.sightseeing}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #64748b; font-size: 11px;">
            Included
          </td>
        </tr>
        `;
      }
    }

    const discountRow = discount > 0 ? `
    <tr style="color: #10b981;">
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <strong>Discount Applied</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
        -₹${Math.round(discount).toLocaleString('en-IN')}
      </td>
    </tr>
    ` : "";

    w.document.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Voucher - ${b.id}</title>
    <style>
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1a1e26;
            background-color: #f4f6f9;
            margin: 0;
            padding: 30px;
        }
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #0b1528;
            padding: 24px 30px;
            border-bottom: 3px solid #c5a880;
            color: #ffffff;
        }
        .brand-logo {
            font-family: Georgia, serif;
            color: #ffffff;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0;
        }
        .brand-sub {
            color: #c5a880;
            font-size: 9px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-top: 2px;
        }
        .voucher-title {
            text-align: right;
        }
        .voucher-title h2 {
            font-size: 16px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #c5a880;
        }
        .voucher-title p {
            font-size: 11px;
            color: #a0a6b5;
            margin: 4px 0 0 0;
        }
        .content {
            padding: 30px;
        }
        .property-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            background: #fafafb;
            position: relative;
        }
        .property-name {
            font-family: Georgia, serif;
            font-size: 18px;
            font-weight: bold;
            color: #0b1528;
            margin: 0 0 8px 0;
        }
        .property-details {
            font-size: 11px;
            color: #64748b;
            line-height: 1.5;
        }
        .stamp-confirmed {
            position: absolute;
            top: 20px;
            right: 20px;
            border: 2px dashed #10b981;
            color: #10b981;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            transform: rotate(5deg);
            letter-spacing: 1px;
            background: rgba(16, 185, 129, 0.04);
        }
        .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .grid-table td {
            padding: 15px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            width: 50%;
        }
        .grid-title {
            font-size: 10px;
            font-weight: bold;
            color: #c5a880;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .grid-value {
            font-size: 12px;
            color: #0b1528;
            font-weight: bold;
            line-height: 1.4;
        }
        .grid-sub {
            font-size: 11px;
            color: #64748b;
            font-weight: normal;
            margin-top: 4px;
        }
        .billing-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .billing-total {
            background-color: #fafafb;
            border-top: 1px solid #e2e8f0;
        }
        .important-info {
            background-color: #f8fafc;
            border-left: 4px solid #c5a880;
            padding: 15px 20px;
            border-radius: 0 12px 12px 0;
            font-size: 11px;
            color: #475569;
            line-height: 1.6;
            margin-top: 25px;
        }
        .important-info h4 {
            margin: 0 0 6px 0;
            text-transform: uppercase;
            color: #0b1528;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        .important-info ul {
            margin: 0;
            padding-left: 15px;
        }
        .footer-info {
            background-color: #0b1528;
            padding: 20px;
            text-align: center;
            font-size: 10px;
            color: #8c93a3;
            border-top: 1px solid #e2e8f0;
        }
        .footer-info a {
            color: #c5a880;
            text-decoration: none;
        }
        @page {
            size: A4;
            margin: 8mm;
        }
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .container {
                box-shadow: none;
                border: none;
                max-width: 100%;
                margin: 0;
                border-radius: 0;
            }
            .header-banner {
                padding: 14px 20px;
            }
            .brand-logo {
                font-size: 18px;
            }
            .content {
                padding: 15px 20px;
            }
            .property-card {
                padding: 12px;
                margin-bottom: 12px;
            }
            .property-name {
                font-size: 15px;
                margin-bottom: 4px;
            }
            .grid-table {
                margin-bottom: 12px;
            }
            .grid-table td {
                padding: 8px 10px;
            }
            .grid-title {
                font-size: 9px;
                margin-bottom: 4px;
            }
            .grid-value {
                font-size: 11px;
            }
            .grid-sub {
                font-size: 10px;
            }
            .billing-table td, .billing-table th {
                padding: 6px 8px !important;
                font-size: 11px;
            }
            .important-info {
                padding: 10px 14px;
                margin-top: 12px;
                font-size: 10px;
            }
            .important-info h4 {
                font-size: 10px;
            }
            .footer-info {
                padding: 10px;
                font-size: 9px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-banner">
            <div>
                <h1 class="brand-logo">Eden Spot Homestay</h1>
                <div class="brand-sub">Just a Peaceful home away from Home</div>
            </div>
            <div class="voucher-title">
                <h2>Booking Voucher</h2>
                <p>Booking ID: <strong style="color: #ffffff; font-family: monospace;">${b.id}</strong></p>
                <p>PNR: <strong style="color: #ffffff; font-family: monospace;">PNR-${b.id.replace('B-', '')}</strong></p>
            </div>
        </div>
        
        <div class="content">
            <div class="property-card">
                <h3 class="property-name">${b.roomName}</h3>
                <div class="property-details">
                    📍 The House of Shalom, Puthachivayal, Marayoor, Idukki, Kerala 685620<br/>
                    📞 +91 94462 20966, +91 94469 33963 | 📧 edenspot.homestay@gmail.com
                </div>
                <div class="stamp-confirmed">Thank You Confirmed</div>
            </div>
            
            <table class="grid-table">
                <tr>
                    <td>
                        <div class="grid-title">🗓️ Stay Duration (${nights} Nights)</div>
                        <div class="grid-value">
                            Check-in: ${b.checkIn}<br/>
                            <span class="grid-sub">After 12:00 PM</span>
                        </div>
                        <div class="grid-value" style="margin-top: 10px;">
                            Check-out: ${b.checkOut}<br/>
                            <span class="grid-sub">Before 11:00 AM</span>
                        </div>
                    </td>
                    <td>
                        <div class="grid-title">👥 Guest Information</div>
                        <div class="grid-value">${b.guestName}</div>
                        <div class="grid-sub">
                            Email: ${b.email}<br/>
                            Phone: ${b.phone || 'N/A'}<br/>
                            Guests: ${b.guests}
                        </div>
                    </td>
                </tr>
            </table>
            
            <div class="grid-title" style="margin-top: 20px;">💳 Invoice &amp; Itemized Billing</div>
            <table class="billing-table">
                <thead>
                    <tr style="background-color: #fafafb; border-bottom: 2px solid #e2e8f0; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; text-align: left;">
                        <th style="padding: 10px; text-align: left;">Description</th>
                        <th style="padding: 10px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody style="font-size: 12px; color: #334155;">
                    ${billRowsHtml}
                    ${discountRow}
                    
                    <tr class="billing-total">
                        <td style="padding: 12px 10px; font-weight: bold; color: #0b1528;">Subtotal</td>
                        <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: #0b1528;">₹${Math.round(subtotal).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr class="billing-total">
                        <td style="padding: 12px 10px; font-weight: bold; color: #64748b; font-size: 11px;">Luxury GST Tax (${b.gstRate ? b.gstRate : gstRate}%)</td>
                        <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: #64748b; font-size: 11px;">₹${Math.round(tax).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr class="billing-total" style="border-top: 2px double #c5a880;">
                        <td style="padding: 15px 10px; font-weight: bold; color: #0b1528; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</td>
                        <td style="padding: 15px 10px; font-weight: bold; text-align: right; color: #c5a880; font-size: 18px; font-family: Georgia, serif;">₹${Math.round(total).toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
            </table>
            
            <p style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 20px; text-align: center;">
                * The booking is confirmed. Balance or outstanding amounts are payable at check-out.
            </p>
            
            <div class="important-info">
                <h4>Important Information</h4>
                <ul>
                    <li>Government approved photo ID card is mandatory for all guests during check-in.</li>
                    <li>Detailed GST invoice receipts can be requested at the reception counter during check-out.</li>
                    <li>Free cancellation up to 48 hours before check-in date.</li>
                </ul>
            </div>
        </div>
        
        <div class="footer-info">
            <p>Eden Spot Homestay, Marayoor, Idukki, Kerala, India</p>
            <p>Need support? Contact us 24/7: edenspot.homestay@gmail.com | 📞 +91 94462 20966, +91 94469 33963</p>
        </div>
    </div>
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`);
    w.document.close();
  };

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const confirmed = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked Out').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const revenue = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked Out').reduce((s, b) => s + b.totalAmount, 0);
    const occupancy = Math.min(100, total > 0 ? Math.round((confirmed / Math.max(rooms.length, 1)) * 100) : 0);
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    return { total, pending, confirmed, cancelled, revenue, occupancy, cancellationRate };
  }, [bookings, rooms]);

  // ── Si  // ── Status badge helper ──────────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      Confirmed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      Pending:   'bg-amber-50  border-amber-200  text-amber-700',
      Cancelled: 'bg-rose-50   border-rose-200   text-rose-700',
      'Checked Out': 'bg-indigo-50 border-indigo-200 text-indigo-700',
      'Cancellation Requested': 'bg-orange-50 border-orange-200 text-orange-700',
    };
    return <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${map[status] ?? ''}`}>{status}</span>;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ── Admin Login / Recovery Pages ────────────────────────────────────────────
  // Admin Login / Recovery Pages
  if (!isAdminAuthenticated) {

    const bg = 'min-h-screen w-full bg-gradient-to-br from-[#001f4d] via-[#0a1b3f] to-[#0d2057] flex flex-col items-center justify-center p-6';
    const blob1 = 'fixed top-[-120px] left-[-120px] w-96 h-96 rounded-full bg-[#b5945b]/10 blur-3xl pointer-events-none';
    const blob2 = 'fixed bottom-[-100px] right-[-100px] w-80 h-80 rounded-full bg-[#003580]/30 blur-3xl pointer-events-none';

    // LOGIN PAGE
    if (loginMode === 'login') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-7">
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <img src="/logo.png" alt="Eden Spot Homestay Logo" className="h-24 w-auto object-contain brightness-0" />
                    <div className="text-left">
                      <h1 className="font-serif text-2xl tracking-wide uppercase font-extrabold text-black leading-none">Eden Spot</h1>
                      <span className="text-xs tracking-[0.2em] uppercase text-black font-extrabold mt-1.5 block">Homestay</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#003580]/50 tracking-[0.25em] uppercase mt-1">Management Portal</p>
                </div>
                {loginError && (
                  <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Username</label>
                    <input
                      type="text" required
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Password</label>
                      <button type="button" onClick={() => { setLoginError(''); setLoginMode('forgot'); }}
                        className="text-[9px] uppercase tracking-wider text-[#b5945b] hover:text-[#003580] font-bold transition-colors cursor-pointer">
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003580] transition-colors cursor-pointer p-1">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmittingLogin}
                    className="w-full bg-[#003580] hover:bg-[#002560] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2">
                    {isSubmittingLogin ? 'Authenticating...' : <><span>Login to Portal</span><ChevronRight className="h-4 w-4" /></>}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => setView('home')}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Main Site
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Eden Spot Homestay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ACCOUNT RECOVERY PAGE
    if (loginMode === 'forgot') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <svg className="w-6 h-6 text-[#b5945b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-lg tracking-wider uppercase font-bold text-[#003580]">Account Recovery</h1>
                  <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Step 1 of 3</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-8 h-1.5 rounded-full bg-[#b5945b]" />
                    <div className="w-4 h-1.5 rounded-full bg-gray-200" />
                    <div className="w-4 h-1.5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Handler Email</label>
                    <input
                      type="email" required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="gokulnath96880@gmail.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                    />
                  </div>
                  <button type="submit" disabled={isSubmittingLogin}
                    className="w-full bg-[#003580] hover:bg-[#002560] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer">
                    {isSubmittingLogin ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => { setLoginError(''); setLoginMode('login'); }}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Login
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Eden Spot Homestay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // OTP VERIFICATION PAGE
    if (loginMode === 'otp') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <svg className="w-6 h-6 text-[#b5945b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-lg tracking-wider uppercase font-bold text-[#003580]">OTP Verification</h1>
                  <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Step 2 of 3</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-4 h-1.5 rounded-full bg-[#b5945b]/40" />
                    <div className="w-8 h-1.5 rounded-full bg-[#b5945b]" />
                    <div className="w-4 h-1.5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <div className="mb-5 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#003580] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-[#003580] font-semibold truncate">OTP sent to <span className="font-bold">{resetEmail}</span></p>
                </div>
                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">6-Digit Code</label>
                    <input
                      type="text" required maxLength={6} inputMode="numeric"
                      value={resetOtp}
                      onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="------"
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#b5945b] focus:bg-white tracking-[0.6em] text-center font-mono font-bold transition-all"
                    />
                    <p className="text-[10px] text-gray-400 text-center">Valid for 5 minutes</p>
                  </div>
                  <button type="submit" disabled={isSubmittingLogin || resetOtp.length !== 6}
                    className="w-full bg-[#003580] hover:bg-[#002560] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer">
                    {isSubmittingLogin ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button type="button"
                    onClick={() => { setLoginError(''); setResetOtp(''); setLoginMode('forgot'); }}
                    className="w-full text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold py-1 transition-colors cursor-pointer">
                    Resend / Change Email
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => { setLoginError(''); setLoginMode('login'); }}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Login
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Eden Spot Homestay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // CHANGE CREDENTIALS PAGE
    if (loginMode === 'reset') {
      return (
        <div className={bg}>
          <div className={blob1} />
          <div className={blob2} />
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#b5945b] via-[#f0d080] to-[#b5945b]" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <svg className="w-6 h-6 text-[#b5945b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-lg tracking-wider uppercase font-bold text-[#003580]">Change Credentials</h1>
                  <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Step 3 of 3</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-4 h-1.5 rounded-full bg-[#b5945b]/40" />
                    <div className="w-4 h-1.5 rounded-full bg-[#b5945b]/40" />
                    <div className="w-8 h-1.5 rounded-full bg-[#b5945b]" />
                  </div>
                </div>
                <div className="mb-5 flex items-center justify-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Identity Verified</p>
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">{loginError}</div>
                )}
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Admin Username</label>
                    <input
                      type="text" required
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} required minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003580] transition-colors cursor-pointer p-1">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#003580] font-bold block">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'} required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003580] focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003580] transition-colors cursor-pointer p-1">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmittingLogin}
                    className="w-full bg-gradient-to-r from-[#003580] to-[#0a1b3f] hover:from-[#002560] hover:to-[#003580] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer mt-2">
                    {isSubmittingLogin ? 'Saving...' : 'Save and Login'}
                  </button>
                </form>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <button onClick={() => { setLoginError(''); setLoginMode('login'); }}
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#003580] font-bold transition-colors cursor-pointer block mx-auto">
                    Back to Login
                  </button>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">2026 Eden Spot Homestay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }


  const sidebarItems = [
    { id: 'overview',    label: 'Dashboard',              icon: <LayoutDashboard className="h-4 w-4 shrink-0" /> },
    { id: 'rooms',       label: 'Rooms & Pricing',         icon: <BedDouble        className="h-4 w-4 shrink-0" /> },
    { id: 'discounts',   label: 'Discounts',              icon: <Percent          className="h-4 w-4 shrink-0" /> },
    { id: 'bookings',    label: 'Customers & Bookings',    icon: <FileSpreadsheet  className="h-4 w-4 shrink-0" /> },
    { id: 'members',     label: 'User Tracking',       icon: <Users            className="h-4 w-4 shrink-0" /> },
    { id: 'calendar',    label: 'Availability Calendar',   icon: <Calendar         className="h-4 w-4 shrink-0" /> },
    { id: 'food',        label: 'Food Packages & Pricing', icon: <UtensilsCrossed  className="h-4 w-4 shrink-0" /> },
    { id: 'sightseeing', label: 'Jeep Tour Packages',      icon: <Compass          className="h-4 w-4 shrink-0" /> },
    { id: 'gallery',     label: 'Gallery',                 icon: <Image            className="h-4 w-4 shrink-0" /> },
    { id: 'amenities',   label: 'Amenities',               icon: <Package          className="h-4 w-4 shrink-0" /> },
    { id: 'qrscanners',  label: 'QR Scanners',             icon: <QrCode           className="h-4 w-4 shrink-0" /> },
    { id: 'reviews',     label: 'Reviews',                 icon: <Star             className="h-4 w-4 shrink-0" /> },
  ];

  const tabLabel = activeTab === 'members'
    ? 'User Tracking'
    : (sidebarItems.find(i => i.id === activeTab)?.label ?? activeTab);

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col lg:flex-row">

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-64 bg-gradient-to-br from-[#003580] via-[#0a1b3f] to-[#0b1528] text-white flex flex-col shrink-0 border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-20">

        {/* Brand */}
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center space-x-3 py-1">
            <img src="/logo.png" alt="Eden Spot Homestay Logo" className="h-16 w-auto object-contain brightness-0 invert" />
            <div>
              <p className="font-serif text-lg tracking-wide uppercase font-extrabold text-white leading-none">Eden Spot</p>
              <span className="text-[10px] tracking-[0.2em] uppercase text-luxury-lightgold font-extrabold mt-1 block">Admin</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-[10px] text-gray-400">
            <p className="font-semibold text-white">Eden Spot Homestay</p>
            <p className="font-mono mt-0.5">Terminal ID: #904-ES</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[11px] uppercase tracking-wider font-semibold transition-all duration-150 ${
                activeTab === item.id
                  ? 'bg-luxury-gold text-luxury-navy font-bold shadow-md'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => { if (window.confirm('Are you sure you want to logout?')) { setIsAdminAuthenticated(false); setView('home'); } }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[11px] uppercase tracking-wider font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
          <p className="text-[9px] text-gray-600 font-mono text-center mt-2">v2.0.0 • Eden Spot Homestay</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">

        {/* Page header */}
        <div className="flex justify-between items-center pb-5 border-b border-gray-200 mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-luxury-navy uppercase tracking-wider">{tabLabel}</h2>
            <p className="text-gray-400 text-xs font-light mt-0.5">Manage and optimise resort details in real-time.</p>
          </div>
          <div className="text-[10px] text-gray-400 font-mono bg-white border border-gray-200 rounded-lg px-3 py-2">
            System: <span className="text-emerald-500 font-bold">● LIVE</span>
          </div>
        </div>

        {/* ══ TAB: DASHBOARD ══════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Gross Revenue',   value: `₹${metrics.revenue.toLocaleString('en-IN')}`, sub: '+18.4% this month', subColor: 'text-emerald-600', icon: <IndianRupee className="h-5 w-5" />, bg: 'bg-emerald-50 border-emerald-100 text-emerald-500' },
                { label: 'Total Bookings',  value: metrics.total,  sub: `Pending: ${metrics.pending}`, subColor: 'text-luxury-gold', icon: <FileSpreadsheet className="h-5 w-5" />, bg: 'bg-blue-50 border-blue-100 text-blue-500' },
                { label: 'Occupancy Rate',  value: `${metrics.occupancy}%`, sub: 'Based on active rooms', subColor: 'text-gray-400', icon: <Users className="h-5 w-5" />, bg: 'bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold' },
                { label: 'Cancellation Rate', value: `${metrics.cancellationRate}%`, sub: `${metrics.cancelled} Cancelled bookings`, subColor: 'text-rose-500 font-bold', icon: <XCircle className="h-5 w-5" />, bg: 'bg-rose-50 border-rose-100 text-rose-500' },
              ].map((c, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200/30 shadow-xs flex items-center justify-between admin-card-hover cursor-default">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{c.label}</span>
                    <p className="font-serif text-2xl font-bold text-luxury-navy">{c.value}</p>
                    <span className={`text-[10px] ${c.subColor}`}>{c.sub}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${c.bg}`}>{c.icon}</div>
                </div>
              ))}
            </div>

            {/* Occupancy chart + quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/30 shadow-xs space-y-6 admin-card-hover">
                
                {/* Header with Month Selector */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Performance Analytics</h4>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Forecast occupancy & gross weekly revenue</p>
                  </div>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-luxury-navy font-semibold focus:outline-none focus:border-luxury-gold transition-all"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Grid for two charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Occupancy Forecast Chart */}
                  <div className="space-y-4">
                    <h5 className="font-serif text-xs font-bold text-luxury-navy uppercase tracking-wider flex items-center space-x-1.5">
                      <span>📊</span> <span>Weekly Occupancy Rate</span>
                    </h5>
                    <div className="space-y-3.5">
                      {monthlyStats.map((w, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[11px] font-semibold text-gray-605 mb-1">
                            <span>{w.label}</span><span>{w.occupancy}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-luxury-navy" style={{ width: `${w.occupancy}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gross Revenue Chart */}
                  <div className="space-y-4">
                    <h5 className="font-serif text-xs font-bold text-luxury-navy uppercase tracking-wider flex items-center space-x-1.5">
                      <span>💰</span> <span>Weekly Gross Revenue</span>
                    </h5>
                    <div className="space-y-3.5">
                      {monthlyStats.map((w, i) => {
                        const maxRev = Math.max(...monthlyStats.map(s => s.revenue), 1);
                        const pct = Math.min(100, Math.max(5, (w.revenue / maxRev) * 100));
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-[11px] font-semibold text-gray-650 mb-1">
                              <span>{w.label}</span><span>₹{w.revenue.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-luxury-gold" 
                                style={{ width: w.revenue > 0 ? `${pct}%` : '0%' }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200/30 shadow-xs space-y-3 admin-card-hover">
                <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Quick Actions</h4>
                {[
                  { label: 'Process Pending Bookings', tab: 'bookings', badge: metrics.pending },
                  { label: 'Update Room Prices',        tab: 'rooms' },
                  { label: 'Manage Food Packages',      tab: 'food' },
                  { label: 'Manage Jeep Packages',      tab: 'sightseeing' },
                  { label: 'Update Gallery',            tab: 'gallery' },
                ].map((q, i) => (
                  <button key={i} onClick={() => setActiveTab(q.tab)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200/30 rounded-xl hover:border-luxury-gold text-xs font-semibold text-luxury-navy transition-all">
                    <span>{q.label}</span>
                    {q.badge !== undefined
                      ? <span className="px-2 py-0.5 bg-luxury-gold text-luxury-navy rounded-full text-[9px] font-bold">{q.badge}</span>
                      : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: ROOMS & PRICING ════════════════════════════════════════════ */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-fade-in">

            {/* Settings Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seasonal multiplier */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/30 shadow-xs space-y-4 admin-card-hover">
                <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Seasonal Pricing Control</h4>
                <p className="text-xs text-gray-400">Apply a global multiplier across all room base rates instantly.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Low Season',   sub: '−10% promo rate',   val: 0.9  },
                    { label: 'Standard',     sub: 'Base rate (1×)',     val: 1.0  },
                    { label: 'Peak Season',  sub: '+15% holiday surge', val: 1.15 },
                  ].map(s => (
                    <button key={s.val} onClick={() => handleUpdateSeasonalMultiplier(s.val)}
                      type="button"
                      className={`p-4 rounded-xl border-2 text-left transition-all ${seasonalMultiplier === s.val ? 'border-luxury-gold bg-luxury-gold/10' : 'border-gray-200 hover:border-gray-300'} cursor-pointer`}>
                      <p className="font-bold text-xs text-luxury-navy">{s.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                      <p className="text-xs font-mono font-bold text-luxury-gold mt-2">{s.val}×</p>
                    </button>
                  ))}
                </div>
                {seasonalMultiplier !== 1.0 && (
                  <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800">
                    <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p>Active multiplier <strong>{seasonalMultiplier}×</strong> — all displayed rates are adjusted accordingly.</p>
                  </div>
                )}
              </div>

              {/* GST Tax Control */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/30 shadow-xs space-y-4 admin-card-hover flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">GST Tax Control</h4>
                  <p className="text-xs text-gray-400">Dynamically update the global GST rate applied on stays and invoices.</p>
                </div>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center space-x-4">
                    <div className="bg-luxury-gold/10 text-luxury-gold p-3.5 rounded-xl shrink-0">
                      <Percent className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Current GST Rate</p>
                      <p className="font-serif text-xl font-bold text-luxury-navy">{gstRate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="any"
                        value={localGstRate} 
                        onChange={e => setLocalGstRate(e.target.value)} 
                        placeholder="E.g. 18" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-luxury-navy focus:outline-none focus:border-luxury-gold bg-white text-left" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleUpdateGstRate(localGstRate)}
                      className="bg-luxury-navy hover:bg-primary-600 text-white text-xs uppercase tracking-wider font-bold px-5 py-3 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold transition-all duration-200 cursor-pointer"
                    >
                      Update GST
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Room Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddRoom(prev => !prev)}
                className="flex items-center space-x-2 bg-luxury-navy text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-luxury-navy/80 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{showAddRoom ? 'Cancel' : 'Add New Room / Villa'}</span>
              </button>
            </div>

            {/* Add New Room Form */}
            {showAddRoom && (
              <form onSubmit={handleAddRoomSubmit} className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 space-y-5 animate-fade-in">
                <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Add New Room / Villa</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Room Name *</label>
                    <input required value={newRoom.name} onChange={e => setNewRoom(p => ({...p, name: e.target.value}))} placeholder="e.g. Emerald Tea Suite" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Category</label>
                    <select value={newRoom.category} onChange={e => setNewRoom(p => ({...p, category: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900">
                      <option>Luxury Suite</option>
                      <option>Premium Villa</option>
                      <option>Deluxe Room</option>
                      <option>Standard Room</option>
                      <option>Family Suite</option>
                      <option>Honeymoon Villa</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Bed Type</label>
                    <select value={newRoom.bedType} onChange={e => setNewRoom(p => ({...p, bedType: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900">
                      <option>1 King Bed</option>
                      <option>2 Twin Beds</option>
                      <option>1 Queen Bed</option>
                      <option>2 King Beds</option>
                      <option>Bunk Beds + Double</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">View</label>
                    <input value={newRoom.view} onChange={e => setNewRoom(p => ({...p, view: e.target.value}))} placeholder="e.g. Tea Garden View, Valley View" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Size (sq ft)</label>
                    <input type="number" value={newRoom.size} onChange={e => setNewRoom(p => ({...p, size: e.target.value}))} placeholder="650" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Base Price (₹) *</label>
                    <input required type="number" value={newRoom.price} onChange={e => setNewRoom(p => ({...p, price: e.target.value}))} placeholder="12000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Low Season Price (₹)</label>
                    <input type="number" value={newRoom.priceLow} onChange={e => setNewRoom(p => ({...p, priceLow: e.target.value}))} placeholder="Auto (−10%)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Peak Season Price (₹)</label>
                    <input type="number" value={newRoom.pricePeak} onChange={e => setNewRoom(p => ({...p, pricePeak: e.target.value}))} placeholder="Auto (+15%)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Amenity IDs (comma-separated)</label>
                    <input value={newRoom.amenities} onChange={e => setNewRoom(p => ({...p, amenities: e.target.value}))} placeholder="wifi, pool, spa, ac" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">Description</label>
                  <textarea value={newRoom.description} onChange={e => setNewRoom(p => ({...p, description: e.target.value}))} rows="2" placeholder="Short description of the room..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">Room Photos (multiple allowed)</label>
                  {newRoomImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newRoomImages.map((img, idx) => (
                        <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 group">
                          <img src={img} alt={`Room ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewRoomImage(idx)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold cursor-pointer transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleRoomImagesChange}
                    className="w-full text-xs text-gray-550 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="bg-luxury-navy text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl hover:bg-luxury-navy/80 transition-all cursor-pointer">Save Room</button>
                  <button type="button" onClick={() => { setShowAddRoom(false); setNewRoom(EMPTY_ROOM); setNewRoomImages([]); }} className="text-xs text-gray-500 underline cursor-pointer">Cancel</button>
                </div>
              </form>
            )}

            {/* Rooms table */}
            <div className="bg-white border border-gray-200/30 rounded-2xl shadow-xs overflow-x-auto admin-card-hover">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200/30">
                    <th className="p-4">Room Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">View / Size</th>
                    <th className="p-4">Standard Rate</th>
                    <th className="p-4">Low Season Rate</th>
                    <th className="p-4">Peak Season Rate</th>
                    <th className="p-4">Active Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-gray-50/60">
                      <td className="p-4">
                        <div className="font-serif font-bold text-luxury-navy">{room.name}</div>
                        <div className="text-[10px] text-gray-400">{room.bedType}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{room.category}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-600">{room.view}</div>
                        <div className="text-[10px] text-gray-400">{room.size} sq ft</div>
                      </td>
                      <td className="p-4 font-semibold text-luxury-navy">
                        {editingRoomId === room.id
                          ? <div className="flex items-center space-x-1"><span>₹</span><input type="number" value={tempPrices.price} onChange={e => setTempPrices(p => ({ ...p, price: e.target.value }))} className="w-20 border border-gray-300 rounded p-1 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" /></div>
                          : <span>₹{Number(room.price || 0).toLocaleString('en-IN')}</span>
                        }
                      </td>
                      <td className="p-4 font-semibold text-gray-600">
                        {editingRoomId === room.id
                          ? <div className="flex items-center space-x-1"><span>₹</span><input type="number" value={tempPrices.priceLow} onChange={e => setTempPrices(p => ({ ...p, priceLow: e.target.value }))} className="w-20 border border-gray-300 rounded p-1 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" /></div>
                          : <span>₹{Number(room.priceLow || Math.round((room.price || 0) * 0.9)).toLocaleString('en-IN')}</span>
                        }
                      </td>
                      <td className="p-4 font-semibold text-gray-600">
                        {editingRoomId === room.id
                          ? <div className="flex items-center space-x-1"><span>₹</span><input type="number" value={tempPrices.pricePeak} onChange={e => setTempPrices(p => ({ ...p, pricePeak: e.target.value }))} className="w-20 border border-gray-300 rounded p-1 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" /></div>
                          : <span>₹{Number(room.pricePeak || Math.round((room.price || 0) * 1.15)).toLocaleString('en-IN')}</span>
                        }
                      </td>
                      <td className="p-4 font-bold text-luxury-gold">
                        <span>₹{getRoomPriceForActiveSeason(room, seasonalMultiplier).toLocaleString('en-IN')} / night</span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleRoomStatus(room.id)}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border cursor-pointer ${room.isOccupied ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                          {room.isOccupied ? 'Occupied' : 'Available'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        {editingRoomId === room.id
                          ? <div className="flex justify-center space-x-1">
                              <button onClick={() => handleSavePrice(room.id)} className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 cursor-pointer"><Check className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setEditingRoomId(null)} className="bg-gray-400 text-white p-1 rounded hover:bg-gray-500 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          : <div className="flex justify-center space-x-2">
                              <button onClick={() => handleEditPrice(room)} className="text-xs text-blue-500 hover:text-blue-700 underline font-semibold cursor-pointer">Edit Rates</button>
                              <button onClick={() => deleteRoom(room.id)} className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer" title="Delete Room"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TAB: DISCOUNTS ═════════════════════════════════════════════════ */}
        {activeTab === 'discounts' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-gray-200/30 rounded-2xl p-6 shadow-xs space-y-6 admin-card-hover">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-150 gap-4">
                <div>
                  <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Seasonal Discount Configurations</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Configure global seasonal discounts and select the active rate to apply to customer bookings.</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-semibold text-gray-600">Global Discount System:</span>
                  <button
                    type="button"
                    onClick={handleToggleGlobalDiscount}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      discountEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        discountEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold uppercase ${discountEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {discountEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Rate edit fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className={`border rounded-2xl p-5 space-y-3 relative transition-all ${
                  activeDiscountType === 'low' ? 'bg-emerald-50/30 border-emerald-300 animate-pulse-subtle' : 'bg-gray-50 border-gray-200'
                }`}>
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="activeDiscountTier"
                      value="low"
                      checked={activeDiscountType === 'low'}
                      onChange={() => handleUpdateActiveDiscountType('low')}
                      className="text-primary-500 focus:ring-primary-500 h-4.5 w-4.5 border-gray-300"
                    />
                    <span className="text-xs font-bold text-luxury-navy uppercase tracking-wider">Low Season Discount</span>
                  </label>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-light">
                    Applies when tourist footfall is low. Typically lower discount rates.
                  </p>
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-xs text-gray-500 font-semibold font-mono">₹</span>
                    <input
                      type="number"
                      value={tempDiscountLow}
                      onChange={(e) => setTempDiscountLow(e.target.value)}
                      placeholder="E.g. 500"
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-luxury-navy focus:outline-none focus:border-luxury-gold bg-white"
                    />
                  </div>
                </div>

                <div className={`border rounded-2xl p-5 space-y-3 relative transition-all ${
                  activeDiscountType === 'standard' ? 'bg-emerald-50/30 border-emerald-300 animate-pulse-subtle' : 'bg-gray-50 border-gray-200'
                }`}>
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="activeDiscountTier"
                      value="standard"
                      checked={activeDiscountType === 'standard'}
                      onChange={() => handleUpdateActiveDiscountType('standard')}
                      className="text-primary-500 focus:ring-primary-500 h-4.5 w-4.5 border-gray-300"
                    />
                    <span className="text-xs font-bold text-luxury-navy uppercase tracking-wider">Standard Discount</span>
                  </label>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-light">
                    Applies under standard operational conditions. Moderate seasonal rate.
                  </p>
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-xs text-gray-500 font-semibold font-mono">₹</span>
                    <input
                      type="number"
                      value={tempDiscountStandard}
                      onChange={(e) => setTempDiscountStandard(e.target.value)}
                      placeholder="E.g. 1000"
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-luxury-navy focus:outline-none focus:border-luxury-gold bg-white"
                    />
                  </div>
                </div>

                <div className={`border rounded-2xl p-5 space-y-3 relative transition-all ${
                  activeDiscountType === 'peak' ? 'bg-emerald-50/30 border-emerald-300 animate-pulse-subtle' : 'bg-gray-50 border-gray-200'
                }`}>
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="activeDiscountTier"
                      value="peak"
                      checked={activeDiscountType === 'peak'}
                      onChange={() => handleUpdateActiveDiscountType('peak')}
                      className="text-primary-500 focus:ring-primary-500 h-4.5 w-4.5 border-gray-300"
                    />
                    <span className="text-xs font-bold text-luxury-navy uppercase tracking-wider">Peak Season Discount</span>
                  </label>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-light">
                    Surge discount rate applied during special promotional events or holidays.
                  </p>
                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-xs text-gray-500 font-semibold font-mono">₹</span>
                    <input
                      type="number"
                      value={tempDiscountPeak}
                      onChange={(e) => setTempDiscountPeak(e.target.value)}
                      placeholder="E.g. 1500"
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-luxury-navy focus:outline-none focus:border-luxury-gold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Save button and alerts */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-start space-x-2 text-[10px] text-gray-400">
                  <Info className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    Selecting a tier applies it globally. The selected active discount will be deducted from invoice calculations on checkouts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveDiscountRates}
                  className="bg-luxury-navy hover:bg-luxury-navy/90 text-white font-sans text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-150 cursor-pointer"
                >
                  Save Rates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: CUSTOMERS & BOOKINGS ═══════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex space-x-3 text-xs font-semibold">
                <span className="px-3 py-1.5 bg-white border rounded-lg">Total: <strong>{bookings.length}</strong></span>
                <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">Pending: <strong>{metrics.pending}</strong></span>
                <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">Confirmed: <strong>{metrics.confirmed}</strong></span>
              </div>
              <div className="relative ml-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                  type="text"
                  value={bookingSearchId}
                  onChange={(e) => setBookingSearchId(e.target.value)}
                  placeholder="Search by Booking ID..."
                  className="pl-8 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-luxury-gold bg-white text-luxury-navy font-mono w-56"
                />
                {bookingSearchId && (
                  <button
                    onClick={() => setBookingSearchId('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-200/30 rounded-2xl shadow-xs overflow-x-auto admin-card-hover">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200/30">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Guest Details</th>
                    <th className="p-4">Room</th>
                    <th className="p-4">Stay Dates</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {bookings.filter(b => !bookingSearchId || b.id?.toLowerCase().includes(bookingSearchId.toLowerCase())).map(b => (
                    <tr 
                      key={b.id} 
                      className={`transition-colors border-b ${
                        b.status === 'Cancellation Requested' 
                          ? 'bg-orange-50/20 hover:bg-orange-50/30 border-l-4 border-orange-400' 
                          : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-luxury-navy text-[11px]">{b.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-luxury-navy">{b.guestName}</div>
                        <div className="text-[10px] text-gray-400">{b.email}</div>
                        {b.phone && <div className="text-[10px] text-gray-400 font-mono">{b.phone}</div>}
                        <div className="text-[10px] text-gray-400 mt-0.5">{b.guests}</div>
                        {b.status === 'Cancellation Requested' && (() => {
                          let cancelReason = "Guest Request";
                          let refundTier = "No Refund";
                          if (b.specialRequests && b.specialRequests.includes('||CANCEL_JSON||')) {
                            try {
                              const parts = b.specialRequests.split('||CANCEL_JSON||');
                              const cancelInfo = JSON.parse(parts[1].trim());
                              cancelReason = cancelInfo.cancellationReason || "Guest Request";
                              refundTier = cancelInfo.refundTier || "No Refund";
                            } catch (e) {
                              console.error(e);
                            }
                          }
                          return (
                            <div className="mt-2.5 p-2 bg-orange-50/60 border border-orange-100 rounded-xl text-[10px] max-w-xs space-y-1">
                              <p className="font-bold text-orange-850">💬 Reason:</p>
                              <p className="italic text-gray-650 font-light">"{cancelReason}"</p>
                              <p className="font-bold text-orange-700">Calculated: {refundTier}</p>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-700">{b.roomName}</div>
                        {b.food && b.food !== 'None' && <div className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">🍽 {b.food}</div>}
                      </td>
                      <td className="p-4 font-mono text-gray-600 text-[10px]">{b.checkIn}<br/>→ {b.checkOut}</td>
                      <td className="p-4 font-bold text-luxury-navy">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4">{statusBadge(b.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-1.5 font-sans">
                          {b.status === 'Pending' && <>
                            <button onClick={() => confirmBooking(b)} className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer" title="Confirm"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => updateBookingStatus(b.id, 'Cancelled')} className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer" title="Cancel"><X className="h-3.5 w-3.5" /></button>
                          </>}
                          {b.status === 'Cancellation Requested' && <>
                            <button 
                              onClick={() => handleApproveCancellation(b.id)} 
                              className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer"
                              title="Approve Cancellation"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectCancellation(b.id)} 
                              className="px-2 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold cursor-pointer"
                              title="Reject Cancellation"
                            >
                              Reject
                            </button>
                          </>}
                          {b.status === 'Confirmed' && (
                            <div className="flex items-center space-x-1">
                              <button onClick={() => printReceipt(b)} className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-luxury-gold/50 bg-luxury-gold/10 text-luxury-navy hover:bg-luxury-gold/20 text-[10px] font-bold cursor-pointer" title="Print Receipt">
                                <Printer className="h-3.5 w-3.5 text-luxury-gold" /><span>PDF</span>
                              </button>
                              <button onClick={() => openBillEditor(b)} className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold cursor-pointer" title="Edit Bill & Send Invoice">
                                <FileText className="h-3.5 w-3.5 text-blue-600" /><span>Bill</span>
                              </button>
                              <button onClick={() => handleCheckout(b)} className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px] font-bold cursor-pointer" title="Checkout Guest">
                                <span>✔ Checkout</span>
                              </button>
                            </div>
                          )}
                          <button onClick={() => deleteBooking(b.id)} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-rose-400 hover:text-rose-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TAB: USER TRACKING ════════════════════════════ */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-gray-200/30 rounded-2xl shadow-xs p-6 space-y-4 admin-card-hover">
              <div className="flex justify-between items-center pb-3 border-b border-gray-150">
                <div>
                  <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">User Tracking</h4>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Users who registered and visited Eden Spot Portal</p>
                </div>
                <span className="px-3 py-1 bg-luxury-gold/10 text-luxury-navy font-bold rounded-lg border border-luxury-gold/25 text-[10px]">
                  Total: {members.length} Users
                </span>
              </div>

              {loadingMembers ? (
                <div className="text-center py-16 space-y-3">
                  <svg className="animate-spin h-7 w-7 text-luxury-gold mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-400 text-xs">Retrieving user tracking registry...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  No tracked users found in the registry.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-150 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200/30">
                        <th className="p-4">Customer ID</th>
                        <th className="p-4">Guest Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Phone / Mobile</th>
                        <th className="p-4">Access Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs text-gray-700">
                      {members.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-mono font-bold text-luxury-navy text-[11px]">{m.id}</td>
                          <td className="p-4 font-semibold text-gray-800">{m.name}</td>
                          <td className="p-4 font-mono">{m.email}</td>
                          <td className="p-4 font-mono">{m.phone}</td>
                          <td className="p-4 text-gray-400">{m.dateCreated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: AVAILABILITY CALENDAR ══════════════════════════════════════ */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-gray-200/30 rounded-2xl shadow-xs p-6 space-y-6 animate-fade-in admin-card-hover">
            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Multi-Room Availability Grid</h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Active Range: {calendarDays[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} – {calendarDays[8].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center space-x-3.5">
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => {
                      const prev = new Date(calendarStartDate);
                      prev.setDate(prev.getDate() - 9);
                      setCalendarStartDate(prev);
                    }}
                    className="hover:bg-white text-gray-700 hover:text-luxury-navy text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-all"
                  >
                    ← Prev 9 Days
                  </button>
                  <button
                    onClick={() => {
                      const next = new Date(calendarStartDate);
                      next.setDate(next.getDate() + 9);
                      setCalendarStartDate(next);
                    }}
                    className="hover:bg-white text-gray-700 hover:text-luxury-navy text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-all border-l border-gray-200/40"
                  >
                    Next 9 Days →
                  </button>
                </div>
                <div className="flex space-x-4 text-[10px] text-gray-500 font-medium">
                  {[['bg-emerald-400','Available'],['bg-rose-400','Confirmed'],['bg-amber-400','Pending']].map(([cls,lbl]) => (
                    <span key={lbl} className="flex items-center space-x-1"><span className={`w-3 h-3 ${cls} rounded-sm`} /><span>{lbl}</span></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px] border border-gray-200/30 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200/30 text-[10px] font-bold text-gray-500 text-center py-2.5">
                  <div className="col-span-3 text-left pl-4">Room</div>
                  {calendarDays.map((day, i) => (
                    <div key={i} className="col-span-1 border-l border-gray-200/50">
                      {day.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-gray-100">
                  {rooms.map((room) => (
                    <div key={room.id} className="grid grid-cols-12 py-3 items-center text-center">
                      <div className="col-span-3 text-left pl-4 font-serif text-xs font-bold text-luxury-navy">{room.name}</div>
                      {calendarDays.map((dayDate, dIdx) => {
                        const dateStr = formatDateString(dayDate);
                        const activeBooking = bookings.find(b => {
                          if (b.roomName.trim().toLowerCase() !== room.name.trim().toLowerCase()) return false;
                          if (String(b.status).trim().toLowerCase() === 'cancelled') return false;
                          return b.checkIn <= dateStr && dateStr < b.checkOut;
                        });

                        let cls = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                        let lbl = 'Free';

                        if (activeBooking) {
                          const statusLower = String(activeBooking.status).trim().toLowerCase();
                          if (statusLower === 'confirmed') {
                            cls = 'bg-rose-100 text-rose-700 border-rose-200';
                            lbl = activeBooking.id;
                          } else if (statusLower === 'pending') {
                            cls = 'bg-amber-100 text-amber-700 border-amber-200';
                            lbl = activeBooking.id;
                          }
                        }

                        return (
                          <div key={dIdx} className="col-span-1 border-l border-gray-100 px-1">
                            <div className={`py-1.5 rounded-md border text-[9px] font-bold font-mono truncate ${cls}`} title={activeBooking ? `${activeBooking.guestName} (${activeBooking.status})` : 'Free'}>{lbl}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-[10px] text-gray-400">
              <Info className="h-4 w-4 text-luxury-gold shrink-0" />
              <p>Cells show booking IDs or "Free". Confirmed bookings are red, pending bookings are amber/yellow.</p>
            </div>
          </div>
        )}

        {/* ══ TAB: FOOD PACKAGES & PRICING ════════════════════════════════════ */}
        {activeTab === 'food' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Manage meal plans. Set 3 Veg + 3 Non-Veg combos for each meal.</p>
              <button onClick={() => setShowAddFood(true)} className="flex items-center space-x-2 bg-luxury-navy text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-luxury-navy/80 transition-all">
                <Plus className="h-4 w-4" /><span>Add Package</span>
              </button>
            </div>

            {showAddFood && (
              <div className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-luxury-navy">New Food Package</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={newFood.name} onChange={e => setNewFood(p => ({ ...p, name: e.target.value }))} placeholder="Package Name (e.g. Full Board)" className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold" />
                  <input type="number" value={newFood.price} onChange={e => setNewFood(p => ({ ...p, price: e.target.value }))} placeholder="Price ₹ per person / day" className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold" />
                  <input value={newFood.description} onChange={e => setNewFood(p => ({ ...p, description: e.target.value }))} placeholder="Short description" className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold sm:col-span-2" />
                </div>

                <p className="text-xs font-bold text-luxury-gold uppercase tracking-wider">Meal Combos — 3 Veg + 3 Non-Veg per meal</p>

                {/* ─── BREAKFAST ─────────────────────────────────── */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-amber-50 flex items-center space-x-2">
                    <span className="text-sm">🍳</span>
                    <span className="text-xs font-bold text-luxury-navy uppercase tracking-wider">Breakfast</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">🥦 Veg — 3 Combos</p>
                      <input value={newFood.bfVeg1} onChange={e => setNewFood(p => ({ ...p, bfVeg1: e.target.value }))} placeholder="Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.bfVeg2} onChange={e => setNewFood(p => ({ ...p, bfVeg2: e.target.value }))} placeholder="Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.bfVeg3} onChange={e => setNewFood(p => ({ ...p, bfVeg3: e.target.value }))} placeholder="Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-rose-500 uppercase">🍗 Non-Veg — 3 Combos</p>
                      <input value={newFood.bfNv1} onChange={e => setNewFood(p => ({ ...p, bfNv1: e.target.value }))} placeholder="Non-Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.bfNv2} onChange={e => setNewFood(p => ({ ...p, bfNv2: e.target.value }))} placeholder="Non-Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.bfNv3} onChange={e => setNewFood(p => ({ ...p, bfNv3: e.target.value }))} placeholder="Non-Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                    </div>
                  </div>
                </div>

                {/* ─── LUNCH ─────────────────────────────────────── */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-emerald-50 flex items-center space-x-2">
                    <span className="text-sm">🍛</span>
                    <span className="text-xs font-bold text-luxury-navy uppercase tracking-wider">Lunch</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">🥦 Veg — 3 Combos</p>
                      <input value={newFood.lnVeg1} onChange={e => setNewFood(p => ({ ...p, lnVeg1: e.target.value }))} placeholder="Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.lnVeg2} onChange={e => setNewFood(p => ({ ...p, lnVeg2: e.target.value }))} placeholder="Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.lnVeg3} onChange={e => setNewFood(p => ({ ...p, lnVeg3: e.target.value }))} placeholder="Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-rose-500 uppercase">🍗 Non-Veg — 3 Combos</p>
                      <input value={newFood.lnNv1} onChange={e => setNewFood(p => ({ ...p, lnNv1: e.target.value }))} placeholder="Non-Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.lnNv2} onChange={e => setNewFood(p => ({ ...p, lnNv2: e.target.value }))} placeholder="Non-Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.lnNv3} onChange={e => setNewFood(p => ({ ...p, lnNv3: e.target.value }))} placeholder="Non-Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                    </div>
                  </div>
                </div>

                {/* ─── DINNER ─────────────────────────────────────── */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-indigo-50 flex items-center space-x-2">
                    <span className="text-sm">🌙</span>
                    <span className="text-xs font-bold text-luxury-navy uppercase tracking-wider">Dinner</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">🥦 Veg — 3 Combos</p>
                      <input value={newFood.dnVeg1} onChange={e => setNewFood(p => ({ ...p, dnVeg1: e.target.value }))} placeholder="Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.dnVeg2} onChange={e => setNewFood(p => ({ ...p, dnVeg2: e.target.value }))} placeholder="Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.dnVeg3} onChange={e => setNewFood(p => ({ ...p, dnVeg3: e.target.value }))} placeholder="Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-rose-500 uppercase">🍗 Non-Veg — 3 Combos</p>
                      <input value={newFood.dnNv1} onChange={e => setNewFood(p => ({ ...p, dnNv1: e.target.value }))} placeholder="Non-Veg Combo 1" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.dnNv2} onChange={e => setNewFood(p => ({ ...p, dnNv2: e.target.value }))} placeholder="Non-Veg Combo 2" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                      <input value={newFood.dnNv3} onChange={e => setNewFood(p => ({ ...p, dnNv3: e.target.value }))} placeholder="Non-Veg Combo 3" className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none focus:border-luxury-gold" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-1">
                  <button onClick={addFood} className="bg-luxury-navy text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-luxury-navy/80">Save Package</button>
                  <button onClick={() => setShowAddFood(false)} className="text-xs text-gray-500 underline">Cancel</button>
                </div>
              </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {foodList.map(pkg => (
                <div key={pkg.id} className="bg-white border border-gray-200/30 rounded-2xl p-5 shadow-xs space-y-4 admin-card-hover">
                  {editingFoodId === pkg.id
                    ? <EditFoodForm pkg={pkg} onSave={saveFood} onCancel={() => setEditingFoodId(null)} />
                    : <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-bold text-luxury-navy">{pkg.name}</h4>
                            <p className="text-luxury-gold font-bold text-lg mt-0.5">
                              ₹{pkg.price.toLocaleString('en-IN')}
                              <span className="text-gray-400 text-xs font-normal"> / person / day</span>
                            </p>
                          </div>
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0">Active</span>
                        </div>
                        {pkg.description && <p className="text-gray-500 text-xs">{pkg.description}</p>}

                        {/* 3-Combo Grid Display */}
                        <div className="space-y-2">
                          {[
                            { emoji:'🍳', label:'Breakfast', veg:[pkg.bfVeg1,pkg.bfVeg2,pkg.bfVeg3], nv:[pkg.bfNv1,pkg.bfNv2,pkg.bfNv3] },
                            { emoji:'🍛', label:'Lunch',     veg:[pkg.lnVeg1,pkg.lnVeg2,pkg.lnVeg3], nv:[pkg.lnNv1,pkg.lnNv2,pkg.lnNv3] },
                            { emoji:'🌙', label:'Dinner',    veg:[pkg.dnVeg1,pkg.dnVeg2,pkg.dnVeg3], nv:[pkg.dnNv1,pkg.dnNv2,pkg.dnNv3] },
                          ].map(({ emoji, label, veg, nv }) => {
                            const hasVeg = veg.some(Boolean);
                            const hasNv  = nv.some(Boolean);
                            if (!hasVeg && !hasNv) return null;
                            return (
                              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-luxury-navy mb-2">{emoji} {label}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {hasVeg && (
                                    <div className="space-y-1">
                                      <p className="text-[8px] font-bold text-emerald-600 uppercase">🥦 Veg</p>
                                      {veg.map((v, i) => v ? <p key={i} className="text-[10px] text-gray-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 leading-tight">Combo {i+1}: {v}</p> : null)}
                                    </div>
                                  )}
                                  {hasNv && (
                                    <div className="space-y-1">
                                      <p className="text-[8px] font-bold text-rose-500 uppercase">🍗 Non-Veg</p>
                                      {nv.map((v, i) => v ? <p key={i} className="text-[10px] text-gray-700 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1 leading-tight">Combo {i+1}: {v}</p> : null)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {pkg.includes && pkg.includes.length > 0 && (
                          <ul className="text-[10px] text-gray-500 space-y-1">
                            {pkg.includes.map((item, i) => <li key={i} className="flex items-center space-x-1"><Check className="h-3 w-3 text-emerald-500 shrink-0" /><span>{item}</span></li>)}
                          </ul>
                        )}
                        <div className="flex space-x-3 pt-2 border-t border-gray-100">
                          <button onClick={() => setEditingFoodId(pkg.id)} className="flex items-center space-x-1 text-[10px] text-blue-500 hover:text-blue-700 font-semibold"><Edit2 className="h-3 w-3" /><span>Edit</span></button>
                          <button onClick={() => deleteFood(pkg.id)} className="flex items-center space-x-1 text-[10px] text-rose-500 hover:text-rose-700 font-semibold"><Trash2 className="h-3 w-3" /><span>Delete</span></button>
                        </div>
                      </>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: JEEP TOUR PACKAGES ════════════════════════════════════════ */}
        {activeTab === 'sightseeing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Manage curated Jeep tour packages including seasonal rates, destinations list, and cover images.</p>
              <button onClick={() => setShowAddSightseeing(true)} className="flex items-center space-x-2 bg-luxury-navy text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-luxury-navy/80 transition-all cursor-pointer">
                <Plus className="h-4 w-4" /><span>Add Tour Package</span>
              </button>
            </div>

            {showAddSightseeing && (
              <div className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-luxury-navy font-serif">New Jeep Tour Package</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Package Name</label>
                    <input value={newSightseeing.name} onChange={e => setNewSightseeing(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Munnar Classic Jeep Tour" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Places (comma-separated list)</label>
                    <input value={newSightseeing.places} onChange={e => setNewSightseeing(p => ({ ...p, places: e.target.value }))} placeholder="e.g. Tea Gardens, Echo Point, Mattupetty Dam" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  
                  {/* Place Photos Uploader */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block">Place Photos</label>
                    {(() => {
                      const list = newSightseeing.places ? newSightseeing.places.split(',').map(p => p.trim()).filter(Boolean) : [];
                      if (list.length === 0) {
                        return <p className="text-[10px] text-gray-400 italic">Enter places above to upload photos for them.</p>;
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-55 p-3 rounded-xl border border-gray-150">
                          {list.map(place => (
                            <div key={place} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200">
                              {newPlaceImages[place] ? (
                                <div className="relative h-10 w-10 rounded overflow-hidden shrink-0 group">
                                  <img src={newPlaceImages[place]} alt={place} className="h-full w-full object-contain bg-gray-50" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveNewPlaceImage(place)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] transition-opacity duration-150 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center shrink-0 text-xs">
                                  📍
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-luxury-navy truncate">{place}</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleNewPlaceImageChange(place, e)}
                                  className="block w-full text-[9px] text-gray-500 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[8px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Description</label>
                    <textarea value={newSightseeing.description} onChange={e => setNewSightseeing(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description of the tour and routes" rows="3" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Standard Season Price (₹)</label>
                    <input type="number" value={newSightseeing.priceStandard} onChange={e => setNewSightseeing(p => ({ ...p, priceStandard: e.target.value }))} placeholder="5000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Low Season Price (₹)</label>
                    <input type="number" value={newSightseeing.priceLow} onChange={e => setNewSightseeing(p => ({ ...p, priceLow: e.target.value }))} placeholder="4000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Peak Season Price (₹)</label>
                    <input type="number" value={newSightseeing.pricePeak} onChange={e => setNewSightseeing(p => ({ ...p, pricePeak: e.target.value }))} placeholder="6000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900" />
                  </div>
                  
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block">Package Image</label>
                    {newSightseeing.image && (
                      <img src={newSightseeing.image} alt="Preview" className="h-32 w-full object-contain bg-gray-50 rounded-lg border mb-2" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewSightseeing(p => ({ ...p, image: event.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-gray-550 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={addSightseeing} className="bg-luxury-navy text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-luxury-navy/80 cursor-pointer">Save Package</button>
                  <button onClick={() => { setShowAddSightseeing(false); setNewSightseeing({ name: '', description: '', places: '', image: '', priceStandard: '', priceLow: '', pricePeak: '' }); }} className="text-xs text-gray-550 underline cursor-pointer">Cancel</button>
                </div>
              </div>
            )}

            {/* Tour Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sightseeingList.map(tour => (
                <div key={tour.id} className="bg-white border border-gray-200/30 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-lg transition-all duration-300 admin-card-hover relative">
                  {tour.image && (
                    <div className="h-48 overflow-hidden relative">
                      <img src={tour.image} alt={tour.name} className="w-full h-full object-contain bg-gray-50" />
                    </div>
                  )}
                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    {editingSightseeingId === tour.id
                      ? <EditSightseeingForm tour={tour} onSave={saveSightseeing} onCancel={() => setEditingSightseeingId(null)} />
                      : <>
                          <div className="space-y-2 flex-grow text-left">
                            <h4 className="font-serif font-bold text-luxury-navy text-base flex items-center gap-1.5">
                              <span>🚙</span> {tour.name}
                            </h4>
                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100">
                              <div className="text-center">
                                <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold">Standard</span>
                                <span className="font-bold text-xs text-luxury-navy font-mono">₹{Number(tour.priceStandard || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-center border-x border-gray-200">
                                <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold">Low Season</span>
                                <span className="font-bold text-xs text-emerald-600 font-mono">₹{Number(tour.priceLow || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-center">
                                <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold">Peak Season</span>
                                <span className="font-bold text-xs text-rose-500 font-mono">₹{Number(tour.pricePeak || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            {tour.description && <p className="text-gray-500 text-xs leading-relaxed font-light">{tour.description}</p>}
                            {tour.places && (
                              <div className="space-y-1.5 pt-2">
                                <span className="text-[9px] uppercase tracking-wider text-luxury-gold font-bold block">Included Destinations</span>
                                <div className="flex flex-wrap gap-1">
                                  {(() => {
                                    let placeImgsObj = {};
                                    try {
                                      placeImgsObj = typeof tour.placeImages === 'string' ? JSON.parse(tour.placeImages || '{}') : (tour.placeImages || {});
                                    } catch (e) {
                                      placeImgsObj = {};
                                    }
                                    return String(tour.places).split(',').map((p, pIdx) => {
                                      const placeName = p.trim();
                                      const placeImg = placeImgsObj[placeName];
                                      return (
                                        <span key={pIdx} className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-lg border border-gray-200 text-[10px]">
                                          {placeImg ? (
                                            <img src={placeImg} alt={placeName} className="h-4.5 w-4.5 rounded-full object-cover shrink-0" />
                                          ) : (
                                            <span>📍</span>
                                          )}
                                          <span>{placeName}</span>
                                        </span>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-3 pt-3 border-t border-gray-100 mt-4">
                            <button onClick={() => setEditingSightseeingId(tour.id)} className="flex items-center space-x-1 text-[10px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"><Edit2 className="h-3 w-3" /><span>Edit Tour</span></button>
                            <button onClick={() => deleteSightseeing(tour.id)} className="flex items-center space-x-1 text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"><Trash2 className="h-3 w-3" /><span>Delete Tour</span></button>
                          </div>
                        </>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: GALLERY ════════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in">
            <label className="block border-2 border-dashed border-gray-300 rounded-2xl py-12 px-4 text-center space-y-3 hover:border-luxury-gold transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-luxury-gold mx-auto" />
              <div>
                <p className="text-sm font-bold text-luxury-navy">Click or drag to upload resort images</p>
                <p className="text-[11px] text-gray-400 mt-1">JPG · PNG · WEBP supported · Multiple files allowed</p>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              <span className="inline-block bg-luxury-navy text-white text-xs uppercase tracking-widest font-bold px-6 py-2.5 rounded-lg border border-luxury-gold/30 hover:border-luxury-gold">Browse Files</span>
            </label>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-luxury-navy">Gallery Images ({galleryImages.length})</h4>
              </div>
              {galleryImages.length === 0
                ? <div className="text-center py-16 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">No images uploaded yet. Use the uploader above.</div>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map(img => {
                      const assignedRooms = rooms.filter(r => (r.images || []).includes(img.url));
                      const isCurrentBackground = landingPageBackground === img.url;

                      return (
                        <div key={img.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200">
                          {/* Upper Image Section with delete overlay */}
                          <div className="relative h-44 group overflow-hidden">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                              <button
                                onClick={() => deleteGalleryImage(img.id)}
                                className="p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-md flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Image</span>
                              </button>
                            </div>
                            <div className="absolute top-2 left-2 bg-luxury-navy/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] text-white font-mono max-w-[80%] truncate">
                              {img.name}
                            </div>
                            {isCurrentBackground && (
                              <div className="absolute top-2 right-2 bg-luxury-gold text-luxury-navy font-bold text-[8px] uppercase tracking-wider px-2 py-1 rounded-lg shadow-sm border border-white/20">
                                ★ Active Landing BG
                              </div>
                            )}
                          </div>

                          {/* Lower Actions Section */}
                          <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                            {/* Landing Background Trigger */}
                            <div>
                              <button
                                onClick={() => handleSetLandingBackground(img.url)}
                                disabled={isCurrentBackground}
                                className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                  isCurrentBackground
                                    ? 'bg-luxury-gold/20 text-luxury-navy border border-luxury-gold/50 cursor-default'
                                    : 'bg-luxury-navy text-white hover:bg-luxury-navy/80 border border-transparent'
                                }`}
                              >
                                {isCurrentBackground ? '★ Current Background' : '☆ Set as Landing Background'}
                              </button>
                            </div>

                            {/* Room Assignment Dropdown */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Assign to specific room</label>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignImageToRoom(img.url, e.target.value);
                                  }
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-luxury-gold text-gray-700 cursor-pointer"
                              >
                                <option value="" disabled>+ Choose Room...</option>
                                {rooms.map(room => (
                                  <option key={room.id} value={room.id}>
                                    {room.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Current Assignments Display */}
                            <div className="space-y-1.5 flex-grow">
                              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Assigned Rooms ({assignedRooms.length})</span>
                              {assignedRooms.length === 0 ? (
                                <p className="text-[10px] text-gray-400 italic">Not assigned to any rooms yet.</p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {assignedRooms.map(room => (
                                    <span
                                      key={room.id}
                                      className="inline-flex items-center space-x-1 bg-luxury-gold/10 text-luxury-navy border border-luxury-gold/20 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                                    >
                                      <span className="truncate max-w-[120px]">{room.name}</span>
                                      <button
                                        onClick={() => handleRemoveImageFromRoom(img.url, room.id)}
                                        className="text-rose-500 hover:text-rose-700 transition-colors p-0.5 cursor-pointer"
                                        title="Unassign room"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          </div>
        )}

        {/* ══ TAB: AMENITIES ══════════════════════════════════════════════════ */}
        {activeTab === 'amenities' && (
          <div className="space-y-8 animate-fade-in">
            {/* Amenities Registry Management Section */}
            <div className="bg-white border border-gray-200/30 rounded-2xl p-6 shadow-xs space-y-4 admin-card-hover">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-serif text-base font-bold text-luxury-navy uppercase tracking-wider">Amenities Registry</h3>
                  <p className="text-xs text-gray-500">Define the global pool of amenities available to assign to rooms.</p>
                </div>
                <button
                  onClick={() => setShowAddAmenity(!showAddAmenity)}
                  className="flex items-center space-x-2 bg-luxury-navy text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-luxury-navy/80 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /><span>{showAddAmenity ? 'Cancel' : 'Add Amenity'}</span>
                </button>
              </div>

              {/* Add Amenity Form */}
              {showAddAmenity && (
                <div className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 space-y-4 animate-fade-in">
                  <h4 className="text-sm font-bold text-luxury-navy">New Amenity Definition</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Unique ID (e.g. wifi, jacuzzi)</label>
                      <input
                        value={newAmenity.id}
                        onChange={e => setNewAmenity(p => ({ ...p, id: e.target.value }))}
                        placeholder="wifi"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Display Name (e.g. High-Speed Wi-Fi)</label>
                      <input
                        value={newAmenity.name}
                        onChange={e => setNewAmenity(p => ({ ...p, name: e.target.value }))}
                        placeholder="High-Speed Wi-Fi"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Icon (Emoji or character, e.g. 📶)</label>
                      <input
                        value={newAmenity.icon}
                        onChange={e => setNewAmenity(p => ({ ...p, icon: e.target.value }))}
                        placeholder="📶"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddAmenity}
                      className="bg-luxury-navy text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-luxury-navy/80 cursor-pointer"
                    >
                      Save Amenity
                    </button>
                    <button
                      onClick={() => { setShowAddAmenity(false); setNewAmenity({ id: '', name: '', icon: '' }); }}
                      className="text-xs text-gray-500 underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Master Amenities Registry Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200/30">
                      <th className="p-4 w-20">Icon</th>
                      <th className="p-4">ID</th>
                      <th className="p-4">Display Name</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {amenityPalette.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50/60">
                        <td className="p-4 text-center text-lg">{a.icon}</td>
                        <td className="p-4 font-mono text-[11px] text-luxury-navy font-bold">{a.id}</td>
                        <td className="p-4 font-semibold text-gray-800">
                          {editingAmenityId === a.id ? (
                            <input
                              value={editAmenityData.name}
                              onChange={e => setEditAmenityData(p => ({ ...p, name: e.target.value }))}
                              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900 w-full max-w-xs"
                            />
                          ) : (
                            <span>{a.name}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {editingAmenityId === a.id ? (
                            <div className="flex justify-center items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-[10px] text-gray-400 font-bold">Icon:</span>
                                <input
                                  value={editAmenityData.icon}
                                  onChange={e => setEditAmenityData(p => ({ ...p, icon: e.target.value }))}
                                  className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900 w-16 text-center"
                                />
                              </div>
                              <button onClick={() => handleUpdateAmenity(a.id)} className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 cursor-pointer" title="Save"><Check className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setEditingAmenityId(null)} className="bg-gray-400 text-white p-1 rounded hover:bg-gray-500 cursor-pointer" title="Cancel"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ) : (
                            <div className="flex justify-center items-center space-x-3">
                              <button onClick={() => handleEditAmenity(a)} className="flex items-center space-x-1 text-[10px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"><Edit2 className="h-3 w-3" /><span>Edit</span></button>
                              <button onClick={() => handleDeleteAmenity(a.id)} className="flex items-center space-x-1 text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"><Trash2 className="h-3 w-3" /><span>Delete</span></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Room Amenity Allocations Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-navy uppercase tracking-wider">Room Amenity Allocations</h3>
                <p className="text-xs text-gray-500">Assign amenities from the registry to specific rooms. Changes are saved automatically.</p>
              </div>
              
              {rooms.map(room => {
                const roomAmenities = room.amenities || [];
                return (
                  <div key={room.id} className="bg-white border border-gray-200/30 rounded-2xl p-6 shadow-xs space-y-4 admin-card-hover">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-serif font-bold text-luxury-navy">{room.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{room.category} · {room.bedType} · {room.size} sq ft</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono bg-luxury-gold/10 text-luxury-navy border border-luxury-gold/30 px-3 py-1 rounded-lg">
                          {roomAmenities.length} / {amenityPalette.length} amenities
                        </span>
                        <button
                          onClick={() => {
                            setRoomAddingCustom(roomAddingCustom === room.id ? null : room.id);
                            setNewCustomAmenity({ name: '', icon: '' });
                          }}
                          className="text-[10px] uppercase font-bold tracking-wider text-luxury-navy border border-luxury-navy/20 hover:border-luxury-gold px-3 py-1 rounded-lg bg-gray-50 hover:bg-luxury-gold/10 transition-all flex items-center space-x-1 cursor-pointer font-sans"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Custom</span>
                        </button>
                      </div>
                    </div>

                    {/* Add Custom Amenity inline form */}
                    {roomAddingCustom === room.id && (
                      <div className="bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl p-4 space-y-3">
                        <p className="text-[11px] font-bold text-luxury-navy uppercase tracking-wider font-sans">Add Custom Amenity directly to this Room</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={newCustomAmenity.name}
                            onChange={e => setNewCustomAmenity(p => ({ ...p, name: e.target.value }))}
                            placeholder="Amenity Name (e.g. Private Hammock)"
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                          />
                          <input
                            type="text"
                            value={newCustomAmenity.icon}
                            onChange={e => setNewCustomAmenity(p => ({ ...p, icon: e.target.value }))}
                            placeholder="Emoji / Icon (e.g. 🕸️)"
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                          />
                        </div>
                        <div className="flex space-x-3 pt-1">
                          <button
                            onClick={() => handleCreateAndAssignCustomAmenity(room.id)}
                            className="bg-luxury-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-luxury-navy/85 cursor-pointer"
                          >
                            Save & Assign
                          </button>
                          <button
                            onClick={() => { setRoomAddingCustom(null); setNewCustomAmenity({ name: '', icon: '' }); }}
                            className="text-xs text-gray-500 underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {amenityPalette.map(a => {
                        const active = roomAmenities.includes(a.id);
                        return (
                          <button key={a.id} onClick={() => toggleAmenity(room.id, a.id)}
                            className={`flex items-center space-x-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${active ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-navy font-bold shadow-xs' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}>
                            <span className="text-base shrink-0">{a.icon}</span>
                            <span className="leading-tight text-left">{a.name}</span>
                            {active ? (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAmenity(room.id, a.id);
                                }}
                                className="ml-auto shrink-0 p-1 rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                title="Remove from room"
                              >
                                <X className="h-3.5 w-3.5" />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ TAB: QR SCANNERS ════════════════════════════════════════════════ */}
        {activeTab === 'qrscanners' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-navy uppercase tracking-wider">UPI QR Scanners</h3>
                <p className="text-xs text-gray-550">Configure UPI QR codes (GPay, PhonePe, Paytm) that guests will scan at checkout.</p>
              </div>
              <button
                onClick={() => setShowAddQR(!showAddQR)}
                className="flex items-center space-x-2 bg-luxury-navy text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-luxury-navy/80 transition-all cursor-pointer font-sans"
              >
                <Plus className="h-4 w-4" /><span>{showAddQR ? 'Cancel' : 'Add QR Scanner'}</span>
              </button>
            </div>

            {/* Add QR Scanner Form */}
            {showAddQR && (
              <form onSubmit={handleAddQR} className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 space-y-4 animate-fade-in text-left">
                <h4 className="text-sm font-bold text-luxury-navy font-serif">New QR Scanner Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Scanner Name (e.g. Google Pay)</label>
                    <input
                      required
                      value={newQR.name}
                      onChange={e => setNewQR(p => ({ ...p, name: e.target.value }))}
                      placeholder="Google Pay"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">UPI ID (e.g. resort@okaxis)</label>
                    <input
                      required
                      value={newQR.upiId}
                      onChange={e => setNewQR(p => ({ ...p, upiId: e.target.value }))}
                      placeholder="resort@okaxis"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">QR Code Scan Image (Optional)</label>
                    {newQR.qrImage && (
                      <div className="relative h-28 w-28 rounded-lg overflow-hidden border border-gray-200 mb-2">
                        <img src={newQR.qrImage} alt="QR Code Preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQRImageChange(e, false)}
                      className="block w-full text-xs text-gray-550 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer"
                    />
                    <p className="text-[9px] text-gray-400 font-light mt-1">If no image is uploaded, a scan code will be auto-generated based on the UPI ID.</p>
                  </div>
                  <div className="flex items-center space-x-3 h-10 select-none">
                    <input
                      type="checkbox"
                      id="newQRActive"
                      checked={newQR.isActive}
                      onChange={e => setNewQR(p => ({ ...p, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <label htmlFor="newQRActive" className="text-xs uppercase tracking-wider font-bold text-luxury-navy cursor-pointer">Active scanner on checkout</label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="bg-luxury-navy text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-luxury-navy/80 cursor-pointer font-sans"
                  >
                    Save QR Scanner
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddQR(false); setNewQR({ name: '', upiId: '', qrImage: '', isActive: true }); }}
                    className="text-xs text-gray-550 underline cursor-pointer font-sans"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* QR Scanner Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrScanners.map(qr => (
                <div key={qr.id} className="bg-white border border-gray-250 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow duration-200 text-left admin-card-hover">
                  {editingQRId === qr.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400">Scanner Name</label>
                        <input
                          value={editQRData.name}
                          onChange={e => setEditQRData(p => ({ ...p, name: e.target.value }))}
                          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400">UPI ID</label>
                        <input
                          value={editQRData.upiId}
                          onChange={e => setEditQRData(p => ({ ...p, upiId: e.target.value }))}
                          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-luxury-gold bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">QR Image</label>
                        {editQRData.qrImage && (
                          <img src={editQRData.qrImage} alt="QR Preview" className="h-16 w-16 object-contain border rounded mb-1.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQRImageChange(e, true)}
                          className="block w-full text-[9px] text-gray-500 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[8px] file:font-semibold file:bg-luxury-navy file:text-white hover:file:bg-luxury-navy/80 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center space-x-2 select-none py-1">
                        <input
                          type="checkbox"
                          id={`editQRActive-${qr.id}`}
                          checked={editQRData.isActive}
                          onChange={e => setEditQRData(p => ({ ...p, isActive: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                        />
                        <label htmlFor={`editQRActive-${qr.id}`} className="text-[10px] uppercase font-bold tracking-wider text-luxury-navy cursor-pointer">Active</label>
                      </div>
                      <div className="flex space-x-2 pt-1 border-t border-gray-100">
                        <button onClick={() => handleUpdateQR(qr.id)} className="bg-luxury-navy text-white text-[10px] font-bold uppercase px-3 py-1 rounded-lg hover:bg-luxury-navy/90 cursor-pointer">Save</button>
                        <button onClick={() => setEditingQRId(null)} className="text-[10px] text-gray-500 underline cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">QR Scanner Details</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => toggleQRActive(qr.id, qr.isActive)}
                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              qr.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                qr.isActive ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[9px] font-bold uppercase ${qr.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {qr.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="py-4 flex flex-col items-center space-y-3.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 my-3">
                        <img src={qr.qrImage} alt={qr.name} className="h-32 w-32 object-contain bg-white p-2 rounded-xl border border-gray-100" />
                        <div className="text-center">
                          <h4 className="font-serif text-sm font-bold text-luxury-navy">{qr.name}</h4>
                          <span className="font-mono text-[10px] text-gray-405 bg-white border px-2 py-0.5 rounded-lg mt-1 inline-block">{qr.upiId}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3.5 pt-2.5 border-t border-gray-100">
                        <button onClick={() => handleEditQR(qr)} className="flex items-center space-x-1 text-[10px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"><Edit2 className="h-3 w-3" /><span>Edit</span></button>
                        <button onClick={() => handleDeleteQR(qr.id)} className="flex items-center space-x-1 text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"><Trash2 className="h-3 w-3" /><span>Delete</span></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: REVIEWS ════════════════════════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex space-x-4 text-xs font-semibold">
              <span className="px-3 py-1.5 bg-white border rounded-lg">Total: <strong>{reviews.length}</strong></span>
              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">Published: <strong>{reviews.filter(r => r.approved).length}</strong></span>
              <span className="px-3 py-1.5 bg-gray-100 border rounded-lg text-gray-500">Hidden: <strong>{reviews.filter(r => !r.approved).length}</strong></span>
            </div>
            <div className="bg-white border border-gray-200/30 rounded-2xl shadow-xs overflow-hidden admin-card-hover">
              <div className="divide-y divide-gray-100">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex space-x-4 items-start">
                      <img src={rev.avatar} alt={rev.name} className="w-11 h-11 rounded-full object-cover border shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-xs font-bold text-luxury-navy">{rev.name}</h4>
                          <span className="text-[9px] text-gray-400 font-mono">{rev.date}</span>
                          {!rev.approved && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">Hidden</span>}
                        </div>
                        <p className="text-[10px] text-luxury-gold uppercase tracking-wider font-semibold">{rev.room}</p>
                        <Stars rating={rev.rating} />
                        <p className="text-gray-600 text-xs font-light max-w-2xl leading-relaxed italic mt-1">"{rev.comment}"</p>
                      </div>
                    </div>
                    <button onClick={() => toggleReview(rev.id)}
                      className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${rev.approved ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`}>
                      {rev.approved ? '✓ Published' : 'Publish'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* ══ BILL EDITOR MODAL ════════════════════════════════════════════ */}
      {isBillModalOpen && selectedBookingForBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-luxury-gold/30 shadow-2xl p-6 max-w-2xl w-full my-8 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-luxury-navy">Bill Editor &amp; Custom Invoice</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Booking ID: {selectedBookingForBill.id} · Guest: {selectedBookingForBill.guestName}</p>
              </div>
              <button onClick={() => setIsBillModalOpen(false)} className="p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form Controls */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-luxury-gold border-b border-luxury-gold/10 pb-1">Itemized Costs</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Room Rate (₹)</label>
                    <input
                      type="number"
                      value={billFormData.roomRate}
                      onChange={e => updateBillTotals({ roomRate: Number(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-luxury-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Nights</label>
                    <input
                      type="number"
                      value={billFormData.nights}
                      onChange={e => updateBillTotals({ nights: Number(e.target.value) || 1 })}
                      className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-luxury-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Food Cost (₹)</label>
                    <input
                      type="number"
                      value={billFormData.foodCost}
                      onChange={e => updateBillTotals({ foodCost: Number(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-luxury-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Sightseeing Cost (₹)</label>
                    <input
                      type="number"
                      value={billFormData.sightseeingCost}
                      onChange={e => updateBillTotals({ sightseeingCost: Number(e.target.value) || 0 })}
                      className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-luxury-gold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Seasonal Discount (₹)</label>
                  <input
                    type="number"
                    value={billFormData.discount}
                    onChange={e => updateBillTotals({ discount: Number(e.target.value) || 0 })}
                    className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-luxury-gold outline-none text-emerald-600"
                  />
                </div>

                {/* Extras Addition */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h5 className="text-[9px] uppercase font-bold tracking-wider text-luxury-gold">Add Extra Charge (Incidentals)</h5>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7">
                      <input
                        type="text"
                        placeholder="Item Description (e.g. Extra Bed, Snacks)"
                        value={newExtra.name}
                        onChange={e => setNewExtra(p => ({ ...p, name: e.target.value }))}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Price"
                        value={newExtra.price}
                        onChange={e => setNewExtra(p => ({ ...p, price: e.target.value }))}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddExtra}
                        className="w-full bg-luxury-gold text-white font-bold p-2 rounded-lg hover:bg-luxury-gold/90 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Bill Summary */}
              <div className="bg-gray-50 border border-gray-200/50 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-luxury-navy border-b border-gray-200 pb-2 mb-3">Live Bill Preview</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room Stay ({billFormData.nights} Nights):</span>
                      <span className="font-semibold text-luxury-navy">₹{billFormData.roomCost.toLocaleString('en-IN')}</span>
                    </div>
                    {billFormData.foodCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Food / Meal Packages:</span>
                        <span className="font-semibold text-luxury-navy">₹{billFormData.foodCost.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {billFormData.sightseeingCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sightseeing:</span>
                        <span className="font-semibold text-luxury-navy">₹{billFormData.sightseeingCost.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    {/* Extras list rendering */}
                    {billFormData.extras.length > 0 && (
                      <div className="pt-2 border-t border-dashed border-gray-200 space-y-1.5">
                        <div className="text-[9px] uppercase tracking-wider text-luxury-gold font-bold">Extras</div>
                        {billFormData.extras.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center group">
                            <span className="text-gray-500">➕ {ex.name}</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-luxury-navy">₹{ex.price.toLocaleString('en-IN')}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExtra(i)}
                                className="text-rose-500 hover:text-rose-700 font-bold opacity-80 hover:opacity-100 cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {billFormData.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 mt-2">
                        <span>🏷️ Discount:</span>
                        <span>-₹{billFormData.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal:</span>
                    <span>₹{billFormData.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-550">
                    <span>Luxury Tax ({(selectedBookingForBill?.gstRate || gstRate)}%):</span>
                    <span>₹{billFormData.luxuryTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-double border-luxury-gold/50 text-sm font-bold text-luxury-navy">
                    <span className="uppercase tracking-wider">Grand Total:</span>
                    <span className="text-base text-luxury-gold">₹{billFormData.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsBillModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 text-xs font-bold cursor-pointer"
                disabled={isSavingBill}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndSendBill}
                className="px-5 py-2 bg-luxury-navy text-white rounded-xl hover:bg-luxury-navy/90 text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md"
                disabled={isSavingBill}
              >
                {isSavingBill ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save &amp; Send Email</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
