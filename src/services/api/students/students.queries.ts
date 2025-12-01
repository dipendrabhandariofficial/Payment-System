import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { studentsApi } from "./students.api";
import { QUERY_KEYS } from "../queryKeys";
import { Student } from "../../../types";
import { AxiosError } from "axios";

export const useStudents = (
  options?: Omit<UseQueryOptions<Student[], AxiosError>, "queryKey" | "queryFn">
): UseQueryResult<Student[], AxiosError> => {
  return useQuery({
    queryKey: QUERY_KEYS.students.all,
    queryFn: studentsApi.getAll,
    ...options,
  });
};

export const useStudent = (
  id: string,
  options?: Omit<
    UseQueryOptions<Student, AxiosError>,
    "queryKey" | "queryFn" | "enabled"
  >
): UseQueryResult<Student, AxiosError> => {
  return useQuery({
    queryKey: QUERY_KEYS.students.detail(id),
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
    ...options,
  });
};
