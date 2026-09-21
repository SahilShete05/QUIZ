const express = require("express");

const badgeController = require("../controllers/badge.controller");
const validate = require("../middlewares/validate.middleware");
const { createBadgeSchema } = require("../validator/badge.validator");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Badge
 *   description: Badge Management APIs
 */

/**
 * @swagger
 * /badges:
 *   post:
 *     tags: [Badge]
 *     summary: Create Badge
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               iconUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Badge created successfully
 */

/**
 * POST api/badges/
 */
router.post("/", protect, authorize("ADMIN"), validate(createBadgeSchema), badgeController.createBadge);

/**
 * @swagger
 * /badges:
 *   get:
 *     tags: [Badge]
 *     summary: Get All Badges
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all badges
 */

/**
 * GET api/badges/
 */

router.get("/", protect, badgeController.getAllBadges);


/**
 * @swagger
 * /badges:
 *   get:
 *     tags: [Badge]
 *     summary: Get User Badges
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User badges
 */

/**
 * GET api/badges/my-badges
 */

router.get("/my-badges", protect, badgeController.getMyBadges
);

module.exports = router;