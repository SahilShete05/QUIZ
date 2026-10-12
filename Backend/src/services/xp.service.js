const prisma = require("../config/prismaClient");

const { sendLevelUpEmail } = require("./emailTemplate.service");

const addXP = async (
  userId,
  xpAmount,
  db = prisma,
  afterCommit = null
) => {
  // Atomic increment: the database adds the XP itself, so two attempts
  // finishing at the same time cannot overwrite each other's XP.
  const user =
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        xp: {
          increment: xpAmount,
        },
      },
    });

  const oldLevel =
    user.level;

  const newXP =
    user.xp;

  const newLevel =
    Math.floor(newXP / 100) + 1;

  let updatedUser = user;

  if (newLevel !== oldLevel) {
    updatedUser =
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          level: newLevel,
        },
      });
  }

  if (newLevel > oldLevel) {
    const sendEmail = async () => {
      try {
        await sendLevelUpEmail(
          updatedUser.email,
          updatedUser.name,
          newLevel
        );
      } catch (error) {
        console.error(
          "LEVEL EMAIL ERROR:",
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
  }

  return updatedUser;
};

module.exports = {
  addXP,
};