import React from "react";
import { Search as SearchIcon } from "lucide-react";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-transparent transition-all duration-200 
                   placeholder-gray-400 text-gray-700"
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBar;
