export const roleLandingPaths = {
  STUDENT: '/student/dashboard',
  TEACHER: '/teacher/dashboard',
  ADMIN: '/admin/dashboard',
};

export function getRoleLandingPath(role) {
  return roleLandingPaths[role] || '/login';
}
