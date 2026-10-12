
const express = require("express");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const adminDashboardController = require("../controllers/adminDashboard.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Administrator Dashboard APIs
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get Admin Dashboard
 *     description: Returns platform-wide statistics, recently created quizzes, and recently registered users. Admin access only.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */

/**
 * GET /api/admin/dashboard
 */

router.get(
  "/",
  protect,
  authorize("ADMIN"),
  adminDashboardController.getAdminDashboard,
);

module.exports = router;
