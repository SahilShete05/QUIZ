const express = require("express");

const { generateAttemptReview} = require("../controllers/aiReview.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI Review
 *   description: AI Attempt Review APIs
 */

/**
 * @swagger
 * /ai/attempt-review/{attemptId}:
 *   get:
 *     summary: Generate AI review for a completed attempt
 *     tags: [AI Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI review generated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 */

/**
 * GET /api/ai/attempt-review/:attemptId
 */

router.get("/attempt-review/:attemptId", protect, generateAttemptReview);

module.exports = router;