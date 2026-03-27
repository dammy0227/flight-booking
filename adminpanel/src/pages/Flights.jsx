import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFlights,
  getFlightStats,
  deleteFlight,
  createFlight,
  updateFlight,
  clearError,
} from "../features/flights/flightSlice";
import {
  FiEdit,
  FiTrash2,
  FiFilter,
  FiX,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiAirplay,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

// Import reusable components
import PageHeader from "../component/common/PageHeader";
import AddButton from "../component/common/AddButton";
import SearchBar from "../component/common/SearchBar";
import FilterBar from "../component/common/FilterBar";
import SortDropdown from "../component/common/SortDropdown";
import StatCard from "../component/common/StatCard";
import LoadingSpinner from "../component/common/LoadingSpinner";
import ErrorDisplay from "../component/common/ErrorDisplay";
import DeleteConfirmModal from "../component/common/DeleteConfirmModal";

const formatDateKey = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return formatDateKey(dateString);
};

const isToday = (dateString) => {
  const date = new Date(dateString);
  return date.toDateString() === new Date().toDateString();
};

const isTomorrow = (dateString) => {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupFlightsByDate = (flightsList) => {
  const groups = {};
  flightsList.forEach((flight) => {
    if (!flight.departureTime) return;
    const dateKey = formatDateKey(flight.departureTime);
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: flight.departureTime,
        displayDate: formatDateShort(flight.departureTime),
        flights: [],
      };
    }
    groups[dateKey].flights.push(flight);
  });
  return Object.values(groups).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

