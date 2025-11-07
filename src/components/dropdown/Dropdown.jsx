import React, { useState, useRef, useEffect } from "react";
import "./Dropdown.css";

const Dropdown = ({
  label,
  options = [],
  onSelect,
  placeholder = "Select an option",
  width = "200px",
  defaultValue = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-wrapper" style={{ width }} ref={dropdownRef}>
      {label && <label className="dropdown-label ">{label}</label>}

      <div
        className={`dropdown-selected ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected || placeholder}</span>
        <svg
          className={`dropdown-icon ${isOpen ? "rotate" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {isOpen && (
        <ul className="dropdown-menu">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={index}
                className={`dropdown-item ${
                  selected === option ? "active" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="dropdown-empty">No options available</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
