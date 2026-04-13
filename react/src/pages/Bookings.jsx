import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBookings,
  getBookingStats,
  deleteBooking,
  updateBookingStatus,
  clearError,
} from "../features/bookings/bookingSlice";
import {
  FiEdit,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMail,
  FiClock,
  FiEye,
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { FaPlane, FaHotel } from "react-icons/fa";

import PageHeader from "../component/common/PageHeader";
import SearchBar from "../component/common/SearchBar";
import FilterBar from "../component/common/FilterBar";
import SortDropdown from "../component/common/SortDropdown";
import StatCard from "../component/common/StatCard";
import StatusBadge from "../component/common/StatusBadge";
import LoadingSpinner from "../component/common/LoadingSpinner";
import ErrorDisplay from "../component/common/ErrorDisplay";
import DeleteConfirmModal from "../component/common/DeleteConfirmModal";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getPaymentBadge = (status) => {
  if (status === "paid") {
    return <StatusBadge status="paid" />;
  }
  return (
    <StatusBadge
      status="pending"
      customConfig={{
        icon: FiXCircle,
        text: "Unpaid",
        bg: "bg-red-100",
        textColor: "text-red-700",
      }}
    />
  );
};

const getTypeIcon = (type) =>
  type === "flight" ? (
    <FaPlane className="w-4 h-4 text-blue-600" />
  ) : (
    <FaHotel className="w-4 h-4 text-orange-600" />
  );

const getReferenceName = (booking) => {
  if (!booking.reference) return "N/A";
  if (booking.type === "flight") {
    return (
      `${booking.reference.airline || ""} ${booking.reference.flightNumber || ""}`.trim() ||
      "Flight"
    );
  }
  return booking.reference.name || "Hotel";
};

const Bookings = () => {
  const dispatch = useDispatch();
  const { bookings, stats, loading, error } = useSelector((state) => state.bookings);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "" });

  const buildQueryParams = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (typeFilter !== "all") params.type = typeFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (dateFilter !== "all") params.dateFilter = dateFilter;
    params.sortBy = sortBy;
    return params;
  }, [search, typeFilter, statusFilter, dateFilter, sortBy]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(getBookings(buildQueryParams())),
        dispatch(getBookingStats())
      ]);
    };
    fetchData();
  }, [dispatch, buildQueryParams]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const refresh = useCallback(() => {
    // Refresh both bookings and stats
    Promise.all([
      dispatch(getBookings(buildQueryParams())),
      dispatch(getBookingStats())
    ]);
  }, [dispatch, buildQueryParams]);

  const handleDelete = (id) => setDeleteConfirm(id);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch(deleteBooking(deleteConfirm)).then(() => {
      refresh();
    });
    setDeleteConfirm(null);
  };

  const handleViewDetails = (booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleEditStatus = (booking) => {
    setEditingBooking(booking);
    setStatusForm({ status: booking.status || "pending" });
    setIsEditModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    await dispatch(
      updateBookingStatus({ id: editingBooking._id, data: { status: statusForm.status } })
    );
    refresh();
    setIsEditModalOpen(false);
    setEditingBooking(null);
  };

  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-0">
        <PageHeader title="Bookings" subtitle="Manage all flight and hotel bookings" />

        <div className="mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by user name, email, or booking ID…"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  } border border-gray-200`}
                  title="Table View"
                >
                  <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  } border border-gray-200`}
                  title="Grid View"
                >
                  <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="all">All Types</option>
                <option value="flight">✈️ Flights</option>
                <option value="hotel">🏨 Hotels</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="pending">⏳ Pending</option>
                <option value="cancelled">✗ Cancelled</option>
              </select>

              <SortDropdown
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "highest", label: "Highest Price" },
                  { value: "lowest", label: "Lowest Price" },
                ]}
                value={sortBy}
                onChange={setSortBy}
              />
            </div>

            <FilterBar
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
              ]}
              value={dateFilter}
              onChange={setDateFilter}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Total Bookings"
            value={stats?.totalBookings ?? 0}
            icon={<FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
            bgColor="bg-orange-100"
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={<FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="Flight / Hotel"
            value={`${stats?.flightBookings ?? 0} / ${stats?.hotelBookings ?? 0}`}
            icon={
              (stats?.flightBookings ?? 0) >= (stats?.hotelBookings ?? 0) ? (
                <FaPlane className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              ) : (
                <FaHotel className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              )
            }
            bgColor="bg-blue-100"
          />
          <StatCard
            label="Pending"
            value={stats?.pendingBookings ?? 0}
            icon={<FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />}
            bgColor="bg-yellow-100"
          />
        </div>

        {loading && <LoadingSpinner message="Loading bookings…" />}

        {error && !loading && <ErrorDisplay error={error} onRetry={refresh} />}

        {!loading && !error && (
          <>
            {bookingsArray.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-gray-200">
                <FiCalendar className="mx-auto w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                  No bookings found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try adjusting your search filters"
                    : "No bookings have been made yet"}
                </p>
              </div>
            ) : viewMode === "table" ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {[
                          "Type",
                          "Customer",
                          "Item",
                          "Date",
                          "Qty",
                          "Total",
                          "Status",
                          "Payment",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookingsArray.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getTypeIcon(booking.type)}
                              <span className="ml-2 text-sm text-gray-600 capitalize">
                                {booking.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {booking.userId?.name || "N/A"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {booking.userId?.email || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {getReferenceName(booking)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {booking.referenceId?.slice(-6) || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatDate(booking.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{booking.quantity}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(booking.totalPrice)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {getPaymentBadge(booking.paymentStatus)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-1 sm:space-x-2">
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleEditStatus(booking)}
                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Update status"
                              >
                                <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(booking._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete booking"
                              >
                                <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View for Table Mode */}
                <div className="sm:hidden space-y-3 p-3">
                  {bookingsArray.map((booking) => (
                    <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(booking.type)}
                          <span className="text-sm font-semibold text-gray-900 capitalize">
                            {booking.type} Booking
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="p-1.5 text-gray-400 hover:text-blue-600"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStatus(booking)}
                            className="p-1.5 text-gray-400 hover:text-orange-600"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.userId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {booking.userId?.email || "N/A"}
                        </p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {getReferenceName(booking)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {booking.referenceId?.slice(-6) || "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-xs text-gray-700">{formatDate(booking.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="text-sm font-semibold text-gray-900">{booking.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm font-semibold text-orange-600">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <StatusBadge status={booking.status} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Payment</span>
                          {getPaymentBadge(booking.paymentStatus)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {bookingsArray.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(booking.type)}
                          <span className="text-sm font-semibold text-gray-900 capitalize">
                            {booking.type} Booking
                          </span>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <FiUser className="w-4 h-4 mr-2 shrink-0" />
                          <span className="font-medium truncate">
                            {booking.userId?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiMail className="w-4 h-4 mr-2 shrink-0" />
                          <span className="truncate">{booking.userId?.email || "N/A"}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {getReferenceName(booking)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {booking.referenceId?.slice(-6) || "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="font-semibold text-gray-900">{booking.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-semibold text-orange-600">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment</p>
                          <div className="mt-1">{getPaymentBadge(booking.paymentStatus)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-xs text-gray-600">{formatDate(booking.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                        >
                          <FiEye className="w-4 h-4 mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleEditStatus(booking)}
                          className="flex-1 px-3 py-2 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center"
                        >
                          <FiEdit className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Delete Booking"
          message="Are you sure you want to delete this booking? This action cannot be undone."
        />

        {isViewModalOpen && viewingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 mx-3 sm:mx-4">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Booking Details
                </h2>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingBooking(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={viewingBooking.status} />
                    {getPaymentBadge(viewingBooking.paymentStatus)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(viewingBooking.type)}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {viewingBooking.type} Booking
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium mb-2">
                    Customer Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-900 wrap-break-words">
                        {viewingBooking.userId?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiMail className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-900 break-all">
                        {viewingBooking.userId?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                    <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">
                      {viewingBooking._id}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Reference ID</p>
                    <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">
                      {viewingBooking.referenceId}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Item Details</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 wrap-break-words">
                    {getReferenceName(viewingBooking)}
                  </p>
                  {viewingBooking.reference && (
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      {viewingBooking.type === "flight" ? (
                        <>
                          <p>
                            {viewingBooking.reference.departureCity} →{" "}
                            {viewingBooking.reference.arrivalCity}
                          </p>
                          <p>{viewingBooking.reference.airline}</p>
                        </>
                      ) : (
                        <>
                          <p>{viewingBooking.reference.address}</p>
                          <p>{viewingBooking.reference.city}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {viewingBooking.quantity}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total Price</p>
                    <p className="text-xl sm:text-2xl font-semibold text-orange-600">
                      {formatCurrency(viewingBooking.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="text-sm text-gray-700 wrap-break-words">{formatDate(viewingBooking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm text-gray-700 wrap-break-words">
                      {formatDate(viewingBooking.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setViewingBooking(null);
                    }}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center order-2 sm:order-1"
                  >
                    <FiArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEditStatus(viewingBooking);
                    }}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center order-1 sm:order-2"
                  >
                    <FiEdit className="w-4 h-4 mr-2" /> Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && editingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-3 sm:mx-4">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Update Booking Status
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingBooking(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <div className="mb-4">
                    <StatusBadge status={editingBooking.status} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <div className="space-y-2">
                    {["pending", "confirmed", "cancelled"].map((s) => (
                      <label
                        key={s}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={s}
                          checked={statusForm.status === s}
                          onChange={(e) => setStatusForm({ status: e.target.value })}
                          className="w-4 h-4 text-orange-600 shrink-0"
                        />
                        <span className="ml-3 text-sm text-gray-700 capitalize flex-1">{s}</span>
                        <span className="ml-auto">
                          {s === "confirmed" && <FiCheckCircle className="w-5 h-5 text-green-600" />}
                          {s === "pending" && <FiClock className="w-5 h-5 text-yellow-600" />}
                          {s === "cancelled" && <FiXCircle className="w-5 h-5 text-red-600" />}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingBooking(null);
                    }}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors order-1 sm:order-2"
                  >
                    Update Status
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

export default Bookings;