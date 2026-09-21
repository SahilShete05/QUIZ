const { z } = require("zod");

// Create a brand new AI-generated quiz
const generateQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),

  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters")
    .max(100, "Topic cannot exceed 100 characters"),

  difficulty: z.enum([
    "EASY",
    "MEDIUM",
    "HARD",
  ]),

  questionCount: z
    .number()
    .int()
    .min(1, "Minimum 1 question")
    .max(20, "Maximum 20 questions"),
});

const addQuestionsSchema = z.object({
  quizId: z
    .string()
    .uuid("Invalid quiz ID"),

  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters")
    .max(100, "Topic cannot exceed 100 characters"),

  difficulty: z.enum([
    "EASY",
    "MEDIUM",
    "HARD",
  ]),

  questionCount: z
    .number()
    .int()
    .min(1, "Minimum 1 question")
    .max(20, "Maximum 20 questions"),
});


const generateReviewSchema = z.object({
  attemptId: z.string().uuid(),
});



module.exports = {
  generateQuizSchema,
  addQuestionsSchema,
  generateReviewSchema
};