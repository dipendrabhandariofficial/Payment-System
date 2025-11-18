import React from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = "max-w-2xl",
  size = "default",
  disabled = false,
}) => {
  if (!isOpen) return null;

  // Size mapping for flexibility
  const sizeClasses = {
    small: "max-w-md",
    default: "max-w-2xl",
    large: "max-w-4xl",
    xlarge: "max-w-6xl",
  };

  const modalWidth = size !== "default" ? sizeClasses[size] : maxWidth;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={!disabled ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${modalWidth} w-full max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 bg-gray-800 text-white p-6 rounded-t-lg flex items-center justify-between border-b border-gray-700 shadow-md">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="bg-white/10 rounded-lg p-2">
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {subtitle && <p className="text-gray-300 text-sm mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={disabled}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;