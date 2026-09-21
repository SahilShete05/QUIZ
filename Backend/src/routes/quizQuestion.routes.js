const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const validate = require( "../middlewares/validate.middleware");
const { addQuestionToQuizSchema, } = require("../validator/quizQuestion.validator");
const quizQuestionController = require("../controllers/quizQuestion.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Quiz Questions
 *   description: Manage Questions inside Quizzes
 */

/**
 * @swagger
 * /quizzes/{quizId}/questions:
 *   post:
 *     tags: [Quiz Questions]
 *     summary: Add Question To Quiz
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Question added successfully
 *       404:
 *         description: Quiz not found
 */


/**
 * POST /api/quizzes/:id/questions
 */
router.post("/:quizId/questions", protect, authorize("TEACHER", "ADMIN"), validate(addQuestionToQuizSchema), quizQuestionController.addQuestionToQuiz);

/**
 * @swagger
 * /quizzes/{quizId}/questions:
 *   get:
 *     tags: [Quiz Questions]
 *     summary: Get Questions Of Quiz
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *       404:
 *         description: Quiz not found
 */


/**
 * GET /api/quizzes/:id/questions
 */

router.get("/:quizId/questions", protect, quizQuestionController.getQuizQuestions);


/**
 * @swagger
 * /quizzes/{quizId}/admin-questions:
 *   get:
 *     tags: [Quiz Questions]
 *     summary: Get Quiz Questions (Admin/Teacher)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quiz not found
 */


/**
 * GET /api/quizzes/:quizId/admin-questions
 */


router.get( "/:quizId/admin-questions", protect, authorize("ADMIN", "TEACHER"),quizQuestionController.getQuizQuestionsAdmin);

/**
 * @swagger
 * /quizzes/{quizId}/questions/{questionId}:
 *   delete:
 *     tags: [Quiz Questions]
 *     summary: Remove Question From Quiz
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question removed successfully
 *       404:
 *         description: Question or Quiz not found
 */


/**
 * DELETE /api/quizzes/:id/questions/:questionId
 */

router.delete("/:quizId/questions/:questionId", protect, authorize("TEACHER", "ADMIN"), quizQuestionController.removeQuestionFromQuiz);

module.exports = router;