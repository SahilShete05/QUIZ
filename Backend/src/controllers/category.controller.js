const prisma = require("../config/prismaClient");

// =====================
// CREATE CATEGORY
// =====================

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          name,
        },
      });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category =
      await prisma.category.create({
        data: {
          name,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET ALL CATEGORIES
// =====================

const getAllCategories = async (req, res) => {
  try {
    const categories =
      await prisma.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET CATEGORY BY ID
// =====================

const getCategoryById = async (req, res) => {
  try {
    const category =
      await prisma.category.findUnique({
        where: {
          id: req.params.id,
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// UPDATE CATEGORY
// =====================

const updateCategory = async (req, res) => {
  try {
    const category =
      await prisma.category.findUnique({
        where: {
          id: req.params.id,
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updatedCategory =
      await prisma.category.update({
        where: {
          id: req.params.id,
        },
        data: req.body,
      });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// DELETE CATEGORY
// =====================

const deleteCategory = async (req, res) => {
  try {
    const category =
      await prisma.category.findUnique({
        where: {
          id: req.params.id,
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await prisma.category.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET QUESTIONS BY CATEGORY
// =====================

const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const questions =
      await prisma.question.findMany({
        where: {
          categoryId,
        },
        include: {
          options: true,
        },
      });

    return res.status(200).json({
      success: true,
      category,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getQuestionsByCategory

};