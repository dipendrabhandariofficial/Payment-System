/**
 * Component prop type definitions
 */

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
  children: ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  children: ReactNode;
}

export interface MessageAlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export interface DataTableProps<T = any> {
  columns: string[];
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  renderCard?: (item: T, index: number) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  className?: string;
  loaderRef?: React.RefObject<HTMLDivElement>;
  hasMore?: boolean;
}

export interface DropdownProps {
  label?: string;
  options: string[];
  placeholder?: string;
  onSelect: (value: string | null) => void;
  width?: string | number;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  icon?: LucideIcon;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
  onClick?: () => void;
  className?: string;
}

export interface LoadingSpinnerProps {
  message?: string;
  size?: string;
  fullScreen?: boolean;
}

export interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export interface StudentFormProps {
  formData: StudentFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  courses: any[];
  selectedCourse?: any;
  setSelectedCourse?: (course: any) => void;
  submitting?: boolean;
  isEditMode?: boolean;
}

export interface StudentFormData {
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  admissionDate: string;
  courseId: string;
  course: string;
  semester: string;
  totalFees: string;
  semesterFees: any[];
}

export interface BulkStudentImportProps {
  isOpen: boolean;
  onClose: () => void;
  courses: any[];
  onImport: (students: any[]) => Promise<any>;
  generateRollNumber: (courseName: string, admissionDate: string) => string;
  existingStudents?: any[];
}

export interface ReceiptModalProps {
  payment?: any;
  isOpen: boolean;
  onClose: () => void;
}

export interface StudentViewModalProps {
  student?: any;
  isOpen: boolean;
  onClose: () => void;
}

export interface InfiniteScrollProps {
  children: ReactNode;
  loaderRef: React.RefObject<HTMLDivElement>;
  hasMore: boolean;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}
