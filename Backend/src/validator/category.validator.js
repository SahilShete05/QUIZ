const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters"),
});

const updateCategorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};