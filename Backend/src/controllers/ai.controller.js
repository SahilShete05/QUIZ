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

    // All database writes run in ONE transaction: if anything fails, no
    // partial quiz or half-added questions are left behind. The slow AI call
    // stays outside, so the transaction stays short.
    const quiz =
      await prisma.$transaction(
        async (tx) => {
          const quiz =
            await tx.quiz.create({
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
              await tx.question.create({
                data: {
                  text: q.question,
                  type: "MCQ",
                  difficulty,
                  categoryId:
                    category.id,
                },
              });

            for (const optionText of q.options) {
              await tx.option.create({
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

            await tx.quizQuestion.create({
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

          return quiz;
        },
        {
          maxWait: 5000,
          timeout: 30000,
        }
      );

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

    // All database writes run in ONE transaction: if anything fails, no
    // partial quiz or half-added questions are left behind. The slow AI call
    // stays outside, so the transaction stays short.
    await prisma.$transaction(
      async (tx) => {
        const lastQuestion =
          await tx.quizQuestion.findFirst({
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
            await tx.question.create({
              data: {
                text: q.question,
                type: "MCQ",
                difficulty,
                categoryId:
                  category.id,
              },
            });

          for (const optionText of q.options) {
            await tx.option.create({
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

          await tx.quizQuestion.create({
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
      },
      {
        maxWait: 5000,
        timeout: 30000,
      }
    );

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

    // Reviews reveal correct answers, so only after submission.
    if (attempt.status === "IN_PROGRESS") {
      return res.status(400).json({
        success: false,
        message:
          "Attempt not submitted yet",
      });
    }

    // Only MCQ / true-false answers are auto-graded, so only those can be
    // "wrong" and get an AI explanation.
    const wrongAnswers =
      attempt.answers.filter(
        (answer) => answer.isCorrect === false
      );

    // Unanswered questions and text answers (not auto-graded) get the
    // correct answer but no AI explanation.
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
        orderBy: {
          order: "asc",
        },
      });

    const extraReviews = [];

    for (const quizQuestion of quizQuestions) {
      const question = quizQuestion.question;

      const answer = attempt.answers.find(
        (a) => a.questionId === question.id
      );

      const unanswered = !answer;
      const ungradedText =
        answer && answer.isCorrect === null;

      if (!unanswered && !ungradedText) continue;

      extraReviews.push({
        questionId: question.id,
        question: question.text,
        yourAnswer:
          answer?.textResponse || null,
        correctAnswer:
          question.options.find(
            (option) => option.isCorrect
          )?.text ||
          question.answerKey ||
          null,
        explanation: null,
      });
    }

    if (
      wrongAnswers.length === 0 &&
      extraReviews.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Perfect score. No review needed.",
        reviews: [],
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
        questionId:
          answer.questionId,
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

    reviews.push(...extraReviews);

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