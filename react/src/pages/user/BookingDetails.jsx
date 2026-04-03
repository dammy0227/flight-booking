import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getBookingById } from '../../features/bookings/bookingSlice';
import { getPaymentById } from '../../features/payments/paymentSlice';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiCalendar,
  FiPrinter,
  FiMapPin,
  FiUsers,
  FiPackage,
  FiGift,
  FiStar,
  FiHelpCircle,
  FiAirplay,
  FiHome,
  FiTag,
  FiFileText
} from 'react-icons/fi';

const BookingDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedBooking, loading } = useSelector((state) => state.bookings);
  const { selectedPayment } = useSelector((state) => state.payments);

  React.useEffect(() => {
    if (!location.state?.booking && id) {
      dispatch(getBookingById(id));
    }
  }, [dispatch, id, location.state?.booking]);

  React.useEffect(() => {
    const booking = location.state?.booking || selectedBooking;
    if (booking?.paymentStatus === 'paid' && booking._id === id) {
      dispatch(getPaymentById(booking._id));
    }
  }, [dispatch, id, location.state?.booking, selectedBooking]);

  const booking = useMemo(() => {
    if (location.state?.booking) return location.state.booking;
    if (selectedBooking && selectedBooking._id === id) return selectedBooking;
    return null;
  }, [location.state?.booking, selectedBooking, id]);

  const payment = useMemo(() => {
    if (selectedPayment && booking?.paymentStatus === 'paid') return selectedPayment;
    return null;
  }, [selectedPayment, booking]);

  const handlePayNow = () => {
    if (booking) {
      navigate('/payment', { state: { bookingId: booking._id, amount: booking.totalPrice } });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })} • ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const getStatusConfig = () => {
    if (booking?.paymentStatus === 'paid') {
      return {
        icon: FiCheckCircle,
        color: 'text-[#10B981]',
        bgColor: 'bg-[#10B981]/20',
        borderColor: 'border-[#10B981]/30',
        title: 'Payment Confirmed',
        message: 'Your booking has been confirmed and is ready'
      };
    }
    if (booking?.status === 'confirmed') {
      return {
        icon: FiCheckCircle,
        color: 'text-[#10B981]',
        bgColor: 'bg-[#10B981]/20',
        borderColor: 'border-[#10B981]/30',
        title: 'Booking Confirmed',
        message: 'Your booking is confirmed and waiting for payment'
      };
    }
    return {
      icon: FiClock,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/20',
      borderColor: 'border-[#F59E0B]/30',
      title: 'Payment Pending',
      message: 'Complete payment to confirm your booking'
    };
  };

  const isPaid = booking?.paymentStatus === 'paid';
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0A0E1A] to-[#141A2A]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C9A84C] border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-[#C9A84C] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0A0E1A] to-[#141A2A]">
        <div className="bg-[#1C2438]/80 backdrop-blur-xl rounded-2xl border border-[#252E44] p-12 text-center max-w-md mx-4">
          <FiHelpCircle className="text-7xl mb-6 mx-auto text-[#C9A84C] animate-bounce" />
          <h3 className="text-[#F5F0E8] text-2xl font-bold mb-3">Booking Not Found</h3>
          <p className="text-[#8B92A5] mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/user-dashboard/bookings')}
            className="px-6 py-3 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] font-semibold hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
          >
            View All Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-linear-to-br from-[#0A0E1A] to-[#141A2A]">
      {/* Top padding spacer for fixed headers */}
      <div className="h-4 md:h-6 lg:h-8"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-6">
          {/* Back Button - Now visible at the top */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/user-dashboard/bookings')}
              className="group flex items-center gap-2 text-[#8B92A5] hover:text-[#C9A84C] transition-all duration-300"
            >
              <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Bookings</span>
            </button>
          </div>

          {/* Status Banner */}
          <div className={`p-6 rounded-2xl border ${statusConfig.borderColor} bg-linear-to-r ${isPaid ? 'from-[#10B981]/10' : 'from-[#F59E0B]/10'} to-transparent backdrop-blur-sm`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${statusConfig.bgColor}`}>
                <StatusIcon size={32} className={statusConfig.color} />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${statusConfig.color}`}>
                  {statusConfig.title}
                </h2>
                <p className="text-[#8B92A5] text-sm mt-1">{statusConfig.message}</p>
              </div>
              {!isPaid && (
                <button
                  onClick={handlePayNow}
                  className="px-4 py-2 bg-[#C9A84C] rounded-xl text-[#0A0E1A] text-sm font-semibold hover:bg-[#E8C97A] transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Information */}
              <div className="bg-[#1C2438]/50 backdrop-blur-sm rounded-2xl border border-[#252E44] overflow-hidden">
                <div className="bg-linear-to-r from-[#C9A84C]/10 to-transparent p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/20">
                      {booking.type === 'flight' ? (
                        <FiAirplay className="text-[#C9A84C]" size={24} />
                      ) : (
                        <FiHome className="text-[#C9A84C]" size={24} />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#F5F0E8]">Booking Information</h2>
                      <p className="text-[#8B92A5] text-xs">Details of your reservation</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-[#0F1420] rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiTag className="text-[#C9A84C]" size={12} />
                        <p className="text-[#8B92A5] text-xs">Booking ID</p>
                      </div>
                      <p className="text-[#F5F0E8] font-mono text-sm font-semibold">{booking._id?.slice(-12).toUpperCase()}</p>
                    </div>
                    <div className="p-4 bg-[#0F1420] rounded-xl">
                      <p className="text-[#8B92A5] text-xs mb-1">Booking Type</p>
                      <p className="text-[#C9A84C] font-semibold capitalize">{booking.type} Booking</p>
                    </div>
                    <div className="p-4 bg-[#0F1420] rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCalendar className="text-[#C9A84C]" size={12} />
                        <p className="text-[#8B92A5] text-xs">Booking Date</p>
                      </div>
                      <p className="text-[#F5F0E8] text-sm">{formatDateTime(booking.createdAt)}</p>
                    </div>
                    <div className="p-4 bg-[#0F1420] rounded-xl">
                      <p className="text-[#8B92A5] text-xs mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                        booking.status === 'confirmed' ? 'bg-[#10B981]/20 text-[#10B981]' :
                        booking.status === 'pending' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                        'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              {booking.travelDetails && (
                <div className="bg-[#1C2438]/50 backdrop-blur-sm rounded-2xl border border-[#252E44] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/20">
                      <FiMapPin className="text-[#C9A84C]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#F5F0E8]">Travel Details</h2>
                      <p className="text-[#8B92A5] text-xs">Your itinerary information</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Travel details content would go here */}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {booking.addons && booking.addons.length > 0 && (
                <div className="bg-[#1C2438]/50 backdrop-blur-sm rounded-2xl border border-[#252E44] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/20">
                      <FiPackage className="text-[#C9A84C]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#F5F0E8]">Add-ons & Extras</h2>
                      <p className="text-[#8B92A5] text-xs">Enhancements to your booking</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {booking.addons.map((addon, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-[#0F1420] rounded-xl">
                        <FiGift className="text-[#C9A84C]" size={16} />
                        <span className="text-[#F5F0E8] text-sm">{addon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment Summary */}
            <div className="space-y-6">
              <div className="bg-[#1C2438]/50 backdrop-blur-sm rounded-2xl border border-[#252E44] overflow-hidden sticky top-8">
                <div className="p-6 border-b border-[#252E44] bg-linear-to-r from-[#C9A84C]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/20">
                      <FiCreditCard className="text-[#C9A84C]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#F5F0E8]">Payment Summary</h2>
                      <p className="text-[#8B92A5] text-xs">Transaction details</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#252E44]">
                    <span className="text-[#8B92A5] text-sm">Total Amount</span>
                    <span className="text-2xl font-bold text-[#E8C97A]">${booking.totalPrice?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B92A5]">Base Price</span>
                    <span className="text-[#F5F0E8]">${(booking.totalPrice / booking.quantity).toFixed(2)} × {booking.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B92A5]">Taxes & Fees</span>
                    <span className="text-[#F5F0E8]">${(booking.totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm pb-3 border-b border-[#252E44]">
                    <span className="text-[#8B92A5]">Service Charge</span>
                    <span className="text-[#F5F0E8]">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B92A5]">Payment Status</span>
                    <span className={`font-semibold ${isPaid ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  
                  {isPaid && payment && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B92A5]">Payment Method</span>
                        <span className="text-[#F5F0E8] capitalize flex items-center gap-1">
                          <FiCreditCard size={12} />
                          {payment.paymentMethod}
                        </span>
                      </div>
                      {payment.transactionId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[#8B92A5]">Transaction ID</span>
                          <span className="text-[#F5F0E8] font-mono text-xs">{payment.transactionId?.slice(-12)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Receipt Section */}
              {isPaid && (
                <div className="bg-linear-to-br from-[#1C2438] to-[#0F1420] rounded-2xl border border-[#C9A84C]/30 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-[#C9A84C]" size={16} />
                      <span className="text-[#C9A84C] text-xs font-semibold tracking-wider">OFFICIAL RECEIPT</span>
                      <FiPrinter 
                        onClick={handlePrintReceipt}
                        className="text-[#8B92A5] cursor-pointer hover:text-[#C9A84C] transition-colors" 
                        size={14} 
                      />
                    </div>
                    <FiStar className="text-[#C9A84C]" size={24} />
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-2xl font-black tracking-wide mb-1">
                      <span className="text-[#F5F0E8]">123 </span>
                      <span className="text-[#C9A84C]">RESERVE</span>
                    </div>
                    <p className="text-[#8B92A5] text-xs">{formatDateTime(booking.createdAt)}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8B92A5]">Booking ID</span>
                      <span className="text-[#F5F0E8] font-mono text-sm">{booking._id?.slice(-12).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8B92A5]">Booking Type</span>
                      <span className="text-[#F5F0E8] capitalize">{booking.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8B92A5]">Passengers</span>
                      <span className="text-[#F5F0E8]">{booking.quantity} {booking.quantity > 1 ? 'travelers' : 'traveler'}</span>
                    </div>
                    {booking.addons && booking.addons.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B92A5]">Add-ons</span>
                        <span className="text-[#F5F0E8]">{booking.addons.length} items</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-[#252E44] pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#F5F0E8] font-bold">Total Paid</span>
                      <span className="text-[#E8C97A] font-bold text-2xl">${booking.totalPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-[#10B981]">
                      <FiCheckCircle size={12} />
                      <span>Payment Confirmed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isPaid && (
              <button
                onClick={handlePayNow}
                className="flex-1 px-6 py-3 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] font-bold hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all duration-300"
              >
                Complete Payment Now
              </button>
            )}
            <button
              onClick={() => navigate('/user-dashboard/bookings')}
              className="flex-1 px-6 py-3 border border-[#C9A84C]/40 rounded-xl text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-all duration-300"
            >
              View All Bookings
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom padding spacer */}
      <div className="h-4 md:h-6 lg:h-8"></div>
    </div>
  );
};

export default BookingDetails;