const prisma = require("../config/prismaClient");
const { processRewards } = require("./reward.service");

async function finalizeAttempt(
  attemptId,
  status = "SUBMITTED"
) {
  const attempt =
    await prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        quiz: true,
        answers: {
          include: {
            selectedOption: true,
          },
        },
      },
    });

  if (!attempt) {
    throw new Error(
      "Attempt not found"
    );
  }

  if (
    attempt.status === "SUBMITTED" ||
    attempt.status === "AUTO_SUBMITTED"
  ) {
    throw new Error(
      "Attempt already submitted"
    );
  }

  let score = 0;

  for (const answer of attempt.answers) {
    const quizQuestion =
      await prisma.quizQuestion.findFirst({
        where: {
          quizId: attempt.quizId,
          questionId:
            answer.questionId,
        },
      });

    const points =
      quizQuestion?.points || 1;

    const correct =
      answer.selectedOption &&
      answer.selectedOption
        .isCorrect;

    await prisma.answer.update({
      where: {
        id: answer.id,
      },
      data: {
        isCorrect: correct,
        pointsAwarded:
          correct
            ? points
            : 0,
      },
    });

    if (correct) {
      score += points;
    }
  }

  const completionTimeSeconds =
    Math.floor(
      (
        Date.now() -
        new Date(
          attempt.startedAt
        ).getTime()
      ) / 1000
    );

  const updatedAttempt =
    await prisma.attempt.update({
      where: {
        id: attemptId,
      },
      data: {
        status,
        score,
        submittedAt:
          new Date(),
        completionTimeSeconds,
      },
    });

  const maxScoreData =
    await prisma.quizQuestion.aggregate(
      {
        where: {
          quizId:
            attempt.quizId,
        },
        _sum: {
          points: true,
        },
      }
    );

  const maxScore =
    maxScoreData._sum.points || 0;

  const rewardResult =
    await processRewards(
      attempt.userId,
      score,
      maxScore
    );

  return {
    attempt,
    updatedAttempt,
    score,
    maxScore,
    rewardResult,
  };
}

module.exports = {
  finalizeAttempt,
};