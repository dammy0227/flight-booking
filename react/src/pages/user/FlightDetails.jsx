import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getFlightById } from '../../features/flights/flightSlice';
import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiUsers,
  FiClock,
  FiMapPin,
  FiInfo,
  FiAirplay,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiPackage,
  FiShield,
  FiCreditCard,
  FiBriefcase,
  FiCoffee,
  FiWifi,
  FiMonitor,
  FiSpeaker,
  FiStar,
  FiZap
} from 'react-icons/fi';

const FlightDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedFlight, loading, flights } = useSelector((state) => state.flights);
  
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [selectedCabin, setSelectedCabin] = useState('economy');

  const flight = useMemo(() => {
    if (location.state?.flight) return location.state.flight;
    if (selectedFlight && selectedFlight._id === id) return selectedFlight;
    if (flights && flights.length > 0 && id) {
      return flights.find(f => f._id === id);
    }
    return null;
  }, [location.state, selectedFlight, flights, id]);

  useEffect(() => {
    if (id && !flight && !loading) {
      dispatch(getFlightById(id));
    }
  }, [id, flight, loading, dispatch]);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${hour12}:${minutes} ${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'N/A';
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const handlePassengerChange = (increment) => {
    if (increment && numberOfPassengers < (flight?.availableSeats || 0)) {
      setNumberOfPassengers(prev => prev + 1);
    } else if (!increment && numberOfPassengers > 1) {
      setNumberOfPassengers(prev => prev - 1);
    }
  };

  const handleProceedToBooking = () => {
    if (!flight) return;
    
    const selectedCabinData = cabinClasses.find(c => c.id === selectedCabin);
    const totalPrice = (selectedCabinData?.price || flight.price) * numberOfPassengers;
    
    navigate('/booking', {
      state: {
        type: 'flight',
        referenceId: flight._id || flight.id,
        id: flight._id || flight.id,
        price: selectedCabinData?.price || flight.price,
        quantity: numberOfPassengers,
        totalPrice: totalPrice,
        flightDetails: {
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          from: flight.departureCity,
          to: flight.arrivalCity,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          departureCity: flight.departureCity,
          arrivalCity: flight.arrivalCity,
          cabinClass: selectedCabin
        }
      }
    });
  };

  if (loading && !flight) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-12 text-center">
            <FiAirplay className="text-6xl mx-auto mb-4 text-gray-300" />
            <h3 className="text-gray-800 text-xl font-semibold mb-2">Flight not found</h3>
            <p className="text-gray-500 text-sm mb-5">The flight you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/user-dashboard/flights')}
              className="px-6 py-2.5 bg-[#C9A84C] rounded-xl text-white text-sm font-semibold hover:bg-[#B8922E] transition-colors"
            >
              Back to Flights
            </button>
          </div>
        </div>
      </div>
    );
  }

  const seatsLow = flight.availableSeats < 10;
  const duration = calculateDuration(flight.departureTime, flight.arrivalTime);

  const cabinClasses = [
    { 
      id: 'economy', 
      name: 'Economy', 
      price: flight.price, 
      icon: FiUsers,
      features: ['Standard seat', 'Meal included', '1 carry-on', 'Free Wi-Fi'] 
    },
    { 
      id: 'business', 
      name: 'Business', 
      price: flight.price * 2.5, 
      icon: FiBriefcase,
      features: ['Extra legroom', 'Premium meal', '2 carry-ons', 'Lounge access', 'Priority boarding'] 
    },
    { 
      id: 'first', 
      name: 'First Class', 
      price: flight.price * 4, 
      icon: FiStar,
      features: ['Lie-flat seat', 'Gourmet dining', 'Priority boarding', 'Luxury lounge', 'Chauffeur service'] 
    }
  ];

  const selectedCabinData = cabinClasses.find(c => c.id === selectedCabin) || cabinClasses[0];
  const SelectedCabinIcon = selectedCabinData.icon;

  const amenities = [
    { icon: FiWifi, name: 'Free Wi-Fi' },
    { icon: FiMonitor, name: 'Entertainment' },
    { icon: FiCoffee, name: 'Meals' },
    { icon: FiSpeaker, name: 'USB Ports' }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/user-dashboard/flights')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#C9A84C] transition-colors group"
          >
            <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Flights</span>
          </button>

          {/* Airline Header */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <FiAirplay className="text-[#C9A84C] text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{flight.airline}</h2>
                    <p className="text-gray-500 text-sm mt-1">Flight {flight.flightNumber}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                  seatsLow 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {seatsLow ? <FiAlertCircle size={14} /> : <FiCheckCircle size={14} />}
                  {flight.availableSeats} seats available
                </div>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-gray-800">{formatTime(flight.departureTime)}</p>
                <p className="text-lg text-[#C9A84C] font-semibold mt-1">{flight.departureCity}</p>
                <p className="text-sm text-gray-500 mt-1">{formatShortDate(flight.departureTime)}</p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#C9A84C] to-transparent"></div>
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <FiAirplay className="text-[#C9A84C] text-lg" />
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#C9A84C] to-transparent"></div>
                </div>
                <p className="text-center text-gray-500 text-sm font-medium">{duration}</p>
                <p className="text-center text-xs text-gray-400 mt-1">Direct Flight</p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-3xl font-bold text-gray-800">{formatTime(flight.arrivalTime)}</p>
                <p className="text-lg text-[#C9A84C] font-semibold mt-1">{flight.arrivalCity}</p>
                <p className="text-sm text-gray-500 mt-1">{formatShortDate(flight.arrivalTime)}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Cabin Class Selection */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiPackage className="text-[#C9A84C]" />
                  Cabin Class
                </h3>
                <div className="space-y-3">
                  {cabinClasses.map(cabin => {
                    const CabinIcon = cabin.icon;
                    const isSelected = selectedCabin === cabin.id;
                    return (
                      <button
                        key={cabin.id}
                        onClick={() => setSelectedCabin(cabin.id)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                            : 'border-gray-200 hover:border-[#C9A84C]/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <CabinIcon className="text-[#C9A84C]" size={20} />
                            <p className="text-gray-800 font-semibold">{cabin.name}</p>
                          </div>
                          <p className="text-[#C9A84C] font-bold">${cabin.price}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cabin.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="text-gray-500 text-xs">• {feature}</span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flight Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiInfo className="text-[#C9A84C]" />
                  Flight Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FiClock className="text-[#C9A84C] mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Duration</p>
                      <p className="text-gray-800 font-semibold text-sm">{duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-[#C9A84C] mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Route</p>
                      <p className="text-gray-800 font-semibold text-sm">
                        {flight.departureCity} → {flight.arrivalCity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiUsers className="text-[#C9A84C] mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Available Seats</p>
                      <p className={`font-semibold text-sm ${seatsLow ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {flight.availableSeats} seats
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCalendar className="text-[#C9A84C] mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Travel Date</p>
                      <p className="text-gray-800 font-semibold text-sm">{formatDate(flight.departureTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboard Amenities */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiZap className="text-[#C9A84C]" />
                  Onboard Amenities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity, idx) => {
                    const AmenityIcon = amenity.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <AmenityIcon className="text-[#C9A84C]" size={16} />
                        <span className="text-gray-700 text-sm">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="space-y-6">
              {/* Passengers Selection */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUsers className="text-[#C9A84C]" />
                  Passengers
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Number of Passengers</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange(false)}
                      disabled={numberOfPassengers <= 1}
                      className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-[#C9A84C] flex items-center justify-center hover:border-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="w-12 text-center text-xl font-bold text-gray-800">
                      {numberOfPassengers}
                    </span>
                    <button
                      onClick={() => handlePassengerChange(true)}
                      disabled={numberOfPassengers >= flight.availableSeats}
                      className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-[#C9A84C] flex items-center justify-center hover:border-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-linear-to-br from-[#FEF8E7] to-white rounded-xl border border-[#C9A84C]/30 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-[#C9A84C]" />
                  Price Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Price per passenger ({selectedCabinData.name})</span>
                    <span className="text-gray-800 font-semibold">${selectedCabinData.price}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Number of passengers</span>
                    <span className="text-gray-800 font-semibold">x{numberOfPassengers}</span>
                  </div>
                  <div className="border-t border-[#C9A84C]/20 my-3"></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-[#C9A84C]">
                      ${(selectedCabinData.price * numberOfPassengers).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleProceedToBooking}
                disabled={!flight.availableSeats || numberOfPassengers > flight.availableSeats}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  flight.availableSeats && numberOfPassengers <= flight.availableSeats
                    ? 'bg-[#C9A84C] text-white hover:bg-[#B8922E] shadow-sm hover:shadow-md transform hover:scale-[1.02]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {flight.availableSeats && numberOfPassengers <= flight.availableSeats 
                  ? `Book Now - $${(selectedCabinData.price * numberOfPassengers).toFixed(2)}` 
                  : 'Not enough seats available'}
              </button>
            </div>
          </div>

          {/* Info Footer */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FiShield className="text-[#C9A84C] text-xl" />
                <span className="text-gray-600 text-sm">Free cancellation up to 24 hours before departure</span>
              </div>
              <div className="flex items-center gap-3">
                <FiTrendingUp className="text-[#C9A84C] text-xl" />
                <span className="text-gray-600 text-sm">Best price guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;