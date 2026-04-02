import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
};

export default LoadingSpinner;