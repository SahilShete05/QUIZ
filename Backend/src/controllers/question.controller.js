const prisma = require("../config/prismaClient");

// =====================
// CREATE QUESTION
// =====================

const createQuestion = async (req, res) => {
  try {
    const {
      text,
      type,
      difficulty,
      categoryId,
      answerKey,
      options,
    } = req.body;

    if (
      (type === "MCQ" || type === "TRUE_FALSE") &&
      (!options || options.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Options are required for MCQ and TRUE_FALSE questions",
      });
    }

  if(categoryId) {
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
}

    const question =
      await prisma.question.create({
        data: {
          text,
          type,
          difficulty,
          categoryId,
          answerKey,

          options:
            options && options.length > 0
              ? {
                  create: options.map(
                    (option) => ({
                      text: option.text,
                      isCorrect:
                        option.isCorrect,
                    })
                  ),
                }
              : undefined,
        },

        include: {
          options: true,
          category: true,
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Question created successfully",
      question,
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
// GET ALL QUESTION
// =====================

const getAllQuestions = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const questions = await prisma.question.findMany({
      where: {
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        options: true,
      },
    });

    return res.status(200).json({
      success: true,
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
// =====================
// GET QUESTION BY ID
// =====================

const getQuestionById = async (req, res) => {
  try {
    const question =
      await prisma.question.findUnique({
        where: {
          id: req.params.id,
        },
        include: {
          category: true,
          options: true,
        },
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// UPDATE QUESTION
// =====================

const updateQuestion = async (req, res) => {
  try {
    const {
      text,
      type,
      difficulty,
      categoryId,
      answerKey,
      options,
    } = req.body;

    const existingQuestion =
      await prisma.question.findUnique({
        where: {
          id: req.params.id,
        },
        include: {
          options: true,
        },
      });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (categoryId) {
      const category =
        await prisma.category.findUnique({
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
    }

    // =====================
    // UPDATE QUESTION
    // =====================

    const updatedQuestion =
      await prisma.question.update({
        where: {
          id: req.params.id,
        },
        data: {
          text,
          type,
          difficulty,
          categoryId,
          answerKey,
        },
      });

    // =====================
    // UPDATE OPTIONS
    // =====================

    if (
      options &&
      Array.isArray(options)
    ) {
      await prisma.option.deleteMany({
        where: {
          questionId: req.params.id,
        },
      });

      await prisma.option.createMany({
        data: options.map(
          (option) => ({
            questionId:
              req.params.id,
            text: option.text,
            isCorrect:
              option.isCorrect,
          })
        ),
      });
    }

    const finalQuestion =
      await prisma.question.findUnique({
        where: {
          id: req.params.id,
        },
        include: {
          category: true,
          options: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Question updated successfully",
      question: finalQuestion,
    });
  } catch (error) {
    console.error(
      "UPDATE QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// DELETE QUESTION
// =====================

const deleteQuestion = async (req, res) => {
  try {
    const existingQuestion =
      await prisma.question.findUnique({
        where: {
          id: req.params.id,
        },
      });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await prisma.question.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        "Question cannot be deleted because it is being used by a quiz or attempt",
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
}