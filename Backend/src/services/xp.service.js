const prisma = require("../config/prismaClient");

const { sendLevelUpEmail } = require("./emailTemplate.service");

const addXP = async (
  userId,
  xpAmount
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  const oldLevel =
    user.level;

  const newXP =
    user.xp + xpAmount;

  const newLevel =
    Math.floor(newXP / 100) + 1;

  const updatedUser =
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

  if (newLevel > oldLevel) {
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
  }

  return updatedUser;
};

module.exports = {
  addXP,
};