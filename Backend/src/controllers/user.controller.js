
const prisma = require("../config/prismaClient");
const bcrypt = require("bcryptjs");

const VALID_ROLES = ["STUDENT", "TEACHER", "ADMIN"];
const COMPLETED_STATUSES = ["SUBMITTED", "AUTO_SUBMITTED"];

// Never expose password hashes or password-reset tokens.
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  xp: true,
  level: true,
  createdAt: true,
  updatedAt: true,
};

// Require ADMIN role for administrative operations.
const requireAdmin = (req, res) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });

    return false;
  }

  return true;
};

// =====================
// GET CURRENT PROFILE
// =====================

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    const [totalAttempts, scoreAggregate] = await Promise.all([
      prisma.attempt.count({
        where: {
          userId: user.id,
          status: { in: COMPLETED_STATUSES },
        },
      }),
      prisma.attempt.aggregate({
        where: {
          userId: user.id,
          status: { in: COMPLETED_STATUSES },
        },
        _sum: { score: true },
      }),
    ]);

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
        totalScore: scoreAggregate._sum.score || 0,
        badges: user.badges,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("getProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// ADMIN: LIST USERS
// GET /api/users
// =====================

const getUsers = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const role =
      typeof req.query.role === "string"
        ? req.query.role.toUpperCase()
        : undefined;

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role filter",
      });
    }

    const where = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

// =====================
// ADMIN: GET USER BY ID
// GET /api/users/:id
// =====================

const getUserById = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...safeUserSelect,
        _count: {
          select: {
            attempts: true,
            quizzesCreated: true,
            badges: true,
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

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user",
    });
  }
};

// =====================
// UPDATE OWN PROFILE
// PATCH /api/users/profile
// =====================

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid name is required",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 100 characters",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name.trim(),
      },
      select: safeUserSelect,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: user,
    });
  } catch (error) {
    console.error("updateProfile error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};



// =====================
// ADMIN: UPDATE USER ROLE
// PATCH /api/users/:id/role
// =====================

const updateUserRole = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { role } = req.body || {};

    if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    // Prevent an administrator from accidentally removing
    // their own administrative role through this endpoint.
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Avoid demoting the last administrator.
    if (
      existingUser.role === "ADMIN" &&
      role !== "ADMIN"
    ) {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "The last administrator cannot be demoted",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: safeUserSelect,
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("updateUserRole error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user role",
    });
  }
};

module.exports = {
  getProfile,
  getUsers,
  getUserById,
  updateProfile,
  updateUserRole,
};
