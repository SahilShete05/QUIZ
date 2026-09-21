const prisma = require("../config/prismaClient");
const { awardBadge } = require("./badge.service");
const { addXP } = require("./xp.service");

const processRewards = async (
  userId,
  score,
  maxScore
) => {
  const xpEarned = score * 10;

  const updatedUser =
    await addXP(
      userId,
      xpEarned
    );

  const attempts =
    await prisma.attempt.count({
      where: {
        userId,
        status: {
          in: [
            "SUBMITTED",
            "AUTO_SUBMITTED",
          ],
        },
      },
    });

  if (attempts === 1) {
    await awardBadge(
      userId,
      "First Quiz"
    );
  }

  if (
    maxScore > 0 &&
    score === maxScore
  ) {
    await awardBadge(
      userId,
      "Perfect Score"
    );
  }

  if (attempts >= 10) {
    await awardBadge(
      userId,
      "Quiz Master"
    );
  }

  if (updatedUser.level >= 5) {
    await awardBadge(
      userId,
      "Level 5"
    );
  }

  return {
    xpEarned,
    level: updatedUser.level,
  };
};

module.exports = {
  processRewards,
};