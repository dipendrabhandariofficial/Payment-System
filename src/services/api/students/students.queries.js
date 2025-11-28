import { useQuery } from '@tanstack/react-query';
import { studentsApi } from './students.api';
import { QUERY_KEYS } from '../queryKeys';

export const useStudents = (options = {}) => {
    return useQuery({
        queryKey: QUERY_KEYS.students.all,
        queryFn: studentsApi.getAll,
        ...options,
    });
};

export const useStudent = (id, options = {}) => {
    return useQuery({
        queryKey: QUERY_KEYS.students.detail(id),
        queryFn: () => studentsApi.getById(id),
        enabled: !!id,
        ...options,
    });
};
