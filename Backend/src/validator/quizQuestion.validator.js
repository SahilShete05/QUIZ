const { z } = require("zod");

const addQuestionToQuizSchema = z.object({
  questionId: z.string().uuid(),
  order: z.number().int().positive(),
  points: z.number().int().positive(),
});

module.exports = {
  addQuestionToQuizSchema,
};