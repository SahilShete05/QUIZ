const prisma = require("../config/prismaClient");
const { awardBadge } = require("./badge.service");
const { addXP } = require("./xp.service");

const processRewards = async (
  userId,
  score,
  maxScore,
  db = prisma,
  afterCommit = null
) => {
  const xpEarned = score * 10;

  const updatedUser =
    await addXP(
      userId,
      xpEarned,
      db,
      afterCommit
    );

  const attempts =
    await db.attempt.count({
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
      "First Quiz",
      db,
      afterCommit
    );
  }

  if (
    maxScore > 0 &&
    score === maxScore
  ) {
    await awardBadge(
      userId,
      "Perfect Score",
      db,
      afterCommit
    );
  }

  if (attempts >= 10) {
    await awardBadge(
      userId,
      "Quiz Master",
      db,
      afterCommit
    );
  }

  if (updatedUser.level >= 5) {
    await awardBadge(
      userId,
      "Level 5",
      db,
      afterCommit
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