import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking } from '../../features/bookings/bookingSlice';
import {
  FiArrowLeft,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiLock,
  FiGift,
  FiAirplay,
  FiHome,
  FiBriefcase,
  FiCoffee,
  FiZap,
  FiStar,
  FiShield as FiShieldIcon
} from 'react-icons/fi';

const BookingView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.users);
  
  const locationState = useMemo(() => location.state, [location.state]);

  const bookingData = useMemo(() => {
    if (!locationState) return null;
    
    return {
      type: locationState.type || '',
      referenceId: locationState.referenceId || locationState.id || '',
      price: locationState.price || 0,
      quantity: locationState.quantity || 1,
      totalPrice: locationState.totalPrice || locationState.price || 0,
      flightDetails: locationState.flightDetails || null,
      hotelDetails: locationState.hotelDetails || null,
      roomDetails: locationState.roomDetails || null
    };
  }, [locationState]);

  const [quantity, setQuantity] = useState(bookingData?.quantity || 1);
  const [selectedAddons, setSelectedAddons] = useState([]);

  if (!locationState) {
    navigate('/user-dashboard/flights');
    return null;
  }

  const addons = [
    { id: 'luggage', name: 'Extra Luggage', price: 25, icon: FiBriefcase, description: '+10kg baggage allowance' },
    { id: 'meal', name: 'Premium Meal', price: 15, icon: FiCoffee, description: 'Gourmet in-flight dining' },
    { id: 'priority', name: 'Priority Boarding', price: 20, icon: FiZap, description: 'Skip the queue' },
    { id: 'insurance', name: 'Travel Insurance', price: 30, icon: FiShieldIcon, description: 'Full coverage' }
  ];

  const handleQuantityChange = (increment) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const getAddonsTotal = () => {
    return selectedAddons.reduce((sum, id) => {
      const addon = addons.find(a => a.id === id);
      return sum + (addon?.price || 0);
    }, 0);
  };

  const basePrice = (bookingData?.price || 0) * quantity;
  const addonsTotal = getAddonsTotal();
  const taxes = (basePrice + addonsTotal) * 0.1;
  const finalTotal = basePrice + addonsTotal + taxes;

  const handleProceedToPayment = async () => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    if (!bookingData?.referenceId) {
      alert('Missing booking information. Please try again.');
      return;
    }

    try {
      const result = await dispatch(createBooking({
        type: bookingData.type,
        referenceId: bookingData.referenceId,
        userId: user.id,
        quantity: quantity,
        totalPrice: finalTotal,
        addons: selectedAddons,
        status: 'pending',
        paymentStatus: 'pending'
      })).unwrap();

      if (result?._id) {
        navigate('/payment', { 
          state: { 
            bookingId: result._id, 
            amount: finalTotal 
          } 
        });
      }
    } catch (error) {
      console.error('Booking creation failed:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-500 hover:text-[#C9A84C] transition-all duration-300 w-fit"
          >
            <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <FiLock size={14} />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Left Column - Booking Details */}
          <div className="flex-1 space-y-5">
            {/* Flight Details */}
            {bookingData.flightDetails && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#FEF8E7] to-transparent p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                      <FiAirplay className="text-[#C9A84C]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Flight Details</h2>
                      <p className="text-gray-500 text-xs">Review your flight information</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg- rounded-xl">
                      <p className="text-gray-500 text-xs mb-1">Airline</p>
                      <p className="text-gray-800 font-semibold text-sm sm:text-base">
                        {bookingData.flightDetails.airline} - {bookingData.flightDetails.flightNumber}
                      </p>
                    </div>
                    <div className="p-4  rounded-xl">
                      <p className="text-gray-500 text-xs mb-1">Route</p>
                      <p className="text-gray-800 font-semibold text-sm sm:text-base">
                        {bookingData.flightDetails.from || bookingData.flightDetails.departureCity} → 
                        {bookingData.flightDetails.to || bookingData.flightDetails.arrivalCity}
                      </p>
                    </div>
                    <div className="p-4  rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiClock className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Departure</p>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold text-sm sm:text-base">
                          {formatTime(bookingData.flightDetails.departureTime)}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {formatDate(bookingData.flightDetails.departureTime)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4  rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiClock className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Arrival</p>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold text-sm sm:text-base">
                          {formatTime(bookingData.flightDetails.arrivalTime)}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {formatDate(bookingData.flightDetails.arrivalTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Details */}
            {bookingData.hotelDetails && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#FEF8E7] to-transparent p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                      <FiHome className="text-[#C9A84C]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Hotel Details</h2>
                      <p className="text-gray-500 text-xs">Review your hotel information</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-xs mb-1">Hotel Name</p>
                      <p className="text-gray-800 font-semibold text-sm sm:text-base">{bookingData.hotelDetails.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiMapPin className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Location</p>
                      </div>
                      <p className="text-gray-800 font-semibold text-sm sm:text-base">{bookingData.hotelDetails.location}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCalendar className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Check-in</p>
                      </div>
                      <p className="text-gray-800 font-semibold text-sm sm:text-base">{bookingData.hotelDetails.checkIn}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCalendar className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Check-out</p>
                      </div>
                      <p className="text-gray-800 font-semibold text-sm sm:text-base">{bookingData.hotelDetails.checkOut}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                  <FiUsers className="text-[#C9A84C]" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Passengers</h2>
                  <p className="text-gray-500 text-xs">Select number of travelers</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-800 font-semibold text-sm sm:text-base">Number of Passengers</p>
                  <p className="text-gray-400 text-xs">Maximum 10 passengers</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(false)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-[#C9A84C] flex items-center justify-center hover:border-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xl"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-2xl font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(true)}
                    disabled={quantity >= 10}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-[#C9A84C] flex items-center justify-center hover:border-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                  <FiGift className="text-[#C9A84C]" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Enhance Your Trip</h2>
                  <p className="text-gray-500 text-xs">Add extras to make your journey better</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {addons.map((addon) => {
                  const Icon = addon.icon;
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleAddonToggle(addon.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#C9A84C]/10 border-2 border-[#C9A84C]'
                          : 'bg-gray-50 border border-gray-200 hover:border-[#C9A84C]/50'
                      }`}
                    >
                      <Icon className="text-[#C9A84C]" size={20} />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                          <p className="text-gray-800 font-semibold text-sm sm:text-base">{addon.name}</p>
                          <p className="text-[#C9A84C] font-bold text-sm sm:text-base">${addon.price}</p>
                        </div>
                        <p className="text-gray-500 text-xs">{addon.description}</p>
                      </div>
                      {isSelected && (
                        <FiCheck className="text-[#C9A84C]" size={16} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:w-96 w-full">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-linear-to-r from-[#FEF8E7] to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCreditCard className="text-[#C9A84C]" size={18} />
                    <h2 className="text-lg font-bold text-gray-800">Booking Summary</h2>
                  </div>
                  <p className="text-gray-500 text-xs">Review your booking details</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Booking Type</span>
                    <span className="text-[#C9A84C] font-semibold uppercase">{bookingData.type}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price per passenger</span>
                    <span className="text-gray-800 font-semibold">${bookingData.price?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Passengers</span>
                    <span className="text-gray-800 font-semibold">{quantity} x ${bookingData.price?.toFixed(2)}</span>
                  </div>
                  
                  {selectedAddons.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-500 text-xs mb-2">Add-ons</p>
                      {selectedAddons.map(id => {
                        const addon = addons.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">{addon.name}</span>
                            <span className="text-gray-800">+${addon.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-800 font-semibold">${(basePrice + addonsTotal).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="text-gray-800">${taxes.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-gray-800 font-bold text-lg">Total</p>
                      <p className="text-gray-400 text-xs">Including all taxes</p>
                    </div>
                    <p className="text-2xl font-bold text-[#C9A84C]">${finalTotal.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={handleProceedToPayment}
                    disabled={loading || !bookingData.referenceId}
                    className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 ${
                      !loading && bookingData.referenceId
                        ? 'bg-[#C9A84C] text-white hover:bg-[#B8922E] shadow-sm hover:shadow-md transform hover:scale-[1.02]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiShield size={12} /> Secure Payment
                    </span>
                    <span className="flex items-center gap-1">
                      <FiLock size={12} /> Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCheck size={12} /> 24/7 Support
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Cancellation Notice */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                  <FiCheck size={14} />
                  <span className="text-sm font-semibold">Free Cancellation</span>
                </div>
                <p className="text-gray-500 text-xs">Cancel up to 24 hours before for a full refund</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingView;