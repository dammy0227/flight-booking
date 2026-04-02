import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHotels,
  getHotelStats,
  deleteHotel,
  createHotel,
  updateHotel,
  clearError,
} from "../features/hotels/hotelSlice";
import {
  FiEdit, FiTrash2, FiPlus, FiX,
  FiMapPin, FiStar, FiHome, FiImage, FiUpload,
  FiHeart, FiShare2, FiClock,
  FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight,
  FiGrid, FiMap, FiCheck,
} from "react-icons/fi";


import PageHeader from "../component/common/PageHeader";
import AddButton from "../component/common/AddButton";
import SearchBar from "../component/common/SearchBar";
import FilterBar from "../component/common/FilterBar";
import SortDropdown from "../component/common/SortDropdown";
import StatCard from "../component/common/StatCard";
import LoadingSpinner from "../component/common/LoadingSpinner";
import ErrorDisplay from "../component/common/ErrorDisplay";
import DeleteConfirmModal from "../component/common/DeleteConfirmModal";

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.url || img.secure_url || null;
};

const ImageSlider = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const urls = useMemo(
    () => (images || []).map(getImageUrl).filter(Boolean),
    [images]
  );

  if (urls.length === 0) {
    return (
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <FiImage className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative h-48 group">
      <img
        src={urls[idx]}
        alt="Hotel"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
        }}
      />
      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((p) => (p - 1 + urls.length) % urls.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((p) => (p + 1) % urls.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {urls.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === idx ? "bg-white" : "bg-gray-400 bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const HotelCard = ({ hotel, selectedHotels, onToggleSelect, onEdit, onDelete }) => {
  const id = hotel._id || hotel.id;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group/card">
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={selectedHotels?.includes(id) || false}
          onChange={() => onToggleSelect(id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
        />
      </div>

      <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <button className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100">
          <FiHeart className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <button className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100">
          <FiShare2 className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      <ImageSlider images={hotel.images} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {hotel.name || "Unnamed Hotel"}
          </h3>
          <div className="flex items-center space-x-1">
            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {hotel.rating ?? 0}
            </span>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-gray-600">
            <FiMapPin className="w-4 h-4 mr-2 shrink-0" />
            <span className="text-sm">{hotel.city || "—"}</span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">
            {hotel.address || ""}
          </p>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {hotel.description || ""}
        </p>

        {(hotel.amenities?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hotel.amenities.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
              >
                {a}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-sm text-gray-500">From </span>
            <span className="text-xl font-bold text-gray-900">
              ${hotel.price ?? 0}
            </span>
            <span className="text-xs text-gray-500">/night</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiHome className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {hotel.roomsAvailable ?? hotel.availableRooms ?? 0} rooms
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100">
          <button
            onClick={() => onEdit(hotel)}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Edit hotel"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete hotel"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AMENITY_OPTIONS = [
  "WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar",
  "Room Service", "Parking", "Airport Shuttle", "Pet Friendly",
  "Family Rooms", "Non-smoking Rooms", "Business Center", "Meeting Rooms",
];

const EMPTY_FORM = {
  name: "", city: "", address: "", description: "",
  rating: "", amenities: [], price: "", roomsAvailable: "",
};

const Hotels = () => {
  const dispatch = useDispatch();
  const { hotels, groupedHotels, stats, loading, error } = useSelector(
    (state) => state.hotels
  );

  const [search,      setSearch]      = useState("");
  const [filterBy,    setFilterBy]    = useState("all");
  const [filterCity,  setFilterCity]  = useState("all");
  const [sortBy,      setSortBy]      = useState("name");
  const [viewMode,    setViewMode]    = useState("grid");
  const [showNewOnly, setShowNewOnly] = useState(false);

  const [selectedHotels, setSelectedHotels] = useState([]);
  const [expandedCities, setExpandedCities] = useState({});
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingHotel,   setEditingHotel]   = useState(null);
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [selectedFiles,  setSelectedFiles]  = useState([]);
  const [imagePreviews,  setImagePreviews]  = useState([]);
  const [formData,       setFormData]       = useState(EMPTY_FORM);

  const buildQueryParams = useCallback(() => {
    const params = {};

    if (search)               params.search     = search;
    if (filterCity !== "all") params.city       = filterCity;
    if (showNewOnly)          params.dateFilter = "new";

    if (filterBy === "highRating")     { params.minRating = 4; }
    else if (filterBy === "midRating") { params.minRating = 3; params.maxRating = 4; }
    else if (filterBy === "lowRating") { params.maxRating = 3; }

    const sortMap = {
      name:   { sortBy: "name",      sortOrder: "asc"  },
      rating: { sortBy: "rating",    sortOrder: "desc" },
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      oldest: { sortBy: "createdAt", sortOrder: "asc"  },
    };
    if (sortMap[sortBy]) {
      params.sortBy    = sortMap[sortBy].sortBy;
      params.sortOrder = sortMap[sortBy].sortOrder;
    }

    if (viewMode === "grid") params.groupBy = "city";

    return params;
  }, [search, filterCity, filterBy, sortBy, viewMode, showNewOnly]);

  useEffect(() => {
    dispatch(getHotels(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    dispatch(getHotelStats());
    return () => dispatch(clearError());
  }, [dispatch]);

  const refreshAll = useCallback(() => {
    dispatch(getHotels(buildQueryParams()));
    dispatch(getHotelStats());
  }, [dispatch, buildQueryParams]);

  const cityList = useMemo(() => {
    if (groupedHotels?.length > 0)
      return groupedHotels.map((g) => g.city).filter(Boolean);
    return [...new Set((hotels || []).map((h) => h.city).filter(Boolean))];
  }, [hotels, groupedHotels]);

  const allFlatHotels = useMemo(() => {
    if (hotels?.length > 0) return hotels;
    if (groupedHotels?.length > 0)
      return groupedHotels.flatMap((g) => g.hotels || []);
    return [];
  }, [hotels, groupedHotels]);

  const handleDelete = (id) => setDeleteConfirm(id);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);
    dispatch(deleteHotel(id)).then(() => {
      setSelectedHotels((prev) => prev.filter((hId) => hId !== id));
      refreshAll();
    });
  };

  const handleBulkDelete = () => {
    if (!selectedHotels.length) return;
    if (!window.confirm(`Delete ${selectedHotels.length} hotel(s)?`)) return;
    Promise.all(selectedHotels.map((id) => dispatch(deleteHotel(id)))).then(
      () => { setSelectedHotels([]); refreshAll(); }
    );
  };

  const toggleSelectHotel = (id) =>
    setSelectedHotels((prev) =>
      prev.includes(id) ? prev.filter((hId) => hId !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelectedHotels(
      selectedHotels.length === allFlatHotels.length
        ? []
        : allFlatHotels.map((h) => h._id || h.id).filter(Boolean)
    );

  const toggleCityExpand = (city) =>
    setExpandedCities((prev) => ({ ...prev, [city]: !prev[city] }));

  const handleCreate = () => {
    setEditingHotel(null);
    setFormData(EMPTY_FORM);
    setSelectedFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name:           hotel.name           || "",
      city:           hotel.city           || "",
      address:        hotel.address        || "",
      description:    hotel.description    || "",
      rating:         hotel.rating         ?? "",
      amenities:      hotel.amenities      || [],
      price:          hotel.price          ?? "",
      roomsAvailable: hotel.roomsAvailable ?? hotel.availableRooms ?? "",
    });
    setImagePreviews(
      (hotel.images || []).map(getImageUrl).filter(Boolean)
    );
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev)  => prev.filter((_, i) => i !== index));
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
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, key === "amenities" ? JSON.stringify(val) : val);
    });
    selectedFiles.forEach((file) => data.append("images", file));

    try {
      if (editingHotel) {
        await dispatch(
          updateHotel({ id: editingHotel._id || editingHotel.id, formData: data })
        ).unwrap();
      } else {
        await dispatch(createHotel(data)).unwrap();
      }
      closeModal();
      refreshAll();
    } catch (err) {
      console.error("Error saving hotel:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <PageHeader
          title="Hotels"
          subtitle="Manage your hotel inventory and properties"
          actionButton={
            <AddButton onClick={handleCreate} label="Add New Hotel" />
          }
        />

        <div className="mb-8">
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search hotels by name, city, or address…"
              />

              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="all">All Cities</option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <SortDropdown
                  options={[
                    { value: "name", label: "Sort by: Name" },
                    { value: "rating", label: "Sort by: Rating" },
                    { value: "newest", label: "Sort by: Newest" },
                    { value: "oldest", label: "Sort by: Oldest" },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />

                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 flex items-center text-sm ${
                      viewMode === "grid"
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FiGrid className="w-4 h-4 mr-1" /> Grid
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`px-3 py-2 flex items-center text-sm ${
                      viewMode === "map"
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FiMap className="w-4 h-4 mr-1" /> Map
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterBar
                options={[
                  { value: "all", label: "All Hotels" },
                  { value: "highRating", label: "High Rating (4+ ⭐)" },
                  { value: "midRating", label: "Medium Rating (3-4 ⭐)" },
                  { value: "lowRating", label: "Low Rating (below 3 ⭐)" },
                ]}
                value={filterBy}
                onChange={setFilterBy}
              />
              <button
                onClick={() => setShowNewOnly((v) => !v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showNewOnly
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                New This Week
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Hotels"
            value={stats?.totalHotels ?? 0}
            icon={<FiHome className="w-5 h-5 text-orange-600" />}
            bgColor="bg-orange-100"
          />
          <StatCard
            label="Average Rating"
            value={stats?.avgRating != null ? `${stats.avgRating} ⭐` : "0 ⭐"}
            icon={<FiStar className="w-5 h-5 text-yellow-600" />}
            bgColor="bg-yellow-100"
          />
          <StatCard
            label="Cities Covered"
            value={stats?.totalCities ?? 0}
            icon={<FiMapPin className="w-5 h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="High Rated"
            value={stats?.highRated ?? 0}
            icon={<FiStar className="w-5 h-5 text-purple-600" />}
            bgColor="bg-purple-100"
          />
          <StatCard
            label="New This Week"
            value={stats?.newThisWeek ?? 0}
            icon={<FiClock className="w-5 h-5 text-teal-600" />}
            bgColor="bg-teal-100"
          />
        </div>

        {selectedHotels.length > 0 && (
          <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <div
                  className={`w-5 h-5 border-2 rounded mr-2 flex items-center justify-center ${
                    selectedHotels.length === allFlatHotels.length
                      ? "bg-orange-600 border-orange-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedHotels.length === allFlatHotels.length && (
                    <FiCheck className="w-3 h-3 text-white" />
                  )}
                </div>
                Select All
              </button>
              <span className="text-sm text-gray-600">
                {selectedHotels.length} hotel{selectedHotels.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedHotels([])}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner message="Loading hotels…" />}

        {error && !loading && (
          <ErrorDisplay error={error} onRetry={refreshAll} />
        )}

        {!loading && !error && allFlatHotels.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <FiHome className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hotels found
            </h3>
            <p className="mt-1 text-gray-500">
              {search
                ? "Try adjusting your search"
                : "Get started by adding a new hotel"}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <FiPlus className="w-4 h-4 mr-2" /> Add Your First Hotel
              </button>
            )}
          </div>
        )}

        {!loading && !error && viewMode === "grid" && groupedHotels?.length > 0 && (
          <div className="space-y-8">
            {groupedHotels.map((group) => {
              const key        = group.city || "unknown";
              const isExpanded = expandedCities[key] !== false;
              const hotelList  = group.hotels || [];

              return (
                <div
                  key={key}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div
                    className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleCityExpand(key)}
                  >
                    <div className="flex items-center space-x-3">
                      <FiMapPin className="w-5 h-5 text-orange-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        {group.city || "Unknown City"}
                      </h2>
                      <span className="text-sm text-gray-500">
                        ({hotelList.length} hotel{hotelList.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    {isExpanded
                      ? <FiChevronUp   className="w-5 h-5 text-gray-500" />
                      : <FiChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </div>

                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hotelList.map((hotel) => (
                          <HotelCard
                            key={hotel._id || hotel.id}
                            hotel={hotel}
                            selectedHotels={selectedHotels}
                            onToggleSelect={toggleSelectHotel}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && viewMode === "grid" &&
          groupedHotels?.length === 0 && allFlatHotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFlatHotels.map((hotel) => (
              <HotelCard
                key={hotel._id || hotel.id}
                hotel={hotel}
                selectedHotels={selectedHotels}
                onToggleSelect={toggleSelectHotel}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {!loading && !error && viewMode === "map" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FiMap className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Map View Coming Soon
            </h3>
            <p className="mt-1 text-gray-500">
              We're working on integrating an interactive map for hotels
            </p>
          </div>
        )}

        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Delete Hotel"
          message="Are you sure you want to delete this hotel? This action cannot be undone."
        />

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-2 sm:my-8">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingHotel ? "Edit Hotel" : "Add New Hotel"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Hotel Name", field: "name" },
                    { label: "City",       field: "city" },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Price per Night ($)", field: "price",          min: 0 },
                    { label: "Rooms Available",     field: "roomsAvailable", min: 0 },
                    { label: "Rating (0-5)",        field: "rating",         min: 0, max: 5, step: 0.1 },
                  ].map(({ label, field, ...rest }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="number"
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        required
                        {...rest}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="hotel-images"
                    />
                    <label
                      htmlFor="hotel-images"
                      className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <FiUpload className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Choose Images</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AMENITY_OPTIONS.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Previews
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
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

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    {editingHotel ? "Update Hotel" : "Create Hotel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Hotels;