const prisma = require("../config/prismaClient");
const {
  generateExplanation,
} = require("../services/ai.services");

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
          quiz: true,
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

    // Student: own attempt. Teacher: only attempts on quizzes they created.
    const isOwner =
      attempt.userId === req.user.id;

    const isQuizTeacher =
      req.user.role === "TEACHER" &&
      attempt.quiz.createdById === req.user.id;

    const isAdmin =
      req.user.role === "ADMIN";

    if (!isOwner && !isQuizTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (attempt.status === "IN_PROGRESS") {
      return res.status(400).json({
        success: false,
        message: "Attempt not submitted yet",
      });
    }

    const review = [];

    for (const answer of attempt.answers) {

      const correctOption =
        answer.question.options.find(
          (option) => option.isCorrect
        );

      const correctText =
        correctOption?.text ||
        answer.question.answerKey ||
        null;

      const studentAnswer =
        answer.selectedOption?.text ||
        answer.textResponse ||
        "No answer submitted";

      let explanation =
        answer.aiExplanation;

      if (
        answer.isCorrect === false &&
        !explanation
      ) {
        explanation =
          await generateExplanation(
            answer.question.text,
            correctText || "",
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
          correctText,
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