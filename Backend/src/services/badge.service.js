const prisma = require("../config/prismaClient");

const { sendBadgeEarnedEmail } = require("./emailTemplate.service");

const awardBadge = async (
  userId,
  badgeName,
  db = prisma,
  afterCommit = null
) => {
  const badge =
    await db.badge.findUnique({
      where: {
        name: badgeName,
      },
    });

  if (!badge) return;

  const alreadyExists =
    await db.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id,
      },
    });

  if (alreadyExists) return;

  await db.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  });

  const user =
    await db.user.findUnique({
      where: {
        id: userId,
      },
    });

  const sendEmail = async () => {
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

  // Inside a transaction the email is sent only after commit.
  if (afterCommit) {
    afterCommit.push(sendEmail);
  } else {
    await sendEmail();
  }
};

module.exports = {
  awardBadge,
};