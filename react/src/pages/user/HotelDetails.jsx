import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getHotelById } from '../../features/hotels/hotelSlice';
import {
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiDollarSign,
  FiWifi,
  FiCoffee,
  FiUsers,
  FiWind,
  FiDroplet,
  FiCalendar,
  FiInfo,
  FiPhone,
  FiMail,
  FiGlobe,
  FiKey,
  FiHeart,
  FiShare2,
  FiCheck,
  FiClock,
  FiAward,
  FiTruck,
  FiSun,
  FiLoader,
  FiHome,
  FiCompass,
  FiShield,
  FiZap
} from 'react-icons/fi';

const HotelDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedHotel, loading, hotels } = useSelector((state) => state.hotels);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const hotel = useMemo(() => {
    if (location.state?.hotel) return location.state.hotel;
    if (selectedHotel && selectedHotel._id === id) return selectedHotel;
    if (hotels && hotels.length > 0 && id) {
      return hotels.find(h => h._id === id);
    }
    return null;
  }, [location.state, selectedHotel, hotels, id]);

  if (!hotel && !loading) {
    dispatch(getHotelById(id));
  }

  const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <FiWifi size={16} className="text-[#C9A84C]" />;
    if (lowerAmenity.includes('breakfast') || lowerAmenity.includes('coffee')) return <FiCoffee size={16} className="text-[#C9A84C]" />;
    if (lowerAmenity.includes('parking')) return <FiTruck size={16} className="text-[#C9A84C]" />;
    if (lowerAmenity.includes('pool')) return <FiDroplet size={16} className="text-[#C9A84C]" />;
    if (lowerAmenity.includes('ac') || lowerAmenity.includes('air')) return <FiWind size={16} className="text-[#C9A84C]" />;
    if (lowerAmenity.includes('spa')) return <FiSun size={16} className="text-[#C9A84C]" />;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return <FiZap size={16} className="text-[#C9A84C]" />;
    return <FiUsers size={16} className="text-[#C9A84C]" />;
  };

  const handleViewRooms = () => {
    if (!hotel) return;
    navigate('/user-dashboard/rooms', { 
      state: { 
        hotelId: hotel._id, 
        hotelName: hotel.name 
      } 
    });
  };

  if (loading && !hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <FiLoader className="animate-spin text-[#C9A84C]" size={48} />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
            <FiHome className="text-5xl mx-auto mb-4 text-gray-300" />
            <h3 className="text-gray-800 text-xl font-semibold mb-2">Hotel not found</h3>
            <p className="text-gray-500 text-sm mb-5">The hotel you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/user-dashboard/hotels')}
              className="px-6 py-2.5 bg-[#C9A84C] rounded-xl text-white text-sm font-semibold hover:bg-[#B8922E] transition-colors"
            >
              Back to Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = hotel.roomsAvailable > 0;
  const images = hotel.images || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-5">
          {/* Back Button */}
          <button
            onClick={() => navigate('/user-dashboard/hotels')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#C9A84C] transition-colors group"
          >
            <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Hotels</span>
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{hotel.name}</h1>
                  <button 
                    onClick={() => setLiked(!liked)}
                    className="p-1.5 rounded-full bg-gray-50 hover:bg-[#C9A84C]/10 transition-colors"
                  >
                    <FiHeart size={16} className={liked ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-400'} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <FiMapPin size={14} className="text-gray-400" />
                    <p className="text-gray-500">{hotel.city}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#C9A84C]/10 rounded-lg">
                    <FiStar size={12} className="text-[#C9A84C] fill-[#C9A84C]" />
                    <span className="text-[#C9A84C] font-semibold text-sm">{hotel.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isAvailable ? `${hotel.roomsAvailable} rooms available` : 'Sold Out'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Price per night</p>
                <p className="text-2xl font-bold text-[#C9A84C]">${hotel.price}</p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={images[selectedImage]?.url || 'https://via.placeholder.com/800x400?text=Hotel+Image'}
                  alt={hotel.name}
                  className="w-full h-56 sm:h-64 md:h-80 object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#C9A84C]' : 'border-gray-200 hover:border-[#C9A84C]/50'
                      }`}
                    >
                      <img src={img.url} alt={`${hotel.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Quick Info Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiInfo className="text-[#C9A84C]" size={14} />
                  Quick Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FiPhone className="text-[#C9A84C]" size={14} />
                    <span className="text-gray-500 text-sm">{hotel.phone || '+1 234 567 890'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FiMail className="text-[#C9A84C]" size={14} />
                    <span className="text-gray-500 text-sm truncate">{hotel.email || 'info@hotel.com'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FiGlobe className="text-[#C9A84C]" size={14} />
                    <span className="text-gray-500 text-sm truncate">{hotel.website || 'www.hotel.com'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-3 border-t border-gray-100">
                    <FiClock className="text-[#C9A84C]" size={14} />
                    <span className="text-gray-500 text-sm">Check-in: 2:00 PM • Check-out: 12:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Special Offer Card */}
              <div className="bg-linear-to-br from-[#FEF8E7] to-white rounded-xl border border-[#C9A84C]/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="text-[#C9A84C]" size={16} />
                  <h3 className="text-sm font-bold text-gray-800">Special Offer</h3>
                </div>
                <p className="text-gray-500 text-sm">Book now and get 10% off on your first stay!</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FiCompass className="text-[#C9A84C]" size={16} />
                About This Hotel
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {showFullDescription ? hotel.description : `${hotel.description.slice(0, 200)}...`}
                {hotel.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-[#C9A84C] ml-1 hover:underline text-sm"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiShield className="text-[#C9A84C]" size={16} />
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hotel.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FiMapPin className="text-[#C9A84C]" size={16} />
                Location
              </h2>
            </div>
            <div className="bg-gray-50 h-48 flex items-center justify-center">
              <div className="text-center px-4">
                <FiMapPin size={32} className="text-[#C9A84C] mx-auto mb-2" />
                <p className="text-gray-800 font-semibold text-sm">{hotel.name}</p>
                <p className="text-gray-500 text-sm mt-1">{hotel.city}, {hotel.address}</p>
              </div>
            </div>
          </div>

          {/* Book Button */}
          <div className="bg-linear-to-r from-[#FEF8E7] to-transparent rounded-xl p-5 border border-[#C9A84C]/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base font-bold text-gray-800">Book Your Stay</h2>
                <p className="text-gray-500 text-sm">Explore available rooms and special rates</p>
              </div>
              <button
                onClick={handleViewRooms}
                disabled={!isAvailable}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  isAvailable
                    ? 'bg-[#C9A84C] text-white hover:bg-[#B8922E] transform hover:scale-[1.02] shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FiKey size={16} />
                View Available Rooms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;