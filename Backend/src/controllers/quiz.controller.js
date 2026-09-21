const prisma = require("../config/prismaClient");

// =====================
// CREATE QUIZ
// =====================

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      durationSeconds,
    } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        durationSeconds,
        createdById: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("CREATE QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// Get Quizz By ID
// =====================
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id,
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("GET QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// Get All Quizzes
// =====================

const getAllQuizzes = async (
  req,
  res
) => {
  try {
    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 10;

    const search =
      req.query.search || "";

    const skip =
      (page - 1) * limit;

    const where = {
      title: {
        contains: search,
        mode: "insensitive",
      },
    };

    const quizzes =
      await prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });

    const total =
      await prisma.quiz.count({
        where,
      });

    return res.status(200).json({
      success: true,

      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(
          total / limit
        ),
        limit,
      },

      count: quizzes.length,

      quizzes,
    });
  } catch (error) {
    console.error(
      "GET QUIZZES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// =====================
// GET PUBLISHED QUIZZES
// =====================

const getPublishedQuizzes =
  async (req, res) => {
    try {
      const page =
        parseInt(req.query.page) || 1;

      const limit =
        parseInt(req.query.limit) || 10;

      const search =
        req.query.search || "";

      const skip =
        (page - 1) * limit;

      const where = {
        isPublished: true,

        title: {
          contains: search,
          mode: "insensitive",
        },
      };

      const quizzes =
        await prisma.quiz.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        });

      const total =
        await prisma.quiz.count({
          where,
        });

      return res.status(200).json({
        success: true,

        pagination: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(
            total / limit
          ),
          limit,
        },

        quizzes,
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
// Update Quiz
// =====================

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      quiz.createdById !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not your quiz",
      });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: {
        id,
      },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("UPDATE QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================
// Delete Quiz
// =====================

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      quiz.createdById !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not your quiz",
      });
    }

    await prisma.quiz.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("DELETE QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================
// PUBLISH QUIZ
// =====================

const publishQuiz = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const quiz =
      await prisma.quiz.findUnique({
        where: { id },
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      quiz.createdById !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not your quiz",
      });
    }

    const questionCount =
      await prisma.quizQuestion.count({
        where: {
          quizId: id,
        },
      });

    if (questionCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot publish quiz without questions",
      });
    }

    const updatedQuiz =
      await prisma.quiz.update({
        where: { id },
        data: {
          isPublished: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Quiz published successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error(
      "PUBLISH QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// UNPUBLISH QUIZ
// =====================

const unpublishQuiz = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const quiz =
      await prisma.quiz.findUnique({
        where: { id },
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      quiz.createdById !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not your quiz",
      });
    }

    const updatedQuiz =
      await prisma.quiz.update({
        where: { id },
        data: {
          isPublished: false,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Quiz unpublished successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error(
      "UNPUBLISH QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  getPublishedQuizzes
};