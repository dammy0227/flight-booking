import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPayments,
  deletePayment,
  updatePaymentStatus,
  clearError,
} from "../features/payments/paymentSlice";
import {
  FiEdit,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMail,
  FiEye,
  FiArrowLeft,
  FiCreditCard,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,  
  FiXCircle,      
  FiClock,       
} from "react-icons/fi";
import { FaStripe, FaPaypal, FaCcVisa } from "react-icons/fa";

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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const getPaymentMethodIcon = (method) => {
  switch (method) {
    case "stripe":  return <FaStripe     className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />;
    case "paypal":  return <FaPaypal     className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600"   />;
    case "card":    return <FaCcVisa     className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />;
    default:        return <FiCreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600"   />;
  }
};

const groupPaymentsByMonth = (list) => {
  const groups = {};
  list.forEach((payment) => {
    const key = new Date(payment.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long",
    });
    if (!groups[key]) {
      groups[key] = { month: key, date: payment.createdAt, payments: [], total: 0, count: 0 };
    }
    groups[key].payments.push(payment);
    groups[key].total += payment.amount || 0;
    groups[key].count++;
  });
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
};

const PaymentCard = ({ payment, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getPaymentMethodIcon(payment.paymentMethod)}
          <span className="text-sm font-medium text-gray-900 capitalize">
            {payment.paymentMethod}
          </span>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-lg font-bold text-gray-900">
            ${payment.amount?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Customer</span>
          <span className="text-sm text-gray-900 truncate max-w-37.5">
            {payment.bookingId?.userId?.name || "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Transaction ID</span>
          <span className="text-xs font-mono text-gray-500">
            {payment.transactionId?.slice(-8) || "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Date</span>
          <span className="text-xs text-gray-600">
            {formatDate(payment.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-1 pt-2 border-t border-gray-100">
        <button
          onClick={() => onView(payment)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View details"
        >
          <FiEye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(payment)}
          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Update status"
        >
          <FiEdit className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(payment._id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete payment"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector((state) => state.payments);

  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [methodFilter, setMethodFilter]   = useState("all");
  const [dateFilter, setDateFilter]       = useState("all");
  const [sortBy, setSortBy]               = useState("newest");
  const [expandedMonths, setExpandedMonths] = useState({});

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment]   = useState(null);
  const [editingPayment, setEditingPayment]   = useState(null);
  const [deleteConfirm, setDeleteConfirm]     = useState(null);
  const [statusForm, setStatusForm]           = useState({ status: "" });

  const buildQueryParams = useCallback(() => {
    const params = {};
    if (search)                   params.search     = search;
    if (statusFilter !== "all")   params.status     = statusFilter;
    if (methodFilter !== "all")   params.method     = methodFilter;
    if (dateFilter   !== "all")   params.dateFilter = dateFilter;
    params.sortBy = sortBy;
    return params;
  }, [search, statusFilter, methodFilter, dateFilter, sortBy]);

  useEffect(() => {
    dispatch(getPayments(buildQueryParams()));
  }, [dispatch, buildQueryParams]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const refresh = useCallback(
    () => dispatch(getPayments(buildQueryParams())),
    [dispatch, buildQueryParams]
  );

  const groupedPayments = useMemo(
    () => groupPaymentsByMonth(Array.isArray(payments) ? payments : []),
    [payments]
  );

  const paymentsArr     = Array.isArray(payments) ? payments : [];
  const totalPayments   = paymentsArr.length;
  const totalRevenue    = paymentsArr.reduce((acc, p) => acc + (p.amount || 0), 0);
  const paidPayments    = paymentsArr.filter((p) => p.status === "paid").length;
  const pendingPayments = paymentsArr.filter((p) => p.status === "pending").length;
  const failedPayments  = paymentsArr.filter((p) => p.status === "failed").length;

  const handleDelete = (id) => setDeleteConfirm(id);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch(deletePayment(deleteConfirm)).then(refresh);
    setDeleteConfirm(null);
  };

  const handleViewDetails = (payment) => {
    setViewingPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleEditStatus = (payment) => {
    setEditingPayment(payment);
    setStatusForm({ status: payment.status || "pending" });
    setIsEditModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    await dispatch(updatePaymentStatus({ id: editingPayment._id, data: { status: statusForm.status } }));
    refresh();
    setIsEditModalOpen(false);
    setEditingPayment(null);
  };

  const toggleMonthExpand = (key) =>
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        <PageHeader
          title="Payments"
          subtitle="Track and manage all payment transactions"
        />

        <div className="mb-6 sm:mb-8">
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by customer, email, booking ID, or transaction ID…"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="all">All Methods</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="card">Card</option>
                </select>

                <SortDropdown
                  options={[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "highest", label: "Highest Amount" },
                    { value: "lowest", label: "Lowest Amount" },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Total Payments"
            value={totalPayments}
            icon={<FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
            bgColor="bg-orange-100"
          />
          <StatCard
            label="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="Paid"
            value={paidPayments}
            icon={<FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            bgColor="bg-green-100"
          />
          <StatCard
            label="Pending"
            value={pendingPayments}
            icon={<FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />}
            bgColor="bg-yellow-100"
          />
          <StatCard
            label="Failed"
            value={failedPayments}
            icon={<FiXCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
            bgColor="bg-red-100"
          />
        </div>

        {loading && <LoadingSpinner message="Loading payments…" />}

        {error && !loading && (
          <ErrorDisplay error={error} onRetry={refresh} />
        )}

        {!loading && !error && (
          <>
            {groupedPayments.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-gray-200">
                <FiDollarSign className="mx-auto w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">No payments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search ? "Try adjusting your search" : "No payment transactions have been made yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {groupedPayments.map((group) => {
                  const isExpanded = expandedMonths[group.month] !== false;
                  return (
                    <div key={group.month} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div
                        className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleMonthExpand(group.month)}
                      >
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                          <h2 className="text-sm sm:text-lg font-semibold text-gray-900">{group.month}</h2>
                          <span className="text-xs sm:text-sm text-gray-500">
                            ({group.count} payment{group.count !== 1 ? "s" : ""})
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-green-600">
                            ${group.total.toLocaleString()}
                          </span>
                        </div>
                        {isExpanded
                          ? <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          : <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        }
                      </div>

                      {isExpanded && (
                        <>
                          <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full min-w-200">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  {["Customer", "Amount", "Method", "Status", "Date", "Transaction ID", "Actions"].map(
                                    (h) => (
                                      <th key={h} className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {h}
                                      </th>
                                    )
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {group.payments.map((payment) => (
                                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 sm:px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                          {payment.bookingId?.userId?.name || "N/A"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {payment.bookingId?.userId?.email || "N/A"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-semibold text-gray-900">
                                        ${payment.amount?.toLocaleString()}
                                      </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {getPaymentMethodIcon(payment.paymentMethod)}
                                        <span className="ml-2 text-sm text-gray-600 capitalize">
                                          {payment.paymentMethod}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                      <StatusBadge status={payment.status} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm text-gray-600">
                                        {formatDate(payment.createdAt)}
                                      </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                      <span className="text-xs font-mono text-gray-500">
                                        {payment.transactionId?.slice(-8) || "N/A"}
                                      </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                      <div className="flex space-x-1 sm:space-x-2">
                                        <button onClick={() => handleViewDetails(payment)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View details">
                                          <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <button onClick={() => handleEditStatus(payment)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Update status">
                                          <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(payment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete payment">
                                          <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="lg:hidden p-4 space-y-3">
                            {group.payments.map((payment) => (
                              <PaymentCard
                                key={payment._id}
                                payment={payment}
                                onView={handleViewDetails}
                                onEdit={handleEditStatus}
                                onDelete={handleDelete}
                              />
                            ))}
                          </div>
                        </>
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
          title="Delete Payment"
          message="Are you sure you want to delete this payment record? This action cannot be undone."
        />

        {isViewModalOpen && viewingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-2 sm:my-8 max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Details</h2>
                <button onClick={() => { setIsViewModalOpen(false); setViewingPayment(null); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <StatusBadge status={viewingPayment.status} />
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(viewingPayment.paymentMethod)}
                    <span className="text-sm font-medium text-gray-900 capitalize">{viewingPayment.paymentMethod}</span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-orange-600 font-medium mb-2">Customer Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-900 break-all">{viewingPayment.bookingId?.userId?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMail className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-900 break-all">{viewingPayment.bookingId?.userId?.email || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Payment ID</p>
                    <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">{viewingPayment._id}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Booking ID</p>
                    <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">{viewingPayment.bookingId?._id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Amount</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">${viewingPayment.amount?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-xs sm:text-sm font-mono text-gray-600 break-all">{viewingPayment.transactionId || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-400">Created</p>
                    <p className="text-xs sm:text-sm text-gray-700">{formatDate(viewingPayment.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-400">Last Updated</p>
                    <p className="text-xs sm:text-sm text-gray-700">{formatDate(viewingPayment.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button onClick={() => { setIsViewModalOpen(false); setViewingPayment(null); }} className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center order-2 sm:order-1">
                    <FiArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <button onClick={() => { setIsViewModalOpen(false); handleEditStatus(viewingPayment); }} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center order-1 sm:order-2">
                    <FiEdit className="w-4 h-4 mr-2" /> Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && editingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Update Payment Status</h2>
                <button onClick={() => { setIsEditModalOpen(false); setEditingPayment(null); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <div className="mb-4">
                    <StatusBadge status={editingPayment.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                  <div className="space-y-2">
                    {["paid", "pending", "failed"].map((s) => (
                      <label key={s} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="status" value={s} checked={statusForm.status === s} onChange={(e) => setStatusForm({ status: e.target.value })} className="w-4 h-4 text-orange-600" />
                        <span className="ml-3 text-sm text-gray-700 capitalize">{s}</span>
                        <span className="ml-auto">
                          {s === "paid"    && <FiCheckCircle className="w-5 h-5 text-green-600"  />}
                          {s === "pending" && <FiClock       className="w-5 h-5 text-yellow-600" />}
                          {s === "failed"  && <FiXCircle     className="w-5 h-5 text-red-600"    />}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingPayment(null); }} className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors order-2 sm:order-1">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors order-1 sm:order-2">
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

export default Payments;