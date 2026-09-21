const genAI = require("../config/gemini");

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
      model: "gemini-3.6-flash",
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

  const questions =
    JSON.parse(cleanText);

  return questions;
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
      model: "gemini-3.6-flash",
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

