const prisma = require("../config/prismaClient");

/**
 * GET DASHBOARD
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // User Info
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Attempts
    const totalAttempts = await prisma.attempt.count({
      where: {
        userId,
      },
    });

    const completedAttempts = await prisma.attempt.count({
      where: {
        userId,
        status: {
          in:[
            "SUBMITTED",
            "AUTO_SUBMITTED",
          ]
        }
      },
    });

    // Scores
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        status: {
          in: [
            "SUBMITTED",
            "AUTO_SUBMITTED",
          ]
        }
      },
      select: {
        score: true,
      },
    });

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + (attempt.score || 0),
      0
    );

    const averageScore =
      attempts.length > 0
        ? totalScore / attempts.length
        : 0;

    const highestScore =
      attempts.length > 0
        ? Math.max(...attempts.map(a => a.score || 0))
        : 0;

    // Badges
    const badgeCount = await prisma.userBadge.count({
      where: {
        userId,
      },
    });

    // Recent Attempts
    const recentAttempts =
      await prisma.attempt.findMany({
        where: {
          userId,
        },
        include: {
          quiz: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
        take: 5,
      });

    return res.status(200).json({
      success: true,
      dashboard: {
        user,

        stats: {
          totalAttempts,
          completedAttempts,
          averageScore: Number(
            averageScore.toFixed(2)
          ),
          highestScore,
          xp: user.xp,
          level: user.level,
          badges: badgeCount,
        },

        recentAttempts,
      },
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
  getDashboard,
};