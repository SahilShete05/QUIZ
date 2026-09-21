const express = require("express");

const teacherDashboardContoller = require("../controllers/teacherDashboard.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorize }= require("../middlewares/role.middleware");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard APIs
 */

/**
 * @swagger
 * /teacher-dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Teacher Dashboard
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Teacher dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */

/**
 * GET /api/teacher-dashboard
 */

router.get("/", protect,authorize("TEACHER","ADMIN"), teacherDashboardContoller.getTeacherDashboard);

module.exports = router;