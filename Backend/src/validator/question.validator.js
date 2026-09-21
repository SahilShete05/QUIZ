const { z } = require("zod");

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const createQuestionSchema = z.object({
  text: z.string().min(3),

  type: z.enum([
    "MCQ",
    "TRUE_FALSE",
    "FILL_IN_BLANK",
    "SHORT_ANSWER",
  ]),

  difficulty: z
    .enum(["EASY", "MEDIUM", "HARD"])
    .optional(),

  categoryId: z.string().uuid().optional(),

  answerKey: z.string().optional(),

  options: z.array(optionSchema).optional(),
});

const updateQuestionSchema =
  createQuestionSchema.partial();

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
};