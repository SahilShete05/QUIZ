const prisma = require("../config/prismaClient");

// =====================
// ADD QUESTION TO QUIZ
// =====================

const addQuestionToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionId, order, points } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
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

    const question =
      await prisma.question.findUnique({
        where: {
          id: questionId,
        },
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const existingLink =
      await prisma.quizQuestion.findFirst({
        where: {
          quizId,
          questionId,
        },
      });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message:
          "Question already added to quiz",
      });
    }

    const existingOrder =
      await prisma.quizQuestion.findFirst({
        where: {
          quizId,
          order,
        },
      });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message:
          "Order number already exists in this quiz",
      });
    }

    const quizQuestion =
      await prisma.quizQuestion.create({
        data: {
          quizId,
          questionId,
          order,
          points,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Question added to quiz",
      quizQuestion,
    });
  } catch (error) {
    console.error(
      "ADD QUESTION TO QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET QUIZ QUESTIONS (STUDENT)
// =====================

const getQuizQuestions = async (
  req,
  res
) => {
  try {
    const { quizId } = req.params;

    const quiz =
      await prisma.quiz.findUnique({
        where: {
          id: quizId,
        },
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const questions =
      await prisma.quizQuestion.findMany({
        where: {
          quizId,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          order: true,
          points: true,

          question: {
            select: {
              id: true,
              text: true,
              type: true,
              difficulty: true,

              options: {
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(
      "GET QUIZ QUESTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// REMOVE QUESTION FROM QUIZ
// =====================

const removeQuestionFromQuiz =
  async (req, res) => {
    try {
      const { quizId, questionId } =
        req.params;

      const quiz =
        await prisma.quiz.findUnique({
          where: {
            id: quizId,
          },
        });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        });
      }

      if (
        req.user.role !== "ADMIN" &&
        quiz.createdById !==
          req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Not your quiz",
        });
      }

      const link =
        await prisma.quizQuestion.findFirst({
          where: {
            quizId,
            questionId,
          },
        });

      if (!link) {
        return res.status(404).json({
          success: false,
          message:
            "Question not found in quiz",
        });
      }

      await prisma.quizQuestion.delete({
        where: {
          id: link.id,
        },
      });

      return res.status(200).json({
        success: true,
        message:
          "Question removed from quiz",
      });
    } catch (error) {
      console.error(
        "REMOVE QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };

// =====================
// GET QUIZ QUESTIONS (ADMIN)
// =====================

const getQuizQuestionsAdmin =
  async (req, res) => {
    try {
      const { quizId } = req.params;

      const quiz =
        await prisma.quiz.findUnique({
          where: {
            id: quizId,
          },
        });

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        });
      }

      if (
        req.user.role !== "ADMIN" &&
        quiz.createdById !==
          req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Not your quiz",
        });
      }

      const questions =
        await prisma.quizQuestion.findMany({
          where: {
            quizId,
          },
          orderBy: {
            order: "asc",
          },
          include: {
            question: {
              include: {
                options: true,
                category: true,
              },
            },
          },
        });

      return res.status(200).json({
        success: true,
        questions,
      });
    } catch (error) {
      console.error(
        "GET ADMIN QUESTIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };

module.exports = {
  addQuestionToQuiz,
  getQuizQuestions,
  removeQuestionFromQuiz,
  getQuizQuestionsAdmin,
};