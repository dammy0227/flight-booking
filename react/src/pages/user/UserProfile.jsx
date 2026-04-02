import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiShield,
  FiLogOut,
  FiEdit2,
  FiCamera,
  FiX,
  FiSave,
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiMapPin,
  FiHome,
  FiStar,
  FiInfo,
  FiChevronRight,
  FiLoader,
  FiAward,
  FiHeart,
  FiGlobe,
  FiSmartphone,
  FiCreditCard
} from 'react-icons/fi';
import { updateProfile,} from '../../features/users/userSlice';
import { getBookings } from '../../features/bookings/bookingSlice';

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.users);
  const { bookings } = useSelector((state) => state.bookings);
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image || null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      dispatch(getBookings({ userId }));
    }
  }, [dispatch, user?.id, user?._id]);

  useEffect(() => {
    if (user?.name && !editMode) {
      setName(user.name);
    }
    if (user?.image && !editMode) {
      setImagePreview(user.image);
    }
  }, [user?.name, user?.image, editMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      console.error('No user ID found');
      alert('User ID not found. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const result = await dispatch(updateProfile({
        id: userId,
        formData: formData
      })).unwrap();

      if (result) {
        setEditMode(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'bg-[#10B981]/20 text-[#10B981]';
    if (status === 'pending') return 'bg-[#F59E0B]/20 text-[#F59E0B]';
    if (status === 'cancelled') return 'bg-[#EF4444]/20 text-[#EF4444]';
    return 'bg-[#8B92A5]/20 text-[#8B92A5]';
  };

  const getBookingIcon = (type) => {
    if (type === 'flight') return <FiTrendingUp size={18} />;
    if (type === 'hotel') return <FiHome size={18} />;
    if (type === 'room') return <FiBriefcase size={18} />;
    return <FiBriefcase size={18} />;
  };

  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
  const flightBookings = bookings?.filter(b => b.type === 'flight').length || 0;
  const hotelBookings = bookings?.filter(b => b.type === 'hotel').length || 0;
  const roomBookings = bookings?.filter(b => b.type === 'room').length || 0;
  const totalSpent = bookings?.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
  const recentBookings = bookings?.slice(0, 3) || [];

  const userId = user?._id || user?.id;

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              My Profile
            </h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all text-sm sm:text-base ${
                editMode
                  ? 'bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30'
                  : 'bg-[#1C2438] text-[#C9A84C] hover:bg-[#252E44]'
              }`}
            >
              {editMode ? <FiX size={16} /> : <FiEdit2 size={16} />}
              <span className="font-semibold">{editMode ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-5 sm:p-6 md:p-8">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-linear-to-br from-[#C9A84C]/60 to-[#C9A84C]/20 p-1">
                  <div className="w-full h-full rounded-full bg-[#1C2438] overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0F1420] flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-[#C9A84C]">
                          {user?.name?.charAt(0)?.toUpperCase() || <FiUser size={28} />}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {editMode && (
                  <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-[#C9A84C] rounded-full cursor-pointer hover:bg-[#E8C97A] transition-colors">
                    <FiCamera size={12} className="text-[#0A0E1A]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Name and Email */}
              {editMode ? (
                <div className="mt-6 w-full max-w-md">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className={`w-full px-4 py-3 bg-[#0F1420] border rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors ${
                      errors.name ? 'border-[#EF4444]' : 'border-[#252E44]'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-[#C9A84C] rounded-xl text-[#0A0E1A] font-semibold hover:bg-[#E8C97A] transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <FiLoader className="animate-spin" size={16} />
                      ) : (
                        <>
                          <FiSave size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setName(user?.name || '');
                        setImagePreview(user?.image || null);
                        setSelectedImage(null);
                      }}
                      className="flex-1 px-4 py-2.5 border border-[#252E44] rounded-xl text-[#8B92A5] hover:text-[#F5F0E8] hover:border-[#C9A84C] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">{user?.name}</h2>
                  <p className="text-[#8B92A5] text-xs sm:text-sm mt-1 break-all">{user?.email}</p>
                  <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-[#0F1420] border border-[#252E44]">
                    <FiShield size={12} className="text-[#C9A84C]" />
                    <span className="text-[#C9A84C] text-xs font-semibold uppercase">
                      {user?.role || 'User'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-3 sm:p-4 text-center hover:border-[#C9A84C]/50 transition-all">
              <div className="flex justify-center mb-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#C9A84C]/10">
                  <FiBriefcase size={16} className="text-[#C9A84C]" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">{totalBookings}</p>
              <p className="text-[#8B92A5] text-xs">Total Bookings</p>
            </div>
            <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-3 sm:p-4 text-center hover:border-[#C9A84C]/50 transition-all">
              <div className="flex justify-center mb-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#10B981]/10">
                  <FiCheckCircle size={16} className="text-[#10B981]" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">{confirmedBookings}</p>
              <p className="text-[#8B92A5] text-xs">Confirmed</p>
            </div>
            <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-3 sm:p-4 text-center hover:border-[#C9A84C]/50 transition-all">
              <div className="flex justify-center mb-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#C9A84C]/10">
                  <FiTrendingUp size={16} className="text-[#C9A84C]" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">{flightBookings}</p>
              <p className="text-[#8B92A5] text-xs">Flights</p>
            </div>
            <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-3 sm:p-4 text-center hover:border-[#C9A84C]/50 transition-all">
              <div className="flex justify-center mb-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#C9A84C]/10">
                  <FiHome size={16} className="text-[#C9A84C]" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">{hotelBookings + roomBookings}</p>
              <p className="text-[#8B92A5] text-xs">Stays</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Account Details */}
            <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-5 sm:p-6">
              <h3 className="text-xs sm:text-sm font-semibold text-[#8B92A5] mb-4 uppercase tracking-wider flex items-center gap-2">
                <FiInfo size={14} />
                Account Details
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#0F1420] rounded-xl">
                  <FiMail className="text-[#C9A84C]" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#8B92A5] text-xs">Email</p>
                    <p className="text-[#F5F0E8] text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0F1420] rounded-xl">
                  <FiShield className="text-[#C9A84C]" size={18} />
                  <div className="flex-1">
                    <p className="text-[#8B92A5] text-xs">Role</p>
                    <p className="text-[#F5F0E8] text-sm font-medium capitalize">{user?.role || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0F1420] rounded-xl">
                  <FiCalendar className="text-[#C9A84C]" size={18} />
                  <div className="flex-1">
                    <p className="text-[#8B92A5] text-xs">Member Since</p>
                    <p className="text-[#F5F0E8] text-sm font-medium">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0F1420] rounded-xl">
                  <FiCreditCard className="text-[#C9A84C]" size={18} />
                  <div className="flex-1">
                    <p className="text-[#8B92A5] text-xs">User ID</p>
                    <p className="text-[#F5F0E8] text-sm font-mono">{userId?.slice(-12)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            {recentBookings.length > 0 ? (
              <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#8B92A5] uppercase tracking-wider flex items-center gap-2">
                    <FiClock size={14} />
                    Recent Bookings
                  </h3>
                  <button
                    onClick={() => navigate('/user-dashboard/bookings')}
                    className="text-[#C9A84C] text-xs sm:text-sm font-semibold hover:opacity-80 flex items-center gap-1"
                  >
                    See all <FiChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center gap-3 p-3 bg-[#0F1420] rounded-xl hover:bg-[#1C2438] transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        booking.type === 'flight' 
                          ? 'bg-[#C9A84C]/10' 
                          : 'bg-[#10B981]/10'
                      }`}>
                        {getBookingIcon(booking.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F5F0E8] font-semibold text-sm capitalize truncate">{booking.type} Booking</p>
                        <p className="text-[#8B92A5] text-xs">${booking.totalPrice?.toFixed(2)} · Qty {booking.quantity}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status?.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-5 sm:p-6 flex flex-col items-center justify-center text-center">
                <FiClock size={32} className="text-[#8B92A5] mb-3" />
                <p className="text-[#F5F0E8] font-semibold text-sm">No bookings yet</p>
                <p className="text-[#8B92A5] text-xs mt-1">Start your first adventure!</p>
                <button
                  onClick={() => navigate('/user-dashboard/flights')}
                  className="mt-3 px-4 py-2 bg-[#C9A84C] rounded-xl text-[#0A0E1A] text-xs font-semibold hover:bg-[#E8C97A] transition-colors"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-linear-to-r from-[#C9A84C]/10 to-transparent rounded-2xl p-5 sm:p-6 border border-[#C9A84C]/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-[#8B92A5] text-sm flex items-center gap-2">
                  <FiDollarSign size={16} />
                  Total Spent
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#E8C97A]">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8B92A5]">
                <FiAward size={16} className="text-[#C9A84C]" />
                <span>Loyalty Member</span>
              </div>
            </div>
          </div>

       
        </div>
      </div>
    </div>
  );
};

export default UserProfile;