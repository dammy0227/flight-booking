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
  FiCompass
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
        color: 'bg-linear-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30',
        icon: FiCheckCircle,
        label: 'PAID',
      };
    }
    if (status === 'confirmed') {
      return {
        color: 'bg-linear-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
        icon: FiCheckCircle,
        label: 'CONFIRMED',
      };
    }
    if (status === 'pending') {
      return {
        color: 'bg-linear-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30',
        icon: FiAlertCircle,
        label: 'PENDING',
      };
    }
    if (status === 'cancelled') {
      return {
        color: 'bg-linear-to-r from-red-500/20 to-red-600/20 text-red-400 border-red-500/30',
        icon: FiXCircle,
        label: 'CANCELLED',
      };
    }
    return {
      color: 'bg-linear-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              My Bookings
            </h1>
            <p className="text-[#8B92A5] mt-2 flex items-center gap-2">
              <FiBookOpen className="text-[#C9A84C]" size={16} />
              Manage and track all your travel bookings in one place
            </p>
          </div>

          <div className="bg-linear-to-r from-[#1C2438] to-[#141B2B] rounded-2xl border border-[#252E44] p-5 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={18} />
                <input
                  type="text"
                  placeholder="Search by booking ID, destination, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 bg-[#0F1420] hover:bg-[#1C2438] rounded-xl text-[#8B92A5] hover:text-[#C9A84C] transition-all border border-[#252E44]"
              >
                <FiFilter size={16} />
                <span>Filters</span>
                {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-[#252E44]">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-linear-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0E1A] shadow-lg'
                      : 'bg-[#0F1420] text-[#8B92A5] hover:text-[#F5F0E8] hover:bg-[#1C2438]'
                  }`}
                >
                  All Bookings
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'paid'
                      ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-[#0F1420] text-[#8B92A5] hover:text-[#F5F0E8] hover:bg-[#1C2438]'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'pending'
                      ? 'bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                      : 'bg-[#0F1420] text-[#8B92A5] hover:text-[#F5F0E8] hover:bg-[#1C2438]'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === 'cancelled'
                      ? 'bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : 'bg-[#0F1420] text-[#8B92A5] hover:text-[#F5F0E8] hover:bg-[#1C2438]'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-24 bg-[#252E44] rounded-xl"></div>
                    <div className="h-4 bg-[#252E44] rounded w-3/4"></div>
                    <div className="h-4 bg-[#252E44] rounded w-1/2"></div>
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
                    className="group relative bg-linear-to-br from-[#1C2438] to-[#141B2B] rounded-2xl border border-[#252E44] hover:border-[#C9A84C]/50 hover:shadow-2xl hover:shadow-[#C9A84C]/5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-[#C9A84C]/0 via-[#C9A84C]/0 to-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-110 ${
                            booking.type === 'flight' 
                              ? 'bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 border border-[#C9A84C]/30' 
                              : 'bg-linear-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30'
                          }`}>
                            {booking.type === 'flight' ? (
                              <FiAirplay className="text-[#C9A84C]" size={24} />
                            ) : (
                              <FiHome className="text-emerald-400" size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-[#F5F0E8] font-bold text-lg capitalize">
                              {booking.type === 'flight' ? 'Flight Booking' : 'Hotel Reservation'}
                            </h3>
                            <p className="text-[#8B92A5] text-xs font-mono">
                              <FiTag className="inline mr-1" size={10} />
                              #{booking._id?.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.color} flex items-center gap-1.5`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-[#0F1420] rounded-xl border border-[#252E44]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="text-[#C9A84C]" size={18} />
                            <span className="text-[#8B92A5] text-sm">Total Amount</span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#E8C97A]">${booking.totalPrice?.toFixed(2)}</p>
                            <p className="text-[#8B92A5] text-xs">including taxes</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-[#C9A84C]" size={14} />
                          <div>
                            <p className="text-[#8B92A5] text-xs">Booking Date</p>
                            <p className="text-[#F5F0E8] text-sm font-medium">{formatDate(booking.createdAt)}</p>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-[#8B92A5]" size={10} />
                              <p className="text-[#8B92A5] text-xs">{formatTime(booking.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-[#C9A84C]" size={14} />
                          <div>
                            <p className="text-[#8B92A5] text-xs">Travelers</p>
                            <p className="text-[#F5F0E8] text-sm font-medium">{booking.quantity} {booking.quantity > 1 ? 'passengers' : 'passenger'}</p>
                          </div>
                        </div>
                      </div>

                      {booking.type === 'flight' && booking.flightDetails && (
                        <div className="mb-4 p-3 bg-[#0F1420] rounded-xl border border-[#252E44]">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[#8B92A5] text-xs">Departure</p>
                              <p className="text-[#F5F0E8] font-semibold">{booking.flightDetails.from}</p>
                            </div>
                            <FiMapPin className="text-[#C9A84C]" size={14} />
                            <div className="text-right">
                              <p className="text-[#8B92A5] text-xs">Arrival</p>
                              <p className="text-[#F5F0E8] font-semibold">{booking.flightDetails.to}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.type === 'hotel' && booking.hotelDetails && (
                        <div className="mb-4 p-3 bg-[#0F1420] rounded-xl border border-[#252E44]">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="text-[#C9A84C]" size={14} />
                            <div>
                              <p className="text-[#8B92A5] text-xs">Location</p>
                              <p className="text-[#F5F0E8] text-sm font-medium">{booking.hotelDetails.location}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 mt-4 pt-4 border-t border-[#252E44]">
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
                            className="flex-1 px-4 py-2.5 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] text-sm font-bold hover:from-[#E8C97A] hover:to-[#C9A84C] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
            <div className="bg-linear-to-br from-[#1C2438] to-[#141B2B] rounded-2xl border border-[#252E44] p-16 text-center">
              <div className="relative inline-block">
                <FiCompass className="text-8xl mb-6 text-[#C9A84C] animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C9A84C] rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-[#F5F0E8] text-2xl font-bold mb-3">No bookings yet</h3>
              <p className="text-[#8B92A5] text-base mb-6 max-w-md mx-auto">
                Your booked flights and hotel reservations will appear here. Start planning your next adventure!
              </p>
              <button
                onClick={() => navigate('/user-dashboard/flights')}
                className="px-8 py-3 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] text-sm font-bold hover:from-[#E8C97A] hover:to-[#C9A84C] transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <FiAirplay size={16} />
                Browse Flights
                <FiHome size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBookings;