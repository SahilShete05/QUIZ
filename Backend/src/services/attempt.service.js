const prisma = require("../config/prismaClient");
const { processRewards } = require("./reward.service");

// Text answers are graded against the question's answerKey. Matching ignores
// case, extra spaces and surrounding punctuation. An answerKey may list
// several accepted answers separated by "|".
const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[\s.,;:!?'"]+|[\s.,;:!?'"]+$/g, "");

const matchesAnswerKey = (response, answerKey) => {
  const given = normalizeText(response);

  if (!given) return false;

  return String(answerKey)
    .split("|")
    .map(normalizeText)
    .filter(Boolean)
    .includes(given);
};

async function finalizeAttempt(
  attemptId,
  status = "SUBMITTED"
) {
  // Emails queued by rewards; sent only after the transaction commits.
  const afterCommit = [];

  const result = await prisma.$transaction(
    async (tx) => {
      // Atomic claim: only ONE caller can move the attempt out of
      // IN_PROGRESS, so manual submit, auto-submit, anti-cheat submit and
      // the cron job can never finalize (or reward) the same attempt twice.
      const claimed =
        await tx.attempt.updateMany({
          where: {
            id: attemptId,
            status: "IN_PROGRESS",
          },
          data: {
            status,
          },
        });

      if (claimed.count === 0) {
        const existing =
          await tx.attempt.findUnique({
            where: {
              id: attemptId,
            },
          });

        if (!existing) {
          throw new Error(
            "Attempt not found"
          );
        }

        const error = new Error(
          "Attempt already submitted"
        );

        error.code =
          "ATTEMPT_ALREADY_SUBMITTED";

        throw error;
      }

      const attempt =
        await tx.attempt.findUnique({
          where: {
            id: attemptId,
          },
          include: {
            quiz: true,
            answers: {
              include: {
                selectedOption: true,
                question: true,
              },
            },
          },
        });

      let score = 0;

      for (const answer of attempt.answers) {
        const quizQuestion =
          await tx.quizQuestion.findFirst({
            where: {
              quizId: attempt.quizId,
              questionId:
                answer.questionId,
            },
          });

        const points =
          quizQuestion?.points || 1;

        // Option questions use the chosen option; text questions use the
        // answer key. No key means the answer stays ungraded (null).
        let correct = null;

        if (answer.selectedOption) {
          correct =
            answer.selectedOption
              .isCorrect;
        } else if (
          answer.textResponse != null &&
          answer.question?.answerKey
        ) {
          correct = matchesAnswerKey(
            answer.textResponse,
            answer.question.answerKey
          );
        }

        await tx.answer.update({
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
        await tx.attempt.update({
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
        await tx.quizQuestion.aggregate(
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
          maxScore,
          tx,
          afterCommit
        );

      return {
        attempt,
        updatedAttempt,
        score,
        maxScore,
        rewardResult,
      };
    },
    {
      maxWait: 5000,
      timeout: 15000,
    }
  );

  for (const sendEmail of afterCommit) {
    await sendEmail();
  }

  return result;
}

module.exports = {
  finalizeAttempt,
};