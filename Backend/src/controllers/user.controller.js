const prisma = require("../config/prismaClient");

// =====================
// GET PROFILE
// =====================

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const totalAttempts =
      await prisma.attempt.count({
        where: {
          userId: req.user.id,
          status: "SUBMITTED",
        },
      });

    const scoreAggregate =
      await prisma.attempt.aggregate({
        where: {
          userId: req.user.id,
          status: "SUBMITTED",
        },
        _sum: {
          score: true,
        },
      });

    return res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        totalAttempts,
        totalScore:
          scoreAggregate._sum.score || 0,
        badges: user.badges,
        createdAt: user.createdAt,
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
  getProfile,
};