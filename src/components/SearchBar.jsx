import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, ChevronDown, MapPin, ChevronLeft, ChevronRight, 
  Search, Anchor, Trees, Ship, Compass, ArrowRight
} from 'lucide-react';

export default function SearchBar({ onSearch, initialParams }) {
  const [place, setPlace] = useState(initialParams?.place || 'Kumarakom Backwaters');
  const [checkIn, setCheckIn] = useState(initialParams?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialParams?.checkOut || '');
  const [adults, setAdults] = useState(initialParams?.adults || 2);
  const [children, setChildren] = useState(initialParams?.children || 0);
  const [rooms, setRooms] = useState(initialParams?.rooms || 1);
  
  // Track which search section dropdown is open: 'where', 'when', 'who' or null
  const [activeTab, setActiveTab] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  // Calendar month/year navigation state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateString = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateString(new Date());

  const isPrevDisabled = calendarYear < new Date().getFullYear() || 
    (calendarYear === new Date().getFullYear() && calendarMonth <= new Date().getMonth());

  // Kerala-centric Destination List
  const destinations = [
    { 
      name: "Kumarakom Backwaters", 
      description: "Quiet lake lagoons & houseboat resorts",
      icon: Anchor 
    },
    { 
      name: "Munnar Tea Hills", 
      description: "Mist-capped valleys & tree cottages",
      icon: Trees 
    },
    { 
      name: "Alleppey Canals", 
      description: "Floating heritage houseboat cruise",
      icon: Ship 
    },
    { 
      name: "Wayanad Wilderness", 
      description: "Bamboo rafting & jungle retreats",
      icon: Compass 
    }
  ];

  const handlePlaceSelect = (selectedPlace) => {
    setPlace(selectedPlace);
    setActiveTab('when');
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleDateClick = (date) => {
    const dateStr = formatDateString(date);
    
    // Clear and set checkIn if no checkIn exists, or if both checkIn/checkOut are already selected
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
      setHoverDate(null);
    } else {
      // If clicked date is before checkIn, set it as checkIn instead
      if (new Date(dateStr) < new Date(checkIn)) {
        setCheckIn(dateStr);
        setHoverDate(null);
      } else {
        setCheckOut(dateStr);
        setHoverDate(null);
        // Automatically proceed to Guest dropdown
        setActiveTab('who');
      }
    }
  };

  const clearDates = () => {
    setCheckIn('');
    setCheckOut('');
    setHoverDate(null);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!checkIn || !checkOut) {
      setActiveTab('when');
      alert("Please select both Check-In and Check-Out dates on the calendar.");
      return;
    }
    
    setActiveTab(null);
    onSearch({
      place,
      checkIn,
      checkOut,
      adults,
      children,
      rooms
    });
  };

  // Helper to generate days list for the month view
  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0: Sunday, 1: Monday...
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding blocks for week start offset
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Days objects
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  // Render a single calendar grid
  const renderCalendarGrid = (year, month) => {
    const days = getDaysInMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="space-y-1">
        {/* Weekdays Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase select-none">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 text-center gap-y-1 text-xs">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="h-9" />;

            const dateStr = formatDateString(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            // Timezone-safe comparison to clear hours
            const compDate = new Date(date);
            compDate.setHours(0, 0, 0, 0);
            const isPast = compDate < today;

            const isCheckIn = checkIn && dateStr === checkIn;
            const isCheckOut = checkOut && dateStr === checkOut;
            const isInRange = checkIn && checkOut && 
              new Date(dateStr) > new Date(checkIn) && 
              new Date(dateStr) < new Date(checkOut);
            
            const isInHoverRange = checkIn && !checkOut && hoverDate && 
              new Date(dateStr) > new Date(checkIn) && 
              new Date(dateStr) <= new Date(hoverDate);

            let dayStyle = "h-9 w-9 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer font-semibold relative ";
            
            if (isPast) {
              dayStyle += "text-gray-300 cursor-not-allowed pointer-events-none";
            } else if (isCheckIn || isCheckOut) {
              dayStyle += "bg-primary-500 text-white font-bold shadow-md scale-105 z-10";
            } else if (isInRange) {
              dayStyle += "bg-primary-50/70 text-primary-900 rounded-none w-full";
            } else if (isInHoverRange) {
              dayStyle += "bg-primary-50/40 text-primary-850 rounded-none w-full border-y border-dashed border-primary-200";
            } else {
              dayStyle += "text-luxury-navy hover:bg-gray-100";
              if (isToday) {
                dayStyle += " border border-luxury-gold";
              }
            }

            return (
              <div 
                key={dateStr} 
                className="py-0.5 relative flex items-center justify-center"
                onMouseEnter={() => !isPast && !checkOut && setHoverDate(dateStr)}
              >
                <button
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={isPast}
                  className={dayStyle}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const leftMonthDate = new Date(calendarYear, calendarMonth, 1);
  const leftMonthName = leftMonthDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const rightMonthYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
  const rightMonthMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
  const rightMonthDate = new Date(rightMonthYear, rightMonthMonth, 1);
  const rightMonthName = rightMonthDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div 
      ref={containerRef}
      className="w-full bg-[#ffb700] rounded-xl shadow-2xl p-1 flex flex-col lg:flex-row items-stretch gap-1 relative z-20"
    >
      
      {/* 1. Destination Column */}
      <div 
        onClick={() => setActiveTab('where')}
        className={`w-full lg:w-[26%] flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors duration-150 rounded-lg lg:rounded-none lg:rounded-l-lg min-w-0 ${
          activeTab === 'where' ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Anchor className="h-6 w-6 text-gray-500 shrink-0" />
        <span className="text-[13px] font-semibold text-gray-900 truncate">
          {place || 'Where are you going?'}
        </span>
      </div>
      
      {/* 2. Dates Selection Column */}
      <div 
        onClick={() => setActiveTab('when')}
        className={`w-full lg:w-[32%] flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors duration-150 rounded-lg lg:rounded-none min-w-0 ${
          activeTab === 'when' ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Calendar className="h-6 w-6 text-gray-500 shrink-0" />
        <span className="text-[13px] font-semibold text-gray-900 truncate">
          {checkIn && checkOut ? (
            `${new Date(checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
          ) : checkIn ? (
            `${new Date(checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – Check-out`
          ) : (
            'Check-in — Check-out'
          )}
        </span>
      </div>

      {/* 3. Occupancy Column */}
      <div 
        onClick={() => setActiveTab('who')}
        className={`w-full lg:w-[32%] flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors duration-150 rounded-lg lg:rounded-none min-w-0 ${
          activeTab === 'who' ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Users className="h-6 w-6 text-gray-500 shrink-0" />
        <span className="text-[13px] font-semibold text-gray-900 truncate">
          {adults} adults · {children} children · {rooms} room
        </span>
      </div>

      {/* 4. Action Button Column */}
      <div className="w-full lg:w-[10%] rounded-lg lg:rounded-none lg:rounded-r-sm overflow-hidden bg-[#006ce4]">
        <button
          type="button"
          onClick={handleSearchSubmit}
          className="w-full h-full text-white font-sans text-[17px] font-bold py-3 px-4 hover:bg-[#0057b8] active:bg-[#0047a0] transition-colors flex items-center justify-center cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* POPUP DROPDOWN CONTEXTS */}
      
      {/* 1. Places Selector */}
      {activeTab === 'where' && (
        <div className="absolute left-4 top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-150 p-5 z-30 animate-fade-in w-full lg:w-96 cursor-default">
          <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-2 select-none">Suggested Kerala Destinations</p>
          <div className="space-y-0.5">
            {destinations.map((d) => {
              const Icon = d.icon;
              return (
                <div 
                  key={d.name}
                  onClick={() => handlePlaceSelect(d.name)}
                  className="flex items-center space-x-3.5 p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50/50 flex items-center justify-center border border-primary-100 text-luxury-gold shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-luxury-navy truncate">{d.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{d.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Calendar Selector */}
      {activeTab === 'when' && (
        <div className="absolute left-0 right-0 mx-auto lg:left-4 lg:right-auto top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-150 p-6 z-30 animate-fade-in max-w-2xl w-[96vw] lg:w-[650px] cursor-default flex flex-col">
          {/* Header Controls */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 select-none">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              className={`p-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-luxury-gold hover:text-luxury-gold transition-colors ${
                isPrevDisabled ? 'opacity-20 pointer-events-none' : ''
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-serif text-xs font-bold text-luxury-navy tracking-wide">
              Select Stay Duration
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-luxury-gold hover:text-luxury-gold transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Grids */}
          <div className="flex flex-col md:flex-row gap-6 pt-4">
            {/* Left Month Grid */}
            <div className="w-full md:w-1/2">
              <p className="text-center font-bold text-[11px] uppercase tracking-wider text-luxury-navy mb-3 select-none">{leftMonthName}</p>
              {renderCalendarGrid(calendarYear, calendarMonth)}
            </div>
            {/* Right Month Grid */}
            <div className="w-full md:w-1/2 hidden md:block border-l border-gray-100 pl-6">
              <p className="text-center font-bold text-[11px] uppercase tracking-wider text-luxury-navy mb-3 select-none">{rightMonthName}</p>
              {renderCalendarGrid(rightMonthYear, rightMonthMonth)}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4 text-xs select-none">
            <div className="text-gray-550 flex items-center space-x-1.5 min-w-0">
              {checkIn ? (
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="font-bold text-luxury-navy">Duration:</span>
                  <span className="bg-primary-50 px-2 py-0.5 rounded text-primary-800 font-bold">
                    {new Date(checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  {checkOut ? (
                    <>
                      <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="bg-primary-50 px-2 py-0.5 rounded text-primary-800 font-bold">
                        {new Date(checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </>
                  ) : (
                    <span className="text-primary-500 font-semibold animate-pulse">Choose check-out date</span>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">Choose check-in date from calendar</span>
              )}
            </div>
            {checkIn && (
              <button
                type="button"
                onClick={clearDates}
                className="text-[10px] uppercase font-bold tracking-widest text-primary-600 hover:text-primary-700 transition-colors underline"
              >
                Clear Stay
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Guest Selector */}
      {activeTab === 'who' && (
        <div className="absolute right-4 top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-150 p-6 z-30 animate-fade-in w-72 lg:w-80 cursor-default">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-4 select-none">Occupancy Configuration</p>
          
          <div className="space-y-4">
            {/* Adults Counter */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-luxury-navy tracking-wider select-none">Adults</p>
                <p className="text-[10px] text-gray-400 select-none">Ages 13 and above</p>
              </div>
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:border-luxury-gold hover:text-luxury-gold text-sm select-none transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold text-luxury-navy inline-block w-4 text-center">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults(Math.min(10, adults + 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:border-luxury-gold hover:text-luxury-gold text-sm select-none transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children Counter */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-luxury-navy tracking-wider select-none">Children</p>
                <p className="text-[10px] text-gray-400 select-none">Ages 2 to 12</p>
              </div>
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:border-luxury-gold hover:text-luxury-gold text-sm select-none transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold text-luxury-navy inline-block w-4 text-center">{children}</span>
                <button
                  type="button"
                  onClick={() => setChildren(Math.min(8, children + 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:border-luxury-gold hover:text-luxury-gold text-sm select-none transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rooms Counter */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-luxury-navy tracking-wider select-none">Rooms</p>
                <p className="text-[10px] text-gray-400 select-none">Total rooms requested</p>
              </div>
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:border-luxury-gold hover:text-luxury-gold text-sm select-none transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold text-luxury-navy inline-block w-4 text-center">{rooms}</span>
                <button
                  type="button"
                  onClick={() => setRooms(Math.min(5, rooms + 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:border-luxury-gold hover:text-luxury-gold text-sm select-none transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="w-full bg-luxury-navy text-white text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-lg border border-luxury-gold/30 hover:border-luxury-gold transition-colors mt-2"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
