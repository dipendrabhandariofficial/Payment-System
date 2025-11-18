import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const DataTable = ({
  columns,
  data,
  renderRow,
  renderCard,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  loading = false,
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading data..." size="w-10 h-10" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16">
        {EmptyIcon && (
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <EmptyIcon className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - hidden on small screens */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View - visible on small/medium screens */}
      <div className="lg:hidden space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            {renderCard ? (
              renderCard(item, index)
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-3">
                  {columns.map((column, colIndex) => (
                    <div key={colIndex} className="flex justify-between items-start gap-4">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0">
                        {column}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100 text-right">
                        {Object.values(item)[colIndex]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;