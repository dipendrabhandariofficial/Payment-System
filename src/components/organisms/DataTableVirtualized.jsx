import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import LoadingSpinner from "../atoms/LoadingSpinner";

/**
 * Virtualized DataTable Component
 *
 * This is an enhanced version of DataTable.jsx that uses TanStack Virtual
 * for rendering large datasets efficiently. Only visible rows are rendered in the DOM.
 *
 * Use this when:
 * - Rendering 1,000+ items
 * - Experiencing scroll performance issues
 * - All data is loaded in memory (not paginated from API)
 */
const DataTableVirtualized = ({
  columns,
  data,
  renderRow,
  renderCard,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  loading = false,
  rowHeight = 50, // Estimated row height in pixels
  cardHeight = 120, // Estimated card height for mobile
}) => {
  const desktopParentRef = useRef(null);
  const mobileParentRef = useRef(null);

  // Desktop table virtualizer
  const desktopVirtualizer = useVirtualizer({
    count: data?.length || 0,
    getScrollElement: () => desktopParentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // Render 5 extra rows above/below viewport for smooth scrolling
  });

  // Mobile cards virtualizer
  const mobileVirtualizer = useVirtualizer({
    count: data?.length || 0,
    getScrollElement: () => mobileParentRef.current,
    estimateSize: () => cardHeight,
    overscan: 3,
  });

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
      {/* Desktop Table View - Virtualized */}
      <div className="hidden lg:block dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div ref={desktopParentRef} className="max-h-[500px] overflow-auto">
          <table className="w-full min-w-max table-auto border-collapse">
            {/* Sticky Header */}
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

            {/* Virtual Body */}
            <tbody
              className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700"
              style={{
                height: `${desktopVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {desktopVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = data[virtualRow.index];
                return (
                  <tr
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    ref={desktopVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {renderRow
                      ? renderRow(item, virtualRow.index)
                      : // Default row rendering
                        Object.values(item).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-900 dark:text-gray-100"
                          >
                            {value}
                          </td>
                        ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Virtual scroll info (optional - for debugging) */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
          Showing {desktopVirtualizer.getVirtualItems().length} of {data.length}{" "}
          rows (Virtual scrolling active)
        </div>
      </div>

      {/* Mobile/Tablet Card View - Virtualized */}
      <div
        ref={mobileParentRef}
        className="lg:hidden max-h-[600px] overflow-auto px-2"
      >
        <div
          style={{
            height: `${mobileVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {mobileVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = data[virtualItem.index];
            return (
              <div
                key={virtualItem.index}
                data-index={virtualItem.index}
                ref={mobileVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="pb-4"
              >
                {renderCard ? (
                  renderCard(item, virtualItem.index)
                ) : (
                  // Default card rendering
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="space-y-3">
                      {columns.map((column, colIndex) => (
                        <div
                          key={colIndex}
                          className="flex justify-between items-start gap-4"
                        >
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">
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
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DataTableVirtualized;
