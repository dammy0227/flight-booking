import React from "react";
import { FiPlus } from "react-icons/fi";

const AddButton = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      <FiPlus className="w-5 h-5 mr-2" />
      {label || "Add New"}
    </button>
  );
};

export default AddButton;