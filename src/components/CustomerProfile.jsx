import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Phone, ShieldCheck, ArrowLeft, AlertTriangle, LogOut, CheckCircle, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

export default function CustomerProfile({ customerUser, onLogout, setView }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cancellation Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [modalRefundInfo, setModalRefundInfo] = useState({ tier: 'No Refund', color: '' });

  const fetchBookings = async () => {
    if (!customerUser) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getCustomerBookings(customerUser.email, customerUser.phone);
      // Sort bookings: newest created first
      const sorted = (data || []).sort((a, b) => {
        return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
      });
      setBookings(sorted);
    } catch (err) {
      setError('Could not retrieve your bookings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [customerUser]);

  const calculateRefundTier = (checkInDate) => {
    try {
      const checkInTime = new Date(checkInDate + 'T12:00:00'); // Assume standard check-in is 12:00 PM
      const now = new Date();
      const diffMs = checkInTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours >= 48) {
        return { tier: '100% Refund', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      } else if (diffHours >= 24) {
        return { tier: '50% Refund', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      } else {
        return { tier: 'No Refund', color: 'text-rose-600 bg-rose-50 border-rose-200' };
      }
    } catch (e) {
      return { tier: 'No Refund', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
  };

  const handleOpenCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    const refund = calculateRefundTier(booking.checkIn);
    setModalRefundInfo(refund);
  };

  const handleCloseCancelModal = () => {
    setSelectedBooking(null);
    setCancelReason('');
  };

  const handleRequestCancellation = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    setSubmittingCancel(true);
    try {
      await api.requestCancellation(selectedBooking.id, cancelReason);
      alert("Cancellation request submitted successfully. The resort admin will review your request and dispatch a confirmation email.");
      handleCloseCancelModal();
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to submit cancellation request. Please try again later.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status).trim().toLowerCase();
    if (s === 'confirmed') {
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
    } else if (s === 'pending') {
      return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending Approval</span>;
    } else if (s === 'cancellation requested') {
      return <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Cancellation Pending</span>;
    } else if (s === 'cancelled') {
      return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
    }
    return <span className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-250 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
  };

  return (
    <div className="bg-gray-50/30 min-h-screen font-sans pb-16 pt-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1">
            <button 
              onClick={() => setView('home')}
              className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-luxury-gold transition-all cursor-pointer mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            <h1 className="font-serif text-3xl font-bold text-luxury-navy">Guest Profile & Portal</h1>
            <p className="text-xs text-gray-400 mt-0.5">View your resort stay records, check policies, and manage reservations.</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Guest Summary & Policies */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Guest Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 shadow-xs space-y-4 admin-card-hover">
              <div className="flex items-center space-x-3.5 pb-4 border-b border-gray-55">
                <div className="w-11 h-11 rounded-full bg-luxury-navy text-white flex items-center justify-center font-bold text-lg border border-luxury-gold/30">
                  {customerUser?.name ? customerUser.name.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-luxury-navy">{customerUser?.name}</h3>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mt-0.5">Registered Guest</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center space-x-2.5">
                  <Mail className="h-4 w-4 text-luxury-gold shrink-0" />
                  <span className="truncate">{customerUser?.email}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Phone className="h-4 w-4 text-luxury-gold shrink-0" />
                  <span className="font-mono">{customerUser?.phone}</span>
                </div>
                {customerUser?.dateCreated && (
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="h-4 w-4 text-luxury-gold shrink-0" />
                    <span>Member Since: {customerUser.dateCreated}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Refund & Cancellation Policy Card */}
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 shadow-xs space-y-4 admin-card-hover text-xs leading-relaxed text-gray-600">
              <h3 className="font-serif text-sm font-bold text-luxury-navy uppercase tracking-wider pb-3 border-b border-gray-50 flex items-center space-x-2">
                <span>📋</span>
                <span>Cancellation Policies</span>
              </h3>
              
              <div className="space-y-3.5">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</div>
                  <div>
                    <p className="font-bold text-luxury-navy">100% Refund (Full Refund)</p>
                    <p className="text-[10px] text-gray-450 mt-0.5">For cancellation requests submitted <strong>more than 48 hours</strong> before the scheduled check-in time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 mt-0.5">½</div>
                  <div>
                    <p className="font-bold text-luxury-navy">50% Partial Refund</p>
                    <p className="text-[10px] text-gray-450 mt-0.5">For cancellations made <strong>between 24 and 48 hours</strong> prior to the check-in time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✕</div>
                  <div>
                    <p className="font-bold text-luxury-navy">No Refund</p>
                    <p className="text-[10px] text-gray-450 mt-0.5">Cancellations made <strong>less than 24 hours</strong> before check-in or in case of a no-show are non-refundable.</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-xl mt-3 text-[10px] font-light text-gray-500 leading-normal flex items-start space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 text-luxury-gold shrink-0 mt-0.5" />
                <p>Refund tier calculations are calculated automatically from the moment you click "Request Cancellation". Refund approvals are processed in accordance with bank transfer cycles.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Bookings Listing */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-2xl border border-gray-200/30 p-6 md:p-8 shadow-xs space-y-6 admin-card-hover">
              <div className="flex justify-between items-center pb-3 border-b border-gray-55">
                <h3 className="font-serif text-base font-bold text-luxury-navy uppercase tracking-wider flex items-center space-x-2">
                  <span>🛎️</span>
                  <span>Your Stay Bookings ({bookings.length})</span>
                </h3>
                <button
                  onClick={fetchBookings}
                  className="p-1.5 text-gray-400 hover:text-luxury-gold rounded-lg transition-colors cursor-pointer"
                  title="Reload Bookings"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 space-y-3">
                  <svg className="animate-spin h-7 w-7 text-luxury-gold mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-400 text-xs">Retrieving your stay reservations...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-rose-500 text-xs font-semibold bg-rose-50 border border-rose-100 rounded-xl p-4">
                  {error}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <p className="text-gray-400 text-xs font-light">No bookings found under this account.</p>
                  <button 
                    onClick={() => setView('rooms')}
                    className="bg-luxury-navy hover:bg-luxury-navy/90 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold transition-all cursor-pointer font-sans"
                  >
                    Book A Stay Now
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {bookings.map(b => {
                    const canCancel = String(b.status).trim().toLowerCase() === 'confirmed' || String(b.status).trim().toLowerCase() === 'pending';
                    
                    return (
                      <div 
                        key={b.id} 
                        className={`border rounded-2xl p-5 md:p-6 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs bg-white ${
                          String(b.status).trim().toLowerCase() === 'cancelled' 
                            ? 'border-gray-200/50 bg-gray-50/20 opacity-70' 
                            : 'border-gray-200 hover:border-luxury-gold/40'
                        }`}
                      >
                        <div className="space-y-3.5 flex-1 text-left">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono font-bold text-luxury-navy text-xs bg-gray-100 px-2 py-0.5 rounded">{b.id}</span>
                            {getStatusBadge(b.status)}
                          </div>
                          
                          <div>
                            <h4 className="font-serif text-sm font-bold text-luxury-navy leading-tight">{b.roomName}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-gray-500 text-[11px] font-medium mt-1">
                              <span className="flex items-center space-x-1"><Calendar className="h-3.5 w-3.5 text-luxury-gold shrink-0" /><span>{b.checkIn} to {b.checkOut}</span></span>
                              <span>•</span>
                              <span>{b.guests}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {b.food && b.food !== 'None' && (
                              <span className="bg-blue-50/70 border border-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium">🍽️ {b.food}</span>
                            )}
                            {b.sightseeing && b.sightseeing !== 'None' && (
                              <span className="bg-orange-50/70 border border-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-medium">🚙 Jeep Tour</span>
                            )}
                          </div>
                        </div>

                        <div className="flex md:flex-col items-end justify-between md:justify-center w-full md:w-auto border-t md:border-t-0 border-gray-50 pt-3.5 md:pt-0 gap-3">
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Total Amount</span>
                            <span className="font-serif font-bold text-luxury-gold text-base">₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(b)}
                              className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-xl font-bold transition-all text-[10px] tracking-wide cursor-pointer font-sans"
                            >
                              Request Cancellation
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* CANCELLATION REQUEST MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-luxury-gold/30 shadow-2xl p-6 md:p-8 max-w-md w-full text-left space-y-5 animate-fade-in">
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h3 className="font-serif text-lg font-bold text-luxury-navy">Cancel Booking Request</h3>
              <button 
                onClick={handleCloseCancelModal} 
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border rounded-2xl text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking ID:</span>
                <span className="font-mono font-bold text-luxury-navy">{selectedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stay check-in:</span>
                <span className="font-bold text-luxury-navy">{selectedBooking.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Billed:</span>
                <span className="font-bold text-luxury-gold">₹{Number(selectedBooking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Refund Tier Warning Alert */}
            <div className={`p-4 border rounded-2xl flex items-start space-x-3 text-xs font-semibold ${modalRefundInfo.color}`}>
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wide">Cancellation Policy Check</p>
                <p className="text-[11px] font-normal leading-relaxed mt-0.5">Based on the current date, you are eligible for a <strong className="font-bold">{modalRefundInfo.tier}</strong> refund.</p>
              </div>
            </div>

            <form onSubmit={handleRequestCancellation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400">Reason for Cancellation</label>
                <textarea
                  required
                  placeholder="Please state why you need to cancel this booking (e.g. medical emergency, changed travel dates)..."
                  rows="4"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-luxury-navy focus:outline-none focus:border-luxury-gold bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCancelModal}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-55 font-bold transition-all text-[11px] text-center uppercase tracking-wider cursor-pointer"
                  disabled={submittingCancel}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="flex-grow py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all text-[11px] text-center uppercase tracking-wider cursor-pointer flex items-center justify-center space-x-2"
                  disabled={submittingCancel}
                >
                  {submittingCancel ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
