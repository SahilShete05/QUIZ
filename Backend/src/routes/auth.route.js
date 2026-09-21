const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware")

const {
    registerSchema,
    loginSchema,
} = require("../validator/auth.validator");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * POST /api/auth/register
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * POST /api/auth/login
 */

router.post("/login",validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout User
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * POST /api/auth/logout
 */

router.post("/logout",authController.logout);

/**
 * @swagger
 * /auth/get-user:
 *   get:
 *     tags: [Authentication]
 *     summary: Get Current Logged In User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * GET /api/auth/protect/get-user
 *
 */

router.get("/get-user", protect, authController.getUser);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Send Password Reset Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 */

/**
 * POST /api/auth/forgot-password
 *
 */

router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset Password
 *     parameters:
 *       - in: path
 *         name: token
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
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

/**
 * POST /api/auth/reset-password/:token
 */

router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;