const express = require("express");
const aiController = require("../controllers/ai.controller");
const { generateQuizSchema , addQuestionsSchema, generateReviewSchema} = require("../validator/ai.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware")


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI Quiz Generation APIs
 */

/**
 * @swagger
 * /ai/generate-quiz:
 *   post:
 *     summary: Generate quiz using AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Quiz generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * POST /"/api/ai/generate-quiz
 */

router.post("/generate-quiz", protect, authorize("TEACHER", "ADMIN"), validate(generateQuizSchema), aiController.generateAIQuiz);

/**
 * @swagger
 * /ai/add-questions:
 *   post:
 *     summary: Add AI generated questions to existing quiz
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Questions added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * POST /"/api/ai/add-questions
 */

router.post("/add-questions", protect, authorize("TEACHER", "ADMIN"), validate(addQuestionsSchema), aiController.addQuestionsToQuiz);

/**
 * @swagger
 * /ai/review-attempt:
 *   post:
 *     summary: Generate AI review for quiz attempt
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Review generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * POST /"/api/ai/review-attempt
 */

router.post("/review-attempt", protect, validate(generateReviewSchema), aiController.generateAttemptReview);

module.exports = router;