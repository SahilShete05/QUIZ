const express = require("express");
const categoryController = require("../controllers/category.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validator/category.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category Management APIs
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Category]
 *     summary: Create Category
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Category created successfully
 */

/**
 * POST /api/categories
 */
router.post("/", protect, authorize("TEACHER", "ADMIN"), validate(createCategorySchema), categoryController.createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Category]
 *     summary: Get All Categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */

/**
 * GET /api/categories
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Category]
 *     summary: Get Category By ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category fetched successfully
 */

/**
 * GET /api/categories/:id
 */
router.get("/:id",  categoryController.getCategoryById);

/**
 * @swagger
 * /categories/{categoryId}/questions:
 *   get:
 *     tags: [Category]
 *     summary: Get Questions By Category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 */

/**
 * GET /api/:categoryId/question
 */

router.get("/:categoryId/questions", categoryController.getQuestionsByCategory);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     tags: [Category]
 *     summary: Update Category
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
 *         description: Category updated successfully
 */

/**
 * PATCH /api/categories/:id
 */
router.patch("/:id", protect, authorize("TEACHER", "ADMIN"), validate(updateCategorySchema), categoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Category]
 *     summary: Delete Category
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
 *         description: Category deleted successfully
 */

/**
 * DELETE /api/categories/:id
 */
router.delete("/:id", protect, authorize("TEACHER", "ADMIN"), categoryController.deleteCategory);



module.exports = router;