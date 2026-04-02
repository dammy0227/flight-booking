import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getHotels, searchHotels } from '../../features/hotels/hotelSlice';
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiDollarSign,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSliders,
  FiWifi,
  FiCoffee,
  FiUsers,
  FiWind,
  FiDroplet,
  FiClock,
  FiCheckCircle,
  FiHome,
  FiAward,
  FiSun,
  FiMoon,
  FiKey,
  FiShield,
  FiZap,
  FiCompass,
  FiGlobe,
  FiLoader
} from 'react-icons/fi';

const UserHotels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, loading } = useSelector((state) => state.hotels);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500,
    minRating: 0,
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  useEffect(() => {
    dispatch(getHotels());
  }, [dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchHotels({ search: searchQuery }));
    } else {
      dispatch(getHotels());
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      minPrice: 0,
      maxPrice: 500,
      minRating: 0,
      sortBy: 'rating',
      sortOrder: 'desc'
    });
    dispatch(getHotels());
  };

  const handleViewDetails = (hotel) => {
    navigate(`/user-dashboard/hotels/${hotel._id}`, { 
      state: { hotel: hotel }
    });
  };

  const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <FiWifi size={14} />;
    if (lowerAmenity.includes('breakfast') || lowerAmenity.includes('coffee')) return <FiCoffee size={14} />;
    if (lowerAmenity.includes('parking')) return <FiMapPin size={14} />;
    if (lowerAmenity.includes('pool')) return <FiDroplet size={14} />;
    if (lowerAmenity.includes('ac') || lowerAmenity.includes('air')) return <FiWind size={14} />;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return <FiZap size={14} />;
    if (lowerAmenity.includes('spa')) return <FiSun size={14} />;
    if (lowerAmenity.includes('bar') || lowerAmenity.includes('restaurant')) return <FiCoffee size={14} />;
    return <FiUsers size={14} />;
  };

  const sortHotels = (hotelsList) => {
    return [...hotelsList].sort((a, b) => {
      let aVal, bVal;
      switch (filters.sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
          return filters.sortOrder === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
      }
      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const filteredHotels = hotels?.filter(hotel => {
    if (filters.minPrice > 0 && hotel.price < filters.minPrice) return false;
    if (filters.maxPrice < 500 && hotel.price > filters.maxPrice) return false;
    if (filters.minRating > 0 && (hotel.rating || 0) < filters.minRating) return false;
    if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !hotel.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedHotels = sortHotels(filteredHotels || []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F0E8] flex items-center gap-3">
            <FiHome className="text-[#C9A84C]" size={32} />
            Luxury Hotels
          </h1>
          <p className="text-[#8B92A5] text-sm mt-1">Find and book the best hotels for your stay</p>
        </div>

        <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9A84C]" size={18} />
              <input
                type="text"
                placeholder="Search hotels by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#8B92A5]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#C9A84C] rounded-xl text-[#0A0E1A] font-semibold hover:bg-[#E8C97A] transition-colors flex items-center gap-2"
            >
              <FiSearch size={16} />
              Search
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F1420] rounded-xl text-[#8B92A5] hover:text-[#C9A84C] transition-colors"
            >
              <FiSliders size={16} />
              <span className="text-sm">Filters</span>
              {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>
            <div className="flex gap-3">
              {(searchQuery || filters.minPrice > 0 || filters.maxPrice < 500 || filters.minRating > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-[#252E44] rounded-xl text-[#8B92A5] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-colors flex items-center gap-2"
                >
                  <FiX size={16} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-[#252E44]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <label className="text-[#8B92A5] text-sm mb-2 block">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  >
                    <option value={0}>Any rating</option>
                    <option value={3}>3+ stars</option>
                    <option value={4}>4+ stars</option>
                    <option value={4.5}>4.5+ stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8B92A5] text-sm mb-2 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  >
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8B92A5] text-sm mb-2 block">Sort Order</label>
                  <button
                    onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className="w-full px-4 py-2 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm flex items-center justify-between hover:border-[#C9A84C] transition-colors"
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
          <p className="text-[#8B92A5] text-sm flex items-center gap-2">
            <FiGlobe size={14} />
            Found <span className="text-[#C9A84C] font-semibold">{sortedHotels.length}</span> hotels
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#1C2438] rounded-2xl border border-[#252E44] overflow-hidden animate-pulse">
                <div className="h-48 bg-[#252E44] flex items-center justify-center">
                  <FiLoader className="text-[#C9A84C] animate-spin" size={32} />
                </div>
                <div className="p-4">
                  <div className="h-5 bg-[#252E44] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#252E44] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHotels.map((hotel) => (
              <div key={hotel._id} className="group bg-[#1C2438] rounded-2xl border border-[#252E44] overflow-hidden hover:border-[#C9A84C]/50 transition-all hover:shadow-xl">
                <div className="relative h-48 overflow-hidden">
                  {hotel.images?.[0]?.url ? (
                    <img 
                      src={hotel.images[0].url} 
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 flex items-center justify-center">
                      <FiHome className="text-[#C9A84C] text-6xl" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <FiDollarSign size={14} className="text-[#0A0E1A]" />
                      <span className="text-[#0A0E1A] font-bold text-sm">${hotel.price?.toFixed(0)}</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A0E1A]/80 backdrop-blur-sm rounded-lg border border-[#C9A84C]/30">
                    <div className="flex items-center gap-1">
                      <FiStar size={12} className="text-[#C9A84C] fill-[#C9A84C]" />
                      <span className="text-[#F5F0E8] text-xs font-semibold">{hotel.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  
                  <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    hotel.roomsAvailable > 0 
                      ? 'bg-[#10B981]/90 text-[#0A0E1A]' 
                      : 'bg-[#EF4444]/90 text-white'
                  }`}>
                    <FiKey size={10} />
                    {hotel.roomsAvailable > 0 ? `${hotel.roomsAvailable} rooms left` : 'Sold Out'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-[#F5F0E8] font-bold text-lg mb-1 truncate">{hotel.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <FiMapPin size={12} className="text-[#8B92A5]" />
                    <p className="text-[#8B92A5] text-xs truncate">{hotel.city}, {hotel.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <FiClock size={12} className="text-[#C9A84C]" />
                      <span className="text-[#8B92A5] text-xs">Check-in: 2:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiShield size={12} className="text-[#10B981]" />
                      <span className="text-[#8B92A5] text-xs">Free cancellation</span>
                    </div>
                  </div>
                  
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-[#0F1420] rounded-lg">
                          {getAmenityIcon(amenity)}
                          <span className="text-[#8B92A5] text-xs truncate max-w-20">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleViewDetails(hotel)}
                    className="w-full mt-2 px-4 py-2.5 bg-[#C9A84C] rounded-xl text-[#0A0E1A] font-semibold hover:bg-[#E8C97A] transition-colors flex items-center justify-center gap-2 group"
                  >
                    <FiCompass size={16} />
                    View Details
                    <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-12 text-center">
            <div className="flex justify-center mb-4">
              <FiGlobe className="text-6xl text-[#8B92A5]" />
            </div>
            <h3 className="text-[#F5F0E8] text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <FiCompass size={20} />
              No hotels found
            </h3>
            <p className="text-[#8B92A5] text-sm mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#C9A84C] rounded-xl text-[#0A0E1A] text-sm font-semibold hover:bg-[#E8C97A] transition-colors flex items-center gap-2 mx-auto"
            >
              <FiX size={16} />
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHotels;