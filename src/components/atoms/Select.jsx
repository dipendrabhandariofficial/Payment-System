import React from "react";
import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
  className = "",
  id,
  name,
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className={`w-full  ${className} ` }>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-700 mb-2 dark:text-white"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5  text-gray-400 group-focus-within:text-gray-600 transition-colors " />
        )}
              <select
                id={selectId}
                name={id || name}
                value={value}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200 appearance-none cursor-pointer text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-gray-500 dark:focus:border-gray-500 dark:text-white`}
              >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default Select;

