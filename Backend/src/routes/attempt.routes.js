const express = require("express");

const { protect } = require("../middlewares/auth.middleware");

const attemptController = require("../controllers/attempt.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attempt
 *   description: Quiz Attempt APIs
 */

/**
 * @swagger
 * /attempts/{quizId}/start:
 *   post:
 *     tags: [Attempt]
 *     summary: Start Quiz Attempt
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Attempt started
 */

/** 
 * POST /api/attempts/:quizId/start 
 */

router.post("/:quizId/start", protect,attemptController.startAttempt);

/**
 * @swagger
 * /attempts/{attemptId}/answers:
 *   post:
 *     tags: [Attempt]
 *     summary: Submit answer for a question
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       404:
 *         description: Attempt not found
 */

/**
 * POST /api/attempts/:attemptId/answer
 */

router.post("/:attemptId/answers", protect,attemptController.answerQuestion);

/**
 * @swagger
 * /attempts/{attemptId}/submit:
 *   post:
 *     tags: [Attempt]
 *     summary: Submit Quiz
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 */

/** 
 * POST /api/attempts/:attemptId/submit  
*/

router.post("/:attemptId/submit", protect, attemptController.submitAttempt);

/**
 * @swagger
 * /attempts/me:
 *   get:
 *     tags: [Attempt]
 *     summary: Get My Attempts
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User attempts fetched successfully
 */

/**
 *  GET /api/attempts/my 
 */

router.get( "/my", protect, attemptController.getMyAttempts);

/**
 * @swagger
 * /attempts/{attemptId}:
 *   get:
 *     tags: [Attempt]
 *     summary: Get Attempt Details
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt fetched successfully
 *       404:
 *         description: Attempt not found
 */

/**
 *  GET /api/attempts/:attemptId 
 */

router.get("/:attemptId", protect,attemptController.getAttempt);

/**
 * @swagger
 * /attempts/{attemptId}/auto-submit:
 *   post:
 *     tags: [Attempt]
 *     summary: Auto Submit Quiz
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz auto submitted successfully
 */

/**
 * POST /api/attempts/:attemptId/auto-submit
 */

router.post("/:attemptId/auto-submit", protect, attemptController.autoSubmitAttempt);

module.exports = router;