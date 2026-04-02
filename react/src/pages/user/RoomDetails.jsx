import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getRoomById } from '../../features/rooms/roomSlice';
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiEye,
  FiInfo,
  FiWifi,
  FiCoffee,
  FiWind,
  FiDroplet,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiCheck,
  FiX,
  FiStar,
  FiHeart,
  FiMaximize2,
  FiLoader,
  FiHome,
  FiClock,
  FiShield,
  FiZap,
  FiKey,
  FiSquare
} from 'react-icons/fi';

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedRoom, loading, rooms } = useSelector((state) => state.rooms);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const room = useMemo(() => {
    if (location.state?.room) return location.state.room;
    if (selectedRoom && selectedRoom._id === id) return selectedRoom;
    if (rooms && rooms.length > 0 && id) {
      return rooms.find(r => r._id === id);
    }
    return null;
  }, [location.state, selectedRoom, rooms, id]);

  if (!room && !loading) {
    dispatch(getRoomById(id));
  }

  const handleBookRoom = () => {
    if (!room) return;
    
    navigate('/booking', {
      state: {
        type: 'room',
        referenceId: room._id,
        price: room.price,
        quantity: selectedQuantity,
        totalPrice: room.price * selectedQuantity,
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

  const nextImage = () => {
    if (room?.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room?.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    return image?.url || null;
  };

  const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <FiWifi size={16} />;
    if (lowerAmenity.includes('breakfast')) return <FiCoffee size={16} />;
    if (lowerAmenity.includes('ac') || lowerAmenity.includes('air conditioning')) return <FiWind size={16} />;
    if (lowerAmenity.includes('pool')) return <FiDroplet size={16} />;
    if (lowerAmenity.includes('spa')) return <FiZap size={16} />;
    if (lowerAmenity.includes('gym')) return <FiShield size={16} />;
    return <FiInfo size={16} />;
  };

  if (loading && !room) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <FiLoader className="animate-spin text-[#C9A84C]" size={48} />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-[#1C2438] rounded-2xl border border-[#252E44] p-8 sm:p-12 text-center">
        <FiSquare className="text-6xl mx-auto mb-4 text-[#8B92A5]" />
        <h3 className="text-[#F5F0E8] text-xl font-semibold mb-2">Room not found</h3>
        <p className="text-[#8B92A5] text-sm mb-4">The room you're looking for doesn't exist</p>
        <button
          onClick={() => navigate('/user-dashboard/rooms')}
          className="px-6 py-2.5 bg-[#C9A84C] rounded-xl text-[#0A0E1A] text-sm font-semibold hover:bg-[#E8C97A] transition-colors"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  const isLowAvailability = room.availableRooms < 5;
  const images = room.images?.map(img => getImageUrl(img)).filter(url => url) || [];
  const hasImages = images.length > 0;
  const defaultImage = 'https://via.placeholder.com/600x400?text=Room+Image';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          <button
            onClick={() => navigate('/user-dashboard/rooms')}
            className="group flex items-center gap-2 text-[#8B92A5] hover:text-[#C9A84C] transition-all duration-300"
          >
            <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Rooms</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#1C2438] rounded-2xl overflow-hidden border border-[#252E44] shadow-xl">
                <div className="relative">
                  {hasImages ? (
                    <>
                      <div className="relative group">
                        <img 
                          src={images[currentImageIndex] || defaultImage} 
                          alt={`${room.roomType} - Image ${currentImageIndex + 1}`}
                          className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() => setIsImageModalOpen(true)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="absolute bottom-4 right-4 px-3 py-2 bg-black/70 hover:bg-black/90 rounded-lg text-white text-sm flex items-center gap-2 transition-all"
                          >
                            <FiMaximize2 size={14} />
                            View Full Screen
                          </button>
                        </div>
                      </div>
                      
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all hover:scale-110"
                          >
                            <FiChevronLeft size={24} className="text-white" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all hover:scale-110"
                          >
                            <FiChevronRight size={24} className="text-white" />
                          </button>
                        </>
                      )}
                      
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                        <span className="text-white text-xs font-semibold">
                          {currentImageIndex + 1} / {images.length}
                        </span>
                      </div>
                      
                      <div className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm flex items-center gap-1 ${
                        isLowAvailability && room.availableRooms > 0
                          ? 'bg-amber-500/90 text-[#0A0E1A]' 
                          : room.availableRooms > 0
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}>
                        <FiKey size={10} />
                        {room.availableRooms > 0 
                          ? `${room.availableRooms} ${room.availableRooms === 1 ? 'room' : 'rooms'} available`
                          : 'Sold Out'}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-64 sm:h-80 md:h-96 bg-linear-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 flex flex-col items-center justify-center">
                      <FiHome className="text-6xl text-[#C9A84C]" />
                      <p className="text-[#8B92A5] mt-2">No images available</p>
                    </div>
                  )}
                </div>
                
                {hasImages && images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx 
                            ? 'border-[#C9A84C] shadow-lg shadow-[#C9A84C]/20' 
                            : 'border-[#252E44] hover:border-[#C9A84C]/50'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-linear-to-br from-[#1C2438] to-[#141B2B] rounded-2xl border border-[#252E44] p-5 sm:p-6 shadow-xl sticky top-6">
                <div className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#F5F0E8] mb-2">{room.roomType}</h1>
                  <div className="flex items-center gap-2 text-[#8B92A5]">
                    <FiMapPin size={14} />
                    <p className="text-xs sm:text-sm">
                      {room.hotelId?.name || room.hotelName}, {room.hotelId?.city || room.hotelCity}
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-[#0F1420] rounded-xl border border-[#252E44]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8B92A5] text-sm">Price per night</span>
                    <div className="flex items-center gap-1">
                      <FiStar className="text-[#C9A84C] fill-[#C9A84C]" size={14} />
                      <span className="text-[#F5F0E8] text-sm font-semibold">4.8</span>
                      <span className="text-[#8B92A5] text-xs">(128 reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-[#E8C97A]">${room.price}</span>
                    <span className="text-[#8B92A5] text-sm">/ night</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {room.bedType && (
                    <div className="flex items-center gap-2 p-2 bg-[#0F1420] rounded-lg">
                      <FiSquare className="text-[#C9A84C]" size={18} />
                      <div>
                        <p className="text-[#8B92A5] text-xs">Bed Type</p>
                        <p className="text-[#F5F0E8] text-sm font-medium">{room.bedType}</p>
                      </div>
                    </div>
                  )}
                  {room.maxOccupancy && (
                    <div className="flex items-center gap-2 p-2 bg-[#0F1420] rounded-lg">
                      <FiUsers size={18} className="text-[#C9A84C]" />
                      <div>
                        <p className="text-[#8B92A5] text-xs">Max Guests</p>
                        <p className="text-[#F5F0E8] text-sm font-medium">{room.maxOccupancy}</p>
                      </div>
                    </div>
                  )}
                  {room.view && (
                    <div className="flex items-center gap-2 p-2 bg-[#0F1420] rounded-lg">
                      <FiEye size={18} className="text-[#C9A84C]" />
                      <div>
                        <p className="text-[#8B92A5] text-xs">View</p>
                        <p className="text-[#F5F0E8] text-sm font-medium">{room.view}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-2 bg-[#0F1420] rounded-lg">
                    <FiClock size={18} className="text-[#C9A84C]" />
                    <div>
                      <p className="text-[#8B92A5] text-xs">Check-in</p>
                      <p className="text-[#F5F0E8] text-sm font-medium">2:00 PM</p>
                    </div>
                  </div>
                </div>

                {room.availableRooms > 0 && (
                  <div className="mb-6">
                    <label className="block text-[#8B92A5] text-sm mb-2">Number of Rooms</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                        disabled={selectedQuantity <= 1}
                        className="w-10 h-10 rounded-lg bg-[#0F1420] border border-[#252E44] text-[#F5F0E8] hover:bg-[#1C2438] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-semibold text-[#F5F0E8] min-w-10 text-center">
                        {selectedQuantity}
                      </span>
                      <button
                        onClick={() => setSelectedQuantity(Math.min(room.availableRooms, selectedQuantity + 1))}
                        disabled={selectedQuantity >= room.availableRooms}
                        className="w-10 h-10 rounded-lg bg-[#0F1420] border border-[#252E44] text-[#F5F0E8] hover:bg-[#1C2438] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                      <span className="text-[#8B92A5] text-sm ml-auto">
                        {room.availableRooms} available
                      </span>
                    </div>
                  </div>
                )}

                {room.availableRooms > 0 && (
                  <div className="mb-6 p-4 bg-[#0F1420] rounded-xl border border-[#252E44]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8B92A5] text-sm">Total for {selectedQuantity} night{selectedQuantity > 1 ? 's' : ''}</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#E8C97A]">${(room.price * selectedQuantity).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookRoom}
                  disabled={room.availableRooms < 1}
                  className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 ${
                    room.availableRooms > 0
                      ? 'bg-linear-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0E1A] hover:shadow-lg hover:shadow-[#C9A84C]/25 transform hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-[#252E44] text-[#8B92A5] cursor-not-allowed'
                  }`}
                >
                  {room.availableRooms > 0 ? `Book Now - $${(room.price * selectedQuantity).toFixed(2)}` : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {room.description && (
              <div className="bg-linear-to-br from-[#1C2438] to-[#141B2B] rounded-2xl border border-[#252E44] p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8] mb-4 flex items-center gap-2">
                  <FiInfo size={20} className="text-[#C9A84C]" />
                  Description
                </h2>
                <div className="p-4 bg-[#0F1420] rounded-xl">
                  <p className="text-[#8B92A5] text-sm leading-relaxed">{room.description}</p>
                </div>
              </div>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div className="bg-linear-to-br from-[#1C2438] to-[#141B2B] rounded-2xl border border-[#252E44] p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#F5F0E8] mb-4 flex items-center gap-2">
                  <FiCheck size={20} className="text-[#C9A84C]" />
                  Amenities
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-[#0F1420] rounded-xl hover:bg-[#1C2438] transition-colors group">
                      <div className="text-[#C9A84C] group-hover:scale-110 transition-transform">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-[#F5F0E8] text-xs sm:text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isImageModalOpen && hasImages && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-[#C9A84C] transition-colors"
            >
              <FiX size={28} />
            </button>
            <img 
              src={images[currentImageIndex]} 
              alt="Full screen view"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all"
                >
                  <FiChevronLeft size={28} className="text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all"
                >
                  <FiChevronRight size={28} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;