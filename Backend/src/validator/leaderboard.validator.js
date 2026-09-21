const { z } = require("zod");

const quizLeaderboardSchema = z.object({
  quizId: z.uuid(),
});

module.exports = {
  quizLeaderboardSchema,
};