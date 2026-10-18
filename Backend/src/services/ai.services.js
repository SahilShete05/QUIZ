const { z } = require("zod");
const genAI = require("../config/gemini");

// Shape every AI-generated question must have before it is saved.
// correctAnswer must exactly match one option, and options must be unique,
// otherwise a question could be stored with zero or several correct options.
const aiQuestionSchema = z
  .object({
    question: z.string().trim().min(1),
    options: z
      .array(z.string().trim().min(1))
      .min(2)
      .max(6),
    correctAnswer: z.string().trim().min(1),
  })
  .refine(
    (q) =>
      q.options.includes(q.correctAnswer) &&
      new Set(q.options).size === q.options.length,
    {
      message:
        "correctAnswer must match exactly one option",
    }
  );

// =====================
// GET AI QUESTIONS
// =====================

const getAIQuestions = async (
  topic,
  difficulty,
  questionCount
) => {
  const prompt = `
Generate ${questionCount} multiple choice questions about ${topic}.

Difficulty: ${difficulty}

Return ONLY valid JSON.

[
  {
    "question":"What is JavaScript?",
    "options":[
      "Language",
      "Database",
      "Browser",
      "Server"
    ],
    "correctAnswer":"Language"
  }
]
`;

  const response =
    await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

  const text =
    response.text ||
    response.candidates?.[0]?.content?.parts?.[0]
      ?.text ||
    "";

  const cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleanText);
  } catch (error) {
    throw new Error(
      "AI returned invalid JSON"
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      "AI returned an unexpected format"
    );
  }

  // Keep only valid questions; never store malformed ones.
  const questions = [];

  for (const item of parsed) {
    const result =
      aiQuestionSchema.safeParse(item);

    if (result.success) {
      questions.push(result.data);
    }
  }

  if (questions.length === 0) {
    throw new Error(
      "AI returned no valid questions"
    );
  }

  return questions.slice(0, questionCount);
};


// =====================
// GENERATE EXPLANATION OF WRONG ANSWER
// =====================


const generateExplanation = async (
  question,
  correctAnswer,
  studentAnswer
) => {
  const prompt = `
Question:
${question}

Student Answer:
${studentAnswer}

Correct Answer:
${correctAnswer}

Explain:
1. Why the answer is wrong.
2. Why the correct answer is correct.
3. Key concept to remember.

Return plain text only.
`;

  const response =
    await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

  return (
    response.text ||
    response.candidates?.[0]?.content?.parts?.[0]
      ?.text ||
    "Explanation unavailable"
  );
};

module.exports = {
  getAIQuestions,
  generateExplanation,
};