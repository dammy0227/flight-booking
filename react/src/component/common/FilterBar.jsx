import React from "react";

const FilterBar = ({ options, value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value: optionValue, label }) => (
        <button
          key={optionValue}
          onClick={() => onChange(optionValue)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === optionValue
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;