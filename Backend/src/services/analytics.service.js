
const prisma = require("../config/prismaClient");

const COMPLETED_STATUSES = ["SUBMITTED", "AUTO_SUBMITTED"];
const PASS_PERCENTAGE = 50;

const completedAttemptWhere = {
  status: {
    in: COMPLETED_STATUSES,
  },
};

const getQuizAccessFilter = (user) => {
  if (user.role === "ADMIN") {
    return { isPublished: true };
  }

  return {
    isPublished: true,
    createdById: user.id,
  };
};

const assertQuizAccess = async (quizId, user) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      ...getQuizAccessFilter(user),
    },
    select: {
      id: true,
      title: true,
      durationSeconds: true,
      createdById: true,
      questions: {
        select: {
          questionId: true,
          points: true,
        },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return quiz;
};

const getMaxScore = (quiz) =>
  quiz.questions.reduce((total, question) => total + question.points, 0);

const getPercentage = (score, maxScore) => {
  if (!maxScore || score == null) return 0;
  return (score / maxScore) * 100;
};

const getAverage = (values) => {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const getScoreDistribution = (percentages) => ({
  excellent: percentages.filter((score) => score >= 80).length,
  good: percentages.filter((score) => score >= 60 && score < 80).length,
  average: percentages.filter((score) => score >= 40 && score < 60).length,
  poor: percentages.filter((score) => score < 40).length,
});

/**
 * Groups attempts by quiz in one pass.
 * Avoids repeatedly scanning the full attempts array for each quiz.
 */
const groupAttemptsByQuiz = (attempts) => {
  const grouped = new Map();

  for (const attempt of attempts) {
    if (!grouped.has(attempt.quizId)) {
      grouped.set(attempt.quizId, []);
    }

    grouped.get(attempt.quizId).push(attempt);
  }

  return grouped;
};

const getQuizPerformance = (quizzes, attempts) => {
  const attemptsByQuiz = groupAttemptsByQuiz(attempts);

  return quizzes.map((quiz) => {
    const quizAttempts = attemptsByQuiz.get(quiz.id) ?? [];
    const maxScore = getMaxScore(quiz);

    const percentages = quizAttempts.map((attempt) =>
      getPercentage(attempt.score, maxScore),
    );

    const passedCount = percentages.filter(
      (percentage) => percentage >= PASS_PERCENTAGE,
    ).length;

    return {
      quizId: quiz.id,
      title: quiz.title,
      totalAttempts: quizAttempts.length,
      totalStudents: new Set(quizAttempts.map((attempt) => attempt.userId))
        .size,
      averageScorePercentage: round(getAverage(percentages)),
      passRate: quizAttempts.length
        ? round((passedCount / quizAttempts.length) * 100)
        : 0,
    };
  });
};

const getQuizAnalytics = async (quizId, user) => {
  const quiz = await assertQuizAccess(quizId, user);
  const maxScore = getMaxScore(quiz);

  const attempts = await prisma.attempt.findMany({
    where: {
      quizId,
      ...completedAttemptWhere,
    },
    select: {
      id: true,
      userId: true,
      score: true,
      completionTimeSeconds: true,
      submittedAt: true,
      startedAt: true,
    },
  });

  const percentages = attempts.map((attempt) =>
    getPercentage(attempt.score, maxScore),
  );

  const scores = attempts
    .map((attempt) => attempt.score)
    .filter((score) => score != null);

  const durations = attempts
    .map((attempt) => attempt.completionTimeSeconds)
    .filter((duration) => duration != null);

  const passedCount = percentages.filter(
    (percentage) => percentage >= PASS_PERCENTAGE,
  ).length;

  return {
    quizId: quiz.id,
    quizTitle: quiz.title,
    maxScore,
    totalQuestions: quiz.questions.length,
    totalAttempts: attempts.length,
    totalStudents: new Set(attempts.map((attempt) => attempt.userId)).size,
    averageScore: round(getAverage(scores)),
    averageScorePercentage: round(getAverage(percentages)),
    highestScore: scores.length ? Math.max(...scores) : 0,
    lowestScore: scores.length ? Math.min(...scores) : 0,
    averageCompletionTimeSeconds: round(getAverage(durations)),
    passRate: attempts.length
      ? round((passedCount / attempts.length) * 100)
      : 0,
    scoreDistribution: getScoreDistribution(percentages),
  };
};

const getQuestionAnalytics = async (quizId, user) => {
  const quiz = await assertQuizAccess(quizId, user);

  const quizQuestions = await prisma.quizQuestion.findMany({
    where: { quizId },
    select: {
      questionId: true,
      points: true,
      order: true,
      question: {
        select: {
          id: true,
          text: true,
          difficulty: true,
          type: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const questionIds = quizQuestions.map((item) => item.questionId);

  // Aggregate answer counts in PostgreSQL rather than fetching every answer.
  const groupedAnswers = questionIds.length
    ? await prisma.answer.groupBy({
        by: ["questionId", "isCorrect"],
        where: {
          questionId: { in: questionIds },
          attempt: {
            quizId,
            ...completedAttemptWhere,
          },
          isCorrect: { not: null },
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const answersByQuestion = new Map();

  for (const group of groupedAnswers) {
    if (!answersByQuestion.has(group.questionId)) {
      answersByQuestion.set(group.questionId, {
        totalAnswers: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      });
    }

    const stats = answersByQuestion.get(group.questionId);
    const count = group._count._all;

    stats.totalAnswers += count;

    if (group.isCorrect === true) {
      stats.correctAnswers += count;
    } else if (group.isCorrect === false) {
      stats.wrongAnswers += count;
    }
  }

  const analytics = quizQuestions.map((item) => {
    const stats = answersByQuestion.get(item.questionId) ?? {
      totalAnswers: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
    };

    return {
      questionId: item.question.id,
      question: item.question.text,
      type: item.question.type,
      difficulty: item.question.difficulty,
      points: item.points,
      ...stats,
      accuracy: stats.totalAnswers
        ? round((stats.correctAnswers / stats.totalAnswers) * 100)
        : 0,
    };
  });

  return {
    quizId: quiz.id,
    quizTitle: quiz.title,
    totalQuestions: analytics.length,
    analytics,
  };
};

const getQuizAttemptsIntegrity = async (
  quizId,
  user,
  { page = 1, limit = 50 } = {},
) => {
  const quiz = await assertQuizAccess(quizId, user);

  page = Math.max(1, Number.parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));

  const where = {
    quizId,
    ...completedAttemptWhere,
  };

  const [total, attempts] = await prisma.$transaction([
    prisma.attempt.count({ where }),
    prisma.attempt.findMany({
      where,
      select: {
        id: true,
        status: true,
        score: true,
        startedAt: true,
        submittedAt: true,
        completionTimeSeconds: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        events: {
          select: {
            eventType: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const results = attempts.map((attempt) => {
    const eventCounts = {
      TAB_SWITCH: 0,
      COPY_ATTEMPT: 0,
      PASTE_ATTEMPT: 0,
      RIGHT_CLICK_ATTEMPT: 0,
    };

    for (const event of attempt.events) {
      if (Object.hasOwn(eventCounts, event.eventType)) {
        eventCounts[event.eventType] += 1;
      }
    }

    const totalViolations = Object.values(eventCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      attemptId: attempt.id,
      student: attempt.user,
      status: attempt.status,
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      completionTimeSeconds: attempt.completionTimeSeconds,
      eventCounts,
      totalViolations,
      riskLevel:
        totalViolations >= 10
          ? "HIGH"
          : totalViolations >= 5
            ? "MEDIUM"
            : "LOW",
    };
  });

  return {
    quizId: quiz.id,
    quizTitle: quiz.title,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    attempts: results,
  };
};

const getOverallAnalytics = async (user) => {
  const quizzes = await prisma.quiz.findMany({
    where: getQuizAccessFilter(user),
    select: {
      id: true,
      title: true,
      createdById: true,
      createdAt: true,
      questions: {
        select: {
          points: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const quizIds = quizzes.map((quiz) => quiz.id);

  const attempts = quizIds.length
    ? await prisma.attempt.findMany({
        where: {
          quizId: { in: quizIds },
          ...completedAttemptWhere,
        },
        select: {
          id: true,
          quizId: true,
          userId: true,
          score: true,
          completionTimeSeconds: true,
          submittedAt: true,
        },
      })
    : [];

  const percentages = attempts.map((attempt) => {
    const quiz = quizzes.find((item) => item.id === attempt.quizId);
    return getPercentage(attempt.score, quiz ? getMaxScore(quiz) : 0);
  });

  const scores = attempts
    .map((attempt) => attempt.score)
    .filter((score) => score != null);

  const durations = attempts
    .map((attempt) => attempt.completionTimeSeconds)
    .filter((duration) => duration != null);

  const passedCount = percentages.filter(
    (percentage) => percentage >= PASS_PERCENTAGE,
  ).length;

  const quizPerformance = getQuizPerformance(quizzes, attempts);

  return {
    summary: {
      totalPublishedQuizzes: quizzes.length,
      totalCompletedAttempts: attempts.length,
      totalStudents: new Set(attempts.map((attempt) => attempt.userId)).size,
      averageScore: round(getAverage(scores)),
      averageScorePercentage: round(getAverage(percentages)),
      averageCompletionTimeSeconds: round(getAverage(durations)),
      passRate: attempts.length
        ? round((passedCount / attempts.length) * 100)
        : 0,
      scoreDistribution: getScoreDistribution(percentages),
    },
    quizPerformance,
  };
};

const getQuizComparison = async (user) => {
  const overview = await getOverallAnalytics(user);

  return {
    quizzes: overview.quizPerformance.sort(
      (a, b) => b.averageScorePercentage - a.averageScorePercentage,
    ),
  };
};

const getAnalyticsTrends = async (user, { days = 30 } = {}) => {
  days = Math.min(365, Math.max(1, Number.parseInt(days, 10) || 30));

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (days - 1));
  fromDate.setHours(0, 0, 0, 0);

  const quizzes = await prisma.quiz.findMany({
    where: getQuizAccessFilter(user),
    select: {
      id: true,
      questions: {
        select: {
          points: true,
        },
      },
    },
  });

  const quizMaxScores = new Map(
    quizzes.map((quiz) => [quiz.id, getMaxScore(quiz)]),
  );

  const quizIds = quizzes.map((quiz) => quiz.id);

  const attempts = quizIds.length
    ? await prisma.attempt.findMany({
        where: {
          quizId: { in: quizIds },
          ...completedAttemptWhere,
          submittedAt: { gte: fromDate },
        },
        select: {
          quizId: true,
          score: true,
          submittedAt: true,
        },
        orderBy: { submittedAt: "asc" },
      })
    : [];

  const byDate = new Map();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + offset);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    byDate.set(key, {
      date: key,
      completedAttempts: 0,
      scorePercentages: [],
    });
  }

  for (const attempt of attempts) {
    if (!attempt.submittedAt) continue;

    const date = attempt.submittedAt;
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const entry = byDate.get(key);
    if (!entry) continue;

    entry.completedAttempts += 1;
    entry.scorePercentages.push(
      getPercentage(
        attempt.score,
        quizMaxScores.get(attempt.quizId) ?? 0,
      ),
    );
  }

  return {
    periodDays: days,
    trends: Array.from(byDate.values()).map((entry) => ({
      date: entry.date,
      completedAttempts: entry.completedAttempts,
      averageScorePercentage: round(getAverage(entry.scorePercentages)),
    })),
  };
};

const getTeacherAnalytics = async () => {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    select: {
      id: true,
      name: true,
      email: true,
      quizzesCreated: {
        where: { isPublished: true },
        select: {
          id: true,
          questions: {
            select: {
              points: true,
            },
          },
          attempts: {
            where: completedAttemptWhere,
            select: {
              userId: true,
              score: true,
            },
          },
        },
      },
    },
  });

  return {
    teachers: teachers.map((teacher) => {
      const quizzes = teacher.quizzesCreated;
      const attempts = quizzes.flatMap((quiz) => {
        const maxScore = getMaxScore(quiz);

        return quiz.attempts.map((attempt) => ({
          ...attempt,
          maxScore,
        }));
      });

      const percentages = attempts.map((attempt) =>
        getPercentage(attempt.score, attempt.maxScore),
      );

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        email: teacher.email,
        totalPublishedQuizzes: quizzes.length,
        totalCompletedAttempts: attempts.length,
        totalStudents: new Set(attempts.map((attempt) => attempt.userId)).size,
        averageScorePercentage: round(getAverage(percentages)),
        passRate: attempts.length
          ? round(
              (percentages.filter(
                (percentage) => percentage >= PASS_PERCENTAGE,
              ).length /
                attempts.length) *
                100,
            )
          : 0,
      };
    }),
  };
};

module.exports = {
  getQuizAnalytics,
  getQuestionAnalytics,
  getQuizAttemptsIntegrity,
  getOverallAnalytics,
  getQuizComparison,
  getAnalyticsTrends,
  getTeacherAnalytics,
};
