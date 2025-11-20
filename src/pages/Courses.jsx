import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  X,
  BookOpen,
  GraduationCap,
  DollarSign,
  Loader2,
  MoreVertical,
  Eye,
  Edit,
  Info,
  Clock,
  Users,
} from "lucide-react";
import SearchBar from "../components/Search";
import Select from "../components/Select";
import { courses as initialCourses } from "../data/courses";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLayout from "../components/PageLayout";
import ActionMenu from "../components/ActionMenu";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: "",
    totalFees: "",
    description: "",
    department: "",
  });

  useEffect(() => {
    // Load courses from localStorage or use initial courses
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(initialCourses);
      localStorage.setItem("courses", JSON.stringify(initialCourses));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.degreeType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterDepartment !== "All") {
      filtered = filtered.filter(
        (course) => course.department === filterDepartment
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, filterDepartment, courses]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-menu")) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-calculate total fees when semester fees or total semesters change
    if (name === "semesterFees" || name === "totalSemesters") {
      const semesterFees =
        name === "semesterFees"
          ? parseFloat(value) || 0
          : parseFloat(formData.semesterFees) || 0;
      const totalSemesters =
        name === "totalSemesters"
          ? parseInt(value) || 0
          : parseInt(formData.totalSemesters) || 0;
      const totalFees = semesterFees * totalSemesters;
      setFormData((prev) => ({ ...prev, totalFees: totalFees.toString() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const courseData = {
        id: selectedCourse ? selectedCourse.id : `course-${Date.now()}`,
        ...formData,
        semesterFees: parseFloat(formData.semesterFees),
        totalFees: parseFloat(formData.totalFees),
        totalSemesters: parseInt(formData.totalSemesters),
      };

      let updatedCourses;
      if (selectedCourse) {
        // Update existing course
        updatedCourses = courses.map((c) =>
          c.id === selectedCourse.id ? courseData : c
        );
      } else {
        // Add new course
        updatedCourses = [...courses, courseData];
      }

      setCourses(updatedCourses);
      localStorage.setItem("courses", JSON.stringify(updatedCourses));
      setSuccess(true);
      handleCloseModal();
      handleCloseEditModal();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Failed to save course. Please try again.");
      console.error("Error saving course:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
    setOpenMenuId(null);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      degreeType: course.degreeType,
      duration: course.duration,
      totalSemesters: course.totalSemesters.toString(),
      semesterFees: course.semesterFees.toString(),
      totalFees: course.totalFees.toString(),
      description: course.description,
      department: course.department,
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (course) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${course.name}"? This action cannot be undone.`
      )
    ) {
      const updatedCourses = courses.filter((c) => c.id !== course.id);
      setCourses(updatedCourses);
      localStorage.setItem("courses", JSON.stringify(updatedCourses));
      setOpenMenuId(null);
    }
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowModal(false);
      setFormData({
        name: "",
        degreeType: "Bachelor",
        duration: "3 Years",
        totalSemesters: 6,
        semesterFees: "",
        totalFees: "",
        description: "",
        department: "",
      });
      setError("");
      setSuccess(false);
    }
  };

  const handleCloseEditModal = () => {
    if (!submitting) {
      setShowEditModal(false);
      setSelectedCourse(null);
      setFormData({
        name: "",
        degreeType: "Bachelor",
        duration: "3 Years",
        totalSemesters: 6,
        semesterFees: "",
        totalFees: "",
        description: "",
        department: "",
      });
      setError("");
      setSuccess(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const uniqueDepartments = Array.from(
    new Set(courses.map((c) => c.department))
  );

  if (loading) {
    return <LoadingSpinner message="Getting Courses data" />;
  }

  return (
    <PageLayout
      title="Courses"
      subtitle={"Manage degree courses and fee structures"}
      actionButton={
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-500  text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Course</span>
        </button>
      }
    >
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center">
          <div className="w-5 h-5 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm font-medium">
            Course saved successfully!
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            label="Search"
            placeholder="Search by course name, department, or degree type..."
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="w-full"
          />

          <Select
            label="Department"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            icon={BookOpen}
            options={[
              { value: "All", label: "All Departments" },
              ...uniqueDepartments.map((dept) => ({
                value: dept,
                label: dept,
              })),
            ]}
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-300 dark:text-gray-100 dark:border-0 rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {course.degreeType}
                  </p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {course.department}
                  </span>
                </div>
                <div className="relative action-menu">

                  <ActionMenu
                    onView={() => handleView(course)}
                    onEdit={() => handleEdit(course)}
                    onDelete={() => handleDelete(course)}
                    
                  />
                  
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Semesters:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.totalSemesters}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Per Semester:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(course.semesterFees)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      Total Fees:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(course.totalFees)}
                    </span>
                  </div>
                </div>
                {course.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">
              No courses found
            </p>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or add a new course
            </p>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-800 text-white p-6 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg p-2">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Add New Course</h2>
                  <p className="text-gray-300 text-sm">
                    Fill in the course information below
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
                  <X className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Select
                    label="Degree Type"
                    value={formData.degreeType}
                    onChange={handleChange}
                    icon={GraduationCap}
                    options={[
                      { value: "Bachelor", label: "Bachelor" },
                      { value: "Master", label: "Master" },
                      { value: "Diploma", label: "Diploma" },
                      { value: "Certificate", label: "Certificate" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    placeholder="e.g., 3 Years"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    placeholder="e.g., Computer Science"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Semesters <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalSemesters"
                    value={formData.totalSemesters}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    min="1"
                    max="12"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fee per Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="semesterFees"
                      value={formData.semesterFees}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Fees
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="totalFees"
                      value={formData.totalFees}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-gray-50 transition-all duration-200"
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated: Fee per Semester × Total Semesters
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200 resize-none"
                    placeholder="Brief description of the course..."
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal - Similar structure to Add Modal */}
      {showEditModal && selectedCourse && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseEditModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 text-white p-6 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg p-2">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Edit Course</h2>
                  <p className="text-gray-300 text-sm">{selectedCourse.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseEditModal}
                disabled={submitting}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center">
                  <X className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Same form fields as Add Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Select
                    label="Degree Type"
                    value={formData.degreeType}
                    onChange={handleChange}
                    icon={GraduationCap}
                    options={[
                      { value: "Bachelor", label: "Bachelor" },
                      { value: "Master", label: "Master" },
                      { value: "Diploma", label: "Diploma" },
                      { value: "Certificate", label: "Certificate" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Semesters <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalSemesters"
                    value={formData.totalSemesters}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    min="1"
                    max="12"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fee per Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="semesterFees"
                      value={formData.semesterFees}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                      min="0"
                      step="0.01"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Fees
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="totalFees"
                      value={formData.totalFees}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-gray-50 transition-all duration-200"
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={submitting}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-5 h-5" />
                      Update Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Course Modal */}
      {showViewModal && selectedCourse && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 text-white p-6 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg p-2">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Course Details</h2>
                  <p className="text-gray-300 text-sm">{selectedCourse.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Course Name</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedCourse.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Degree Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCourse.degreeType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCourse.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCourse.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Semesters
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCourse.totalSemesters}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fee per Semester
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedCourse.semesterFees)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Total Course Fees
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedCourse.totalFees)}
                    </p>
                  </div>
                  {selectedCourse.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-900">
                        {selectedCourse.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg flex items-center justify-end gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Courses;
