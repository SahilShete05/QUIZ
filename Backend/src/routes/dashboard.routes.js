const express = require("express");

const dashboardController = require("../controllers/dashboard.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard APIs
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Student Dashboard
 *     description: Get student dashboard statistics, XP, level, badges, and recent attempts.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * GET /api/dashboard
 */
router.get("/", protect, dashboardController.getDashboard);

module.exports = router;