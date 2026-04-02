import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFlights, searchFlights } from '../../features/flights/flightSlice';
import {
  FiSearch,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSliders,
  FiInfo,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { 
  FaPlane, 
  FaPlaneDeparture, 
  FaPlaneArrival,
  FaClock,
  FaChair,
  FaSuitcase,
  FaWifi,
  FaUtensils,
  FaTv,
  FaPlug,
  FaAirFreshener
} from 'react-icons/fa';
import { MdFlightTakeoff, MdFlightLand, MdAccessTime, MdAirlineSeatReclineNormal, MdOutlineFlight } from 'react-icons/md';
import { GiCommercialAirplane, GiAirplaneArrival, GiAirplaneDeparture, GiAirplane, GiAirZigzag, GiAirBalloon } from 'react-icons/gi';
import { TbPlane, TbPlaneArrival, TbPlaneDeparture, TbPlaneInflight } from 'react-icons/tb';
import { IoAirplaneOutline, IoAirplaneSharp } from 'react-icons/io5';

const UserFlights = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { flights, loading } = useSelector((state) => state.flights);
  
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000,
    minSeats: 1,
    sortBy: 'departureTime',
    sortOrder: 'asc'
  });

  useEffect(() => {
    dispatch(getFlights());
  }, [dispatch]);

  const handleSearch = () => {
    if (searchParams.from || searchParams.to || searchParams.date) {
      dispatch(searchFlights(searchParams));
    } else {
      dispatch(getFlights());
    }
  };

  const handleResetFilters = () => {
    setSearchParams({
      from: '',
      to: '',
      date: '',
      passengers: 1
    });
    setFilters({
      minPrice: 0,
      maxPrice: 1000,
      minSeats: 1,
      sortBy: 'departureTime',
      sortOrder: 'asc'
    });
    dispatch(getFlights());
  };

  const handleBookFlight = (flight) => {
    navigate('/booking', {
      state: {
        type: 'flight',
        referenceId: flight._id,
        id: flight._id,
        price: flight.price,
        quantity: searchParams.passengers,
        totalPrice: flight.price * searchParams.passengers,
        flightDetails: {
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          from: flight.departureCity,
          to: flight.arrivalCity,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          departureCity: flight.departureCity,
          arrivalCity: flight.arrivalCity
        }
      }
    });
  };

  const handleViewDetails = (flight) => {
    navigate(`/user-dashboard/flights/${flight._id}`, { 
      state: { flight: flight }
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'N/A';
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const sortFlights = (flightsList) => {
    return [...flightsList].sort((a, b) => {
      let aVal, bVal;
      switch (filters.sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'availableSeats':
          aVal = a.availableSeats;
          bVal = b.availableSeats;
          break;
        default:
          aVal = new Date(a.departureTime);
          bVal = new Date(b.departureTime);
      }
      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const filteredFlights = flights?.filter(flight => {
    if (filters.minPrice > 0 && flight.price < filters.minPrice) return false;
    if (filters.maxPrice < 1000 && flight.price > filters.maxPrice) return false;
    if (filters.minSeats > 1 && flight.availableSeats < filters.minSeats) return false;
    if (searchParams.from && !flight.departureCity.toLowerCase().includes(searchParams.from.toLowerCase())) return false;
    if (searchParams.to && !flight.arrivalCity.toLowerCase().includes(searchParams.to.toLowerCase())) return false;
    if (searchParams.date) {
      const flightDate = new Date(flight.departureTime).toDateString();
      const searchDate = new Date(searchParams.date).toDateString();
      if (flightDate !== searchDate) return false;
    }
    return true;
  });

  const sortedFlights = sortFlights(filteredFlights || []);

  const getAirlineIcon = (airline) => {
    const airlineLower = airline?.toLowerCase() || '';
    if (airlineLower.includes('emirates')) return <GiCommercialAirplane className="text-[#C9A84C]" size={24} />;
    if (airlineLower.includes('qatar')) return <TbPlaneInflight className="text-[#C9A84C]" size={24} />;
    if (airlineLower.includes('singapore')) return <IoAirplaneSharp className="text-[#C9A84C]" size={24} />;
    if (airlineLower.includes('delta')) return <FaPlane className="text-[#C9A84C]" size={24} />;
    if (airlineLower.includes('american')) return <IoAirplaneOutline className="text-[#C9A84C]" size={24} />;
    if (airlineLower.includes('united')) return <TbPlane className="text-[#C9A84C]" size={24} />;
    return <MdOutlineFlight className="text-[#C9A84C]" size={24} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F0E8]">Flights</h1>
          <p className="text-[#8B92A5] text-xs sm:text-sm mt-1">Find and book the best flights for your journey</p>
        </div>

        <div className="bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <GiAirplaneDeparture className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={16} />
                <input
                  type="text"
                  placeholder="From"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#8B92A5]"
                />
              </div>
              <div className="relative">
                <GiAirplaneArrival className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={16} />
                <input
                  type="text"
                  placeholder="To"
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#8B92A5]"
                />
              </div>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={16} />
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors cursor-pointer"
                />
              </div>
              <div className="relative">
                <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={16} />
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                  className="w-full pl-9 sm:pl-10 pr-7 sm:pr-8 py-2.5 sm:py-3 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B92A5]" size={16} />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#0F1420] rounded-lg sm:rounded-xl text-[#8B92A5] hover:text-[#C9A84C] transition-colors"
                >
                  <FiSliders size={16} />
                  <span className="text-sm">Filters</span>
                  {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
                
                <div className="flex gap-2 bg-[#0F1420] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#C9A84C] text-[#0A0E1A]' : 'text-[#8B92A5] hover:text-[#C9A84C]'}`}
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#C9A84C] text-[#0A0E1A]' : 'text-[#8B92A5] hover:text-[#C9A84C]'}`}
                  >
                    <FiList size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {(searchParams.from || searchParams.to || searchParams.date || filters.minPrice > 0 || filters.maxPrice < 1000 || filters.minSeats > 1) && (
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-[#252E44] rounded-lg sm:rounded-xl text-[#8B92A5] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-colors flex items-center justify-center gap-2"
                  >
                    <FiX size={16} />
                    <span className="text-sm">Reset</span>
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[#C9A84C] rounded-lg sm:rounded-xl text-[#0A0E1A] font-semibold hover:bg-[#E8C97A] transition-colors flex items-center justify-center gap-2"
                >
                  <FiSearch size={16} />
                  <span className="hidden sm:inline">Search Flights</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#252E44]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[#8B92A5] text-sm mb-2 block">Max Price</label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#8B92A5]">
                        <span>$0</span>
                        <span>${filters.maxPrice}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                        className="w-full h-2 bg-[#252E44] rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: '#C9A84C' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8B92A5] text-sm mb-2 block">Minimum Seats</label>
                    <select
                      value={filters.minSeats}
                      onChange={(e) => setFilters({ ...filters, minSeats: parseInt(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}+ seats</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8B92A5] text-sm mb-2 block">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                    >
                      <option value="departureTime">Departure Time</option>
                      <option value="price">Price</option>
                      <option value="availableSeats">Available Seats</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8B92A5] text-sm mb-2 block">Sort Order</label>
                    <button
                      onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                      className="w-full px-3 sm:px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm flex items-center justify-between hover:border-[#C9A84C] transition-colors"
                    >
                      <span>{filters.sortOrder === 'asc' ? 'Lowest First' : 'Highest First'}</span>
                      {filters.sortOrder === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[#8B92A5] text-sm">
            Found <span className="text-[#C9A84C] font-semibold">{sortedFlights.length}</span> flights
          </p>
        </div>

        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-5`}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] p-4 sm:p-5 animate-pulse">
                <div className="h-40 sm:h-48 bg-[#252E44] rounded-lg sm:rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : sortedFlights.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-5`}>
            {sortedFlights.map((flight) => (
              viewMode === 'grid' ? (
                <div 
                  key={flight._id} 
                  className="group bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] hover:border-[#C9A84C]/50 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-4 sm:p-5 pb-3 border-b border-[#252E44]">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
                          {getAirlineIcon(flight.airline)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#F5F0E8] font-bold text-sm sm:text-base truncate">
                            {flight.departureCity} → {flight.arrivalCity}
                          </h3>
                          <p className="text-[#8B92A5] text-[10px] sm:text-xs truncate">
                            {flight.airline} • {flight.flightNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#E8C97A] text-lg sm:text-xl font-bold">${flight.price}</p>
                        <p className={`text-[10px] sm:text-xs font-semibold ${flight.availableSeats < 10 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                          {flight.availableSeats} left
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-[#F5F0E8] font-bold text-base sm:text-lg">{formatTime(flight.departureTime)}</p>
                        <p className="text-[#8B92A5] text-[10px] sm:text-xs mt-0.5 sm:mt-1">{formatDate(flight.departureTime)}</p>
                        <p className="text-[#8B92A5] text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1 truncate">{flight.departureCity}</p>
                      </div>
                      <div className="flex flex-col items-center px-2 sm:px-3">
                        <p className="text-[#8B92A5] text-[10px] sm:text-xs font-medium">{calculateDuration(flight.departureTime, flight.arrivalTime)}</p>
                        <div className="relative w-12 sm:w-16 my-1 sm:my-2">
                          <div className="h-px bg-linear-to-r from-transparent via-[#C9A84C] to-transparent"></div>
                          <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1C2438] px-0.5 sm:px-1 text-[#C9A84C] text-[10px] sm:text-xs">
                            <FaPlane size={10} />
                          </span>
                        </div>
                        <p className="text-[#8B92A5] text-[10px] sm:text-xs">Direct</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[#F5F0E8] font-bold text-base sm:text-lg">{formatTime(flight.arrivalTime)}</p>
                        <p className="text-[#8B92A5] text-[10px] sm:text-xs mt-0.5 sm:mt-1">{formatDate(flight.arrivalTime)}</p>
                        <p className="text-[#8B92A5] text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1 truncate">{flight.arrivalCity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-3 border-t border-[#252E44]">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MdAirlineSeatReclineNormal size={12} className="text-[#8B92A5]" />
                        <span className="text-[#8B92A5] text-[10px] sm:text-xs">{flight.availableSeats} seats</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FaClock size={12} className="text-[#8B92A5]" />
                        <span className="text-[#8B92A5] text-[10px] sm:text-xs">{calculateDuration(flight.departureTime, flight.arrivalTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => handleViewDetails(flight)}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-[#C9A84C]/40 rounded-lg sm:rounded-xl text-[#C9A84C] text-xs sm:text-sm font-semibold hover:bg-[#C9A84C]/10 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <FiInfo size={12} />
                      Details
                    </button>
                    <button
                      onClick={() => handleBookFlight(flight)}
                      disabled={flight.availableSeats < searchParams.passengers}
                      className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1 sm:gap-2 ${
                        flight.availableSeats >= searchParams.passengers
                          ? 'bg-[#C9A84C] text-[#0A0E1A] hover:bg-[#E8C97A]'
                          : 'bg-[#252E44] text-[#8B92A5] cursor-not-allowed'
                      }`}
                    >
                      Book
                      <FiArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  key={flight._id} 
                  className="group bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] hover:border-[#C9A84C]/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
                        {getAirlineIcon(flight.airline)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-[#F5F0E8] font-bold text-base sm:text-lg">
                              {flight.departureCity} → {flight.arrivalCity}
                            </h3>
                            <p className="text-[#8B92A5] text-xs">
                              {flight.airline} • {flight.flightNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#E8C97A] text-xl font-bold">${flight.price}</p>
                            <p className={`text-xs font-semibold ${flight.availableSeats < 10 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                              {flight.availableSeats} seats left
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-3">
                          <div className="flex items-center gap-2">
                            <MdFlightTakeoff className="text-[#C9A84C]" size={14} />
                            <div>
                              <p className="text-[#F5F0E8] font-semibold text-sm">{formatTime(flight.departureTime)}</p>
                              <p className="text-[#8B92A5] text-xs">{formatDate(flight.departureTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdFlightLand className="text-[#C9A84C]" size={14} />
                            <div>
                              <p className="text-[#F5F0E8] font-semibold text-sm">{formatTime(flight.arrivalTime)}</p>
                              <p className="text-[#8B92A5] text-xs">{formatDate(flight.arrivalTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdAccessTime className="text-[#C9A84C]" size={14} />
                            <p className="text-[#8B92A5] text-xs">{calculateDuration(flight.departureTime, flight.arrivalTime)}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleViewDetails(flight)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-[#C9A84C]/40 rounded-lg sm:rounded-xl text-[#C9A84C] text-xs sm:text-sm font-semibold hover:bg-[#C9A84C]/10 transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleBookFlight(flight)}
                            disabled={flight.availableSeats < searchParams.passengers}
                            className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                              flight.availableSeats >= searchParams.passengers
                                ? 'bg-[#C9A84C] text-[#0A0E1A] hover:bg-[#E8C97A]'
                                : 'bg-[#252E44] text-[#8B92A5] cursor-not-allowed'
                            }`}
                          >
                            Book Now
                            <FiArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4 flex justify-center">
              <GiAirplane size={60} className="text-[#C9A84C]" />
            </div>
            <h3 className="text-[#F5F0E8] text-lg sm:text-xl font-semibold mb-2">No flights found</h3>
            <p className="text-[#8B92A5] text-xs sm:text-sm mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={handleResetFilters}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#C9A84C] rounded-lg sm:rounded-xl text-[#0A0E1A] text-sm font-semibold hover:bg-[#E8C97A] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFlights;