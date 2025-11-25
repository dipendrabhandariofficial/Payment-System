// ============================================
// SEMESTER UPGRADE IMPLEMENTATION FOR STUDENTS.JSX
// ============================================
// Copy and paste these code snippets into Students.jsx

// ============================================
// 1. ADD TO IMPORTS (around line 6)
// ============================================
import SemesterUpgradeModal from "../components/SemesterUpgradeModal";

// ============================================
// 2. ADD TO API IMPORTS (around line 17)
// ============================================
// Add getPayments to the existing import:
import {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getPayments,  // <- ADD THIS LINE
} from "../services/api";

// ============================================
// 3. ADD TO ICON IMPORTS (around line 27)
// ============================================
// Add GraduationCap to the existing import:
import {
    Plus,
    User,
    Edit,
    Loader2,
    Upload,
    Trash2,
    FileSpreadsheet,
    X,
    GraduationCap,  // <- ADD THIS LINE
} from "lucide-react";

// ============================================
// 4. ADD STATE (around line 45, after showBulkImportModal)
// ============================================
const [showSemesterUpgradeModal, setShowSemesterUpgradeModal] = useState(false);

// ============================================
// 5. ADD PAYMENTS QUERY (around line 90, after students query)
// ============================================
// Fetch payments for semester upgrade eligibility
const {
    data: payments = [],
    isLoading: paymentsLoading,
} = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
});

// ============================================
// 6. ADD SEMESTER UPGRADE MUTATION (around line 225, after bulkDeleteMutation)
// ============================================
// ✅ REACT QUERY: useMutation for semester upgrade
const semesterUpgradeMutation = useMutation({
    mutationFn: async (studentIds) => {
        const upgradePromises = studentIds.map(async (studentId) => {
            const student = students.find((s) => s.id === studentId);
            if (!student) return;

            const updatedData = {
                ...student,
                semester: (parseInt(student.semester) + 1).toString(),
            };

            return updateStudent(studentId, updatedData);
        });

        await Promise.all(upgradePromises);
    },
    onSuccess: () => {
        queryClient.invalidateQueries(["students"]);
        toast.success("Students upgraded successfully!");
    },
    onError: (error) => {
        console.error("Error upgrading students:", error);
        toast.error("Failed to upgrade students. Please try again.");
    },
});

// ============================================
// 7. ADD HANDLER FUNCTION (around line 655, after handleBulkExport)
// ============================================
// Handle semester upgrade
const handleSemesterUpgrade = async (selectedStudentIds) => {
    await semesterUpgradeMutation.mutateAsync(selectedStudentIds);
};

// ============================================
// 8. ADD BUTTON TO UI (around line 690, in the actionButton section)
// ============================================
// Find this section:
// actionButton={
//   <div className="flex items-center gap-3">
//     <button onClick={() => setShowBulkImportModal(true)} ...>
//       ...Bulk Import...
//     </button>
//     <button onClick={() => setShowModal(true)} ...>
//       ...Add Student...
//     </button>
//   </div>
// }

// ADD THIS BUTTON between Bulk Import and Add Student:
<button
    onClick={() => setShowSemesterUpgradeModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors font-medium"
>
    <GraduationCap className="w-5 h-5" />
    <span className="hidden sm:inline">Semester Upgrade</span>
</button>

// ============================================
// 9. ADD MODAL COMPONENT (around line 1030, before the last closing tags)
// ============================================
// Find the end of the component, after BulkStudentImport modal and before </PageLayout>
// ADD THIS:

{/* Semester Upgrade Modal */ }
<SemesterUpgradeModal
    isOpen={showSemesterUpgradeModal}
    onClose={() => setShowSemesterUpgradeModal(false)}
    students={students}
    payments={payments}
    onUpgrade={handleSemesterUpgrade}
/>

// ============================================
// THAT'S IT! Your semester upgrade feature is now implemented.
// ============================================
