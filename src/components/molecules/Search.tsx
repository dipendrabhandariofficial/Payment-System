import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Search as SearchIcon, X as ClearIcon } from "lucide-react";

// Debounce utility
function debounce(fn: Function, delay: number) {
  let timeout: number | undefined;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
interface SearchBarProps {
  label: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  delay?: number;
}

const SearchBar = ({
  label,
  searchTerm,
  setSearchTerm,
  placeholder = "Search...",
  className = "",
  id = "search-input",
  delay = 300,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState(searchTerm);

  // Sync internal value with external searchTerm changes
  useEffect(() => {
    setInternalValue(searchTerm);
  }, [searchTerm]);

  // Debounced setter with cleanup
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, delay),
    [setSearchTerm, delay]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalValue(value);
    debouncedSetSearch(value);
  };

  const clearInput = useCallback(() => {
    setInternalValue("");
    setSearchTerm("");
  }, [setSearchTerm]);

  return (
    <div className={` ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {/* Search Icon */}
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"
          aria-hidden="true"
        />

        {/* Input */}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleChange}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            focus:border-transparent transition-all duration-200 
            dark:text-white dark:bg-gray-800 dark:border-gray-600 
            placeholder-gray-400 dark:placeholder-gray-500 text-gray-700"
          aria-label={placeholder}
        />

        {/* Clear Button */}
        {internalValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
              hover:text-gray-600 dark:hover:text-gray-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Clear search"
          >
            <ClearIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
