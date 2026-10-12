
const express = require("express");

const analyticsController = require("../controllers/analytics.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Teacher and Admin Analytics APIs
 */

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get overall analytics
 *     description: Returns analytics for published quizzes and completed attempts only. Teachers see their own quizzes; admins see all published quizzes.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Overall analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /analytics/comparison:
 *   get:
 *     summary: Compare published quizzes
 *     description: Compares quiz performance using submitted and auto-submitted attempts only.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Quiz comparison retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get analytics trends
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *     responses:
 *       200:
 *         description: Daily completed-attempt and average-score trends
 *       400:
 *         description: Invalid days parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /analytics/teachers:
 *   get:
 *     summary: Get teacher performance analytics
 *     description: Admin-only endpoint for comparing teachers' published quizzes and completed attempts.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Teacher analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /analytics/quiz/{quizId}:
 *   get:
 *     summary: Get analytics for a specific quiz
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Quiz analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quiz not found or access denied
 */

/**
 * @swagger
 * /analytics/{quizId}/questions:
 *   get:
 *     summary: Get question-level analytics
 *     description: Returns question accuracy based on completed attempts for the specified published quiz.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Question analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quiz not found or access denied
 */

/**
 * @swagger
 * /analytics/quiz/{quizId}/attempts:
 *   get:
 *     summary: Get completed attempts and integrity events
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Completed attempts retrieved successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quiz not found or access denied
 */

// All analytics routes require authentication.
router.use(protect);

// Overall analytics
router.get(
  "/overview",
  authorize("TEACHER", "ADMIN"),
  analyticsController.getOverallAnalytics,
);

router.get(
  "/comparison",
  authorize("TEACHER", "ADMIN"),
  analyticsController.getQuizComparison,
);

router.get(
  "/trends",
  authorize("TEACHER", "ADMIN"),
  analyticsController.getAnalyticsTrends,
);

// Admin-only analytics
router.get(
  "/teachers",
  authorize("ADMIN"),
  analyticsController.getTeacherAnalytics,
);

// Individual quiz analytics
router.get(
  "/quiz/:quizId",
  authorize("TEACHER", "ADMIN"),
  analyticsController.getQuizAnalytics,
);

router.get(
  "/:quizId/questions",
  authorize("TEACHER", "ADMIN"),
  analyticsController.getQuestionAnalytics,
);

router.get(
  "/quiz/:quizId/attempts",
  authorize("TEACHER", "ADMIN"),
  analyticsController.getQuizAttemptsIntegrity,
);

module.exports = router;
