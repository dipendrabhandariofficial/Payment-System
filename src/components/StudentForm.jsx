import React from "react";
import {
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  DollarSign,
  Info,
} from "lucide-react";

const StudentForm = ({
  isEditMode = false,
  formData,
  onChange,
  courses,
  selectedCourse,
  setSelectedCourse,
  submitting = false,
  showPersonalInfo = true,
  showGuardianInfo = true,
}) => {
  const handleCourseChange = (e) => {
    // Simply pass the event to the parent's onChange handler
    // The parent (Students.jsx) will handle all the logic
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {showPersonalInfo && (
        <>
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              Personal Information
            </h3>
          </div>

          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                placeholder="Enter student name"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Roll Number
            </label>

            <div className="relative">
              <Hash
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
        group-focus-within:text-gray-600 transition-colors"
              />

              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={onChange}
                disabled={isEditMode} // ✅ Disable in edit mode
                className={`w-full pl-10 pr-3 py-2 border rounded transition
        ${
          isEditMode
            ? "bg-gray-200 cursor-not-allowed text-gray-500"
            : "bg-white dark:bg-gray-800"
        }
      `}
                placeholder="Enter Roll Number"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                placeholder="student@example.com"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                placeholder="+1 234 567 8900"
                required
                disabled={submitting}
              />
            </div>
          </div>
        </>
      )}

      <div className="md:col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-gray-600" />
          Academic Information
        </h3>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Course <span className="text-red-500">*</span>
        </label>
        {!formData.courseId && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            ⚠️ Please select a course to continue
          </div>
        )}
        <div className="relative group">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors z-10" />
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleCourseChange}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200 appearance-none"
            required
            disabled={submitting}
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.degreeType})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {selectedCourse && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {selectedCourse.name}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      Department:
                    </span>
                    <span className="text-blue-900 ml-2">
                      {selectedCourse.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Duration:</span>
                    <span className="text-blue-900 ml-2">
                      {selectedCourse.duration}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Total Semesters:
                    </span>
                    <span className="text-blue-900 ml-2">
                      {selectedCourse.totalSemesters}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Fee per Semester:
                    </span>
                    <span className="text-blue-900 ml-2">
                      ₹{selectedCourse.semesterFees.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700 font-medium">
                      Total Fees:
                    </span>
                    <span className="text-blue-900 ml-2 font-bold">
                      ₹{selectedCourse.totalFees.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedCourse.description && (
                    <div className="col-span-2 mt-1">
                      <p className="text-xs text-blue-600">
                        {selectedCourse.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Current Semester <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          <input
            type="number"
            name="semester"
            value={formData.semester}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
            placeholder="Enter current semester"
            min="1"
            max={selectedCourse?.totalSemesters || 8}
            required
            disabled={submitting || !selectedCourse}
          />
        </div>
        {selectedCourse && (
          <p className="text-xs text-gray-500 mt-1">
            Semester range: 1 - {selectedCourse.totalSemesters}
          </p>
        )}
      </div>

      <div className="md:col-span-2 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          Financial Information
        </h3>
      </div>

      <div className="relative group md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Total Fees <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          <input
            type="number"
            name="totalFees"
            value={formData.totalFees}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
            placeholder="Total course fees"
            min="0"
            step="0.01"
            required
            disabled={submitting || !!selectedCourse}
            readOnly={!!selectedCourse}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {selectedCourse
            ? `Auto-filled from course. This will be set as the initial pending fees.`
            : "This will be set as the initial pending fees"}
        </p>
        {selectedCourse &&
          formData.semesterFees &&
          formData.semesterFees.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Semester Fee Structure:
              </p>
              <div className="space-y-1">
                {formData.semesterFees.slice(0, 3).map((sem, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs text-gray-600"
                  >
                    <span>Semester {sem.semester}:</span>
                    <span className="font-medium">
                      ₹{sem.amount.toLocaleString("en-IN")} (Due:{" "}
                      {new Date(sem.dueDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                      )
                    </span>
                  </div>
                ))}
                {formData.semesterFees.length > 3 && (
                  <p className="text-xs text-gray-500 italic">
                    ... and {formData.semesterFees.length - 3} more semesters
                  </p>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default StudentForm;
