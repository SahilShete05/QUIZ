const { z } = require("zod");

const answerQuestionSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid().optional(),
  textResponse: z.string().optional(),
});

module.exports = {
  answerQuestionSchema,
};