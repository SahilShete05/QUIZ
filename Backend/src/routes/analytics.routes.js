const express = require("express");

const analyticsController = require("../controllers/analytics.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorize} = require("../middlewares/role.middleware");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Quiz Analytics APIs
 */
/**
 * @swagger
 * /analytics/quiz/{quizId}:
 *   get:
 *     summary: Get overall quiz analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz analytics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Quiz not found
 */

/**
 *  GET /api/analytics/quiz/:quizId
 */

router.get("/quiz/:quizId", protect, analyticsController.getQuizAnalytics);

/**
 * @swagger
 * /analytics/{quizId}/questions:
 *   get:
 *     summary: Get question-wise analytics for a quiz
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Question analytics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Quiz not found
 */

/**
 *  GET /api/analytics/:quizId/questions
 */

router.get("/:quizId/questions", protect, authorize("TEACHER","ADMIN"), analyticsController.getQuestionAnalytics);

module.exports = router;