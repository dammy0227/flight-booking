import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiAirplay,
  FiDollarSign,
  FiUsers,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiStar,
  FiMapPin,
  FiArrowRight,
  FiPlus,
} from "react-icons/fi";
import { FaPlane, FaHotel } from "react-icons/fa";

import { getBookings } from "../features/bookings/bookingSlice";
import { getFlights, getFlightStats } from "../features/flights/flightSlice";
import { getHotels, getHotelStats } from "../features/hotels/hotelSlice";
import { getRooms, getRoomStats } from "../features/rooms/roomSlice";
import { getPayments } from "../features/payments/paymentSlice";
import { getUsers } from "../features/users/userSlice";

const StatCard = ({ title, value, icon, trend, trendValue, bgColor, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {trendValue && <p className="text-xs text-gray-400 mt-1">{trendValue}</p>}
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-6 shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { flights, flightStats, loading: flightsLoading } = useSelector((state) => state.flights);
  const { hotels, hotelStats, loading: hotelsLoading } = useSelector((state) => state.hotels);
  const { rooms, roomStats, loading: roomsLoading } = useSelector((state) => state.rooms);
  const { payments, loading: paymentsLoading } = useSelector((state) => state.payments);
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          dispatch(getBookings()),
          dispatch(getFlights()),
          dispatch(getFlightStats()),
          dispatch(getHotels()),
          dispatch(getHotelStats()),
          dispatch(getRooms()),
          dispatch(getRoomStats()),
          dispatch(getPayments()),
          dispatch(getUsers()),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [dispatch]);

  // Safely extract data with fallbacks
  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  const flightsArray = Array.isArray(flights) ? flights : [];
  const hotelsArray = Array.isArray(hotels) ? hotels : [];
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const usersArray = Array.isArray(users) ? users : [];
  const roomsArray = Array.isArray(rooms) ? rooms : [];

  // Calculate metrics with safe fallbacks
  const totalRevenue = paymentsArray.reduce((sum, p) => sum + (p?.amount || 0), 0);
  const pendingRevenue = paymentsArray
    .filter(p => p?.status === "pending")
    .reduce((sum, p) => sum + (p?.amount || 0), 0);
  
  const completedBookings = bookingsArray.filter(b => b?.status === "confirmed").length;
  const pendingBookings = bookingsArray.filter(b => b?.status === "pending").length;
  const cancelledBookings = bookingsArray.filter(b => b?.status === "cancelled").length;
  
  const activeUsers = usersArray.length;
  const newUsersThisMonth = usersArray.filter(u => {
    if (!u?.createdAt) return false;
    const userDate = new Date(u.createdAt);
    const now = new Date();
    return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
  }).length;

  const availableRooms = roomsArray.reduce((sum, r) => sum + (r?.availableRooms || 0), 0);
  const lowStockRooms = roomsArray.filter(r => (r?.availableRooms || 0) > 0 && (r?.availableRooms || 0) < 5).length;

  const totalFlights = flightStats?.totalFlights || flightsArray.length || 0;
  const flightsToday = flightStats?.todayFlights || 0;
  const flightsTomorrow = flightStats?.tomorrowFlights || 0;
  const avgFlightPrice = flightStats?.avgPrice || (flightsArray.reduce((sum, f) => sum + (f?.price || 0), 0) / (flightsArray.length || 1)).toFixed(0);

  const avgHotelRating = hotelStats?.avgRating ? Number(hotelStats.avgRating).toFixed(1) : 
    (hotelsArray.reduce((sum, h) => sum + (h?.rating || 0), 0) / (hotelsArray.length || 1)).toFixed(1);
  const totalHotels = hotelStats?.totalHotels || hotelsArray.length || 0;
  const totalCities = hotelStats?.totalCities || new Set(hotelsArray.map(h => h?.city)).size || 0;
  const highRatedHotels = hotelStats?.highRated || hotelsArray.filter(h => (h?.rating || 0) >= 4.5).length || 0;

  const avgRoomPrice = roomStats?.avgPrice ? `$${roomStats.avgPrice}` : 
    `$${(roomsArray.reduce((sum, r) => sum + (r?.price || 0), 0) / (roomsArray.length || 1)).toFixed(0)}`;
  const totalRoomTypes = roomStats?.totalTypes || roomsArray.length || 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Recent activity with safe data access
  const recentActivity = [
    ...bookingsArray.slice(0, 5).map(b => ({ 
      ...b, 
      type: 'booking', 
      date: b?.createdAt,
      name: b?.userId?.name || b?.userId?.email || 'Guest',
      amount: b?.totalPrice
    })),
    ...paymentsArray.slice(0, 5).map(p => ({ 
      ...p, 
      type: 'payment', 
      date: p?.createdAt,
      name: p?.bookingId?.userId?.name || 'Customer',
      amount: p?.amount
    })),
    ...usersArray.slice(0, 5).map(u => ({ 
      ...u, 
      type: 'user', 
      date: u?.createdAt,
      name: u?.name || u?.email 
    })),
  ]
    .filter(item => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const conversionRate = bookingsArray.length > 0 
    ? ((completedBookings / bookingsArray.length) * 100).toFixed(1)
    : 0;

  const navigateTo = (path) => {
    navigate(path);
  };

  const isLoadingAny = bookingsLoading || flightsLoading || hotelsLoading || roomsLoading || paymentsLoading || usersLoading;

  if (isLoading || isLoadingAny) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your platform today.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex bg-white border border-gray-200 rounded-lg p-1">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<FiDollarSign className="w-6 h-6 text-green-600" />}
            bgColor="bg-green-100"
            trend={12.5}
            trendValue={`+${formatCurrency(pendingRevenue)} pending`}
            onClick={() => navigateTo('/payments')}
          />
          <StatCard
            title="Total Bookings"
            value={bookingsArray.length}
            icon={<FiCalendar className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-100"
            trend={8.2}
            trendValue={`${completedBookings} completed, ${pendingBookings} pending`}
            onClick={() => navigateTo('/bookings')}
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={<FiUsers className="w-6 h-6 text-purple-600" />}
            bgColor="bg-purple-100"
            trend={15.3}
            trendValue={`${newUsersThisMonth} new this month`}
            onClick={() => navigateTo('/users')}
          />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={<FiTrendingUp className="w-6 h-6 text-orange-600" />}
            bgColor="bg-orange-100"
            trend={5.7}
            onClick={() => navigateTo('/bookings')}
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Available Rooms"
            value={availableRooms}
            icon={<FiHome className="w-6 h-6 text-indigo-600" />}
            bgColor="bg-indigo-100"
            trend={-2.1}
            trendValue={`${lowStockRooms} low stock`}
            onClick={() => navigateTo('/rooms')}
          />
          <StatCard
            title="Total Flights"
            value={totalFlights}
            icon={<FiAirplay className="w-6 h-6 text-cyan-600" />}
            bgColor="bg-cyan-100"
            trend={3.4}
            trendValue={`${flightsToday} today, ${flightsTomorrow} tomorrow`}
            onClick={() => navigateTo('/flights')}
          />
          <StatCard
            title="Hotels"
            value={totalHotels}
            icon={<FaHotel className="w-6 h-6 text-pink-600" />}
            bgColor="bg-pink-100"
            trend={5.2}
            trendValue={`Avg rating: ${avgHotelRating} ⭐`}
            onClick={() => navigateTo('/hotels')}
          />
          <StatCard
            title="Pending Payments"
            value={paymentsArray.filter(p => p?.status === 'pending').length}
            icon={<FiCreditCard className="w-6 h-6 text-yellow-600" />}
            bgColor="bg-yellow-100"
            trend={-8.4}
            trendValue={formatCurrency(pendingRevenue)}
            onClick={() => navigateTo('/payments')}
          />
        </div>

        {/* Charts and Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ChartCard title="Booking Status">
            <div className="space-y-4">
              {[
                { 
                  status: 'Confirmed', 
                  count: completedBookings, 
                  color: 'bg-green-500', 
                  percentage: bookingsArray.length > 0 ? (completedBookings / bookingsArray.length) * 100 : 0 
                },
                { 
                  status: 'Pending', 
                  count: pendingBookings, 
                  color: 'bg-yellow-500', 
                  percentage: bookingsArray.length > 0 ? (pendingBookings / bookingsArray.length) * 100 : 0 
                },
                { 
                  status: 'Cancelled', 
                  count: cancelledBookings, 
                  color: 'bg-red-500', 
                  percentage: bookingsArray.length > 0 ? (cancelledBookings / bookingsArray.length) * 100 : 0 
                },
              ].map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.status}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Quick Stats">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors" onClick={() => navigateTo('/flights')}>
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg. Flight Price</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${avgFlightPrice}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors" onClick={() => navigateTo('/rooms')}>
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg. Room Price</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{avgRoomPrice}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors" onClick={() => navigateTo('/rooms')}>
                <div className="flex items-center space-x-2">
                  <FiHome className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Room Types</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{totalRoomTypes}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors" onClick={() => navigateTo('/hotels')}>
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Cities Covered</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{totalCities}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors" onClick={() => navigateTo('/hotels')}>
                <div className="flex items-center space-x-2">
                  <FiStar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">High Rated Hotels</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{highRatedHotels}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Recent Activity">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  let icon, bgColor, path;
                  switch (activity.type) {
                    case 'booking':
                      icon = <FiCalendar className="w-4 h-4 text-blue-600" />;
                      bgColor = 'bg-blue-100';
                      path = '/bookings';
                      break;
                    case 'payment':
                      icon = <FiDollarSign className="w-4 h-4 text-green-600" />;
                      bgColor = 'bg-green-100';
                      path = '/payments';
                      break;
                    case 'user':
                      icon = <FiUsers className="w-4 h-4 text-purple-600" />;
                      bgColor = 'bg-purple-100';
                      path = '/users';
                      break;
                    default:
                      icon = <FiClock className="w-4 h-4 text-gray-600" />;
                      bgColor = 'bg-gray-100';
                      path = '#';
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => navigateTo(path)}
                    >
                      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'booking' && `New booking from ${activity.name || 'Guest'}`}
                          {activity.type === 'payment' && `Payment of ${formatCurrency(activity.amount)} received`}
                          {activity.type === 'user' && `New user registered: ${activity.name || 'User'}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.date ? new Date(activity.date).toLocaleString() : 'Date not available'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Recent Bookings and Quick Actions - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Recent Bookings">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookingsArray.slice(0, 5).map((booking) => (
                    <tr 
                      key={booking._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateTo(`/bookings/${booking._id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {booking.userId?.name || booking.userId?.email || 'Guest'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {booking.type === 'flight' ? (
                            <FaPlane className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FaHotel className="w-4 h-4 text-orange-600" />
                          )}
                          <span className="text-sm text-gray-600 capitalize">{booking.type || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                    </tr>
                  ))}
                  {bookingsArray.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link to="/bookings" className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700">
                View all bookings <FiArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </ChartCard>

          <ChartCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigateTo('/flights')}
                className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <FiAirplay className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Manage Flights</p>
                <p className="text-xs text-gray-500 mt-1">View & edit flights</p>
              </button>

              <button 
                onClick={() => navigateTo('/hotels')}
                className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <FaHotel className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Manage Hotels</p>
                <p className="text-xs text-gray-500 mt-1">View & edit hotels</p>
              </button>

              <button 
                onClick={() => navigateTo('/rooms')}
                className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <FiHome className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Manage Rooms</p>
                <p className="text-xs text-gray-500 mt-1">View & edit rooms</p>
              </button>

              <button 
                onClick={() => navigateTo('/users')}
                className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Manage Users</p>
                <p className="text-xs text-gray-500 mt-1">View & manage users</p>
              </button>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;