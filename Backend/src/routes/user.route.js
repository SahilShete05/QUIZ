const express = require("express");

const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");

const userController = require("../controllers/user.controller");


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User APIs
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get Current User Profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * GET /api/users/profile
 */ 
router.get("/profile", protect, userController.getProfile);

module.exports = router;