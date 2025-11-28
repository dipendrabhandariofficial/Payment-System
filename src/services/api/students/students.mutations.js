import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from './students.api';
import { QUERY_KEYS } from '../queryKeys';
import { useToast } from '../../../context/ToastContext';

export const useCreateStudent = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: studentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Student added successfully!');
        },
        onError: (error) => {
            console.error('Error adding student:', error);
            toast.error('Failed to add student. Please try again.');
        },
    });
};

export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: ({ id, data }) => studentsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Student updated successfully!');
        },
        onError: (error) => {
            console.error('Error updating student:', error);
            toast.error('Failed to update student. Please try again.');
        },
    });
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: studentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Student deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student. Please try again.');
        },
    });
};

export const useBulkDeleteStudents = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (studentIds) => {
            const deletePromises = studentIds.map((id) =>
                studentsApi.delete(id).catch((err) => {
                    console.error(`Failed to delete student ${id}:`, err);
                    throw err;
                })
            );
            await Promise.all(deletePromises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Students deleted successfully!');
        },
        onError: (error) => {
            console.error('Error deleting students:', error);
            toast.error('Failed to delete students. Please try again.');
        },
    });
};

export const useSemesterUpgrade = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async ({ studentIds, students }) => {
            const upgradePromises = studentIds.map(async (studentId) => {
                const student = students.find((s) => s.id === studentId);
                if (!student) return;

                const updatedData = {
                    ...student,
                    semester: (parseInt(student.semester) + 1).toString(),
                };

                return studentsApi.update(studentId, updatedData);
            });

            await Promise.all(upgradePromises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Students upgraded successfully!');
        },
        onError: (error) => {
            console.error('Error upgrading students:', error);
            toast.error('Failed to upgrade students. Please try again.');
        },
    });
};

export const useBulkImportStudents = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (studentsData) => {
            for (const studentData of studentsData) {
                await studentsApi.create(studentData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
            toast.success('Bulk import completed successfully!');
        },
        onError: (error) => {
            console.error('Error importing students:', error);
            toast.error('Failed to import students');
        },
    });
};
