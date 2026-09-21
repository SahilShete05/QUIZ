const prisma = require("../config/prismaClient");

const getTeacherDashboardData = async (teacherId) => {
  const totalQuizzes = await prisma.quiz.count({
    where: {
      createdById: teacherId,
    },
  });

  const publishedQuizzes = await prisma.quiz.count({
    where: {
      createdById: teacherId,
      isPublished: true,
    },
  });

  const totalQuestions =
    await prisma.quizQuestion.count({
      where: {
        quiz: {
          createdById: teacherId,
        },
      },
    });

  const totalAttempts =
    await prisma.attempt.count({
      where: {
        quiz: {
          createdById: teacherId,
        },
      },
    });

  const autoSubmittedAttempts =
    await prisma.attempt.count({
      where: {
        status: "AUTO_SUBMITTED",
        quiz: {
          createdById: teacherId,
        },
      },
    });

  const scoreStats =
    await prisma.attempt.aggregate({
      where: {
        status: {
          in: [
            "SUBMITTED",
            "AUTO_SUBMITTED",
          ],
        },
        quiz: {
          createdById: teacherId,
        },
      },
      _avg: {
        score: true,
      },
    });

  const uniqueStudents =
    await prisma.attempt.findMany({
      where: {
        quiz: {
          createdById: teacherId,
        },
      },
      distinct: ["userId"],
      select: {
        userId: true,
      },
    });

  const recentQuizzes =
    await prisma.quiz.findMany({
      where: {
        createdById: teacherId,
      },
      select: {
        id: true,
        title: true,
        isPublished: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

  const recentAttempts =
    await prisma.attempt.findMany({
      where: {
        quiz: {
          createdById: teacherId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        quiz: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 10,
    });

  return {
    stats: {
      totalQuizzes,
      publishedQuizzes,
      totalQuestions,
      totalAttempts,
      totalStudents:
        uniqueStudents.length,
      autoSubmittedAttempts,
      averageScore:
        Number(
          (
            scoreStats._avg.score || 0
          ).toFixed(2)
        ),
    },

    recentQuizzes,
    recentAttempts,
  };
};

module.exports = {
  getTeacherDashboardData,
};