const prisma = require("../config/prismaClient");
const { processRewards } = require("../services/reward.service");
const { sendQuizCompletedEmail } = require("../services/emailTemplate.service");
const { finalizeAttempt } = require("../services/attempt.service");


// =====================
// START ATTEMPT
// =====================

const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

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

    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Quiz not published",
      });
    }

  const quizQuestions = await prisma.quizQuestion.count({
    where: {
      quizId,
    },
  });

  if (quizQuestions === 0) {
    return res.status(400).json({
      success: false,
      message: "Quiz has no questions",
    });
  }

  const existingAttempt = await prisma.attempt.findFirst({
    where: {
      quizId,
      userId: req.user.id,
      status: "IN_PROGRESS",
    },
  });

  if (existingAttempt) {
    return res.status(400).json({
      success: false,
      message: "You already have an active attempt",
    });
  }

  const attempt = await prisma.attempt.create({
      data: {
        userId: req.user.id,
        quizId,
        seed: Math.floor(Math.random() * 100000),
      },
    });

    return res.status(201).json({
      success: true,
      attempt,
    });

  } 
  catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// ANSWER QUESTIONS
// =====================

const answerQuestion = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const {
      questionId,
      selectedOptionId,
      textResponse,
    } = req.body;

    const attempt =
      await prisma.attempt.findUnique({
        where: {
          id: attemptId,
        },
        include: {
          quiz: true,
        },
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // Owner check
    if (attempt.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Attempt already submitted
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({
        success: false,
        message: "Attempt already submitted",
      });
    }

    // Deadline check: no answers after time is up (small grace period
    // for network delay), even if the cron job has not auto-submitted yet.
    const endTime =
      new Date(attempt.startedAt).getTime() +
      attempt.quiz.durationSeconds * 1000;

    if (Date.now() > endTime + 5000) {
      return res.status(400).json({
        success: false,
        message: "Quiz time has expired",
      });
    }

    // Question belongs to quiz
    const quizQuestion =
      await prisma.quizQuestion.findFirst({
        where: {
          quizId: attempt.quizId,
          questionId,
        },
      });

    if (!quizQuestion) {
      return res.status(400).json({
        success: false,
        message:
          "Question does not belong to this quiz",
      });
    }

    // Existing answer: the student is changing it (updated below)
    const existing =
      await prisma.answer.findFirst({
        where: {
          attemptId,
          questionId,
        },
      });

    // Validate option
    if (selectedOptionId) {
      const option =
        await prisma.option.findUnique({
          where: {
            id: selectedOptionId,
          },
        });

      if (
        !option ||
        option.questionId !== questionId
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid option",
        });
      }
    }

    // Upsert on @@unique([attemptId, questionId]): saving again replaces the
    // previous answer, and two simultaneous first saves cannot collide.
    // The unused field is cleared so only one of the two is ever stored.
    const answer =
      await prisma.answer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId,
          },
        },
        update: {
          selectedOptionId:
            selectedOptionId ?? null,
          textResponse:
            textResponse ?? null,
        },
        create: {
          attemptId,
          questionId,
          selectedOptionId,
          textResponse,
        },
      });

    return res.status(existing ? 200 : 201).json({
      success: true,
      answer,
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
// SUBMIT ATTEMPT
// =====================
const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt =
      await prisma.attempt.findUnique({
        where: {
          id: attemptId,
        },
        include: {
          answers: true,
          quiz: true,
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

    if (
      attempt.status === "SUBMITTED" ||
      attempt.status === "AUTO_SUBMITTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt already submitted",
      });
    }

    const result =
      await finalizeAttempt(
        attemptId,
        "SUBMITTED"
      );

    const {
      updatedAttempt,
      score,
      maxScore,
      rewardResult,
    } = result;

    const user =
      await prisma.user.findUnique({
        where: {
          id: attempt.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

    if (user) {
      try {
        await sendQuizCompletedEmail(
          user.email,
          user.name,
          score,
          maxScore
        );

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Quiz Completed",
            message: `You completed "${attempt.quiz.title}" and scored ${score}/${maxScore}`,
          },
        });
      } catch (emailError) {
        console.error(
          "QUIZ EMAIL ERROR:",
          emailError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Quiz submitted successfully",
      score,
      maxScore,
      xpEarned:
        rewardResult?.xpEarned || 0,
      level:
        rewardResult?.level || 1,
      attempt: updatedAttempt,
    });
  } catch (error) {
    if (error.code === "ATTEMPT_ALREADY_SUBMITTED") {
      return res.status(409).json({
        success: false,
        message:
          "Attempt already submitted",
      });
    }

    console.error(
      "SUBMIT ATTEMPT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET ATTEMPT
// =====================

const getAttempt = async (req, res) => {
  try {
    const attempt = await prisma.attempt.findUnique({
        where: {
          id: req.params.attemptId,
        },
        include: {
          quiz: true,
          answers: {
            include: {
              selectedOption: true,
              question: true,
            },
          },
        }
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
    
    // While the attempt is running, never expose correctness data:
    // selectedOption.isCorrect and question.answerKey reveal the answers.
    if (attempt.status === "IN_PROGRESS") {
      attempt.answers = attempt.answers.map((answer) => {
        const { selectedOption, question, ...rest } = answer;

        return {
          ...rest,
          selectedOption: selectedOption
            ? { id: selectedOption.id, text: selectedOption.text }
            : null,
          question: question
            ? { id: question.id, text: question.text, type: question.type }
            : null,
        };
      });
    }

    const violationCount = await prisma.attemptEvent.count({
      where: { attemptId: attempt.id },
    });

    // After submission the student may see the correct answer of every quiz
    // question (including unanswered ones). Never sent while in progress.
    let correctAnswers;

    if (attempt.status !== "IN_PROGRESS") {
      const quizQuestions =
        await prisma.quizQuestion.findMany({
          where: {
            quizId: attempt.quizId,
          },
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        });

      correctAnswers = quizQuestions.map(
        ({ question }) => ({
          questionId: question.id,
          correctAnswer:
            question.options
              .filter((option) => option.isCorrect)
              .map((option) => option.text)
              .join(" / ") ||
            question.answerKey ||
            null,
        })
      );
    }

    return res.status(200).json({
      success: true,
      attempt: {
        ...attempt,
        violationCount,
        ...(correctAnswers ? { correctAnswers } : {}),
      },
    });

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET MY ATTEMPT
// =====================

const getMyAttempts = async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            isPublished: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
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
// AUTO SUBMIT ATTEMPT
// =====================
const autoSubmitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt =
      await prisma.attempt.findUnique({
        where: {
          id: attemptId,
        },
        include: {
          quiz: true,
          answers: true,
        },
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // SECURITY FIX
    if (attempt.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      attempt.status !==
      "IN_PROGRESS"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt already finished",
      });
    }

    const endTime =
      new Date(
        attempt.startedAt
      ).getTime() +
      attempt.quiz.durationSeconds *
        1000;

    if (Date.now() < endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Quiz time has not expired yet",
      });
    }

    const result =
      await finalizeAttempt(
        attemptId,
        "AUTO_SUBMITTED"
      );

    const {
      updatedAttempt,
      score,
      maxScore,
      rewardResult,
    } = result;

    const user =
      await prisma.user.findUnique({
        where: {
          id: attempt.userId,
        },
        select: {
          name: true,
          email: true,
        },
      });

    if (user) {
      try {
        await sendQuizCompletedEmail(
          user.email,
          user.name,
          score,
          maxScore
        );
      } catch (emailError) {
        console.error(
          "AUTO SUBMIT EMAIL ERROR:",
          emailError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Attempt auto submitted successfully",
      score,
      maxScore,
      xpEarned:
        rewardResult?.xpEarned || 0,
      level:
        rewardResult?.level || 1,
      attempt:
        updatedAttempt,
    });
  } catch (error) {
    if (error.code === "ATTEMPT_ALREADY_SUBMITTED") {
      return res.status(409).json({
        success: false,
        message:
          "Attempt already submitted",
      });
    }

    console.error(
      "AUTO SUBMIT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};

module.exports = {
  startAttempt,
  answerQuestion,
  submitAttempt,
  getAttempt,
  getMyAttempts,
  autoSubmitAttempt
};