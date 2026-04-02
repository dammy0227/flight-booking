import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getRooms,
  getRoomStats,
  getRoomsGrouped,
  deleteRoom,
  createRoom,
  updateRoom,
  clearError,
} from "../features/rooms/roomSlice";
import { getHotels } from "../features/hotels/hotelSlice";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiHome,
  FiDollarSign,
  FiHash,
  FiEye,
  FiArrowLeft,
  FiGrid,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiXCircle,
  FiUpload,
  FiImage,
} from "react-icons/fi";

import PageHeader from "../component/common/PageHeader";
import AddButton from "../component/common/AddButton";
import SearchBar from "../component/common/SearchBar";
import FilterBar from "../component/common/FilterBar";
import SortDropdown from "../component/common/SortDropdown";
import StatCard from "../component/common/StatCard";
import StatusBadge from "../component/common/StatusBadge";
import LoadingSpinner from "../component/common/LoadingSpinner";
import ErrorDisplay from "../component/common/ErrorDisplay";
import DeleteConfirmModal from "../component/common/DeleteConfirmModal";

const AMENITY_OPTIONS = [
  "WiFi", "TV", "AC", "Mini Bar", "Safe", "Coffee Maker",
  "Ocean View", "City View", "Balcony", "Kitchen", "Jacuzzi",
];

const BED_TYPE_OPTIONS = ["Single", "Double", "Queen", "King", "Twin"];

const getAvailabilityBadge = (available) => {
  if (available === 0) {
    return <StatusBadge status="full" customConfig={{
      icon: FiXCircle,
      text: "Full",
      bg: "bg-red-100",
      textColor: "text-red-700"
    }} />;
  }
  if (available < 5) {
    return <StatusBadge status="lowStock" customConfig={{
      icon: FiXCircle,
      text: "Low Stock",
      bg: "bg-yellow-100",
      textColor: "text-yellow-700"
    }} />;
  }
  return <StatusBadge status="available" />;
};

