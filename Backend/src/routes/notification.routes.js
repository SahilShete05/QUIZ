const express = require("express");

const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth.middleware");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification APIs
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get User Notifications
 *     description: Returns all notifications for the logged-in user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 */


router.get("/", protect, notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark Notification As Read
 *     description: Marks a notification as read.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */

router.patch("/:notificationId/read", protect, notificationController.markAsRead);

module.exports = router;