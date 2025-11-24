import React from "react";
import PropTypes from "prop-types";

const PageLayout = ({ children, title, subtitle, actionButton }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#101828] p-6">
      {(title || actionButton) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {title && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          )}
          {actionButton && <div className="w-full sm:w-auto">{actionButton}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actionButton: PropTypes.node,
};

export default PageLayout;