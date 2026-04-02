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
  FiCompass as FiCompassIcon
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
    const colors = ['C9A84C', '4CAF50', '2196F3', '9C27B0', 'FF5722'];
    const randomColor = colors[name.length % colors.length];
    return `https://ui-avatars.com/api/?name=${name}&background=${randomColor}&color=fff&size=100`;
  };

  const getGreetingIcon = () => {
    if (greeting === 'Good Morning') return <FiSunrise className="text-[#C9A84C]" size={24} />;
    if (greeting === 'Good Afternoon') return <FiSun className="text-[#C9A84C]" size={24} />;
    return <FiMoon className="text-[#C9A84C]" size={24} />;
  };

  const totalSpent = bookings?.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
  
  const stats = [
    { 
      icon: FiBriefcase, 
      label: 'Total Bookings', 
      value: bookings?.length || 0, 
      change: '+12%',
      color: '#C9A84C', 
      bg: 'linear-linear(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 100%)'
    },
    { 
      icon: FiTrendingUp, 
      label: 'Flights', 
      value: flights?.length || 0, 
      change: '+8%',
      color: '#4CAF50', 
      bg: 'linear-linear(135deg, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.05) 100%)'
    },
    { 
      icon: FiMapPin, 
      label: 'Hotels', 
      value: hotels?.length || 0, 
      change: '+15%',
      color: '#9C27B0', 
      bg: 'linear-linear(135deg, rgba(156,39,176,0.2) 0%, rgba(156,39,176,0.05) 100%)'
    },
    { 
      icon: FiDollarSign, 
      label: 'Total Spent', 
      value: `$${totalSpent.toLocaleString()}`, 
      change: '+23%',
      color: '#2196F3', 
      bg: 'linear-linear(135deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.05) 100%)'
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
    { name: 'Flights', value: flights?.length || 0, color: '#C9A84C', icon: FiAirplay },
    { name: 'Hotels', value: hotels?.length || 0, color: '#4CAF50', icon: FiHome },
    { name: 'Packages', value: 2, color: '#9C27B0', icon: FiPackage },
  ];

  const formatDate = (dateString) => {
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
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const quickActions = [
    { icon: FiAirplay, label: 'Book Flight', color: '#C9A84C', path: '/user-dashboard/flights' },
    { icon: FiHome, label: 'Book Hotel', color: '#4CAF50', path: '/user-dashboard/hotels' },
    { icon: FiCompass, label: 'Explore', color: '#2196F3', path: '/explore' },
    { icon: FiCalendar, label: 'My Trips', color: '#9C27B0', path: '/user-dashboard/bookings' },
  ];

  const achievements = [
    { title: 'First Booking', completed: bookings?.length > 0, icon: FiStar },
    { title: 'Travel Bug', completed: (flights?.length + hotels?.length) >= 5, icon: FiSmile },
    { title: 'Globetrotter', completed: totalSpent > 5000, icon: FiGlobe },
    { title: 'Adventure Seeker', completed: upcomingTrips.length > 0, icon: FiZap },
  ];

  const trendingDestinations = [
    { city: 'Paris, France', bookings: 284, icon: FiFlag, countryCode: 'FR' },
    { city: 'Dubai, UAE', bookings: 356, icon: FiNavigation, countryCode: 'AE' },
    { city: 'Tokyo, Japan', bookings: 312, icon: FiFlag, countryCode: 'JP' },
    { city: 'New York, USA', bookings: 278, icon: FiFlag, countryCode: 'US' },
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
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#C9A84C] cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setShowMenu(!showMenu)}
              />
              {showMenu && (
                <div className="absolute top-14 sm:top-20 left-0 bg-[#1C2438] rounded-xl shadow-xl border border-[#252E44] w-48 overflow-hidden z-50">
                  <div className="p-3 border-b border-[#252E44]">
                    <p className="text-[#F5F0E8] font-semibold text-sm truncate">{user?.name}</p>
                    <p className="text-[#8B92A5] text-xs truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/user-dashboard/profile')}
                    className="w-full px-3 py-2 text-left text-[#F5F0E8] text-sm hover:bg-[#252E44] transition-colors flex items-center gap-2"
                  >
                    <FiSettings size={14} /> Profile Settings
                  </button>
                  <button
                    onClick={() => navigate('/logout')}
                    className="w-full px-3 py-2 text-left text-red-400 text-sm hover:bg-[#252E44] transition-colors flex items-center gap-2"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getGreetingIcon()}
                <p className="text-[#8B92A5] text-xs sm:text-sm">{greeting}</p>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F5F0E8]">Welcome back, {getUserName()}!</h1>
              <p className="text-[#8B92A5] text-xs sm:text-sm mt-1 hidden sm:block">Ready for your next adventure? Let's explore amazing destinations.</p>
            </div>
          </div>
          <div className="bg-[#1C2438] backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border border-[#252E44] shadow-lg w-full sm:w-auto">
            <p className="text-[#8B92A5] text-xs flex items-center gap-1"><FiClock size={12} /> Local Time</p>
            <p className="text-[#F5F0E8] text-xl sm:text-2xl font-bold">{currentTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-2xl p-4 sm:p-6 border border-[#252E44] hover:border-[#C9A84C]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ background: stat.bg }}
            >
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-linear-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-3xl font-bold text-[#F5F0E8]">{stat.value}</span>
                    <p className="text-emerald-400 text-xs font-semibold mt-1 flex items-center gap-1">
                      <FiTrendingUp size={10} /> {stat.change}
                    </p>
                  </div>
                </div>
                <p className="text-[#8B92A5] text-xs sm:text-sm font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1C2438] rounded-2xl p-4 sm:p-6 border border-[#252E44]">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <FiZap className="text-[#C9A84C]" size={18} />
            <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-linear-to-br from-white/5 to-transparent hover:from-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="p-2 sm:p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <span className="text-[#F5F0E8] text-xs sm:text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-[#1C2438] rounded-2xl p-4 sm:p-6 border border-[#252E44]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Booking Analytics</h2>
                <p className="text-[#8B92A5] text-xs mt-1">Monthly booking & revenue trends</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#C9A84C]"></div>
                  <span className="text-[#8B92A5] text-xs">Bookings</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#4CAF50]"></div>
                  <span className="text-[#8B92A5] text-xs">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-62.5 sm:h-75">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252E44" />
                  <XAxis dataKey="month" stroke="#8B92A5" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" stroke="#8B92A5" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8B92A5" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C2438', borderColor: '#252E44', color: '#F5F0E8' }}
                    labelStyle={{ color: '#F5F0E8' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C' }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} dot={{ fill: '#4CAF50' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1C2438] rounded-2xl p-4 sm:p-6 border border-[#252E44]">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Service Distribution</h2>
              <p className="text-[#8B92A5] text-xs mt-1">Bookings by type</p>
            </div>
            <div className="h-50 sm:h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#8B92A5' }}
                  >
                    {bookingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C2438', borderColor: '#252E44', color: '#F5F0E8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
              {bookingDistribution.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <ItemIcon size={12} style={{ color: item.color }} />
                    <span className="text-[#8B92A5] text-xs">{item.name}</span>
                    <span className="text-[#F5F0E8] text-xs font-semibold">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#252E44] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8] flex items-center gap-2">
                <FiCalendar className="text-[#C9A84C]" />
                Upcoming Adventures
              </h2>
              <p className="text-[#8B92A5] text-xs mt-1">Your next journeys await</p>
            </div>
            <button
              onClick={() => navigate('/user-dashboard/bookings')}
              className="text-[#C9A84C] text-xs sm:text-sm font-semibold hover:opacity-80 flex items-center gap-1 group"
            >
              View All <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => (
                <div key={trip._id} className="group relative bg-linear-to-br from-[#0F1420] to-[#1C2438] rounded-xl p-3 sm:p-4 border border-[#252E44] hover:border-[#C9A84C]/50 transition-all cursor-pointer hover:scale-105">
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <FiHeart className="text-[#8B92A5] hover:text-[#C9A84C] transition-colors cursor-pointer" size={14} />
                  </div>
                  <div className="mb-2 sm:mb-3">
                    {trip.type === 'flight' ? (
                      <FiAirplay className="text-[#C9A84C]" size={28} />
                    ) : (
                      <FiHome className="text-emerald-400" size={28} />
                    )}
                  </div>
                  <p className="text-[#F5F0E8] font-semibold text-xs sm:text-sm mb-1 capitalize">{trip.type} Booking</p>
                  <p className="text-[#8B92A5] text-xs mb-2">{formatDate(trip.departureDate || trip.checkInDate)}</p>
                  <div className="flex items-center justify-between mt-2 sm:mt-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-semibold border ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                    <span className="text-[#E8C97A] font-bold text-xs sm:text-sm">{formatPrice(trip.totalPrice)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 sm:py-12">
                <FiCompassIcon className="text-5xl sm:text-6xl mb-3 sm:mb-4 text-[#C9A84C] mx-auto" />
                <p className="text-[#8B92A5] text-base sm:text-lg">No upcoming trips yet</p>
                <p className="text-[#8B92A5] text-xs sm:text-sm mt-1">Start planning your next adventure!</p>
                <button
                  onClick={() => navigate('/user-dashboard/flights')}
                  className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] text-xs sm:text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Plan a Trip
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] flex flex-col max-h-125">
            <div className="p-4 sm:p-6 border-b border-[#252E44] shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Recent Activity</h2>
              <p className="text-[#8B92A5] text-xs mt-1">Your latest bookings and transactions</p>
            </div>
            <div className="divide-y divide-[#252E44] overflow-y-auto flex-1">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking._id} className="p-3 sm:p-4 hover:bg-[#252E44]/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        {booking.type === 'flight' ? (
                          <FiAirplay className="text-[#C9A84C]" size={20} />
                        ) : (
                          <FiHome className="text-emerald-400" size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-1">
                            <p className="text-[#F5F0E8] font-semibold text-xs sm:text-sm capitalize truncate">{booking.type} Booking</p>
                            <p className="text-[#8B92A5] text-xs mt-1">Qty: {booking.quantity} · {formatDate(booking.createdAt)}</p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-[#E8C97A] font-bold text-xs sm:text-sm">{formatPrice(booking.totalPrice)}</p>
                            <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-lg text-xs font-semibold mt-1 ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <FiCalendar className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-[#8B92A5] mx-auto" />
                  <p className="text-[#8B92A5] text-sm sm:text-base">No recent bookings</p>
                  <button
                    onClick={() => navigate('/user-dashboard/flights')}
                    className="mt-2 sm:mt-3 text-[#C9A84C] text-xs sm:text-sm font-semibold hover:opacity-80"
                  >
                    Start Exploring →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-linear-to-br from-[#1C2438] to-[#0F1420] rounded-2xl p-4 sm:p-6 border border-[#252E44]">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FiGlobe className="text-[#C9A84C]" size={18} />
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Travel Statistics</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-2 sm:p-3 bg-white/5 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-[#C9A84C]">{flights?.length || 0}</p>
                  <p className="text-[#8B92A5] text-xs mt-1">Flights Booked</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-white/5 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-[#C9A84C]">{hotels?.length || 0}</p>
                  <p className="text-[#8B92A5] text-xs mt-1">Hotels Booked</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-white/5 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-[#C9A84C]">{bookings?.length || 0}</p>
                  <p className="text-[#8B92A5] text-xs mt-1">Total Trips</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-white/5 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-[#C9A84C]">${totalSpent > 0 ? totalSpent.toLocaleString() : 0}</p>
                  <p className="text-[#8B92A5] text-xs mt-1">Total Spent</p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 rounded-2xl p-4 sm:p-6 border border-[#C9A84C]/20">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                  <FiAward className="text-[#C9A84C]" size={24} />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-[#F5F0E8] font-bold text-base sm:text-lg mb-1">Travel Achievements</h3>
                  <p className="text-[#8B92A5] text-xs sm:text-sm mb-3">You've completed {bookings?.length || 0} bookings!</p>
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map((achievement, idx) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 p-1.5 sm:p-2 bg-white/5 rounded-lg">
                          <Icon size={12} className={achievement.completed ? 'text-[#C9A84C]' : 'text-[#8B92A5]'} />
                          <span className={`text-xs ${achievement.completed ? 'text-[#F5F0E8]' : 'text-[#8B92A5]'}`}>
                            {achievement.title}
                          </span>
                          {achievement.completed && <FiStar size={10} className="text-[#C9A84C] ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-[#252E44] rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-full h-2 transition-all duration-500"
                        style={{ width: `${Math.min((achievements.filter(a => a.completed).length / achievements.length) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[#8B92A5] text-xs mt-2 text-center">
                      {achievements.filter(a => a.completed).length} of {achievements.length} achievements unlocked
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1C2438] rounded-2xl p-4 sm:p-6 border border-[#252E44]">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FiUsers className="text-[#C9A84C]" size={18} />
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Trending Destinations</h2>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {trendingDestinations.map((dest, idx) => {
                  const DestIcon = dest.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">{getCountryFlag(dest.countryCode)}</span>
                        <span className="text-[#F5F0E8] text-xs sm:text-sm font-medium">{dest.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8B92A5] text-xs">{dest.bookings} bookings</span>
                        <FiArrowRight size={12} className="text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-linear-to-r from-[#C9A84C]/10 to-transparent rounded-2xl p-4 sm:p-6 border border-[#C9A84C]/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8]">Ready for your next journey?</h2>
                <p className="text-[#8B92A5] text-xs sm:text-sm">Book your next adventure with exclusive deals</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/user-dashboard/flights')}
                  className="px-4 sm:px-6 py-2 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] text-xs sm:text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 justify-center"
                >
                  <FiAirplay size={14} />
                  Book Flight
                </button>
                <button
                  onClick={() => navigate('/user-dashboard/hotels')}
                  className="px-4 sm:px-6 py-2 border border-[#C9A84C] rounded-xl text-[#C9A84C] text-xs sm:text-sm font-semibold hover:bg-[#C9A84C]/10 transition-all flex items-center gap-2 justify-center"
                >
                  <FiHome size={14} />
                  Book Hotel
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1C2438] rounded-2xl p-4 sm:p-6 border border-[#252E44]">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <FiCoffee className="text-[#C9A84C]" size={16} />
              <h3 className="text-[#F5F0E8] font-semibold text-sm sm:text-base">Travel Tips</h3>
            </div>
            <p className="text-[#8B92A5] text-xs sm:text-sm">Book at least 3 weeks in advance to get the best deals on flights and hotels!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;