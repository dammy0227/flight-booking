import React from "react";

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actionButton && <div className="mt-4 md:mt-0">{actionButton}</div>}
      </div>
    </div>
  );
};

export default PageHeader;