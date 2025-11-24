import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { useRef } from "react";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const DataTable = ({
  columns,
  className,
  data,
  renderRow,
  renderCard,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  loading = false,
}) => {
  // Use state for refs to ensure hook gets the element when it's mounted
  const [desktopRoot, setDesktopRoot] = useState(null);
  const [mobileRoot, setMobileRoot] = useState(null);
  
  // Separate infinite scroll hooks for desktop and mobile
  const desktopScroll = useInfiniteScroll({ items: data || [], pageSize: 10, rootElement: desktopRoot });
  const mobileScroll = useInfiniteScroll({ items: data || [], pageSize: 5, rootElement: mobileRoot });
  
  // Get visible items, fallback to empty array if undefined
  const desktopVisibleItems = desktopScroll?.paginatedItems || [];
  const mobileVisibleItems = mobileScroll?.paginatedItems || [];

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
      <div className="hidden lg:block dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div
          ref={setDesktopRoot}
          className="max-h-[500px] overflow-y-auto"
        >
          <table className="w-full min-w-max table-auto border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-3 py-2 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {desktopVisibleItems.map((item, index) => renderRow(item, index))}
              {desktopScroll?.hasMore && (
                <tr>
                  <td colSpan={columns.length}>
                    <div ref={desktopScroll.loaderRef} className="py-2 text-center text-gray-500 text-[8px]">
                      Loading more...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View - visible on small/medium screens */}
      <div 
        ref={setMobileRoot}
        className="lg:hidden space-y-4 max-h-[600px] overflow-y-auto px-2"
      >
        {mobileVisibleItems.map((item, index) => (
          <div key={index}>
            {renderCard ? (
              renderCard(item, index)
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-3">
                  {columns.map((column, colIndex) => (
                    <div key={colIndex} className="flex justify-between items-start gap-4">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0">
                        {column}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">
                        {Object.values(item)[colIndex]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {mobileScroll?.hasMore && (
          <div ref={mobileScroll.loaderRef} className="py-4 text-center text-gray-500 text-sm">
            Loading more...
          </div>
        )}
      </div>
    </>
  );
};

export default DataTable;