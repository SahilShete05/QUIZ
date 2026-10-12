
const prisma = require("../config/prismaClient");

const COMPLETED_STATUSES = ["SUBMITTED", "AUTO_SUBMITTED"];

const getAdminDashboard = async () => {
  const startedAt = Date.now();

  const [
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalQuizzes,
    totalPublishedQuizzes,
    totalQuestions,
    totalAttempts,
    totalCompletedAttempts,
    totalCategories,
    totalBadges,
    recentQuizzes,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: "STUDENT" },
    }),

    prisma.user.count({
      where: { role: "TEACHER" },
    }),

    prisma.user.count({
      where: { role: "ADMIN" },
    }),

    prisma.quiz.count(),

    prisma.quiz.count({
      where: { isPublished: true },
    }),

    prisma.question.count(),

    prisma.attempt.count(),

    prisma.attempt.count({
      where: {
        status: { in: COMPLETED_STATUSES },
      },
    }),

    prisma.category.count(),

    prisma.badge.count(),

    prisma.quiz.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        isPublished: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    }),

    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const dashboard = {
    stats: {
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalUsers: totalStudents + totalTeachers + totalAdmins,
      totalQuizzes,
      totalPublishedQuizzes,
      totalDraftQuizzes: totalQuizzes - totalPublishedQuizzes,
      totalQuestions,
      totalAttempts,
      totalCompletedAttempts,
      totalCategories,
      totalBadges,
    },
    recentQuizzes,
    recentUsers,
  };

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[Admin Dashboard] Service completed in ${Date.now() - startedAt}ms`
    );
  }

  return dashboard;
};

module.exports = {
  getAdminDashboard,
};
