const prisma = require("../config/prismaClient");

const { sendBadgeEarnedEmail } = require("./emailTemplate.service");

const awardBadge = async (
  userId,
  badgeName
) => {
  const badge =
    await prisma.badge.findUnique({
      where: {
        name: badgeName,
      },
    });

  if (!badge) return;

  const alreadyExists =
    await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id,
      },
    });

  if (alreadyExists) return;

  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  });

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  try {
    await sendBadgeEarnedEmail(
      user.email,
      user.name,
      badge.name
    );
  } catch (error) {
    console.error(
      "BADGE EMAIL ERROR:",
      error
    );
  }
};

module.exports = {
  awardBadge,
};