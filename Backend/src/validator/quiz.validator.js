const { z } = require("zod");

const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z.string().optional(),

  durationSeconds: z
    .number()
    .int()
    .positive(),
});

const updateQuizSchema = z.object({
  title: z.string().min(3).optional(),

  description: z.string().optional(),

  durationSeconds: z.number().int().positive().optional(),

  isPublished: z.boolean().optional(),
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
};