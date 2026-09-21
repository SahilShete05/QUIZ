const prisma = require("../config/prismaClient");
const genAI = require("../config/gemini");
const { getAIQuestions } = require("../services/ai.services");

// =====================
// GENERATE AI QUIZ
// =====================

const generateAIQuiz = async (
  req,
  res
) => {
  try {
    const {
      title,
      topic,
      difficulty,
      questionCount,
    } = req.body;

    const aiQuestions =
      await getAIQuestions(
        topic,
        difficulty,
        questionCount
      );

    if (
      !Array.isArray(aiQuestions) ||
      aiQuestions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "AI generated invalid questions",
      });
    }

    let category =
      await prisma.category.findUnique({
        where: {
          name: topic,
        },
      });

    if (!category) {
      category =
        await prisma.category.create({
          data: {
            name: topic,
          },
        });
    }

    const quiz =
      await prisma.quiz.create({
        data: {
          title,
          description:
            `AI Generated Quiz on ${topic}`,
          durationSeconds:
            questionCount * 60,
          createdById:
            req.user.id,
          isPublished: false,
        },
      });

    let order = 1;

    for (const q of aiQuestions) {
      const question =
        await prisma.question.create({
          data: {
            text: q.question,
            type: "MCQ",
            difficulty,
            categoryId:
              category.id,
          },
        });

      for (const optionText of q.options) {
        await prisma.option.create({
          data: {
            questionId:
              question.id,
            text: optionText,
            isCorrect:
              optionText ===
              q.correctAnswer,
          },
        });
      }

      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionId:
            question.id,
          order,
          points: 1,
        },
      });

      order++;
    }

    return res.status(201).json({
      success: true,
      message:
        "AI Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate AI quiz",
      error: error.message,
    });
  }
};

// =====================
// ADD QUESTIONS TO EXISTING QUIZ
// =====================

const addQuestionsToQuiz = async (
  req,
  res
) => {
  try {
    const {
      quizId,
      topic,
      difficulty,
      questionCount,
    } = req.body;

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
      quiz.createdById !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const aiQuestions =
      await getAIQuestions(
        topic,
        difficulty,
        questionCount
      );

    let category =
      await prisma.category.findUnique({
        where: {
          name: topic,
        },
      });

    if (!category) {
      category =
        await prisma.category.create({
          data: {
            name: topic,
          },
        });
    }

    const lastQuestion =
      await prisma.quizQuestion.findFirst({
        where: {
          quizId,
        },
        orderBy: {
          order: "desc",
        },
      });

    let order =
      (lastQuestion?.order || 0) + 1;

    for (const q of aiQuestions) {
      const question =
        await prisma.question.create({
          data: {
            text: q.question,
            type: "MCQ",
            difficulty,
            categoryId:
              category.id,
          },
        });

      for (const optionText of q.options) {
        await prisma.option.create({
          data: {
            questionId:
              question.id,
            text: optionText,
            isCorrect:
              optionText ===
              q.correctAnswer,
          },
        });
      }

      await prisma.quizQuestion.create({
        data: {
          quizId,
          questionId:
            question.id,
          order,
          points: 1,
        },
      });

      order++;
    }

    return res.status(201).json({
      success: true,
      message:
        `${aiQuestions.length} questions added successfully`,
      quizId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to add AI questions",
      error: error.message,
    });
  }
};


// =====================
// GENERATE ATTEMPT REVIEW
// =====================

const generateAttemptReview = async (
  req,
  res
) => {
  try {
    const { attemptId } = req.body;

    const attempt =
      await prisma.attempt.findUnique({
        where: {
          id: attemptId,
        },
        include: {
          answers: {
            include: {
              question: true,
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

    if (attempt.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const wrongAnswers =
      attempt.answers.filter(
        (answer) => answer.isCorrect === false
      );

    if (wrongAnswers.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "Perfect score. No review needed.",
      });
    }

    const reviews = [];

    for (const answer of wrongAnswers) {
      const correctOption =
        await prisma.option.findFirst({
          where: {
            questionId:
              answer.questionId,
            isCorrect: true,
          },
        });

      const prompt = `
Question:
${answer.question.text}

Student Answer:
${answer.selectedOption?.text || answer.textResponse || "No Answer"}

Correct Answer:
${correctOption?.text || answer.question.answerKey}

Explain:
1. Why student answer is wrong
2. Why correct answer is right
3. Short learning tip

Maximum 120 words.
`;

      const response =
        await genAI.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

      const explanation =
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]
          ?.text ||
        "No explanation generated";

      await prisma.answer.update({
        where: {
          id: answer.id,
        },
        data: {
          aiExplanation: explanation,
        },
      });

      reviews.push({
        question:
          answer.question.text,
        yourAnswer:
          answer.selectedOption?.text ||
          answer.textResponse,
        correctAnswer:
          correctOption?.text ||
          answer.question.answerKey,
        explanation,
      });
    }

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
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
  generateAIQuiz,
  addQuestionsToQuiz,
  generateAttemptReview
};
