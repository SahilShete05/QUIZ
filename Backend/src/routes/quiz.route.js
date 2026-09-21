const express = require("express");
const quizController = require("../controllers/quiz.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
  createQuizSchema,
  updateQuizSchema,
} = require("../validator/quiz.validator");


const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Quiz APIs
 */

/**
 * @swagger
 * /quizzes:
 *   post:
 *     tags: [Quiz]
 *     summary: Create Quiz
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Quiz created successfully
 */

/**
 * POST /api/quizzes/
 */

router.post("/", protect, authorize("TEACHER", "ADMIN"), validate(createQuizSchema),quizController.createQuiz);

/**
 * @swagger
 * /quizzes/published:
 *   get:
 *     tags: [Quiz]
 *     summary: Get Published Quizzes
 *     responses:
 *       200: 
 *        description: Published quizzes fetched successfully
 */

/**
 * GET /api/quizzes/published
 */

router.get("/published",quizController.getPublishedQuizzes);


/**
 * @swagger
 * /quizzes/published:
 *   get:
 *     tags: [Quiz]
 *     summary: Get Published Quizzes
 *     responses:
 *       200:
 *         description: Published quizzes fetched successfully
 */

/**
 * PATCH /api/quizzes/:id/publish
 */

router.patch("/:id/publish", protect, authorize("TEACHER", "ADMIN"), quizController.publishQuiz);

/**
 * @swagger
 * /quizzes/{id}/unpublish:
 *   patch:
 *     tags: [Quiz]
 *     summary: Unpublish Quiz
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
 *         description: Quiz unpublished successfully
 */

/**
 * PATCH /api/quizzes/:id/unpublish
 */

router.patch("/:id/unpublish", protect, authorize("TEACHER","ADMIN"),quizController.unpublishQuiz);

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     tags: [Quiz]
 *     summary: Get Quiz By ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz fetched successfully
 *       404:
 *         description: Quiz not found
 */

/**
 * GET /api/quizzes/:id
 */

router.get("/:id",quizController.getQuizById);

/**
 * @swagger
 * /quizzes:
 *   get:
 *     tags: [Quiz]
 *     summary: Get All Quizzes
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Quizzes fetched successfully
 */

/**
 * GET /api/quizzes/
 */

router.get("/",protect, authorize("TEACHER", "ADMIN"), quizController.getAllQuizzes);

/**
 * @swagger
 * /quizzes/{id}:
 *   patch:
 *     tags: [Quiz]
 *     summary: Update Quiz
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
 *         description: Quiz updated successfully
 */

/**
 * PATCH /api/quizzes/:id
 */

router.patch("/:id", protect, authorize("TEACHER", "ADMIN"), validate(updateQuizSchema), quizController.updateQuiz);

/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     tags: [Quiz]
 *     summary: Delete Quiz
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
 *         description: Quiz deleted successfully
 */

/**
 * DELETE /api/quizzes/:id
 */

router.delete("/:id", protect,authorize("TEACHER", "ADMIN"), quizController.deleteQuiz);


module.exports = router;