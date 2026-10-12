
const express = require("express");

const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User and profile management APIs
 */

// All routes require authentication.
router.use(protect);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user's name
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sahil Shete
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.patch("/profile", userController.updateProfile);



/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [STUDENT, TEACHER, ADMIN]
 *     responses:
 *       200:
 *         description: Paginated users
 *       403:
 *         description: Admin access required
 */
router.get("/", userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user details (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.get("/:id", userController.getUserById);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's role (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [STUDENT, TEACHER, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 *       400:
 *         description: Invalid role or prohibited change
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch("/:id/role", userController.updateUserRole);

module.exports = router;
