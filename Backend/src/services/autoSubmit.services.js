const cron = require("node-cron");
const prisma = require("../config/prismaClient");

const { finalizeAttempt } = require("../services/attempt.service");

const startAutoSubmitJob = () => {
  // Every 10 seconds (6-field cron: seconds first) instead of every minute,
  // so expired attempts are closed at most ~10s late.
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const attempts =
        await prisma.attempt.findMany({
          where: {
            status: "IN_PROGRESS",
          },
          include: {
            quiz: true,
          },
        });

      for (const attempt of attempts) {
        const endTime =
          new Date(
            attempt.startedAt
          ).getTime() +
          attempt.quiz
            .durationSeconds *
            1000;

        if (
          Date.now() >= endTime
        ) {
          console.log(
            `Auto submitting ${attempt.id}`
          );

          try {
            await finalizeAttempt(
              attempt.id,
              "AUTO_SUBMITTED"
            );

            console.log(
              `Successfully auto submitted ${attempt.id}`
            );
          } catch (submitError) {
            // The student's browser or the manual submit already finalized it.
            if (
              submitError.code ===
              "ATTEMPT_ALREADY_SUBMITTED"
            ) {
              continue;
            }

            console.error(
              `Failed to auto submit ${attempt.id}`,
              submitError
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "AUTO SUBMIT JOB ERROR",
        error
      );
    }
  });
};

module.exports = {
  startAutoSubmitJob,
};