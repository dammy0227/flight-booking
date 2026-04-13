import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPayment } from '../../features/payments/paymentSlice';
import { getBookingById, updateBookingStatus, getBookings } from '../../features/bookings/bookingSlice';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiLock,
  FiShield,
  FiInfo,
  FiLoader,
  FiDownload,
  FiHome,
  FiCalendar,
  FiClock,
  FiUser,
  FiTag,
  FiAirplay
} from 'react-icons/fi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY');

const PaymentForm = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.payments);
  
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setErrorMessage(event.error.message);
    } else {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setErrorMessage('Stripe is not initialized');
      return;
    }
    
    if (!cardComplete) {
      setErrorMessage('Please complete your card details');
      return;
    }
    
    setProcessing(true);
    setErrorMessage('');
    
    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      
      if (paymentMethodError) {
        setErrorMessage(paymentMethodError.message);
        setProcessing(false);
        onError?.(paymentMethodError.message);
        return;
      }
      
      const result = await dispatch(createPayment({
        bookingId: bookingId,
        amount: amount,
        paymentMethod: 'stripe',
        token: paymentMethod.id,
        currency: 'usd'
      })).unwrap();
      
      if (result) {
        await dispatch(updateBookingStatus({
          id: bookingId,
          data: { 
            paymentStatus: 'paid',
            status: 'confirmed'
          }
        }));
        
        await dispatch(getBookings());
        await dispatch(getBookingById(bookingId));
        
        onSuccess?.(result);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment failed. Please try again.');
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#1F2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#9CA3AF',
        },
        backgroundColor: '#F9FAFB',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
      complete: {
        color: '#10B981',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#C9A84C]/10">
            <FiCreditCard className="text-[#C9A84C]" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Card Details</h2>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
            className="py-3 px-2"
          />
        </div>
      </div>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <FiXCircle className="text-red-500" size={18} />
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiLock size={14} className="text-[#C9A84C]" />
            <span className="text-gray-500 text-xs">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <FiShield size={14} className="text-[#C9A84C]" />
            <span className="text-gray-500 text-xs">SSL Encrypted</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-gray-500 text-xs">Amount to Pay</p>
            <p className="text-2xl font-bold text-[#C9A84C]">${amount?.toFixed(2)}</p>
          </div>
          <button
            type="submit"
            disabled={!cardComplete || processing || loading}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              !cardComplete || processing || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#C9A84C] text-white hover:bg-[#B8922E] transform hover:scale-[1.02] shadow-sm'
            }`}
          >
            {processing || loading ? (
              <FiLoader className="animate-spin h-5 w-5 text-white mx-auto" />
            ) : (
              `Pay $${amount?.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
        <p className="text-gray-600 text-xs mb-2 font-medium">Test Cards (Stripe)</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-600">✓ Success</span>
            <span className="text-gray-500 font-mono">4242 4242 4242 4242</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-500">✗ Decline</span>
            <span className="text-gray-500 font-mono">4000 0000 0000 0002</span>
          </div>
        </div>
      </div>
    </form>
  );
};

