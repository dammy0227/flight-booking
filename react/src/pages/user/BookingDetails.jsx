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
  FiFileText,
  FiInfo,
  FiArrowRight
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
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        title: 'Payment Confirmed',
        message: 'Your booking has been confirmed and is ready'
      };
    }
    if (booking?.status === 'confirmed') {
      return {
        icon: FiCheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Booking Confirmed',
        message: 'Your booking is confirmed and waiting for payment'
      };
    }
    return {
      icon: FiClock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      title: 'Payment Pending',
      message: 'Complete payment to confirm your booking'
    };
  };

  const isPaid = booking?.paymentStatus === 'paid';
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading && !booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-4 shadow-sm">
          <FiHelpCircle className="text-6xl mb-6 mx-auto text-[#C9A84C]" />
          <h3 className="text-gray-800 text-2xl font-bold mb-3">Booking Not Found</h3>
          <p className="text-gray-500 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/user-dashboard/bookings')}
            className="px-6 py-3 bg-[#C9A84C] rounded-xl text-white font-semibold hover:bg-[#B8922E] transition-all duration-300"
          >
            View All Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-6">
          {/* Back Button and Print */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/user-dashboard/bookings')}
              className="group flex items-center gap-2 text-gray-500 hover:text-[#C9A84C] transition-all duration-300"
            >
              <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Bookings</span>
            </button>
            {isPaid && (
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-[#C9A84C] transition-colors"
              >
                <FiPrinter size={16} />
                <span className="text-sm">Print Receipt</span>
              </button>
            )}
          </div>

          {/* Status Banner */}
          <div className={`p-5 rounded-xl border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`p-3 rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                <StatusIcon size={28} className={statusConfig.color} />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${statusConfig.color}`}>
                  {statusConfig.title}
                </h2>
                <p className="text-gray-600 text-sm mt-0.5">{statusConfig.message}</p>
              </div>
              {!isPaid && (
                <button
                  onClick={handlePayNow}
                  className="px-6 py-2.5 bg-[#C9A84C] rounded-xl text-white text-sm font-semibold hover:bg-[#B8922E] transition-colors shadow-sm"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Information Card with View All Button inside */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-linear-to-r from-[#FEF8E7] to-transparent p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                        {booking.type === 'flight' ? (
                          <FiAirplay className="text-[#C9A84C]" size={24} />
                        ) : (
                          <FiHome className="text-[#C9A84C]" size={24} />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Booking Information</h2>
                        <p className="text-gray-500 text-xs">Details of your reservation</p>
                      </div>
                    </div>
                    {/* View All Bookings Button moved here */}
                    <button
                      onClick={() => navigate('/user-dashboard/bookings')}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#C9A84C] hover:text-[#B8922E] transition-colors"
                    >
                      <span>View All</span>
                      <FiArrowRight size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiTag className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Booking ID</p>
                      </div>
                      <p className="text-gray-800 font-mono text-sm font-semibold">{booking._id?.slice(-12).toUpperCase()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-xs mb-1">Booking Type</p>
                      <p className="text-[#C9A84C] font-semibold capitalize">{booking.type} Booking</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCalendar className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Booking Date</p>
                      </div>
                      <p className="text-gray-800 text-sm">{formatDateTime(booking.createdAt)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-xs mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <FiUsers className="text-[#C9A84C]" size={12} />
                        <p className="text-gray-500 text-xs">Travelers</p>
                      </div>
                      <p className="text-gray-800 text-sm font-medium">{booking.quantity} {booking.quantity > 1 ? 'passengers' : 'passenger'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Details Card */}
              {(booking.flightDetails || booking.hotelDetails) && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="bg-linear-to-r from-[#FEF8E7] to-transparent p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                        <FiMapPin className="text-[#C9A84C]" size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Travel Details</h2>
                        <p className="text-gray-500 text-xs">Your itinerary information</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {booking.type === 'flight' && booking.flightDetails && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-gray-500 text-xs">Departure</p>
                            <p className="text-gray-800 font-semibold text-lg">{booking.flightDetails.from}</p>
                            <p className="text-gray-400 text-xs mt-1">{booking.flightDetails.departureDate}</p>
                          </div>
                          <FiArrowLeft className="text-[#C9A84C] rotate-180" size={20} />
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">Arrival</p>
                            <p className="text-gray-800 font-semibold text-lg">{booking.flightDetails.to}</p>
                            <p className="text-gray-400 text-xs mt-1">{booking.flightDetails.arrivalDate}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-xs">Airline</p>
                            <p className="text-gray-800 font-medium">{booking.flightDetails.airline || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-xs">Flight Number</p>
                            <p className="text-gray-800 font-medium">{booking.flightDetails.flightNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.type === 'hotel' && booking.hotelDetails && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <FiMapPin className="text-[#C9A84C] mt-0.5" size={16} />
                            <div>
                              <p className="text-gray-800 font-semibold">{booking.hotelDetails.name || 'Hotel Reservation'}</p>
                              <p className="text-gray-500 text-sm">{booking.hotelDetails.location}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-xs">Check-in</p>
                            <p className="text-gray-800 font-medium">{formatDateTime(booking.hotelDetails.checkIn)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-xs">Check-out</p>
                            <p className="text-gray-800 font-medium">{formatDateTime(booking.hotelDetails.checkOut)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add-ons Card */}
              {booking.addons && booking.addons.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="bg-linear-to-r from-[#FEF8E7] to-transparent p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                        <FiPackage className="text-[#C9A84C]" size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Add-ons & Extras</h2>
                        <p className="text-gray-500 text-xs">Enhancements to your booking</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {booking.addons.map((addon, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <FiGift className="text-[#C9A84C]" size={16} />
                          <span className="text-gray-700 text-sm">{addon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment Summary */}
            <div className="space-y-6">
              {/* Payment Summary Card */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm sticky top-6">
                <div className="bg-linear-to-r from-[#FEF8E7] to-transparent p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/10">
                      <FiCreditCard className="text-[#C9A84C]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Payment Summary</h2>
                      <p className="text-gray-500 text-xs">Transaction details</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Total Amount</span>
                    <span className="text-2xl font-bold text-[#C9A84C]">${booking.totalPrice?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Price</span>
                    <span className="text-gray-700">${(booking.totalPrice / booking.quantity).toFixed(2)} × {booking.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="text-gray-700">${(booking.totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm pb-3 border-b border-gray-100">
                    <span className="text-gray-500">Service Charge</span>
                    <span className="text-gray-700">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`font-semibold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  
                  {isPaid && payment && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="text-gray-700 capitalize flex items-center gap-1">
                          <FiCreditCard size={12} />
                          {payment.paymentMethod}
                        </span>
                      </div>
                      {payment.transactionId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Transaction ID</span>
                          <span className="text-gray-700 font-mono text-xs">{payment.transactionId?.slice(-12)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Date</span>
                        <span className="text-gray-700 text-xs">{formatDateTime(payment.createdAt)}</span>
                      </div>
                    </>
                  )}
                  
                  {!isPaid && (
                    <button
                      onClick={handlePayNow}
                      className="w-full mt-2 px-6 py-3 bg-[#C9A84C] rounded-xl text-white font-semibold hover:bg-[#B8922E] transition-all duration-300 shadow-sm"
                    >
                      Complete Payment
                    </button>
                  )}
                </div>
              </div>

              {/* Receipt Card (if paid) */}
              {isPaid && (
                <div className="bg-linear-to-br from-[#FEF8E7] to-white rounded-xl border border-[#C9A84C]/30 p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-[#C9A84C]" size={16} />
                      <span className="text-[#C9A84C] text-xs font-semibold tracking-wider">OFFICIAL RECEIPT</span>
                    </div>
                    <FiStar className="text-[#C9A84C]" size={20} />
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-2xl font-black tracking-wide mb-1">
                      <span className="text-gray-800">123 </span>
                      <span className="text-[#C9A84C]">RESERVE</span>
                    </div>
                    <p className="text-gray-500 text-xs">{formatDateTime(booking.createdAt)}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Booking ID</span>
                      <span className="text-gray-800 font-mono text-sm">{booking._id?.slice(-12).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Booking Type</span>
                      <span className="text-gray-800 capitalize">{booking.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Travelers</span>
                      <span className="text-gray-800">{booking.quantity} {booking.quantity > 1 ? 'travelers' : 'traveler'}</span>
                    </div>
                    {booking.addons && booking.addons.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Add-ons</span>
                        <span className="text-gray-800">{booking.addons.length} items</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-800 font-bold">Total Paid</span>
                      <span className="text-[#C9A84C] font-bold text-2xl">${booking.totalPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-600">
                      <FiCheckCircle size={12} />
                      <span>Payment Confirmed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Need Help Card */}
              <div className="bg-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <FiInfo className="text-[#C9A84C]" size={18} />
                  <h3 className="text-gray-800 font-semibold">Need Help?</h3>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  Having issues with your booking? Contact our support team.
                </p>
                <button className="text-[#C9A84C] text-sm font-medium hover:underline">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;