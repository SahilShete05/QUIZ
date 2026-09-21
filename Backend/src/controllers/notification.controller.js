const prisma = require("../config/prismaClient");

// =====================
// GET MY NOTIFICATIONS
// =====================

const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
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
// MARK AS READ
// =====================

const markAsRead = async (
  req,
  res
) => {
  try {
    const { notificationId } =
      req.params;

    const notification =
      await prisma.notification.findUnique({
        where: {
          id: notificationId,
        },
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    if (
      notification.userId !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    const updated =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });

    return res.status(200).json({
      success: true,
      notification: updated,
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
  getNotifications,
  markAsRead,
};