// Receipt Component for printing
const ReceiptContent = React.forwardRef(({ booking, user, amount }, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div ref={ref} className="receipt-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-linear(135deg, #C9A84C, #B8922E)', padding: '24px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>
            123 RESERVE
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>Travel & Hospitality</p>
          <div style={{ marginTop: '12px', display: 'inline-block', padding: '4px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', fontSize: '14px', fontWeight: '600' }}>
            OFFICIAL RECEIPT
          </div>
        </div>

        {/* Receipt Body */}
        <div style={{ padding: '24px' }}>
          {/* Receipt Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Receipt Number</p>
              <p style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '14px', fontWeight: '600' }}>
                INV-{booking?._id?.slice(-8).toUpperCase() || '00000000'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Date of Issue</p>
              <p style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>{formatDateTime(new Date())}</p>
            </div>
          </div>

          {/* From and To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>From</p>
              <p style={{ color: '#1f2937', fontWeight: '600', margin: 0 }}>123 RESERVE</p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>support@123reserve.com</p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '2px 0 0 0' }}>+1 (555) 123-4567</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>Billed To</p>
              <p style={{ color: '#1f2937', fontWeight: '600', margin: 0 }}>{user?.name || 'Valued Customer'}</p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>{user?.email || 'customer@example.com'}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Booking Information</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Booking ID</p>
                <p style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0 0' }}>{booking?._id?.slice(-12).toUpperCase()}</p>
              </div>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Booking Type</p>
                <p style={{ color: '#1f2937', fontSize: '14px', fontWeight: '600', margin: '4px 0 0 0', textTransform: 'capitalize' }}>{booking?.type || 'Travel'}</p>
              </div>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Booking Date</p>
                <p style={{ color: '#1f2937', fontSize: '14px', margin: '4px 0 0 0' }}>{formatDate(booking?.createdAt)}</p>
              </div>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Status</p>
                <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', margin: '4px 0 0 0' }}>PAID</p>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          {booking?.flightDetails && (
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Flight Details</p>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>From</p>
                    <p style={{ color: '#1f2937', fontWeight: '600', margin: '4px 0 0 0' }}>{booking.flightDetails.from || booking.flightDetails.departureCity}</p>
                  </div>
                  <div style={{ color: '#C9A84C' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>To</p>
                    <p style={{ color: '#1f2937', fontWeight: '600', margin: '4px 0 0 0' }}>{booking.flightDetails.to || booking.flightDetails.arrivalCity}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {booking?.hotelDetails && (
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Hotel Details</p>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <p style={{ color: '#1f2937', fontWeight: '600', margin: 0 }}>{booking.hotelDetails.name}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>{booking.hotelDetails.location}</p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Payment Summary</p>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Booking Amount</span>
                  <span style={{ color: '#1f2937' }}>${booking?.totalPrice?.toFixed(2) || amount?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Taxes & Fees</span>
                  <span style={{ color: '#1f2937' }}>${((booking?.totalPrice || amount) * 0.1).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Service Charge</span>
                  <span style={{ color: '#1f2937' }}>$0.00</span>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1f2937', fontWeight: 'bold' }}>Total Paid</span>
                    <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>${amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Payment Method</p>
                <p style={{ color: '#1f2937', fontWeight: '500', margin: '4px 0 0 0' }}>Credit Card (Stripe)</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiCheckCircle style={{ color: '#10b981' }} size={14} />
                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>PAID</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', paddingTop: '16px' }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Thank you for choosing 123 RESERVE!</p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>This is a system generated receipt. No signature required.</p>
          </div>
        </div>
      </div>
    </div>
  );
});

ReceiptContent.displayName = 'ReceiptContent';

const PaymentSuccess = ({ amount, booking, user }) => {
  const receiptRef = useRef(null);
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    
    const originalTitle = document.title;
    document.title = `Receipt_${booking?._id?.slice(-8) || 'payment'}`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt ${booking?._id?.slice(-8) || 'payment'}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body { 
                font-family: Arial, Helvetica, sans-serif; 
                margin: 0; 
                padding: 20px;
                background-color: white;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
    
    document.title = originalTitle;
  };

  return (
    <div className="space-y-5">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] rounded-xl text-white hover:bg-[#B8922E] transition-colors shadow-sm"
        >
          <FiDownload size={16} />
          Download Receipt (PDF)
        </button>
      </div>

      {/* Receipt */}
      <ReceiptContent
        ref={receiptRef}
        booking={booking}
        user={user}
        amount={amount}
      />

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/user-dashboard')}
          className="flex-1 px-6 py-3 bg-[#C9A84C] rounded-xl text-white font-bold hover:bg-[#B8922E] transition-colors shadow-sm"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/user-dashboard/bookings')}
          className="flex-1 px-6 py-3 border-2 border-[#C9A84C]/40 rounded-xl text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-colors"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

const PaymentError = ({ error, onRetry }) => {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <FiXCircle className="text-red-500" size={48} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
      <p className="text-gray-500 mb-6">
        {error || 'Your card was not charged. Please check your details and try again.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetry}
          className="flex-1 px-6 py-3 bg-[#C9A84C] rounded-xl text-white font-bold hover:bg-[#B8922E] transition-colors shadow-sm"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="flex-1 px-6 py-3 border-2 border-[#C9A84C]/40 rounded-xl text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const PaymentView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedBooking } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.users);
  
  const [paymentStatus, setPaymentStatus] = useState('form');
  const [paymentError, setPaymentError] = useState('');
  const [, setCompletedPayment] = useState(null);
  const [completedBooking, setCompletedBooking] = useState(null);

  const paymentData = useMemo(() => {
    const state = location.state;
    
    if (state?.bookingId && state?.amount) {
      return {
        bookingId: state.bookingId,
        amount: state.amount
      };
    } else if (selectedBooking?._id) {
      return {
        bookingId: selectedBooking._id,
        amount: selectedBooking.totalPrice
      };
    }
    
    return null;
  }, [location.state, selectedBooking]);

  useEffect(() => {
    if (!paymentData) {
      navigate('/user-dashboard/bookings');
    }
  }, [paymentData, navigate]);

  const handlePaymentSuccess = async (paymentResult) => {
    setCompletedPayment(paymentResult);
    
    if (paymentData?.bookingId) {
      try {
        const result = await dispatch(getBookingById(paymentData.bookingId)).unwrap();
        setCompletedBooking(result);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      }
    }
    
    setPaymentStatus('success');
  };

  const handlePaymentError = (error) => {
    setPaymentError(error);
    setPaymentStatus('error');
  };

  const handleRetry = () => {
    setPaymentStatus('form');
    setPaymentError('');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <FiLoader className="animate-spin text-[#C9A84C]" size={32} />
      </div>
    );
  }

  const { bookingId, amount } = paymentData;

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-[#C9A84C] transition-colors group"
            >
              <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {paymentStatus === 'success' ? 'Payment Complete' : 'Secure Payment'}
            </h1>
            <div className="w-16"></div>
          </div>

          {/* Amount Card */}
          {paymentStatus !== 'success' && (
            <div className="bg-linear-to-r from-[#FEF8E7] to-white rounded-xl p-6 border border-[#C9A84C]/30 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Amount due</p>
                  <p className="text-3xl font-bold text-[#C9A84C]">${amount?.toFixed(2)}</p>
                </div>
                <div className="px-3 py-1 bg-[#C9A84C]/10 rounded-full">
                  <span className="text-[#C9A84C] text-xs font-semibold">Stripe</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Content */}
          {paymentStatus === 'form' && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingId={bookingId}
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {paymentStatus === 'success' && (
            <PaymentSuccess
              amount={amount}
              booking={completedBooking || selectedBooking}
              user={user}
            />
          )}

          {paymentStatus === 'error' && (
            <PaymentError
              error={paymentError}
              onRetry={handleRetry}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentView;