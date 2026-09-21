const express = require("express");

const attemptEventController = require("../controllers/attemptEvent.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attempt Events
 *   description: Anti-cheat and attempt monitoring APIs
 */

/**
 * @swagger
 * /attempts/{attemptId}/events:
 *   post:
 *     tags: [Attempt Events]
 *     summary: Create attempt event
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Event created successfully
 *       404:
 *         description: Attempt not found
 */

/**
 * POST
 * /api/attempt-events/:attemptId/events
 */

router.post("/:attemptId/events", protect, attemptEventController.createAttemptEvent);

/**
 * @swagger
 * /attempts/{attemptId}/events:
 *   get:
 *     tags: [Attempt Events]
 *     summary: Get all attempt events
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
 *         description: Events fetched successfully
 *       404:
 *         description: Attempt not found
 */

/**
 * GET
 * /api/attempt-events/:attemptId/events
 */

router.get("/:attemptId/events", protect, attemptEventController.getAttemptEvents);

/**
 * @swagger
 * /attempts/{attemptId}/events/summary:
 *   get:
 *     tags: [Attempt Events]
 *     summary: Get attempt event summary
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
 *         description: Event summary fetched successfully
 *       404:
 *         description: Attempt not found
 */

/**
 * GET
 * /api/attempt-events/:attemptId/events-summary
 */

router.get("/:attemptId/events/summary", protect, attemptEventController.getAttemptEventSummary);

module.exports = router;