export const QUERY_KEYS = {
  students: {
    all: ["students"] as const,
    detail: (id: string) => ["students", id] as const,
    byCourse: (courseId: string) => ["students", "course", courseId] as const,
  },
  payments: {
    all: ["payments"] as const,
    detail: (id: string) => ["payments", id] as const,
    byStudent: (studentId: string) =>
      ["payments", "student", studentId] as const,
  },
  auth: {
    user: ["auth", "user"] as const,
  },
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", id] as const,
  },
};