const Flights = () => {
  const dispatch = useDispatch();
  const { flights, stats, loading, error } = useSelector(
    (state) => state.flights
  );

  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedDates, setExpandedDates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    flightNumber: "",
    airline: "",
    departureCity: "",
    arrivalCity: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    availableSeats: "",
  });

  const buildQueryParams = useCallback(() => {
    const params = {};

    if (search) params.search = search;
    if (dateFilter !== "all") params.dateFilter = dateFilter;
    if (filterBy === "lowPrice") params.maxPrice = 300;
    if (filterBy === "available") params.minSeats = 20;

    params.sortBy = "departureTime";
    params.sortOrder = "asc";

    return params;
  }, [search, dateFilter, filterBy]);

  useEffect(() => {
    const params = buildQueryParams();
    dispatch(getFlights(params));
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    dispatch(getFlightStats());
    return () => dispatch(clearError());
  }, [dispatch]);

  const groupedFlights = groupFlightsByDate(
    Array.isArray(flights) ? flights : []
  );

  const handleDelete = (id) => setDeleteConfirm(id);

  const confirmDelete = () => {
    if (deleteConfirm) {
      dispatch(deleteFlight(deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setFormData({
      flightNumber: flight.flightNumber || "",
      airline: flight.airline || "",
      departureCity: flight.departureCity || "",
      arrivalCity: flight.arrivalCity || "",
      departureTime: flight.departureTime?.slice(0, 16) || "",
      arrivalTime: flight.arrivalTime?.slice(0, 16) || "",
      price: flight.price || "",
      availableSeats: flight.availableSeats || "",
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingFlight(null);
    setFormData({
      flightNumber: "",
      airline: "",
      departureCity: "",
      arrivalCity: "",
      departureTime: "",
      arrivalTime: "",
      price: "",
      availableSeats: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: Number(formData.price),
      availableSeats: Number(formData.availableSeats),
    };

    if (editingFlight) {
      await dispatch(updateFlight({ id: editingFlight._id, data: submitData }));
    } else {
      await dispatch(createFlight(submitData));
    }

    dispatch(getFlights(buildQueryParams()));
    dispatch(getFlightStats());
    setIsModalOpen(false);
  };

  const toggleDateExpand = (dateKey) =>
    setExpandedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header with Add Button */}
        <PageHeader
          title="Flights"
          subtitle="Manage your flight inventory and schedules"
          actionButton={
            <AddButton onClick={handleCreate} label="Add New Flight" />
          }
        />

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by number, airline, or route…"
            />

            <div className="flex flex-wrap gap-2">
              <FilterBar
                options={[
                  { value: "all", label: "All" },
                  { value: "today", label: "Today" },
                  { value: "tomorrow", label: "Tomorrow" },
                  { value: "week", label: "Next 7 Days" },
                ]}
                value={dateFilter}
                onChange={setDateFilter}
              />
            </div>

            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400 w-5 h-5" />
              <SortDropdown
                options={[
                  { value: "all", label: "All Flights" },
                  { value: "lowPrice", label: "Under $300" },
                  { value: "available", label: "20+ Seats Available" },
                ]}
                value={filterBy}
                onChange={setFilterBy}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Flights"
            value={stats.totalFlights}
            icon={<FiAirplay className="w-5 h-5 text-orange-600" />}
            bgColor="bg-orange-100"
          />
          <StatCard
            label="Today"
            value={stats.todayFlights}
            icon={<FiCalendar className="w-5 h-5 text-blue-600" />}
            bgColor="bg-blue-100"
          />
          <StatCard
            label="Tomorrow"
            value={stats.tomorrowFlights}
            icon={<FiCalendar className="w-5 h-5 text-purple-600" />}
            bgColor="bg-purple-100"
          />
          <StatCard
            label="This Week"
            value={stats.weekFlights}
            icon={<FiCalendar className="w-5 h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="Avg. Price"
            value={`$${stats.avgPrice}`}
            icon={<FiDollarSign className="w-5 h-5 text-yellow-600" />}
            bgColor="bg-yellow-100"
          />
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner message="Loading flights…" />}

        {/* Error State */}
        {error && !loading && (
          <ErrorDisplay 
            error={error} 
            onRetry={() => dispatch(getFlights(buildQueryParams()))} 
          />
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {groupedFlights.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <FiAirplay className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No flights found
                </h3>
                <p className="mt-1 text-gray-500">
                  {search
                    ? "Try adjusting your search"
                    : "Get started by adding a new flight"}
                </p>
                {!search && (
                  <button
                    onClick={handleCreate}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <FiAirplay className="w-4 h-4 mr-2" />
                    Add Your First Flight
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {groupedFlights.map((group, groupIndex) => {
                  const isExpanded = expandedDates[group.date] !== false;
                  const todayGroup = isToday(group.date);
                  const tomorrowGroup = isTomorrow(group.date);

                  return (
                    <div
                      key={groupIndex}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div
                        className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleDateExpand(group.date)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              todayGroup
                                ? "bg-green-500"
                                : tomorrowGroup
                                ? "bg-blue-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <h2 className="text-lg font-semibold text-gray-900">
                            {group.displayDate}
                          </h2>
                          <span className="text-sm text-gray-500">
                            ({group.flights.length} flight
                            {group.flights.length !== 1 ? "s" : ""})
                          </span>
                          {(todayGroup || tomorrowGroup) && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                todayGroup
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {todayGroup ? "Today" : "Tomorrow"}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {group.flights.map((flight) => {
                              const seats = flight.availableSeats || 0;
                              return (
                                <div
                                  key={flight._id}
                                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                >
                                  <div className="p-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                            {flight.flightNumber || "N/A"}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {flight.airline || "N/A"}
                                          </span>
                                        </div>
                                        <h3 className="mt-3 text-lg font-semibold text-gray-900">
                                          {flight.departureCity} →{" "}
                                          {flight.arrivalCity}
                                        </h3>
                                      </div>
                                      <div className="flex space-x-1">
                                        <button
                                          onClick={() => handleEdit(flight)}
                                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                          title="Edit flight"
                                        >
                                          <FiEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDelete(flight._id)
                                          }
                                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Delete flight"
                                        >
                                          <FiTrash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FiClock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                          Departure
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {formatDateTime(flight.departureTime)}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FiClock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                          Arrival
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {formatDateTime(flight.arrivalTime)}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                      <div>
                                        <span className="text-2xl font-bold text-gray-900">
                                          ${flight.price || 0}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">
                                          /person
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <FiUsers className="w-4 h-4 text-gray-400" />
                                        <span
                                          className={`text-sm font-medium ${
                                            seats < 10
                                              ? "text-orange-600"
                                              : "text-green-600"
                                          }`}
                                        >
                                          {seats} seats left
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Delete Flight"
          message="Are you sure you want to delete this flight? This action cannot be undone."
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingFlight ? "Edit Flight" : "Add New Flight"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Flight Number",
                      field: "flightNumber",
                      type: "text",
                    },
                    { label: "Airline", field: "airline", type: "text" },
                    {
                      label: "From",
                      field: "departureCity",
                      type: "text",
                    },
                    { label: "To", field: "arrivalCity", type: "text" },
                    {
                      label: "Departure Time",
                      field: "departureTime",
                      type: "datetime-local",
                    },
                    {
                      label: "Arrival Time",
                      field: "arrivalTime",
                      type: "datetime-local",
                    },
                    {
                      label: "Price ($)",
                      field: "price",
                      type: "number",
                      min: 0,
                    },
                    {
                      label: "Seats Available",
                      field: "availableSeats",
                      type: "number",
                      min: 0,
                    },
                  ].map(({ label, field, type, min }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        min={min}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    {editingFlight ? "Update Flight" : "Create Flight"}
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

export default Flights;