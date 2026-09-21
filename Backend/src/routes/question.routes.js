const express = require("express");
const questionController = require("../controllers/question.controller");
const validate = require( "../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
    createQuestionSchema,
    updateQuestionSchema,
} = require(
  "../validator/question.validator"
);


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Question
 *   description: Question Management APIs
 */

/**
 * @swagger
 * /questions:
 *   post:
 *     tags: [Question]
 *     summary: Create Question
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Question created successfully
 */

/**
 *POST /api/questions/
 */

router.post("/", protect, authorize("TEACHER", "ADMIN"), validate(createQuestionSchema), questionController.createQuestion);

/**
 * @swagger
 * /questions:
 *   get:
 *     tags: [Question]
 *     summary: Get All Questions
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 */

/**
 *GET /api/questions/
 */

router.get("/",questionController.getAllQuestions);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     tags: [Question]
 *     summary: Get Question By ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question fetched successfully
 *       404:
 *         description: Question not found
 */

/**
 *GET /api/questions/:id
 */

router.get("/:id", questionController.getQuestionById);

/**
 * @swagger
 * /questions/{id}:
 *   patch:
 *     tags: [Question]
 *     summary: Update Question
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
 *         description: Question updated successfully
 */

/**
 *PATCH /api/questions/:id
 */

router.patch("/:id", protect, authorize("TEACHER", "ADMIN"), validate(updateQuestionSchema), questionController.updateQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     tags: [Question]
 *     summary: Delete Question
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
 *         description: Question deleted successfully
 */

/**
 *DELETE /api/questions/:id
 */

router.delete("/:id", protect, authorize("TEACHER", "ADMIN"),questionController.deleteQuestion);

module.exports = router;