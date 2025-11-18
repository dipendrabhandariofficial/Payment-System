import React, { useState, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

const ActionMenu = ({
  className,
  onView,
  onEdit,
  onDelete,
  viewLabel = "View",
  editLabel = "Edit",
  deleteLabel = "Delete",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-menu")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative action-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 dark:p-1 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>
      {isOpen && (
        <div className={`absolute sm:w-20 grid-cols-1  ${className} w-64 bg-white  dark:bg-gray-400 dark:border-0 dark:hover:bg-gray-500 rounded-lg shadow-lg border border-gray-200 z-10 py-1`}>
          {onView && (
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
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
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
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
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
