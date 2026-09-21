const prisma = require("../config/prismaClient");

// =====================
// CREATE BADGE
// =====================

const createBadge = async (req, res) => {
  try {
    const { name, description, iconUrl } =
      req.body;

    const existing =
      await prisma.badge.findUnique({
        where: {
          name,
        },
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Badge already exists",
      });
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        iconUrl,
      },
    });

    return res.status(201).json({
      success: true,
      badge,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET ALL BADGES
// =====================

const getAllBadges = async (req, res) => {
  try {
    const badges =
      await prisma.badge.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: badges.length,
      badges,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET MY BADGES
// =====================

const getMyBadges = async (req, res) => {
  try {
    const badges =
      await prisma.userBadge.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          badge: true,
        },
        orderBy: {
          awardedAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: badges.length,
      badges,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createBadge,
  getAllBadges,
  getMyBadges,
};