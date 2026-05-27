import React, { useState } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, CreditCard, Calendar, Users, Info, 
  ArrowLeft, CheckCircle, Ship, Coffee, Compass, Car, QrCode
} from 'lucide-react';

export default function Checkout({ checkoutData, onBackClick, onConfirmBooking, qrScanners = [], bookings = [], customerUser, gstRate }) {
  // If no checkout details exist, fall back to avoid crashing
  if (!checkoutData) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-gray-500 text-xs">No active checkout session found.</p>
        <button onClick={onBackClick} className="bg-luxury-navy text-white text-xs uppercase tracking-widest font-bold px-6 py-2">
          Return to Room Selector
        </button>
      </div>
    );
  }

  const { 
    room, checkIn, checkOut, nights, adults, children, rooms, 
    selectedFoodPackage, selectedSightseeing, selectedVehicle, pricing 
  } = checkoutData;

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  React.useEffect(() => {
    if (customerUser) {
      const nameVal = customerUser.name || '';
      const parts = nameVal.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(customerUser.email || '');
      setPhone(customerUser.phone || '');
    }
  }, [customerUser]);

  const [arrivalFlight, setArrivalFlight] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedQRId, setSelectedQRId] = useState('');

  React.useEffect(() => {
    const active = qrScanners.filter(q => q.isActive);
    if (active.length > 0 && !selectedQRId) {
      setSelectedQRId(active[0].id);
    }
  }, [qrScanners, selectedQRId]);

  const selectedQR = qrScanners.find(q => q.id === selectedQRId) || qrScanners.filter(q => q.isActive)[0];

  const [agreeTerms, setAgreeTerms] = useState(false);

  // Success Modal State
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please accept the terms and conditions to submit your booking request.");
      return;
    }

    // Safety check: verify no confirmed booking overlaps for the selected dates of this room
    const isDatesOccupied = bookings.some(b => {
      if (b.roomName.trim().toLowerCase() !== room.name.trim().toLowerCase()) return false;
      if (String(b.status).trim().toLowerCase() !== 'confirmed') return false;
      return b.checkIn < checkOut && checkIn < b.checkOut;
    });

    if (isDatesOccupied) {
      alert("❌ This room is already reserved for the selected dates. Please return to the Room Selector and choose another date range.");
      return;
    }

    // Generate random booking ID
    const randomId = "B-" + Math.floor(1000 + Math.random() * 9000);
    setGeneratedBookingId(randomId);

    // Call parent's confirm callback to push booking into mock bookings list in App.js
    const newBookingObj = {
      id: randomId,
      guestName: `${firstName} ${lastName}`,
      email,
      phone,
      roomName: room.name,
      checkIn,
      checkOut,
      guests: `${adults} Adults${children > 0 ? `, ${children} Children` : ''}`,
      totalAmount: Math.round(pricing.total),
      status: "Pending", // Admin can approve/cancel
      dateCreated: new Date().toISOString().split('T')[0],
      // Custom customizations
      food: selectedFoodPackage && selectedFoodPackage.label !== 'None'
        ? `${selectedFoodPackage.label} [${selectedFoodPackage.details}]`
        : 'None',
      sightseeing: selectedSightseeing ? `${selectedSightseeing.name} [Jeep Tour: ${selectedSightseeing.places}]` : 'None',
      specialRequests,
      gstRate: gstRate
    };

    onConfirmBooking(newBookingObj);
    setShowSuccess(true);

    // Persist to Google Sheets via Flask backend
    try { await api.create('Bookings', newBookingObj); } catch(e) { console.error('Failed to save booking to backend:', e); }
  };

  return (
    <div className="bg-gray-50/30 min-h-screen font-sans pb-16">
      
      {/* Header bar */}
      <div className="border-b border-gray-100 py-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-3 text-xs font-semibold text-gray-600">
          <button 
            onClick={onBackClick}
            className="flex items-center space-x-1.5 hover:text-luxury-gold transition-colors duration-200"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Modify Selection</span>
          </button>
          <span>/</span>
          <span className="text-luxury-navy font-bold uppercase tracking-wider">Booking Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <h1 className="font-serif text-3xl font-bold text-luxury-navy mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Guest & Payment Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            
            {/* 1. Guest Details */}
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 md:p-8 shadow-xs space-y-6 admin-card-hover">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <div className="w-6 h-6 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center font-bold text-xs">1</div>
                <h3 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Guest Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full text-xs border border-gray-200 rounded-lg p-3 text-luxury-navy focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full text-xs border border-gray-200 rounded-lg p-3 text-luxury-navy focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@email.com"
                    className="w-full text-xs border border-gray-200 rounded-lg p-3 text-luxury-navy focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs border border-gray-200 rounded-lg p-3 text-luxury-navy focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              {/* Shuttle transfer details */}
              <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl space-y-3">
                <div className="flex space-x-2 text-xs text-primary-900 font-semibold items-center">
                  <Ship className="h-4 w-4 text-primary-500" />
                  <span>Sandalwood Valley Coordination</span>
                </div>
                <p className="text-[10px] text-primary-850 font-light leading-relaxed">
                  As Eden Spot Homestay is situated in Marayoor, Idukki, we coordinate arrival transfers from Cochin International Airport (COK), Coimbatore Airport (CJB), or local train stations. Please enter your travel details below.
                </p>
                <div className="space-y-1 max-w-sm">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-primary-600">Arrival Flight or Train details (E.g. flight coordinates/times)</label>
                  <input
                    type="text"
                    value={arrivalFlight}
                    onChange={(e) => setArrivalFlight(e.target.value)}
                    placeholder="E.g. AI 512 arriving COK at 14:30"
                    className="w-full text-xs border border-primary-200 rounded-lg p-2.5 bg-white text-luxury-navy focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Special Requests / Dietary Guidelines</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="E.g., Allergy warnings, honeymoon setups, extra spices preference, early arrival check-in requests..."
                  rows="3"
                  className="w-full text-xs border border-gray-200 rounded-lg p-3 text-luxury-navy focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>

            {/* 2. QR Code Payment Details */}
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 md:p-8 shadow-xs space-y-6 admin-card-hover text-left">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <div className="w-6 h-6 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center font-bold text-xs">2</div>
                <h3 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider">Payment Information</h3>
              </div>

              <div className="space-y-5">
                <div className="p-4 bg-primary-50/40 rounded-2xl border border-primary-100/50 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-primary-900">
                    <QrCode className="h-4.5 w-4.5 text-primary-500 shrink-0" />
                    <span>Pay with UPI (GPay / PhonePe / Paytm)</span>
                  </div>
                  <p className="text-[10px] text-primary-850 font-light leading-relaxed">
                    You can pay your advance booking amount or full payment securely here. Please scan the QR code of your preferred UPI app below to complete the payment transaction.
                  </p>
                </div>

                {/* QR Code Tab Selector */}
                {qrScanners.filter(q => q.isActive).length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 italic">
                    No active UPI payment methods configured. Please contact the resort admin.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Tab buttons */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
                      {qrScanners.filter(q => q.isActive).map(qr => (
                        <button
                          key={qr.id}
                          type="button"
                          onClick={() => setSelectedQRId(qr.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            (selectedQR?.id === qr.id)
                              ? 'bg-luxury-navy text-white shadow-md'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {qr.name}
                        </button>
                      ))}
                    </div>

                    {/* QR Display Panel */}
                    {selectedQR && (
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-200/55">
                        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm shrink-0">
                          <img
                            src={selectedQR.qrImage}
                            alt={`${selectedQR.name} Scan QR`}
                            className="h-40 w-40 object-contain mx-auto"
                          />
                        </div>
                        <div className="space-y-3 text-center md:text-left flex-1">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-luxury-navy">Pay via {selectedQR.name}</h4>
                            <p className="text-[10px] text-gray-400 font-light mt-0.5">Scan the QR code with your payment app or pay using the UPI ID below.</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-wider font-bold text-gray-400 block">UPI ID</span>
                            <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl font-mono text-xs text-luxury-navy font-bold shadow-2xs">
                              <span>{selectedQR.upiId}</span>
                            </div>
                          </div>
                          <div className="bg-white/60 border border-luxury-gold/20 p-3 rounded-xl text-[10px] text-luxury-navy/85 leading-normal">
                            💰 <strong>Advance Amount:</strong> We suggest paying an advance of 50% (₹{(Math.round(pricing.total * 0.5)).toLocaleString('en-IN')}) or the full amount of ₹{Math.round(pricing.total).toLocaleString('en-IN')} to confirm your room reservation.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}


              </div>
            </div>

            {/* Terms and Submission */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                />
                <span className="leading-relaxed">
                  I request this booking at Eden Spot Homestay. I understand that the owner will receive this reservation request with my customization selections. Once confirmed, I will receive an official booking confirmation email containing my downloadable PDF receipt.
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-luxury-navy hover:bg-primary-600 text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-xl shadow-lg border border-luxury-gold/30 hover:border-luxury-gold transition-all duration-300"
              >
                Send Booking Request (₹{pricing.total.toLocaleString('en-IN')})
              </button>
            </div>

          </form>

          {/* RIGHT: Booking Breakdown details */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Room mini details card */}
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 shadow-xs space-y-4 admin-card-hover">
              <h3 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider pb-3 border-b border-gray-50">Resort Reservation</h3>
              
              <div className="flex space-x-3.5 items-center">
                <img src={room.images[0]} alt={room.name} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <h4 className="font-serif text-xs font-bold text-luxury-navy leading-tight">{room.name}</h4>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mt-0.5">{room.category}</span>
                  <span className="text-xs font-serif font-semibold text-luxury-gold mt-1 block">₹{room.price.toLocaleString('en-IN')} / night</span>
                </div>
              </div>

              {/* Checkin / Checkout summary block */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-gray-500 font-medium">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Check-in</span>
                  <span className="text-luxury-navy font-bold">{checkIn}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Check-out</span>
                  <span className="text-luxury-navy font-bold">{checkOut}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-luxury-gold" />
                  <span>Duration:</span>
                </span>
                <span className="font-semibold text-luxury-navy">{nights} Nights ({rooms} Room)</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-luxury-gold" />
                  <span>Guests:</span>
                </span>
                <span className="font-semibold text-luxury-navy">{adults} Adults{children > 0 ? `, ${children} Children` : ''}</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 shadow-xs space-y-4 admin-card-hover">
              <h3 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider pb-3 border-b border-gray-50">Price Breakdown</h3>
                       <div className="space-y-2.5 text-xs text-gray-550">
                <div className="flex justify-between">
                  <span>Room Cost ({nights} nights)</span>
                  <span className="font-semibold text-luxury-navy">₹{pricing.roomCost.toLocaleString('en-IN')}</span>
                </div>

                {selectedFoodPackage && selectedFoodPackage.label !== 'None' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="flex items-center space-x-1.5 shrink-0">
                        <Coffee className="h-3.5 w-3.5 text-luxury-gold" />
                        <span className="truncate max-w-[150px]">{selectedFoodPackage.label}</span>
                      </span>
                      <span className="font-semibold text-luxury-navy">₹{pricing.foodCost.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedFoodPackage.details && (
                      <p className="pl-5 text-[10px] text-gray-400 font-light leading-tight">
                        {selectedFoodPackage.details}
                      </p>
                    )}
                  </div>
                )}

                {selectedSightseeing && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="flex items-center space-x-1.5">
                        <Compass className="h-3.5 w-3.5 text-luxury-gold" />
                        <span className="truncate max-w-[200px]">Jeep Tour: {selectedSightseeing.name}</span>
                      </span>
                      <span className="font-semibold text-luxury-navy">₹{pricing.sightseeingCost.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="pl-5 text-[10px] text-gray-400 font-light leading-tight">
                      🚙 4x4 Jeep transport included to: {selectedSightseeing.places}
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-1 border-t border-gray-550">
                  <span>Luxury GST Tax ({gstRate}%)</span>
                  <span className="font-semibold text-luxury-navy">₹{pricing.luxuryTax.toLocaleString('en-IN')}</span>
                </div>

                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1.5 mt-1.5">
                    <span className="flex items-center space-x-1.5">
                      <span>🏷️</span>
                      <span>Discount Applied</span>
                    </span>
                    <span>-₹{pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-gray-200/30 text-sm font-bold text-luxury-navy">
                  <span>Calculated Total</span>
                  <span className="font-serif text-lg text-luxury-gold">₹{pricing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl flex space-x-2 text-[10px] text-primary-850">
              <Info className="h-4.5 w-4.5 text-primary-500 shrink-0 mt-0.5" />
              <p className="leading-normal">Your credit card is verified and held securely. The resort owner will manually review this custom reservation request before sending confirmation details.</p>
            </div>

          </aside>

        </div>

      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-luxury-gold/30 shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
            
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle className="h-10 w-10 shrink-0 fill-emerald-50 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-luxury-navy">Booking Request Sent!</h3>
              <p className="text-gray-500 text-xs font-light px-2">
                Thank you, <strong className="font-semibold text-gray-700">{firstName}</strong>. Your customized stay request at Eden Spot Homestay has been submitted to the owner.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/30 space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Request ID:</span>
                <span className="font-mono font-bold text-luxury-navy">{generatedBookingId}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total Amount:</span>
                <span className="font-bold text-luxury-gold">₹{pricing.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Room Requested:</span>
                <span className="font-semibold text-luxury-navy truncate max-w-[120px]">{room.name}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-light leading-normal px-4">
              An email notification has been dispatched to the owner. Once they confirm, a downloadable PDF invoice link will be sent to you at <span className="font-medium text-gray-600">{email}</span>.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onBackClick(); // Return to room details page
                }}
                className="w-full bg-luxury-navy text-white text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold transition-colors"
              >
                Go to Rooms & Villas
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
