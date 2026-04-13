import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFlights } from '../../features/flights/flightSlice';
import { getHotels } from '../../features/hotels/hotelSlice';
import { getBookings } from '../../features/bookings/bookingSlice';
import {
  FiTrendingUp,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiAward,
  FiHeart,
  FiUsers,
  FiGlobe,
  FiSettings,
  FiLogOut,
  FiStar,
  FiCompass,
  FiAirplay,
  FiHome,
  FiSmile,
  FiZap,
  FiCoffee,
  FiSun,
  FiMoon,
  FiSunrise,
  FiPackage,
  FiFlag,
  FiNavigation,
  FiCompass as FiCompassIcon,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);
  const { flights } = useSelector((state) => state.flights);
  const { hotels } = useSelector((state) => state.hotels);
  const { bookings } = useSelector((state) => state.bookings);
  
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
      
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    
    updateTime();
    
    const interval = setInterval(updateTime, 1000);
    
    dispatch(getFlights());
    dispatch(getHotels());
    if (user?.id) {
      dispatch(getBookings({ userId: user.id }));
    }
    
    return () => clearInterval(interval);
  }, [dispatch, user]);

  const getUserName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return 'Traveler';
  };

  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar;
    const name = getUserName();
    return `https://ui-avatars.com/api/?name=${name}&background=C9A84C&color=fff&size=100`;
  };

  const getGreetingIcon = () => {
    if (greeting === 'Good Morning') return <FiSunrise className="text-[#C9A84C]" size={24} />;
    if (greeting === 'Good Afternoon') return <FiSun className="text-[#C9A84C]" size={24} />;
    return <FiMoon className="text-[#3B82F6]" size={24} />;
  };

  const totalSpent = bookings?.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
  
  const stats = [
    { 
      icon: FiBriefcase, 
      label: 'Total Bookings', 
      value: bookings?.length || 0, 
      change: '+12%',
      color: '#C9A84C', 
      bg: 'linear-linear(135deg, #FEF8E7 0%, #FDF2D6 100%)'
    },
    { 
      icon: FiTrendingUp, 
      label: 'Flights', 
      value: flights?.length || 0, 
      change: '+8%',
      color: '#3B82F6', 
      bg: 'linear-linear(135deg, #EFF6FF 0%, #DBEAFE 100%)'
    },
    { 
      icon: FiMapPin, 
      label: 'Hotels', 
      value: hotels?.length || 0, 
      change: '+15%',
      color: '#C9A84C', 
      bg: 'linear-linear(135deg, #FEF8E7 0%, #FDF2D6 100%)'
    },
    { 
      icon: FiDollarSign, 
      label: 'Total Spent', 
      value: `$${totalSpent.toLocaleString()}`, 
      change: '+23%',
      color: '#3B82F6', 
      bg: 'linear-linear(135deg, #EFF6FF 0%, #DBEAFE 100%)'
    },
  ];

  const recentBookings = bookings?.slice(0, 3) || [];
  const upcomingTrips = bookings?.filter(b => b.status === 'confirmed' && new Date(b.departureDate || b.checkInDate) > new Date()).slice(0, 4) || [];

  const bookingTrend = [
    { month: 'Jan', bookings: 4, revenue: 1200 },
    { month: 'Feb', bookings: 6, revenue: 1800 },
    { month: 'Mar', bookings: 8, revenue: 2400 },
    { month: 'Apr', bookings: 12, revenue: 3600 },
    { month: 'May', bookings: 9, revenue: 2700 },
    { month: 'Jun', bookings: 15, revenue: 4500 },
  ];

  const bookingDistribution = [
    { name: 'Flights', value: flights?.length || 0, color: '#3B82F6', icon: FiAirplay },
    { name: 'Hotels', value: hotels?.length || 0, color: '#C9A84C', icon: FiHome },
    { name: 'Packages', value: 2, color: '#8B5CF6', icon: FiPackage },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `$${price?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const quickActions = [
    { icon: FiAirplay, label: 'Book Flight', color: '#3B82F6', path: '/user-dashboard/flights' },
    { icon: FiHome, label: 'Book Hotel', color: '#C9A84C', path: '/user-dashboard/hotels' },
    { icon: FiCompass, label: 'Explore', color: '#3B82F6', path: '/explore' },
    { icon: FiCalendar, label: 'My Trips', color: '#C9A84C', path: '/user-dashboard/bookings' },
  ];

  const achievements = [
    { title: 'First Booking', completed: bookings?.length > 0, icon: FiStar },
    { title: 'Travel Bug', completed: (flights?.length + hotels?.length) >= 5, icon: FiSmile },
    { title: 'Globetrotter', completed: totalSpent > 5000, icon: FiGlobe },
    { title: 'Adventure Seeker', completed: upcomingTrips.length > 0, icon: FiZap },
  ];

  const trendingDestinations = [
    { city: 'Paris, France', bookings: 284, countryCode: 'FR' },
    { city: 'Dubai, UAE', bookings: 356, countryCode: 'AE' },
    { city: 'Tokyo, Japan', bookings: 312, countryCode: 'JP' },
    { city: 'New York, USA', bookings: 278, countryCode: 'US' },
  ];

  const getCountryFlag = (countryCode) => {
    const flags = {
      'FR': '🇫🇷',
      'AE': '🇦🇪',
      'JP': '🇯🇵',
      'US': '🇺🇸'
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-[#C9A84C] to-[#3B82F6] rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setShowMenu(!showMenu)}
              />
              {showMenu && (
                <div className="absolute top-16 sm:top-20 left-0 bg-white rounded-xl shadow-xl border border-gray-100 w-48 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-gray-800 font-semibold text-sm truncate">{user?.name}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/user-dashboard/profile')}
                    className="w-full px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FiSettings size={14} /> Profile Settings
                  </button>
                  <button
                    onClick={() => navigate('/logout')}
                    className="w-full px-3 py-2 text-left text-red-500 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getGreetingIcon()}
                <p className="text-gray-500 text-sm">{greeting}</p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome back, {getUserName()}!</h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">Ready for your next adventure? Let's explore amazing destinations.</p>
            </div>
          </div>
          <div className="bg-white shadow-sm px-5 py-2.5 rounded-xl border border-gray-100 w-full sm:w-auto">
            <p className="text-gray-500 text-xs flex items-center gap-1"><FiClock size={12} /> Local Time</p>
            <p className="text-gray-800 text-xl sm:text-2xl font-semibold">{currentTime}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl`} style={{ background: stat.bg }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                  <p className="text-emerald-600 text-xs font-semibold mt-1 flex items-center gap-1 justify-end">
                    <FiTrendingUp size={10} /> {stat.change}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <FiZap className="text-[#C9A84C]" size={18} />
            <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              >
                <div className="p-2.5 rounded-full bg-white shadow-sm group-hover:shadow transition-all">
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <span className="text-gray-700 text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Booking Analytics</h2>
                <p className="text-gray-500 text-sm mt-0.5">Monthly booking & revenue trends</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]"></div>
                  <span className="text-gray-600 text-xs">Bookings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                  <span className="text-gray-600 text-xs">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: '#1F2937' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#C9A84C" strokeWidth={2.5} dot={{ fill: '#C9A84C', strokeWidth: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800">Service Distribution</h2>
              <p className="text-gray-500 text-sm mt-0.5">Bookings by type</p>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#9CA3AF' }}
                  >
                    {bookingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-5 mt-4">
              {bookingDistribution.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <ItemIcon size={12} style={{ color: item.color }} />
                    <span className="text-gray-600 text-xs">{item.name}</span>
                    <span className="text-gray-800 text-xs font-semibold">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Adventures */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiCalendar className="text-[#C9A84C]" />
                Upcoming Adventures
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">Your next journeys await</p>
            </div>
            <button
              onClick={() => navigate('/user-dashboard/bookings')}
              className="text-[#C9A84C] text-sm font-semibold hover:text-[#B8922E] flex items-center gap-1 group"
            >
              View All <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <div key={trip._id} className="group relative bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#C9A84C] hover:shadow-md transition-all cursor-pointer hover:-translate-y-1">
                  <div className="absolute top-3 right-3">
                    <FiHeart className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer" size={16} />
                  </div>
                  <div className="mb-3">
                    {trip.type === 'flight' ? (
                      <FiAirplay className="text-[#3B82F6]" size={28} />
                    ) : (
                      <FiHome className="text-[#C9A84C]" size={28} />
                    )}
                  </div>
                  <p className="text-gray-800 font-semibold text-sm mb-1 capitalize">{trip.type} Booking</p>
                  <p className="text-gray-500 text-xs mb-2">{formatDate(trip.departureDate || trip.checkInDate)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                    <span className="text-[#C9A84C] font-bold text-sm">{formatPrice(trip.totalPrice)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FiCompassIcon className="text-5xl mb-3 text-[#C9A84C] mx-auto" />
                <p className="text-gray-600 text-lg">No upcoming trips yet</p>
                <p className="text-gray-400 text-sm mt-1">Start planning your next adventure!</p>
                <button
                  onClick={() => navigate('/user-dashboard/flights')}
                  className="mt-4 px-6 py-2 bg-[#C9A84C] rounded-xl text-white text-sm font-semibold hover:bg-[#B8922E] transition-all"
                >
                  Plan a Trip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col max-h-100">
            <div className="p-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
              <p className="text-gray-500 text-sm mt-0.5">Your latest bookings and transactions</p>
            </div>
            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        {booking.type === 'flight' ? (
                          <FiAirplay className="text-[#3B82F6]" size={18} />
                        ) : (
                          <FiHome className="text-[#C9A84C]" size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-1">
                            <p className="text-gray-800 font-semibold text-sm capitalize truncate">{booking.type} Booking</p>
                            <p className="text-gray-500 text-xs mt-1">Qty: {booking.quantity} · {formatDate(booking.createdAt)}</p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-[#C9A84C] font-bold text-sm">{formatPrice(booking.totalPrice)}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold mt-1 ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiCalendar className="text-4xl mb-2 text-gray-300 mx-auto" />
                  <p className="text-gray-500 text-sm">No recent bookings</p>
                  <button
                    onClick={() => navigate('/user-dashboard/flights')}
                    className="mt-2 text-[#C9A84C] text-sm font-semibold hover:text-[#B8922E]"
                  >
                    Start Exploring →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Travel Statistics */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <FiGlobe className="text-[#C9A84C]" size={18} />
                <h2 className="text-lg font-bold text-gray-800">Travel Statistics</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#3B82F6]">{flights?.length || 0}</p>
                  <p className="text-gray-500 text-sm mt-1">Flights Booked</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#C9A84C]">{hotels?.length || 0}</p>
                  <p className="text-gray-500 text-sm mt-1">Hotels Booked</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#3B82F6]">{bookings?.length || 0}</p>
                  <p className="text-gray-500 text-sm mt-1">Total Trips</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#C9A84C]">${totalSpent > 0 ? totalSpent.toLocaleString() : 0}</p>
                  <p className="text-gray-500 text-sm mt-1">Total Spent</p>
                </div>
              </div>
            </div>

            {/* Travel Achievements */}
            <div className="bg-linear-to-br from-[#FEF8E7] to-[#FDF2D6] rounded-xl p-5 border border-[#C9A84C]/30">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                  <FiAward className="text-[#C9A84C]" size={24} />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-gray-800 font-bold text-lg mb-1">Travel Achievements</h3>
                  <p className="text-gray-600 text-sm mb-4">You've completed {bookings?.length || 0} bookings!</p>
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map((achievement, idx) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                          <Icon size={12} className={achievement.completed ? 'text-[#C9A84C]' : 'text-gray-400'} />
                          <span className={`text-xs ${achievement.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                            {achievement.title}
                          </span>
                          {achievement.completed && <FiStar size={10} className="text-[#C9A84C] ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-[#C9A84C]/20 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-[#C9A84C] to-[#B8922E] rounded-full h-2 transition-all duration-500"
                        style={{ width: `${Math.min((achievements.filter(a => a.completed).length / achievements.length) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2 text-center">
                      {achievements.filter(a => a.completed).length} of {achievements.length} achievements unlocked
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Destinations */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <FiUsers className="text-[#C9A84C]" size={18} />
                <h2 className="text-lg font-bold text-gray-800">Trending Destinations</h2>
              </div>
              <div className="space-y-3">
                {trendingDestinations.map((dest, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCountryFlag(dest.countryCode)}</span>
                      <span className="text-gray-800 text-sm font-medium">{dest.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{dest.bookings} bookings</span>
                      <FiArrowRight size={12} className="text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-linear-to-r from-[#FEF8E7] to-transparent rounded-xl p-5 border border-[#C9A84C]/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Ready for your next journey?</h2>
                <p className="text-gray-600 text-sm">Book your next adventure with exclusive deals</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/user-dashboard/flights')}
                  className="px-5 py-2 bg-[#3B82F6] rounded-xl text-white text-sm font-semibold hover:bg-[#2563EB] transition-all flex items-center gap-2 justify-center"
                >
                  <FiAirplay size={14} />
                  Book Flight
                </button>
                <button
                  onClick={() => navigate('/user-dashboard/hotels')}
                  className="px-5 py-2 border border-[#C9A84C] rounded-xl text-[#C9A84C] text-sm font-semibold hover:bg-[#FEF8E7] transition-all flex items-center gap-2 justify-center"
                >
                  <FiHome size={14} />
                  Book Hotel
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FiCoffee className="text-[#C9A84C]" size={16} />
              <h3 className="text-gray-800 font-semibold">Travel Tips</h3>
            </div>
            <p className="text-gray-500 text-sm">Book at least 3 weeks in advance to get the best deals on flights and hotels!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;