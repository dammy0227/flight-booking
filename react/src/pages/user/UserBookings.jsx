import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getBookings } from '../../features/bookings/bookingSlice';
import {
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiCreditCard,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiAirplay,
  FiHome,
  FiTag,
  FiClock,
  FiBookOpen,
  FiCompass,
  FiArrowRight
} from 'react-icons/fi';

const UserBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.users);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getBookings({ userId: user.id }));
    }
  }, [dispatch, user]);

  const handleViewDetails = (booking) => {
    navigate(`/user-dashboard/bookings/${booking._id}`, { state: { booking } });
  };

  const handlePayNow = (booking) => {
    navigate('/payment', { state: { bookingId: booking._id, amount: booking.totalPrice } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status, paymentStatus) => {
    if (paymentStatus === 'paid') {
      return {
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: FiCheckCircle,
        label: 'PAID',
      };
    }
    if (status === 'confirmed') {
      return {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: FiCheckCircle,
        label: 'CONFIRMED',
      };
    }
    if (status === 'pending') {
      return {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: FiAlertCircle,
        label: 'PENDING',
      };
    }
    if (status === 'cancelled') {
      return {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: FiXCircle,
        label: 'CANCELLED',
      };
    }
    return {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: FiAlertCircle,
      label: status?.toUpperCase() || 'PENDING',
    };
  };

  const filteredBookings = bookings?.filter(booking => {
    if (filter === 'paid') return booking.paymentStatus === 'paid';
    if (filter === 'pending') return booking.paymentStatus !== 'paid' && booking.status !== 'cancelled';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  }).filter(booking => {
    if (!searchTerm) return true;
    return booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           booking.type?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              My Bookings
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <FiBookOpen className="text-[#C9A84C]" size={16} />
              Manage and track all your travel bookings in one place
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={18} />
                <input
                  type="text"
                  placeholder="Search by booking ID, destination, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-[#C9A84C] transition-all border border-gray-200"
              >
                <FiFilter size={16} />
                <span>Filters</span>
                {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-[#C9A84C] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Bookings
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'paid'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'cancelled'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {/* Bookings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse shadow-sm">
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBookings?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status, booking.paymentStatus);
                const StatusIcon = statusConfig.icon;
                const isPaid = booking.paymentStatus === 'paid';
                
                return (
                  <div
                    key={booking._id}
                    className="group relative bg-white rounded-xl border border-gray-100 hover:border-[#C9A84C]/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            booking.type === 'flight' 
                              ? 'bg-[#C9A84C]/10' 
                              : 'bg-emerald-500/10'
                          }`}>
                            {booking.type === 'flight' ? (
                              <FiAirplay className="text-[#C9A84C]" size={24} />
                            ) : (
                              <FiHome className="text-emerald-500" size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-gray-800 font-bold text-lg capitalize">
                              {booking.type === 'flight' ? 'Flight Booking' : 'Hotel Reservation'}
                            </h3>
                            <p className="text-gray-400 text-xs font-mono flex items-center gap-1">
                              <FiTag size={10} />
                              #{booking._id?.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.color} flex items-center gap-1.5`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="text-[#C9A84C]" size={18} />
                            <span className="text-gray-500 text-sm">Total Amount</span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#C9A84C]">${booking.totalPrice?.toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">including taxes</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-[#C9A84C]" size={14} />
                          <div>
                            <p className="text-gray-400 text-xs">Booking Date</p>
                            <p className="text-gray-700 text-sm font-medium">{formatDate(booking.createdAt)}</p>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-gray-400" size={10} />
                              <p className="text-gray-400 text-xs">{formatTime(booking.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-[#C9A84C]" size={14} />
                          <div>
                            <p className="text-gray-400 text-xs">Travelers</p>
                            <p className="text-gray-700 text-sm font-medium">{booking.quantity} {booking.quantity > 1 ? 'passengers' : 'passenger'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      {booking.type === 'flight' && booking.flightDetails && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gray-400 text-xs">Departure</p>
                              <p className="text-gray-800 font-semibold">{booking.flightDetails.from}</p>
                            </div>
                            <FiArrowRight className="text-[#C9A84C]" size={14} />
                            <div className="text-right">
                              <p className="text-gray-400 text-xs">Arrival</p>
                              <p className="text-gray-800 font-semibold">{booking.flightDetails.to}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.type === 'hotel' && booking.hotelDetails && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="text-[#C9A84C]" size={14} />
                            <div>
                              <p className="text-gray-400 text-xs">Location</p>
                              <p className="text-gray-800 text-sm font-medium">{booking.hotelDetails.location}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="flex-1 px-4 py-2.5 border-2 border-[#C9A84C]/40 rounded-xl text-[#C9A84C] text-sm font-semibold hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] transition-all flex items-center justify-center gap-2 group"
                        >
                          <FiEye size={14} className="group-hover:scale-110 transition-transform" />
                          View Details
                        </button>
                        {!isPaid && (
                          <button
                            onClick={() => handlePayNow(booking)}
                            className="flex-1 px-4 py-2.5 bg-[#C9A84C] rounded-xl text-white text-sm font-bold hover:bg-[#B8922E] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <FiCreditCard size={14} />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-12 sm:p-16 text-center">
              <div className="relative inline-block">
                <FiCompass className="text-6xl sm:text-7xl mb-6 text-[#C9A84C] mx-auto" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#C9A84C] rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-gray-800 text-xl sm:text-2xl font-bold mb-3">No bookings yet</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md mx-auto">
                Your booked flights and hotel reservations will appear here. Start planning your next adventure!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/user-dashboard/flights')}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#3B82F6] rounded-xl text-white text-sm font-semibold hover:bg-[#2563EB] transition-all inline-flex items-center gap-2 justify-center"
                >
                  <FiAirplay size={16} />
                  Browse Flights
                </button>
                <button
                  onClick={() => navigate('/user-dashboard/hotels')}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-[#C9A84C] rounded-xl text-[#C9A84C] text-sm font-semibold hover:bg-[#C9A84C]/10 transition-all inline-flex items-center gap-2 justify-center"
                >
                  <FiHome size={16} />
                  Find Hotels
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBookings;