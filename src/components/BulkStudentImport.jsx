import React, { useState, useMemo } from 'react';
import { Upload, X, Download, CheckCircle, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkStudentImport = ({ 
  isOpen, 
  onClose, 
  courses, 
  onImport, 
  generateRollNumber,
  existingStudents 
}) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Get all existing roll numbers
  const existingRollNumbers = useMemo(() => {
    return new Set([
      ...(existingStudents?.map(s => s.rollNumber) || []),
      ...preview.map(p => p.rollNumber)
    ]);
  }, [existingStudents, preview]);

  const downloadTemplate = () => {
    const template = [
      {
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '9876543210',
        'Course ID': 'bsc-cs',
        'Semester': '1',
        'Address': 'Kathmandu',
        'Guardian Name': 'Jane Doe',
        'Guardian Phone': '9876543211',
        'Guardian Relation': 'Mother'
      },
      {
        'Name': 'Jane Smith',
        'Email': 'jane@example.com',
        'Phone': '9876543212',
        'Course ID': 'bsc-cs',
        'Semester': '1',
        'Address': 'Pokhara',
        'Guardian Name': 'John Smith',
        'Guardian Phone': '9876543213',
        'Guardian Relation': 'Father'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const instructions = [
      { 'Column': 'Name', 'Required': 'Yes', 'Description': 'Full name' },
      { 'Column': 'Email', 'Required': 'Yes', 'Description': 'Valid email' },
      { 'Column': 'Phone', 'Required': 'Yes', 'Description': 'Phone number' },
      { 'Column': 'Course ID', 'Required': 'Yes', 'Description': 'Select from available list' },
      { 'Column': 'Semester', 'Required': 'Yes', 'Description': 'Semester number' },
      { 'Column': 'Address', 'Required': 'No', 'Description': 'Address' },
      { 'Column': 'Guardian Name', 'Required': 'No', 'Description': 'Guardian full name' },
      { 'Column': 'Guardian Phone', 'Required': 'No', 'Description': 'Guardian contact' },
      { 'Column': 'Guardian Relation', 'Required': 'No', 'Description': 'Relation' }
    ];

    const instructionsWs = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

    const coursesData = courses.map(c => ({
      'Course ID': c.id,
      'Course Name': c.name,
      'Department': c.department,
      'Total Semesters': c.totalSemesters,
      'Total Fees': c.totalFees
    }));

    const coursesWs = XLSX.utils.json_to_sheet(coursesData);
    XLSX.utils.book_append_sheet(wb, coursesWs, 'Available Courses');

    XLSX.writeFile(wb, 'Student_Import_Template.xlsx');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          setErrors(['Spreadsheet is empty.']);
          return;
        }

        validateAndPreview(jsonData);
      } catch {
        setErrors(['Invalid Excel file.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateUniqueRollNumber = (courseName, admissionDate, attempt = 0) => {
    let rollNumber = generateRollNumber(courseName, admissionDate);
    
    // If roll number already exists, append attempt number
    if (existingRollNumbers.has(rollNumber)) {
      rollNumber = `${generateRollNumber(courseName, admissionDate)}+${attempt + 1}`;
    }
    
    return rollNumber;
  };

  const validateAndPreview = (data) => {
    const validatedData = [];
    const errorList = [];
    const usedRollNumbers = new Set();

    data.forEach((row, index) => {
      const rowNum = index + 2;
      const rowErrors = [];

      // Validation
      if (!row['Name']?.trim()) rowErrors.push('Name required');
      if (!row['Email']?.trim()) rowErrors.push('Email required');
      if (!row['Phone']?.trim()) rowErrors.push('Phone required');
      if (!row['Course ID']?.trim()) rowErrors.push('Course ID required');
      if (!row['Semester']) rowErrors.push('Semester required');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (row['Email'] && !emailRegex.test(row['Email'])) rowErrors.push('Invalid email');

      const phoneRegex = /^\d{10}$/;
      if (row['Phone'] && !phoneRegex.test(row['Phone'].toString().trim())) {
        rowErrors.push('Phone must be 10 digits');
      }

      const course = courses.find(c => c.id === row['Course ID']?.trim());
      if (!course) rowErrors.push(`Course ID "${row['Course ID']}" not found`);

      if (rowErrors.length > 0) {
        errorList.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
        return;
      }

      // Auto-generate admission date (today)
      const today = new Date();
      const formattedAdmissionDate = today.toISOString().split('T')[0];

      // Auto-generate unique roll number
      let rollNumber = generateRollNumber(course.name, formattedAdmissionDate);
      let attempt = 0;
      
      while (existingRollNumbers.has(rollNumber) || usedRollNumbers.has(rollNumber)) {
        attempt++;
        rollNumber = `${generateRollNumber(course.name, formattedAdmissionDate)}-${attempt}`;
      }
      usedRollNumbers.add(rollNumber);

      // Check for duplicate emails in current batch
      const duplicateEmail = validatedData.find(s => s.email === row['Email'].trim());
      if (duplicateEmail) {
        errorList.push(`Row ${rowNum}: Duplicate email "${row['Email']}" found in batch`);
        return;
      }

      validatedData.push({
        name: row['Name'].trim(),
        email: row['Email'].trim(),
        phone: row['Phone'].toString().trim(),
        courseId: row['Course ID'].trim(),
        course: course.name,
        admissionDate: formattedAdmissionDate,
        semester: row['Semester'].toString(),
        address: row['Address']?.trim() || '',
        guardianName: row['Guardian Name']?.trim() || '',
        guardianPhone: row['Guardian Phone']?.toString().trim() || '',
        guardianRelation: row['Guardian Relation']?.trim() || '',
        rollNumber,
        totalFees: course.totalFees,
        semesterFees: generateSemesterFees(course, formattedAdmissionDate),
        paidFees: 0,
        pendingFees: course.totalFees,
        rowNum
      });
    });

    setErrors(errorList);
    setPreview(validatedData);
  };

  const generateSemesterFees = (course, admissionDate) => {
    const fees = [];
    const startDate = new Date(admissionDate);
    const semesterDuration = 6;

    for (let i = 1; i <= course.totalSemesters; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (i - 1) * semesterDuration);

      fees.push({
        semester: i.toString(),
        amount: course.semesterFees || course.totalFees / course.totalSemesters,
        dueDate: dueDate.toISOString().split('T')[0],
        paid: false
      });
    }

    return fees;
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);

    try {
      await onImport(preview);
      setSuccess(true);
      setTimeout(handleClose, 2000);
    } catch (error) {
      setErrors(['Import failed: ' + (error.message || 'Unknown error')]);
    }

    setImporting(false);
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setSuccess(false);
    setSelectedCourse('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Bulk Import Students</h2>
          <button onClick={handleClose} className="hover:bg-blue-700 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">

          {/* Course Information */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-l-4 border-blue-500 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">📋 Available Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {courses.map(c => (
                <div key={c.id} className="p-2 bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-blue-600">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">ID: {c.id}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">Use these course IDs in the Excel file.</p>
          </div>

          {/* Step 1 */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-r-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">Step 1: Download Template</h3>
              <p className="text-sm text-green-700 dark:text-green-400">Includes sample data + instructions.</p>
            </div>
            <button 
              onClick={downloadTemplate} 
              className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> Download Template
            </button>
          </div>

          {/* Step 2 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Step 2: Upload Filled Template</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center rounded-lg hover:border-blue-500 transition-colors">
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload" 
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {file ? file.name : 'Click or drag Excel file here'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supported: .xlsx, .xls</p>
              </label>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-900 dark:text-red-300">Validation Errors</h3>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-400 max-h-40 overflow-y-auto space-y-1">
                {errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 border-l-4 border-green-500 rounded-r-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-700 dark:text-green-300 font-semibold">✓ Import successful! {preview.length} students added.</p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && errors.length === 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Step 3: Review Data ({preview.length} students)</h3>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Roll #</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Sem</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Admission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{s.rollNumber}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{s.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{s.email}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{s.course}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-center">{s.semester}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{s.admissionDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
          <button 
            onClick={handleClose} 
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport} 
            disabled={importing || preview.length === 0 || errors.length > 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            Import {preview.length}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStudentImport;