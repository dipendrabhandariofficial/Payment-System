import React from "react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-700",
  valueColor = "text-gray-900",
  onClick,
  className = "",
}) => {
  const cardClasses = `
    bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white
    ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold  ${valueColor}`}>{value}</p>
          {subtitle && <p className="text-xs  mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${iconBg} rounded-lg p-3`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

