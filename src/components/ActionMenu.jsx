import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

const ActionMenu = ({
  className = "",
  onView,
  onEdit,
  onDelete,
  viewLabel = "View",
  editLabel = "Edit",
  deleteLabel = "Delete",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2  text-gray-700  dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-400 " />
      </button>

      {/* Menu Items */}
      {isOpen && (
        <div
          className={`absolute right-0  mt-2 w-48 bg-white dark:bg-gray-700 text
            rounded-lg shadow-lg border z-40 border-gray-200 dark:border-gray-600 
             py-1 ${className}`}
        >
          {onView && (
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2
                         text-gray-700 dark:text-gray-200 hover:bg-gray-300 
                         dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {viewLabel}
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2
                         text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                         dark:hover:bg-gray-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              {editLabel}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2
                         text-red-600 hover:bg-red-50 dark:text-red-400
                         dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {deleteLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
