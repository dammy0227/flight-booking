import React, { useState, useMemo, useEffect } from 'react';
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
  FiInfo
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
        
        onSuccess?.();
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
        color: '#F5F0E8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#8B92A5',
        },
        backgroundColor: '#0F1420',
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <FiCreditCard className="text-[#C9A84C]" size={20} />
          </div>
          <h2 className="text-lg font-bold text-[#F5F0E8]">Card Details</h2>
        </div>
        <div className="p-4 bg-[#0F1420] rounded-xl">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
            className="py-3 px-2"
          />
        </div>
      </div>
      
      {errorMessage && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-center gap-2">
          <FiXCircle className="text-[#EF4444]" size={18} />
          <p className="text-[#EF4444] text-sm">{errorMessage}</p>
        </div>
      )}
      
      <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiLock size={14} className="text-[#C9A84C]" />
            <span className="text-[#8B92A5] text-xs">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <FiShield size={14} className="text-[#C9A84C]" />
            <span className="text-[#8B92A5] text-xs">SSL Encrypted</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#252E44]">
          <div>
            <p className="text-[#8B92A5] text-xs">Amount to Pay</p>
            <p className="text-2xl font-bold text-[#E8C97A]">${amount?.toFixed(2)}</p>
          </div>
          <button
            type="submit"
            disabled={!cardComplete || processing || loading}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              !cardComplete || processing || loading
                ? 'bg-[#252E44] text-[#8B92A5] cursor-not-allowed'
                : 'bg-[#C9A84C] text-[#0A0E1A] hover:bg-[#E8C97A] transform hover:scale-[1.02]'
            }`}
          >
            {processing || loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A0E1A] mx-auto"></div>
            ) : (
              `Pay $${amount?.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-4">
        <p className="text-[#8B92A5] text-xs mb-2">Test Cards (Stripe)</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#10B981]">✓ Success</span>
            <span className="text-[#8B92A5] font-mono">4242 4242 4242 4242</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#EF4444]">✗ Decline</span>
            <span className="text-[#8B92A5] font-mono">4000 0000 0000 0002</span>
          </div>
        </div>
      </div>
    </form>
  );
};

const PaymentSuccess = ({ amount, bookingId }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8 px-8 lg:px-4">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#10B981]/20 flex items-center justify-center border-2 border-[#10B981]/40">
        <FiCheckCircle className="text-[#10B981]" size={48} />
      </div>
      <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">Payment Successful!</h2>
      <p className="text-[#E8C97A] text-3xl font-bold mb-6">${amount?.toFixed(2)}</p>
      
      <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-6 mb-6 text-left">
        <div className="flex items-center gap-2 mb-4">
          <FiInfo className="text-[#C9A84C]" size={16} />
          <span className="text-[#F5F0E8] font-semibold">Payment Receipt</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8B92A5]">Booking ID</span>
            <span className="text-[#F5F0E8] font-mono text-xs">{bookingId?.slice(-12)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8B92A5]">Amount Paid</span>
            <span className="text-[#E8C97A] font-bold">${amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8B92A5]">Payment Method</span>
            <span className="text-[#F5F0E8]">Stripe</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8B92A5]">Status</span>
            <span className="text-[#10B981] font-semibold">COMPLETED</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/user-dashboard')}
          className="flex-1 px-6 py-3 bg-[#C9A84C] rounded-xl text-[#0A0E1A] font-bold hover:bg-[#E8C97A] transition-colors"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/user-dashboard/bookings')}
          className="flex-1 px-6 py-3 border border-[#C9A84C]/40 rounded-xl text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-colors"
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
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#EF4444]/20 flex items-center justify-center border-2 border-[#EF4444]/40">
        <FiXCircle className="text-[#EF4444]" size={48} />
      </div>
      <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">Payment Failed</h2>
      <p className="text-[#8B92A5] mb-6">
        {error || 'Your card was not charged. Please check your details and try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 px-6 py-3 bg-[#C9A84C] rounded-xl text-[#0A0E1A] font-bold hover:bg-[#E8C97A] transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="flex-1 px-6 py-3 border border-[#C9A84C]/40 rounded-xl text-[#C9A84C] font-semibold hover:bg-[#C9A84C]/10 transition-colors"
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
  const { selectedBooking } = useSelector((state) => state.bookings);
  
  const [paymentStatus, setPaymentStatus] = useState('form');
  const [paymentError, setPaymentError] = useState('');

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

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]"></div>
      </div>
    );
  }

  const { bookingId, amount } = paymentData;

  const handlePaymentSuccess = () => {
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

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-8">
      <div className="max-w-5xl mx-auto px-8 lg:px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#8B92A5] hover:text-[#C9A84C] transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-[#F5F0E8]">
              {paymentStatus === 'success' ? 'Payment Complete' : 'Secure Payment'}
            </h1>
            <div className="w-16"></div>
          </div>

          <div className="bg-linear-to-r from-[#C9A84C]/10 to-transparent rounded-2xl p-6 border border-[#C9A84C]/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#8B92A5] text-sm">Amount due</p>
                <p className="text-3xl font-bold text-[#C9A84C]">${amount?.toFixed(2)}</p>
              </div>
              <div className="px-3 py-1 bg-[#C9A84C]/10 rounded-full">
                <span className="text-[#C9A84C] text-xs font-semibold">Stripe</span>
              </div>
            </div>
          </div>

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
              bookingId={bookingId}
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