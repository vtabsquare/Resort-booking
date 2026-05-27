import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, Check } from 'lucide-react';
import api from '../services/api';

export default function FeedbackView({ setView, bookings, setReviews }) {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bId = params.get('bookingId');
    if (bId) {
      setBookingId(bId);
      const found = bookings.find(b => b.id === bId);
      if (found) {
        setBooking(found);
      }
    }
    setLoading(false);
  }, [bookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief description of your stay experience.');
      return;
    }

    setSubmitting(true);
    setError('');

    const newReview = {
      id: String(Date.now()),
      name: booking ? booking.guestName : 'Verified Guest',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rating: Number(rating),
      comment: comment.trim(),
      room: booking ? booking.roomName : 'Garden View Cottage',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      approved: false // Admin must approve before it is visible
    };

    try {
      await api.create('Reviews', newReview);
      setReviews(prev => [newReview, ...prev]);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-gray-500">
        <svg className="animate-spin h-8 w-8 text-luxury-gold mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-semibold tracking-wider uppercase">Loading Guest Reservation Details...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-16 px-6 py-12 bg-white rounded-3xl border border-gray-100 shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-150 mx-auto">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-luxury-navy">Feedback Submitted!</h2>
        <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-xs mx-auto">
          Thank you for sharing your experience, {booking ? booking.guestName : 'Valued Guest'}. Your feedback helps us maintain the highest standard of luxury homestay experiences.
        </p>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/');
            setView('home');
          }}
          className="mt-4 bg-luxury-navy text-white text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded-xl hover:bg-luxury-navy/90 border border-luxury-gold/30 hover:border-luxury-gold transition-all duration-300 cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-16 px-6 sm:px-8 py-10 bg-white rounded-3xl border border-gray-100 shadow-2xl space-y-8 animate-fade-in text-left">
      <div className="text-center space-y-2 border-b border-gray-100 pb-5">
        <h2 className="font-serif text-2xl font-bold text-luxury-navy">Share Your Feedback</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          {booking ? `Review stay at ${booking.roomName}` : 'Eden Spot Homestay Stay Experience'}
        </p>
      </div>

      {booking && (
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
          <p>Guest Name: <strong className="text-luxury-navy">{booking.guestName}</strong></p>
          <p>Dates of Stay: <strong className="text-luxury-navy">{booking.checkIn} to {booking.checkOut}</strong></p>
          <p>Villa / Cottage: <strong className="text-luxury-navy">{booking.roomName}</strong></p>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-2xl text-rose-600 text-xs font-semibold flex items-start space-x-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-gray-700">
        
        {/* Rating Select */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">How would you rate your stay?</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
              >
                <Star
                  className={`h-7 w-7 transition-colors duration-200 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[10px] text-luxury-gold uppercase tracking-wider block mt-1 font-bold">
            {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
          </span>
        </div>

        {/* Comment field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Your Experience</label>
          <textarea
            required
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your stay, local activities in Marayoor, support of the staff..."
            className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-luxury-gold bg-white text-luxury-navy font-semibold text-xs leading-relaxed transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-luxury-navy hover:bg-luxury-navy/90 text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-2xl border border-luxury-gold/30 hover:border-luxury-gold transition-all duration-300 cursor-pointer text-center disabled:opacity-60 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Submitting Review...</span>
            </>
          ) : (
            <span>Submit Stay Review</span>
          )}
        </button>

      </form>
    </div>
  );
}
