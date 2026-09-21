const prisma = require("../config/prismaClient");

const createNotification = async (
  userId,
  title,
  message
) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

module.exports = {
  createNotification,
};