const prisma = require("../config/prismaClient");
const {
  generateExplanation,
} = require("../services/ai.service");

// =====================
// GENERATE AI REVIEW
// =====================

const generateAttemptReview = async (
  req,
  res
) => {
  try {
    const { attemptId } = req.params;

    const attempt =
      await prisma.attempt.findUnique({
        where: {
          id: attemptId,
        },
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                },
              },
              selectedOption: true,
            },
          },
        },
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    if (
      attempt.userId !== req.user.id &&
      req.user.role !== "ADMIN" &&
      req.user.role !== "TEACHER"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const review = [];

    for (const answer of attempt.answers) {

      const correctOption =
        answer.question.options.find(
          (option) => option.isCorrect
        );

      const studentAnswer =
        answer.selectedOption?.text ||
        "No answer submitted";

      let explanation =
        answer.aiExplanation;

      if (
        !answer.isCorrect &&
        !explanation
      ) {
        explanation =
          await generateExplanation(
            answer.question.text,
            correctOption?.text || "",
            studentAnswer
          );

        await prisma.answer.update({
          where: {
            id: answer.id,
          },
          data: {
            aiExplanation:
              explanation,
          },
        });
      }

      review.push({
        questionId:
          answer.question.id,
        question:
          answer.question.text,
        studentAnswer,
        correctAnswer:
          correctOption?.text ||
          null,
        isCorrect:
          answer.isCorrect,
        explanation,
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate review",
    });
  }
};

module.exports = {
  generateAttemptReview,
};