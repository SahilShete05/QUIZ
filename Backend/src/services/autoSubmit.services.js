const cron = require("node-cron");
const prisma = require("../config/prismaClient");

const { finalizeAttempt } = require("../services/attempt.service");

const startAutoSubmitJob = () => {
  cron.schedule("*/1 * * * *", async () => {
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