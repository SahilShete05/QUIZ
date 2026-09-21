const prisma = require("../config/prismaClient");

// =====================
// QUIZ ANALYTICS
// =====================

const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      quiz.createdById !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        quizId,
        status: {
          in: [
            "SUBMITTED",
            "AUTO_SUBMITTED",
          ],
        },
      },
      select: {
        score: true,
        completionTimeSeconds: true,
        userId: true,
      },
    });

    const totalAttempts = attempts.length;

    const totalStudents = new Set(
      attempts.map((a) => a.userId)
    ).size;

    const scores = attempts.map(
      (a) => a.score || 0
    );

    const averageScore =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) /
          scores.length
        : 0;

    const highestScore =
      scores.length > 0
        ? Math.max(...scores)
        : 0;

    const lowestScore =
      scores.length > 0
        ? Math.min(...scores)
        : 0;

    const avgCompletionTime =
      attempts.length > 0
        ? attempts.reduce(
            (sum, a) =>
              sum +
              (a.completionTimeSeconds || 0),
            0
          ) / attempts.length
        : 0;

    const totalStarted =
      await prisma.attempt.count({
        where: {
          quizId,
        },
      });

    const completionRate =
      totalStarted > 0
        ? (
            (totalAttempts /
              totalStarted) *
            100
          ).toFixed(2)
        : 0;

    // =====================
    // MAX SCORE
    // =====================

    const maxScoreData =
      await prisma.quizQuestion.aggregate({
        where: {
          quizId,
        },
        _sum: {
          points: true,
        },
      });

    const maxScore =
      maxScoreData._sum.points || 0;

    // =====================
    // PASS RATE
    // =====================

    const passedAttempts =
      attempts.filter((attempt) => {
        const percentage =
          maxScore > 0
            ? ((attempt.score || 0) /
                maxScore) *
              100
            : 0;

        return percentage >= 50;
      }).length;

    const passRate =
      totalAttempts > 0
        ? (
            (passedAttempts /
              totalAttempts) *
            100
          ).toFixed(2)
        : 0;

    // =====================
    // SCORE DISTRIBUTION
    // =====================

    const scoreDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
    };

    for (const attempt of attempts) {
      const percentage =
        maxScore > 0
          ? ((attempt.score || 0) /
              maxScore) *
            100
          : 0;

      if (percentage >= 80) {
        scoreDistribution.excellent++;
      } else if (percentage >= 60) {
        scoreDistribution.good++;
      } else if (percentage >= 40) {
        scoreDistribution.average++;
      } else {
        scoreDistribution.poor++;
      }
    }

    return res.status(200).json({
      success: true,
      analytics: {
        quizId,

        maxScore,

        totalAttempts,

        totalStudents,

        averageScore: Number(
          averageScore.toFixed(2)
        ),

        highestScore,

        lowestScore,

        averageCompletionTimeSeconds:
          Number(
            avgCompletionTime.toFixed(2)
          ),

        completionRate: Number(
          completionRate
        ),

        passRate: Number(
          passRate
        ),

        scoreDistribution,
      },
    });
  } catch (error) {
    console.error(
      "QUIZ ANALYTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// QUESTION ANALYTICS
// =====================

const getQuestionAnalytics = async (
  req,
  res
) => {
  try {
    const { quizId } = req.params;

    const quiz =
      await prisma.quiz.findUnique({
        where: {
          id: quizId,
        },
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      quiz.createdById !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const quizQuestions =
      await prisma.quizQuestion.findMany({
        where: {
          quizId,
        },
        include: {
          question: true,
        },
        orderBy: {
          order: "asc",
        },
      });

    const analytics = [];

    for (const item of quizQuestions) {
      const totalAnswers =
        await prisma.answer.count({
          where: {
            questionId:
              item.questionId,
          },
        });

      const correctAnswers =
        await prisma.answer.count({
          where: {
            questionId:
              item.questionId,
            isCorrect: true,
          },
        });

      const wrongAnswers =
        await prisma.answer.count({
          where: {
            questionId:
              item.questionId,
            isCorrect: false,
          },
        });

      const accuracy =
        totalAnswers > 0
          ? (
              (correctAnswers /
                totalAnswers) *
              100
            ).toFixed(2)
          : 0;

      analytics.push({
        questionId:
          item.question.id,

        question:
          item.question.text,

        difficulty:
          item.question.difficulty,

        totalAnswers,

        correctAnswers,

        wrongAnswers,

        accuracy:
          Number(accuracy),
      });
    }

    return res.status(200).json({
      success: true,
      quizId,
      totalQuestions:
        analytics.length,
      analytics,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getQuizAnalytics,
  getQuestionAnalytics,
};