import React from "react";

const QuickStat = ({ 
  title, 
  description, 
  value, 
  className = "" 
}) => {
  return (
    <div
      className={`flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}
    >
      <div>
        <span className="block text-gray-700 dark:text-gray-300 font-medium">
          {title}
        </span>

        {description && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </span>
        )}
      </div>

      <span className="text-md font-semibold text-blue-600 dark:text-blue-400">
        {value}
      </span>
    </div>
  );
};

export default QuickStat;
