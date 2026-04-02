import React from "react";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

const statusConfig = {
  // Booking statuses
  confirmed: {
    icon: FiCheckCircle,
    text: "Confirmed",
    bg: "bg-green-100",
    textColor: "text-green-700",
  },
  pending: {
    icon: FiClock,
    text: "Pending",
    bg: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  cancelled: {
    icon: FiXCircle,
    text: "Cancelled",
    bg: "bg-red-100",
    textColor: "text-red-700",
  },
  // Payment statuses
  paid: {
    icon: FiCheckCircle,
    text: "Paid",
    bg: "bg-green-100",
    textColor: "text-green-700",
  },
  failed: {
    icon: FiXCircle,
    text: "Failed",
    bg: "bg-red-100",
    textColor: "text-red-700",
  },
  // Availability statuses
  available: {
    icon: FiCheckCircle,
    text: "Available",
    bg: "bg-green-100",
    textColor: "text-green-700",
  },
  lowStock: {
    icon: FiAlertCircle,
    text: "Low Stock",
    bg: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  full: {
    icon: FiXCircle,
    text: "Full",
    bg: "bg-red-100",
    textColor: "text-red-700",
  },
};

const StatusBadge = ({ status, customConfig }) => {
  const config = customConfig || statusConfig[status] || {
    icon: FiAlertCircle,
    text: status || "Unknown",
    bg: "bg-gray-100",
    textColor: "text-gray-700",
  };
  
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 ${config.bg} ${config.textColor} rounded-full text-xs font-medium flex items-center w-fit`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  );
};

export default StatusBadge;