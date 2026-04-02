import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRooms } from '../../features/rooms/roomSlice';
import {
  FiSearch,
  FiMapPin,
  FiDollarSign,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSliders,
  FiUsers,
  FiEye,
  FiGrid,
  FiList,
  FiHome,
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import { 
  FaBed, 
  FaBath, 
  FaWifi, 
  FaTv, 
  FaSnowflake, 
  FaCoffee,
  FaStar,
  FaStarHalfAlt,
  FaRegStar
} from 'react-icons/fa';
import { 
  MdRoomService, 
  MdBalcony, 
  MdKingBed, 
  MdMeetingRoom 
} from 'react-icons/md';
import { 
  GiBathtub, 
  GiDesk, 
  GiClothes, 
  GiWashingMachine 
} from 'react-icons/gi';

const UserRooms = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { rooms, loading } = useSelector((state) => state.rooms);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500,
    minGuests: 1,
    sortBy: 'price',
    sortOrder: 'asc'
  });

  const hotelId = location.state?.hotelId || '';
  const hotelName = location.state?.hotelName || '';

  useEffect(() => {
    if (hotelId) {
      dispatch(getRooms({ hotel: hotelId }));
    } else {
      dispatch(getRooms());
    }
  }, [dispatch, hotelId]);

  const handleSearch = () => {
    if (hotelId) {
      dispatch(getRooms({ hotel: hotelId, search: searchQuery }));
    } else {
      dispatch(getRooms({ search: searchQuery }));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      minPrice: 0,
      maxPrice: 500,
      minGuests: 1,
      sortBy: 'price',
      sortOrder: 'asc'
    });
    if (hotelId) {
      dispatch(getRooms({ hotel: hotelId }));
    } else {
      dispatch(getRooms());
    }
  };

  const handleViewDetails = (room) => {
    navigate(`/user-dashboard/rooms/${room._id}`, { 
      state: { room: room }
    });
  };

  const handleBookRoom = (room) => {
    navigate('/booking', {
      state: {
        type: 'room',
        referenceId: room._id,
        price: room.price,
        quantity: 1,
        totalPrice: room.price,
        roomDetails: {
          roomType: room.roomType,
          hotelName: room.hotelId?.name || room.hotelName,
          hotelCity: room.hotelId?.city || room.hotelCity,
          bedType: room.bedType,
          maxOccupancy: room.maxOccupancy,
          view: room.view,
        }
      }
    });
  };

  const getHotelName = (room) => {
    return room.hotelId?.name || room.hotelName || 'Hotel';
  };

  const getHotelCity = (room) => {
    return room.hotelId?.city || room.hotelCity || '';
  };

  const getBedIcon = (bedType) => {
    const type = bedType?.toLowerCase() || '';
    if (type.includes('king')) return <MdKingBed size={14} />;
    if (type.includes('queen')) return <FaBed size={14} />;
    if (type.includes('twin')) return <FaBed size={14} />;
    return <FaBed size={14} />;
  };

  const getViewIcon = (view) => {
    const viewType = view?.toLowerCase() || '';
    if (viewType.includes('ocean') || viewType.includes('sea')) return <FiEye size={12} />;
    if (viewType.includes('city')) return <FiGrid size={12} />;
    if (viewType.includes('mountain')) return <FiMapPin size={12} />;
    return <FiEye size={12} />;
  };

  const getAmenityIcon = (amenity) => {
    const amenityType = amenity?.toLowerCase() || '';
    if (amenityType.includes('wifi')) return <FaWifi size={12} />;
    if (amenityType.includes('tv')) return <FaTv size={12} />;
    if (amenityType.includes('ac') || amenityType.includes('air')) return <FaSnowflake size={12} />;
    if (amenityType.includes('coffee')) return <FaCoffee size={12} />;
    if (amenityType.includes('bath')) return <FaBath size={12} />;
    if (amenityType.includes('room service')) return <MdRoomService size={12} />;
    if (amenityType.includes('balcony')) return <MdBalcony size={12} />;
    return null;
  };

  const sortRooms = (roomsList) => {
    return [...roomsList].sort((a, b) => {
      let aVal, bVal;
      switch (filters.sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'maxOccupancy':
          aVal = a.maxOccupancy || 0;
          bVal = b.maxOccupancy || 0;
          break;
        default:
          aVal = a.roomType;
          bVal = b.roomType;
      }
      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const filteredRooms = rooms?.filter(room => {
    if (filters.minPrice > 0 && room.price < filters.minPrice) return false;
    if (filters.maxPrice < 500 && room.price > filters.maxPrice) return false;
    if (filters.minGuests > 1 && (room.maxOccupancy || 0) < filters.minGuests) return false;
    if (searchQuery && !room.roomType?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedRooms = sortRooms(filteredRooms || []);

  const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} size={12} className="text-[#C9A84C]" />
        ))}
        {hasHalfStar && <FaStarHalfAlt size={12} className="text-[#C9A84C]" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} size={12} className="text-[#8B92A5]" />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F0E8]">
            {hotelName ? `${hotelName} - Rooms` : 'Available Rooms'}
          </h1>
          <p className="text-[#8B92A5] text-xs sm:text-sm mt-1">
            {hotelName ? `Browse all rooms at ${hotelName}` : 'Find the perfect room for your stay'}
          </p>
        </div>

        <div className="bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={18} />
              <input
                type="text"
                placeholder="Search rooms by type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#8B92A5]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#C9A84C] rounded-lg sm:rounded-xl text-[#0A0E1A] font-semibold hover:bg-[#E8C97A] transition-colors flex items-center justify-center gap-2"
            >
              <FiSearch size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
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
              {(searchQuery || filters.minPrice > 0 || filters.maxPrice < 500 || filters.minGuests > 1) && (
                <button
                  onClick={handleResetFilters}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-[#252E44] rounded-lg sm:rounded-xl text-[#8B92A5] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-colors flex items-center justify-center gap-2"
                >
                  <FiX size={16} />
                  <span className="text-sm">Reset</span>
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#252E44]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <label className="text-[#8B92A5] text-sm mb-2 block">Price Range (max)</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#8B92A5]">
                      <span>$0</span>
                      <span>${filters.maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="25"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#252E44] rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: '#C9A84C' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[#8B92A5] text-sm mb-2 block">Minimum Guests</label>
                  <select
                    value={filters.minGuests}
                    onChange={(e) => setFilters({ ...filters, minGuests: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  >
                    <option value={1}>1+ guests</option>
                    <option value={2}>2+ guests</option>
                    <option value={3}>3+ guests</option>
                    <option value={4}>4+ guests</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8B92A5] text-sm mb-2 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  >
                    <option value="price">Price</option>
                    <option value="maxOccupancy">Max Guests</option>
                    <option value="roomType">Room Type</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8B92A5] text-sm mb-2 block">Sort Order</label>
                  <button
                    onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className="w-full px-3 sm:px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-lg sm:rounded-xl text-[#F5F0E8] text-sm flex items-center justify-between hover:border-[#C9A84C] transition-colors"
                  >
                    <span>{filters.sortOrder === 'asc' ? 'Lowest to Highest' : 'Highest to Lowest'}</span>
                    {filters.sortOrder === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[#8B92A5] text-sm">
            Found <span className="text-[#C9A84C] font-semibold">{sortedRooms.length}</span> rooms
          </p>
        </div>

        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-6`}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] overflow-hidden animate-pulse">
                <div className="h-40 sm:h-48 bg-[#252E44]"></div>
                <div className="p-4">
                  <div className="h-5 bg-[#252E44] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#252E44] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedRooms.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-6`}>
            {sortedRooms.map((room) => {
              const isLowAvailability = room.availableRooms < 5;
              const imageUrl = room.images?.[0]?.url || null;
              const rating = room.rating || 4.5;
              
              return viewMode === 'grid' ? (
                <div key={room._id} className="group bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] overflow-hidden hover:border-[#C9A84C]/50 transition-all hover:shadow-xl">
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={room.roomType}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 flex items-center justify-center"><span class="text-4xl sm:text-6xl">🛏️</span></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 flex items-center justify-center">
                        <span className="text-4xl sm:text-6xl">🛏️</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-lg sm:rounded-full shadow-lg">
                      <div className="flex items-center gap-1">
                        <FiDollarSign size={12} className="text-[#0A0E1A]" />
                        <span className="text-[#0A0E1A] font-bold text-xs sm:text-sm">{room.price}</span>
                      </div>
                    </div>
                    
                    <div className={`absolute bottom-3 right-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold ${
                      isLowAvailability 
                        ? 'bg-[#F59E0B]/90 text-[#0A0E1A]' 
                        : 'bg-[#10B981]/90 text-white'
                    }`}>
                      {room.availableRooms > 0 ? `${room.availableRooms} left` : 'Sold Out'}
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[#F5F0E8] font-bold text-base sm:text-lg truncate flex-1">{room.roomType}</h3>
                      <RatingStars rating={rating} />
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <FiMapPin size={12} className="text-[#8B92A5] shrink-0" />
                      <p className="text-[#8B92A5] text-xs truncate">{getHotelName(room)}, {getHotelCity(room)}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                      {room.bedType && (
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-[#0F1420] rounded-md sm:rounded-lg">
                          {getBedIcon(room.bedType)}
                          <span className="text-[#8B92A5] text-[10px] sm:text-xs">{room.bedType}</span>
                        </div>
                      )}
                      {room.maxOccupancy && (
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-[#0F1420] rounded-md sm:rounded-lg">
                          <FiUsers size={10} className="text-[#C9A84C]" />
                          <span className="text-[#8B92A5] text-[10px] sm:text-xs">{room.maxOccupancy}</span>
                        </div>
                      )}
                      {room.view && (
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-[#0F1420] rounded-md sm:rounded-lg">
                          {getViewIcon(room.view)}
                          <span className="text-[#8B92A5] text-[10px] sm:text-xs">{room.view}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleViewDetails(room)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-[#C9A84C]/40 rounded-lg sm:rounded-xl text-[#C9A84C] text-xs sm:text-sm font-semibold hover:bg-[#C9A84C]/10 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleBookRoom(room)}
                        disabled={room.availableRooms < 1}
                        className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
                          room.availableRooms > 0
                            ? 'bg-[#C9A84C] text-[#0A0E1A] hover:bg-[#E8C97A]'
                            : 'bg-[#252E44] text-[#8B92A5] cursor-not-allowed'
                        }`}
                      >
                        Book
                        <FiArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={room._id} className="group bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] overflow-hidden hover:border-[#C9A84C]/50 transition-all">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 sm:h-auto sm:w-48 md:w-64 overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={room.roomType}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 flex items-center justify-center"><span class="text-6xl">🛏️</span></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 flex items-center justify-center">
                          <span className="text-6xl">🛏️</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <div>
                          <h3 className="text-[#F5F0E8] font-bold text-lg sm:text-xl">{room.roomType}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <FiMapPin size={12} className="text-[#8B92A5]" />
                            <p className="text-[#8B92A5] text-xs sm:text-sm">{getHotelName(room)}, {getHotelCity(room)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <FiDollarSign size={16} className="text-[#C9A84C]" />
                            <span className="text-[#F5F0E8] font-bold text-lg sm:text-xl">{room.price}</span>
                            <span className="text-[#8B92A5] text-xs">/night</span>
                          </div>
                          <RatingStars rating={rating} />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {room.bedType && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#0F1420] rounded-lg">
                            {getBedIcon(room.bedType)}
                            <span className="text-[#8B92A5] text-xs">{room.bedType}</span>
                          </div>
                        )}
                        {room.maxOccupancy && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#0F1420] rounded-lg">
                            <FiUsers size={12} className="text-[#C9A84C]" />
                            <span className="text-[#8B92A5] text-xs">Up to {room.maxOccupancy} guests</span>
                          </div>
                        )}
                        {room.view && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#0F1420] rounded-lg">
                            {getViewIcon(room.view)}
                            <span className="text-[#8B92A5] text-xs">{room.view} view</span>
                          </div>
                        )}
                      </div>
                      
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.amenities.slice(0, 4).map((amenity, idx) => (
                            <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-[#0F1420] rounded-lg">
                              {getAmenityIcon(amenity)}
                              <span className="text-[#8B92A5] text-xs">{amenity}</span>
                            </div>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="text-[#8B92A5] text-xs px-2 py-1">+{room.amenities.length - 4} more</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewDetails(room)}
                          className="px-4 sm:px-6 py-2 border border-[#C9A84C]/40 rounded-lg sm:rounded-xl text-[#C9A84C] text-sm font-semibold hover:bg-[#C9A84C]/10 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleBookRoom(room)}
                          disabled={room.availableRooms < 1}
                          className={`flex-1 px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                            room.availableRooms > 0
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
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1C2438] rounded-xl sm:rounded-2xl border border-[#252E44] p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">🛏️</div>
            <h3 className="text-[#F5F0E8] text-lg sm:text-xl font-semibold mb-2">No rooms found</h3>
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

export default UserRooms;