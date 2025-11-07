import React from "react";
import "./Button.css";

const Button = ({
  children,
  colorScheme = "blue",
  variant = "solid",
  size = "md",
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  isFullWidth = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses = `
    button
    button--${variant}
    button--${colorScheme}
    button--${size}
    ${isFullWidth ? "button--full-width" : ""}
    ${isLoading ? "button--loading" : ""}
    ${disabled ? "button--disabled" : ""}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <span className="button__spinner">
          <svg className="button__spinner-svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </span>
      )}
      
      {leftIcon && !isLoading && (
        <span className="button__icon button__icon--left">
          {leftIcon}
        </span>
      )}
      
      <span className="button__content">
        {children}
      </span>
      
      {rightIcon && !isLoading && (
        <span className="button__icon button__icon--right">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export { Button };