// Image Slider Component
const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const imageUrls = useMemo(() => {
    if (!images || images.length === 0) return [];
    return images.map(img => img.url || img).filter(Boolean);
  }, [images]);

  if (imageUrls.length === 0) {
    return (
      <div className="h-48 bg-gray-100 flex items-center justify-center rounded-t-xl">
        <FiImage className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative h-48 group">
      <img
        src={imageUrls[currentIndex]}
        alt="Room"
        className="w-full h-full object-cover rounded-t-xl"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
        }}
      />
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiChevronDown className="w-4 h-4 -rotate-90" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {imageUrls.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-white" : "bg-gray-400 bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Rooms = () => {
  const dispatch = useDispatch();
  const { rooms, groupedRooms, stats, loading, error } = useSelector(
    (state) => state.rooms
  );
  const { hotels } = useSelector((state) => state.hotels);

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price-low");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [expandedHotels, setExpandedHotels] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Image upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    hotelId: "",
    roomType: "",
    price: "",
    availableRooms: "",
    amenities: [],
    description: "",
    bedType: "Double",
    maxOccupancy: 2,
    roomNumber: "",
    floor: "",
    view: "",
  });

  const buildQueryParams = useCallback(() => {
    const params = {};

    if (search) params.search = search;
    if (hotelFilter !== "all") params.hotel = hotelFilter;
    if (availabilityFilter !== "all") params.availability = availabilityFilter;

    if (sortBy === "price-low") params.sort = "price-low";
    if (sortBy === "price-high") params.sort = "price-high";
    if (sortBy === "available") params.sort = "available";
    if (sortBy === "newest") params.sort = "newest";

    if (filterBy === "budget") { params.minPrice = 0; params.maxPrice = 99; }
    if (filterBy === "standard") { params.minPrice = 100; params.maxPrice = 199; }
    if (filterBy === "luxury") { params.minPrice = 200; }

    return params;
  }, [search, hotelFilter, availabilityFilter, sortBy, filterBy]);

  useEffect(() => {
    dispatch(getRooms(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    dispatch(getRoomStats());
    dispatch(getRoomsGrouped());
    dispatch(getHotels());
    return () => dispatch(clearError());
  }, [dispatch]);

  const refreshAll = useCallback(() => {
    dispatch(getRooms(buildQueryParams()));
    dispatch(getRoomStats());
    dispatch(getRoomsGrouped());
  }, [dispatch, buildQueryParams]);

  const groupedDisplay = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    const groups = {};
    rooms.forEach((room) => {
      const hotelName = room.hotelId?.name || "Unknown Hotel";
      const hotelCity = room.hotelId?.city || "Unknown City";
      const hotelId = room.hotelId?._id || room.hotelId || hotelName;

      if (!groups[hotelId]) {
        groups[hotelId] = { hotelName, hotelCity, rooms: [], count: 0 };
      }
      groups[hotelId].rooms.push(room);
      groups[hotelId].count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [rooms]);

  const hotelOptions = useMemo(() => {
    if (!Array.isArray(groupedRooms)) return [];
    return groupedRooms.map((g) => ({
      id: g.rooms?.[0]?.hotelId?._id || g.hotelName,
      name: g.hotelName,
    }));
  }, [groupedRooms]);

  const handleDelete = (id) => setDeleteConfirm(id);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch(deleteRoom(deleteConfirm)).then(refreshAll);
    setDeleteConfirm(null);
  };

  const handleViewDetails = (room) => {
    setViewingRoom(room);
    setIsViewModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      hotelId: room.hotelId?._id || room.hotelId || "",
      roomType: room.roomType || "",
      price: room.price || "",
      availableRooms: room.availableRooms || "",
      amenities: room.amenities || [],
      description: room.description || "",
      bedType: room.bedType || "Double",
      maxOccupancy: room.maxOccupancy || 2,
      roomNumber: room.roomNumber || "",
      floor: room.floor || "",
      view: room.view || "",
    });
    
    // Set existing images as previews
    if (room.images && room.images.length > 0) {
      setImagePreviews(room.images.map(img => img.url || img).filter(Boolean));
    } else {
      setImagePreviews([]);
    }
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setFormData({
      hotelId: "",
      roomType: "",
      price: "",
      availableRooms: "",
      amenities: [],
      description: "",
      bedType: "Double",
      maxOccupancy: 2,
      roomNumber: "",
      floor: "",
      view: "",
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity) =>
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    submitData.append("hotelId", formData.hotelId);
    submitData.append("roomType", formData.roomType);
    submitData.append("price", Number(formData.price));
    submitData.append("availableRooms", Number(formData.availableRooms));
    submitData.append("amenities", JSON.stringify(formData.amenities));
    submitData.append("description", formData.description || "");
    submitData.append("bedType", formData.bedType);
    submitData.append("maxOccupancy", Number(formData.maxOccupancy));
    if (formData.roomNumber) submitData.append("roomNumber", formData.roomNumber);
    if (formData.floor) submitData.append("floor", Number(formData.floor));
    if (formData.view) submitData.append("view", formData.view);
    
    // Append new images
    selectedFiles.forEach((file) => submitData.append("images", file));

    try {
      if (editingRoom) {
        await dispatch(updateRoom({ id: editingRoom._id, data: submitData })).unwrap();
      } else {
        await dispatch(createRoom(submitData)).unwrap();
      }
      
      refreshAll();
      setIsModalOpen(false);
      setSelectedFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const toggleHotelExpand = (key) =>
    setExpandedHotels((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <PageHeader
          title="Rooms"
          subtitle="Manage room inventory across all hotels"
          actionButton={
            <AddButton onClick={handleCreate} label="Add New Room" />
          }
        />

        <div className="mb-8">
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search rooms by type, hotel, or city…"
              />

              <div className="flex flex-wrap gap-2">
                <select
                  value={hotelFilter}
                  onChange={(e) => setHotelFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="all">All Hotels</option>
                  {hotelOptions.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>

                <SortDropdown
                  options={[
                    { value: "price-low", label: "Price: Low to High" },
                    { value: "price-high", label: "Price: High to Low" },
                    { value: "available", label: "Availability" },
                    { value: "newest", label: "Newest First" },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterBar
                options={[
                  { value: "all", label: "All Rooms" },
                  { value: "budget", label: "Budget (Under $100)" },
                  { value: "standard", label: "Standard ($100–$199)" },
                  { value: "luxury", label: "Luxury ($200+)" },
                ]}
                value={filterBy}
                onChange={setFilterBy}
              />
              <button
                onClick={() =>
                  setAvailabilityFilter((v) => (v === "available" ? "all" : "available"))
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  availabilityFilter === "available"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Available Now
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Rooms"
            value={stats?.totalRooms ?? 0}
            icon={<FiGrid className="w-5 h-5 text-orange-600" />}
            bgColor="bg-orange-100"
          />
          <StatCard
            label="Available Now"
            value={stats?.totalAvailable ?? 0}
            icon={<FiHome className="w-5 h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="Average Price"
            value={`$${stats?.avgPrice ?? 0}`}
            icon={<FiDollarSign className="w-5 h-5 text-blue-600" />}
            bgColor="bg-blue-100"
          />
          <StatCard
            label="Room Types"
            value={stats?.roomTypes ?? 0}
            icon={<FiHash className="w-5 h-5 text-purple-600" />}
            bgColor="bg-purple-100"
          />
        </div>

        {loading && <LoadingSpinner message="Loading rooms…" />}

        {error && !loading && (
          <ErrorDisplay error={error} onRetry={refreshAll} />
        )}

        {!loading && !error && (
          <>
            {groupedDisplay.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <FiGrid className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No rooms found
                </h3>
                <p className="mt-1 text-gray-500">
                  {search
                    ? "Try adjusting your search"
                    : "Get started by adding a new room"}
                </p>
                {!search && (
                  <button
                    onClick={handleCreate}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <FiPlus className="w-4 h-4 mr-2" /> Add Your First Room
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {groupedDisplay.map((group) => {
                  const key = group.hotelName;
                  const isExpanded = expandedHotels[key] !== false;

                  return (
                    <div
                      key={key}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div
                        className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleHotelExpand(key)}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <FiHome className="w-5 h-5 text-orange-600 shrink-0" />
                          <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                              {group.hotelName}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                              <FiMapPin className="w-3 h-3 mr-1 shrink-0" />
                              <span className="truncate">{group.hotelCity}</span>
                            </p>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            ({group.count})
                          </span>
                        </div>
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {group.rooms.map((room) => (
                              <div
                                key={room._id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                              >
                                <ImageSlider images={room.images || []} />
                                
                                <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded-full inline-block">
                                        {room.roomType}
                                      </span>
                                      <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900 truncate">
                                        {room.roomType} Room
                                      </h3>
                                      {room.bedType && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Bed: {room.bedType}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex space-x-1 ml-2 shrink-0">
                                      <button
                                        onClick={() => handleViewDetails(room)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View details"
                                      >
                                        <FiEye className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleEdit(room)}
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Edit room"
                                      >
                                        <FiEdit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(room._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete room"
                                      >
                                        <FiTrash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 sm:p-6 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                      Price per night
                                    </span>
                                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                      ${room.price}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                      Available rooms
                                    </span>
                                    <div className="flex flex-col items-end gap-1">
                                      <span
                                        className={`text-base sm:text-lg font-semibold ${
                                          room.availableRooms < 5
                                            ? "text-orange-600"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {room.availableRooms}
                                      </span>
                                      {getAvailabilityBadge(room.availableRooms)}
                                    </div>
                                  </div>

                                  {room.maxOccupancy && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-500">
                                        Max Occupancy
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">
                                        {room.maxOccupancy} guests
                                      </span>
                                    </div>
                                  )}

                                  {room.amenities?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-2">
                                      {room.amenities.slice(0, 3).map((a, i) => (
                                        <span
                                          key={i}
                                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                                        >
                                          {a}
                                        </span>
                                      ))}
                                      {room.amenities.length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
                                          +{room.amenities.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-3">
                                    <span className="text-xs text-gray-400">
                                      Added:{" "}
                                      {new Date(room.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                      onClick={() => handleViewDetails(room)}
                                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                    >
                                      <FiEye className="w-4 h-4 mr-1" /> Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Delete Room"
          message="Are you sure you want to delete this room? This action cannot be undone."
        />

        {/* View Modal - Mobile Responsive */}
        {isViewModalOpen && viewingRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8 flex items-start sm:items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-4 sm:my-8">
                <ImageSlider images={viewingRoom.images || []} />
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Room Details
                    </h2>
                    <button
                      onClick={() => { setIsViewModalOpen(false); setViewingRoom(null); }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium mb-1">Hotel</p>
                    <p className="text-base sm:text-xl font-semibold text-gray-900">
                      {viewingRoom.hotelId?.name || "Unknown Hotel"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                      <FiMapPin className="w-3 h-3 mr-1" />
                      {viewingRoom.hotelId?.city || "Unknown City"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Room Type</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {viewingRoom.roomType}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Price per Night</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        ${viewingRoom.price}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Available Rooms</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {viewingRoom.availableRooms}
                        </p>
                        {getAvailabilityBadge(viewingRoom.availableRooms)}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Bed Type</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {viewingRoom.bedType || "Standard"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Max Occupancy</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {viewingRoom.maxOccupancy || 2} guests
                      </p>
                    </div>
                    {viewingRoom.view && (
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">View</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {viewingRoom.view}
                        </p>
                      </div>
                    )}
                  </div>

                  {viewingRoom.description && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-sm sm:text-base text-gray-700">{viewingRoom.description}</p>
                    </div>
                  )}

                  {viewingRoom.amenities?.length > 0 && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingRoom.amenities.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400">Created</p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {new Date(viewingRoom.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {new Date(viewingRoom.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => { setIsViewModalOpen(false); setViewingRoom(null); }}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <FiArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>
                    <button
                      onClick={() => { setIsViewModalOpen(false); handleEdit(viewingRoom); }}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FiEdit className="w-4 h-4 mr-2" /> Edit Room
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal - Fully Mobile Responsive */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8 flex items-start sm:items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-4 sm:my-8">
                {/* Modal Header - Sticky with responsive padding */}
                <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 z-10">
                  <div className="flex items-center justify-between p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {editingRoom ? "Edit Room" : "Add New Room"}
                    </h2>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedFiles([]);
                        setImagePreviews([]);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body - Scrollable with responsive padding */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Hotel *
                    </label>
                    <select
                      value={formData.hotelId}
                      onChange={(e) =>
                        setFormData({ ...formData, hotelId: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-sm"
                      required
                    >
                      <option value="">Choose a hotel…</option>
                      {hotels.map((hotel) => (
                        <option key={hotel._id} value={hotel._id}>
                          {hotel.name} — {hotel.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type *
                      </label>
                      <select
                        value={formData.roomType}
                        onChange={(e) =>
                          setFormData({ ...formData, roomType: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-sm"
                        required
                      >
                        <option value="">Select room type…</option>
                        {["Single", "Double", "Twin", "Suite", "Deluxe", "Family", "Executive", "Presidential"].map(
                          (t) => (
                            <option key={t} value={t}>
                              {t} Room
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bed Type
                      </label>
                      <select
                        value={formData.bedType}
                        onChange={(e) =>
                          setFormData({ ...formData, bedType: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-sm"
                      >
                        {BED_TYPE_OPTIONS.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Night ($) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="e.g., 150"
                        required
                        min="0"
                        step="1"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Rooms *
                      </label>
                      <input
                        type="number"
                        value={formData.availableRooms}
                        onChange={(e) =>
                          setFormData({ ...formData, availableRooms: e.target.value })
                        }
                        placeholder="e.g., 10"
                        required
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Occupancy
                      </label>
                      <input
                        type="number"
                        value={formData.maxOccupancy}
                        onChange={(e) =>
                          setFormData({ ...formData, maxOccupancy: e.target.value })
                        }
                        min="1"
                        max="10"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={formData.roomNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, roomNumber: e.target.value })
                        }
                        placeholder="e.g., 101, 202A"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor
                      </label>
                      <input
                        type="number"
                        value={formData.floor}
                        onChange={(e) =>
                          setFormData({ ...formData, floor: e.target.value })
                        }
                        placeholder="e.g., 1"
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      View
                    </label>
                    <input
                      type="text"
                      value={formData.view}
                      onChange={(e) =>
                        setFormData({ ...formData, view: e.target.value })
                      }
                      placeholder="e.g., Ocean View, City View, Garden View"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Describe the room features, size, special amenities..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AMENITY_OPTIONS.map((amenity) => (
                        <label key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="room-images"
                    />
                    <label
                      htmlFor="room-images"
                      className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <FiUpload className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Choose Images</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      You can select multiple images. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Previews
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>

                {/* Modal Footer - Sticky with responsive padding */}
                <div className="sticky bottom-0 bg-white rounded-b-xl border-t border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedFiles([]);
                        setImagePreviews([]);
                      }}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      {editingRoom ? "Update Room" : "Create Room"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;