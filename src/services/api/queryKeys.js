export const QUERY_KEYS = {
    students: {
        all: ['students'],
        detail: (id) => ['students', id],
        byCourse: (courseId) => ['students', 'course', courseId],
    },
    payments: {
        all: ['payments'],
        detail: (id) => ['payments', id],
        byStudent: (studentId) => ['payments', 'student', studentId],
    },
    auth: {
        user: ['auth', 'user'],
    },
    courses: {
        all: ['courses'],
        detail: (id) => ['courses', id],
    },
};
