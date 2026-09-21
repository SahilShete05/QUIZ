const express = require("express");
const router = express.Router();

const leaderboardController = require("../controllers/leaderboard.controller");

const { protect } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Leaderboard APIs
 */

/**
 * @swagger
 * /leaderboard/global:
 *   get:
 *     tags: [Leaderboard]
 *     summary: Get Global Leaderboard
 *     description: Returns top users ranked by XP and level.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Global leaderboard fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * GET /api/leaderboard/global
 */ 
router.get("/global", protect, leaderboardController.getGlobalLeaderboard);

/**
 * @swagger
 * /leaderboard/quiz/{quizId}:
 *   get:
 *     tags: [Leaderboard]
 *     summary: Get Quiz Leaderboard
 *     description: Returns top performers for a specific quiz.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz leaderboard fetched successfully
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 */

/**
 * GET /api/leaderboard/quiz/:quizId
 */ 

router.get("/quiz/:quizId", protect, leaderboardController.getQuizLeaderboard);

module.exports = router;