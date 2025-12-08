import React, { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import PageLayout from "../components/templates/PageLayout";
import { formatCurrency } from "../utils/studentUtils";

// Mock data generator
const generateMockStudents = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    rollNumber: `2024-${(i + 1).toString().padStart(4, "0")}`,
    name: `Student ${i + 1}`,
    course: ["BCA", "BBA", "BBS", "BIT"][i % 4],
    semester: `Semester ${(i % 8) + 1}`,
    totalFees: 50000 + (i % 10) * 1000,
    paidFees: i % 2 === 0 ? 25000 : 50000,
    pendingFees: i % 2 === 0 ? 25000 + (i % 10) * 1000 : 0,
  }));
};

const VirtualizationDemo = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const students = useMemo(() => generateMockStudents(10000), []);

  // Configure virtualizer
  const rowVirtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimate row height
  });

  return (
    <PageLayout
      title="Virtualization Demo"
      subtitle="Demonstrating high-performance rendering with 10,000 student records using TanStack Virtual"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">
            Student Records ({students.length})
          </h2>
          <span className="text-sm text-gray-500">
            Scroll to see virtualization in action
          </span>
        </div>

        {/* Table Header - Fixed */}
        <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="col-span-1">Roll No</div>
          <div className="col-span-1">Name</div>
          <div className="col-span-1">Course</div>
          <div className="col-span-1">Semester</div>
          <div className="col-span-1 text-right">Total Fees</div>
          <div className="col-span-1 text-right">Paid</div>
          <div className="col-span-1 text-right">Pending</div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={parentRef}
          style={{
            height: "600px",
            overflow: "auto",
          }}
          className="w-full"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const student = students[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-7 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <div className="col-span-1 font-mono text-xs">
                    {student.rollNumber}
                  </div>
                  <div className="col-span-1 font-medium">{student.name}</div>
                  <div className="col-span-1">{student.course}</div>
                  <div className="col-span-1">{student.semester}</div>
                  <div className="col-span-1 text-right">
                    {formatCurrency(student.totalFees)}
                  </div>
                  <div className="col-span-1 text-right text-green-600 dark:text-green-400">
                    {formatCurrency(student.paidFees)}
                  </div>
                  <div
                    className={`col-span-1 text-right font-medium ${
                      student.pendingFees > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {formatCurrency(student.pendingFees)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VirtualizationDemo;
