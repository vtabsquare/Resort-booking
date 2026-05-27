import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RoomsList from './pages/RoomsList';
import RoomDetails from './pages/RoomDetails';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import CustomerProfile from './components/CustomerProfile';
import FeedbackView from './components/FeedbackView';
import { roomsData, initialBookings, mockReviews, foodPackages as initialFoodPackages, sightseeingPackages as initialSightseeing } from './data/resortData';
import api from './services/api';

export default function App() {
  const [currentView, setView] = useState('home'); // 'home', 'rooms', 'room-details', 'checkout', 'admin', 'my-bookings'
  const [selectedRoomId, setSelectedRoomId] = useState('overwater-sanctuary');
  
  // Customer User Authentication States
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('customerUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [submittingCust, setSubmittingCust] = useState(false);
  const [custError, setCustError] = useState('');

  // Auto-popup Login Container after 2.5 seconds on home/landing page
  useEffect(() => {
    if (currentView === 'home' && !customerUser && !sessionStorage.getItem('hasAutoPoppedLogin')) {
      const timer = setTimeout(() => {
        setIsLoginModalOpen(true);
        sessionStorage.setItem('hasAutoPoppedLogin', 'true');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentView, customerUser]);

  // Check URL query parameters for feedback routing on mount/load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const bookingIdParam = params.get('bookingId');
    if (viewParam === 'feedback' && bookingIdParam) {
      setView('feedback');
    }
  }, []);

  const handleCustomerLoginSubmit = async (e) => {
    e.preventDefault();
    if (!custName.trim() || !custEmail.trim() || !custPhone.trim()) {
      alert("Please fill out all fields.");
      return;
    }
    setSubmittingCust(true);
    setCustError('');
    try {
      const res = await api.registerLoginCustomer({
        name: custName.trim(),
        email: custEmail.trim().toLowerCase(),
        phone: custPhone.trim()
      });
      if (res && res.customer) {
        localStorage.setItem('customerUser', JSON.stringify(res.customer));
        setCustomerUser(res.customer);
        setIsLoginModalOpen(false);
        setCustName('');
        setCustEmail('');
        setCustPhone('');
        setView('my-bookings');
      }
    } catch (err) {
      setCustError(err.response?.data?.error || 'Login failed. Please verify your details.');
    } finally {
      setSubmittingCust(false);
    }
  };

  // Search parameters synced across Home and Rooms pages
  const [searchParams, setSearchParams] = useState(null);
  
  // Checkout packet data transfer state
  const [checkoutData, setCheckoutData] = useState(null);

  // Global Mock Database States (Fallback)
  const [rooms, setRooms] = useState(roomsData.map(r => ({ ...r, isOccupied: false })));
  const [bookings, setBookings] = useState(initialBookings);
  const [reviews, setReviews] = useState(mockReviews.map(r => ({ ...r, approved: true })));
  
  // Dynamic database states
  const [foodPackages, setFoodPackages] = useState(initialFoodPackages);
  const [sightseeingPackages, setSightseeingPackages] = useState(initialSightseeing);
  const [galleryImages, setGalleryImages] = useState([]);
  const [seasonalMultiplier, setSeasonalMultiplier] = useState(1.0);
  const [gstRate, setGstRate] = useState(12);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [landingPageBackground, setLandingPageBackground] = useState('/landing_page.webp');
  const [qrScanners, setQrScanners] = useState([]);
  
  // Discount States
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [activeDiscountType, setActiveDiscountType] = useState('standard');
  const [discountLow, setDiscountLow] = useState(500);
  const [discountStandard, setDiscountStandard] = useState(1000);
  const [discountPeak, setDiscountPeak] = useState(1500);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch real data from Google Sheets API
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
        const [apiRooms, apiBookings, apiReviews, apiFood, apiSightseeing, apiSettings, apiGallery, apiAmenities, apiQrScanners, apiDiscounts] = await Promise.all([
          fetch(`${API_BASE}/Rooms`).then(r => r.json()),
          fetch(`${API_BASE}/Bookings`).then(r => r.json()),
          fetch(`${API_BASE}/Reviews`).then(r => r.json()),
          fetch(`${API_BASE}/Food`).then(r => r.json()),
          fetch(`${API_BASE}/Sightseeing`).then(r => r.json()),
          fetch(`${API_BASE}/settings`).then(r => r.json()),
          fetch(`${API_BASE}/Gallery`).then(r => r.json()),
          fetch(`${API_BASE}/Amenities`).then(r => r.json()),
          fetch(`${API_BASE}/QRScanners`).then(r => r.json().catch(() => [])).catch(() => []),
          fetch(`${API_BASE}/Discounts`).then(r => r.json().catch(() => [])).catch(() => []),
        ]);

        if (apiRooms && apiRooms.length > 0) {
          const mergedRooms = apiRooms.map(apiRoom => {
            const staticRoom = roomsData.find(r => r.id === apiRoom.id);
            let amenities = apiRoom.amenities;
            if (typeof amenities === 'string') {
              amenities = amenities ? amenities.split(',').map(s => s.trim()).filter(Boolean) : [];
            }
            let images = apiRoom.images;
            if (typeof images === 'string') {
              try {
                images = JSON.parse(images);
              } catch (e) {
                images = images ? images.split(',').map(s => s.trim()).filter(Boolean) : [];
              }
            }
            return {
              id: apiRoom.id,
              name: apiRoom.name || 'Unnamed Room',
              category: apiRoom.category || 'Room',
              price: Number(apiRoom.price) || 0,
              priceLow: Number(apiRoom.priceLow) || Math.round((Number(apiRoom.price) || 0) * 0.9),
              pricePeak: Number(apiRoom.pricePeak) || Math.round((Number(apiRoom.price) || 0) * 1.15),
              rating: Number(apiRoom.rating) || 5.0,
              reviewsCount: Number(apiRoom.reviewsCount) || 0,
              size: Number(apiRoom.size) || 0,
              view: apiRoom.view || 'Scenic View',
              bedType: apiRoom.bedType || '1 King Bed',
              description: apiRoom.description || '',
              maxOccupancy: staticRoom?.maxOccupancy || { adults: 2, children: 1, rooms: 1 },
              highlights: staticRoom?.highlights || [],
              ...staticRoom,
              price: Number(apiRoom.price) || (staticRoom ? staticRoom.price : 0),
              priceLow: Number(apiRoom.priceLow) || (staticRoom ? Math.round(staticRoom.price * 0.9) : Math.round(Number(apiRoom.price) * 0.9)),
              pricePeak: Number(apiRoom.pricePeak) || (staticRoom ? Math.round(staticRoom.price * 1.15) : Math.round(Number(apiRoom.price) * 1.15)),
              isOccupied: String(apiRoom.isOccupied).toLowerCase() === 'true',
              rating: Number(apiRoom.rating) || (staticRoom ? staticRoom.rating : 5.0),
              reviewsCount: Number(apiRoom.reviewsCount) || (staticRoom ? staticRoom.reviewsCount : 0),
              amenities: Array.isArray(amenities) && amenities.length > 0 ? amenities : (staticRoom ? staticRoom.amenities : []),
              images: Array.isArray(images) && images.length > 0 ? images : (staticRoom ? staticRoom.images : []),
            };
          });
          setRooms(mergedRooms);
        }
        if (apiBookings && apiBookings.length > 0) setBookings(apiBookings);
        if (apiReviews && apiReviews.length > 0) setReviews(apiReviews);

        if (apiFood && apiFood.length > 0) {
          const parsedFood = apiFood.map(f => ({
            ...f,
            price: Number(f.price) || 0
          }));
          setFoodPackages(parsedFood);
        }

        if (apiSightseeing && apiSightseeing.length > 0) {
          const parsedSightseeing = apiSightseeing.map(s => ({
            ...s,
            priceStandard: Number(s.priceStandard) || 0,
            priceLow: Number(s.priceLow) || 0,
            pricePeak: Number(s.pricePeak) || 0,
            price: Number(s.priceStandard) || Number(s.price) || 0
          }));
          setSightseeingPackages(parsedSightseeing);
        }

        if (apiSettings && apiSettings.length > 0) {
          const multRecord = apiSettings.find(s => s.key === 'seasonalMultiplier');
          if (multRecord) {
            setSeasonalMultiplier(parseFloat(multRecord.value) || 1.0);
          }
          const bgRecord = apiSettings.find(s => s.key === 'landingPageBackground');
          if (bgRecord && bgRecord.value) {
            setLandingPageBackground(bgRecord.value);
          }
          const gstRecord = apiSettings.find(s => s.key === 'gstRate');
          if (gstRecord) {
            setGstRate(parseFloat(gstRecord.value) || 12);
          }
        }

        if (apiDiscounts && apiDiscounts.length > 0) {
          const discEnabledRecord = apiDiscounts.find(s => s.key === 'discountEnabled');
          if (discEnabledRecord) {
            setDiscountEnabled(discEnabledRecord.value.toLowerCase() === 'true');
          }
          const discActiveRecord = apiDiscounts.find(s => s.key === 'activeDiscountType');
          if (discActiveRecord) {
            setActiveDiscountType(discActiveRecord.value || 'standard');
          }
          const discLowRecord = apiDiscounts.find(s => s.key === 'discountLow');
          if (discLowRecord) {
            setDiscountLow(Number(discLowRecord.value) || 0);
          }
          const discStdRecord = apiDiscounts.find(s => s.key === 'discountStandard');
          if (discStdRecord) {
            setDiscountStandard(Number(discStdRecord.value) || 0);
          }
          const discPeakRecord = apiDiscounts.find(s => s.key === 'discountPeak');
          if (discPeakRecord) {
            setDiscountPeak(Number(discPeakRecord.value) || 0);
          }
        }

        if (apiGallery && apiGallery.length > 0) {
          setGalleryImages(apiGallery.map(img => ({
            id: img.id,
            url: img.url,
            name: img.name || ''
          })));
        }

        if (apiAmenities && apiAmenities.length > 0) {
          setAmenities(apiAmenities);
        } else {
          setAmenities([
            { id: "wifi", name: "Complimentary High-Speed Wi-Fi", icon: "📶" },
            { id: "pool", name: "Infinity Pool & Private Lake Deck", icon: "🏊" },
            { id: "ayurveda", name: "Ayurvedic Treatment Wellness Center", icon: "💆" },
            { id: "dining", name: "Traditional Kerala & Multi-Cuisine Fine Dining", icon: "🍽️" },
            { id: "butler", name: "24/7 Dedicated Butler Service", icon: "🛎️" },
            { id: "yoga", name: "Morning Lakefront Yoga Pavilion", icon: "🧘" },
            { id: "shuttle", name: "Private Speedboat Airport Pickups", icon: "⛵" },
            { id: "bar", name: "Sunset Floating Beverage Lounge", icon: "🥂" },
            { id: "tours", name: "Bespoke Canal Cruises & Houseboat Safaris", icon: "🚤" },
            { id: "ac", name: "Fully Climate-Controlled Villas", icon: "❄️" }
          ]);
        }

        if (apiQrScanners && apiQrScanners.length > 0) {
          setQrScanners(apiQrScanners.map(q => ({
            ...q,
            isActive: String(q.isActive).toLowerCase() === 'true'
          })));
        } else {
          setQrScanners([
            { id: "qr-gpay", name: "Google Pay (GPay)", upiId: "gpay-resort@okaxis", qrImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=gpay-resort@okaxis&pn=Eden%20Spot%20Homestay", isActive: true },
            { id: "qr-phonepe", name: "PhonePe", upiId: "phonepe-resort@ybl", qrImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=phonepe-resort@ybl&pn=Eden%20Spot%20Homestay", isActive: true },
            { id: "qr-paytm", name: "Paytm", upiId: "paytm-resort@paytm", qrImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=paytm-resort@paytm&pn=Eden%20Spot%20Homestay", isActive: true }
          ]);
        }
      } catch (error) {
        console.error("Failed to load data from Flask backend:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    fetchApiData();
  }, []);

  // Add confirmed booking to lists
  const handleConfirmNewBooking = (newBooking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleBookStayCTA = () => {
    setView('rooms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = (data) => {
    setCheckoutData(data);
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render view conditionally
  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Home 
            setView={setView} 
            setSelectedRoomId={setSelectedRoomId}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            heroBackground={landingPageBackground}
          />
        );
      case 'rooms':
        return (
          <RoomsList 
            rooms={rooms}
            bookings={bookings}
            setView={setView}
            setSelectedRoomId={setSelectedRoomId}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            seasonalMultiplier={seasonalMultiplier}
            amenitiesList={amenities}
          />
        );
      case 'room-details':
        return (
          <RoomDetails 
            dbRooms={rooms}
            bookings={bookings}
            roomId={selectedRoomId}
            setView={setView}
            onBackClick={() => setView('rooms')}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onProceedToCheckout={handleProceedToCheckout}
            foodPackages={foodPackages}
            sightseeingPackages={sightseeingPackages}
            seasonalMultiplier={seasonalMultiplier}
            amenitiesList={amenities}
            discountEnabled={discountEnabled}
            activeDiscountType={activeDiscountType}
            discountLow={discountLow}
            discountStandard={discountStandard}
            discountPeak={discountPeak}
            gstRate={gstRate}
          />
        );
      case 'checkout':
        return (
          <Checkout 
            checkoutData={checkoutData}
            onBackClick={() => setView('room-details')}
            onConfirmBooking={handleConfirmNewBooking}
            qrScanners={qrScanners}
            bookings={bookings}
            customerUser={customerUser}
            gstRate={gstRate}
          />
        );
      case 'my-bookings':
        return (
          <CustomerProfile 
            customerUser={customerUser}
            onLogout={() => {
              localStorage.removeItem('customerUser');
              setCustomerUser(null);
              setView('home');
            }}
            setView={setView}
          />
        );
      case 'feedback':
        return (
          <FeedbackView 
            setView={setView} 
            bookings={bookings}
            setReviews={setReviews}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            rooms={rooms}
            setRooms={setRooms}
            bookings={bookings}
            setBookings={setBookings}
            reviews={reviews}
            setReviews={setReviews}
            setView={setView}
            foodPackages={foodPackages}
            setFoodPackages={setFoodPackages}
            sightseeingPackages={sightseeingPackages}
            setSightseeingPackages={setSightseeingPackages}
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
            seasonalMultiplier={seasonalMultiplier}
            setSeasonalMultiplier={setSeasonalMultiplier}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            amenities={amenities}
            setAmenities={setAmenities}
            landingPageBackground={landingPageBackground}
            setLandingPageBackground={setLandingPageBackground}
            discountEnabled={discountEnabled}
            setDiscountEnabled={setDiscountEnabled}
            activeDiscountType={activeDiscountType}
            setActiveDiscountType={setActiveDiscountType}
            discountLow={discountLow}
            setDiscountLow={setDiscountLow}
            discountStandard={discountStandard}
            setDiscountStandard={setDiscountStandard}
            discountPeak={discountPeak}
            setDiscountPeak={setDiscountPeak}
            qrScanners={qrScanners}
            setQrScanners={setQrScanners}
            gstRate={gstRate}
            setGstRate={setGstRate}
          />
        );
      default:
        return (
          <Home 
            setView={setView} 
            setSelectedRoomId={setSelectedRoomId}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            heroBackground={landingPageBackground}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800 selection:bg-luxury-gold/30 selection:text-luxury-navy">
      
      {/* Dynamic Sticky Header Navbar */}
      {currentView !== 'admin' && (
        <Navbar 
          currentView={currentView} 
          setView={setView} 
          onBookClick={handleBookStayCTA}
          customerUser={customerUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Main Page Content */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* Render global footer only if not on the Admin tab */}
      {currentView !== 'admin' && (
        <Footer setView={setView} />
      )}

      {/* GUEST LOGIN & PORTAL SIGN-IN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-luxury-gold/30 shadow-2xl p-6 md:p-8 max-w-sm w-full relative text-left space-y-6 animate-fade-in text-xs">
            
            {/* Close button */}
            <button 
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-55 cursor-pointer"
            >
              <span className="sr-only">Close modal</span>
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-luxury-navy rounded-2xl flex items-center justify-center border border-luxury-gold/50 mx-auto">
                <span className="font-serif text-white font-bold text-lg">N</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-luxury-navy">Guest Stay Portal</h3>
              <p className="text-[10px] text-gray-600 font-semibold tracking-wider uppercase">Access stay records &amp; cancel reservations</p>
            </div>

            {custError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs text-center font-medium">
                {custError}
              </div>
            )}

            <form onSubmit={handleCustomerLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700">Guest Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">👤</span>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-luxury-gold bg-white text-luxury-navy font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">✉️</span>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="E.g. john@email.com"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-luxury-gold bg-white text-luxury-navy font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-700">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">📞</span>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="E.g. +91 98765 43210"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-luxury-gold bg-white text-luxury-navy font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingCust}
                className="w-full bg-luxury-navy hover:bg-luxury-navy/90 disabled:opacity-60 text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold transition-all duration-300 cursor-pointer text-center"
              >
                {submittingCust ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying details...</span>
                  </>
                ) : (
                  <span>Access Stay Portal</span>
                )}
              </button>
            </form>

            <div className="text-center border-t border-gray-50 pt-4">
              <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                New guests are registered automatically upon signing in.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
