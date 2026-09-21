const prisma = require("../config/prismaClient");

// ======================
// GLOBAL LEADERBOARD
// ======================

const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
      },
      orderBy: [
        {
          xp: "desc",
        },
        {
          level: "desc",
        },
      ],
      take: 20,
    });

    const leaderboard = users.map(
      (user, index) => ({
        rank: index + 1,
        ...user,
      })
    );

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          xp: true,
        },
      });

    let currentUserRank = null;

    if (currentUser) {
      currentUserRank =
        (
          await prisma.user.count({
            where: {
              xp: {
                gt: currentUser.xp,
              },
            },
          })
        ) + 1;
    }

    return res.status(200).json({
      success: true,
      count: leaderboard.length,
      currentUserRank,
      leaderboard,
    });
  } catch (error) {
    console.error(
      "GLOBAL LEADERBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================
// QUIZ LEADERBOARD
// ======================

const getQuizLeaderboard = async (
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

    const attempts =
      await prisma.attempt.findMany({
        where: {
          quizId,
          status: {
            in: [
              "SUBMITTED",
              "AUTO_SUBMITTED",
            ],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: [
          {
            score: "desc",
          },
          {
            completionTimeSeconds:
              "asc",
          },
        ],
        take: 20,
      });

    const leaderboard =
      attempts.map(
        (attempt, index) => ({
          rank: index + 1,
          userId:
            attempt.user.id,
          name:
            attempt.user.name,
          level:
            attempt.user.level,
          xp:
            attempt.user.xp,
          score:
            attempt.score,
          completionTimeSeconds:
            attempt.completionTimeSeconds,
        })
      );

    return res.status(200).json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
      },
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    console.error(
      "QUIZ LEADERBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getQuizLeaderboard,
};