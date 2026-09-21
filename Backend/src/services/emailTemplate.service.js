const transporter = require("../services/email");

const sendWelcomeEmail = async (
  email,
  name
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject:
      "Welcome to Quiz Platform",
    html: `
      <h2>Welcome ${name} 👋</h2>

      <p>
        Your account has been created successfully.
      </p>

      <p>
        Start solving quizzes and earning XP.
      </p>

      <br/>

      <p>
        Quiz Platform Team
      </p>
    `,
  });
};

const sendQuizCompletedEmail =
  async (
    email,
    name,
    score,
    maxScore
  ) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Quiz Completed",
      html: `
        <h2>Quiz Completed 🎉</h2>

        <p>
          Hello ${name},
        </p>

        <p>
          You successfully completed a quiz.
        </p>

        <p>
          Score:
          <strong>
            ${score}/${maxScore}
          </strong>
        </p>

        <br/>

        <p>
          Keep learning and improving.
        </p>
      `,
    });
  };

const sendBadgeEarnedEmail =
  async (
    email,
    name,
    badgeName
  ) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject:
        "New Badge Earned",
      html: `
        <h2>
          Congratulations ${name} 🏆
        </h2>

        <p>
          You unlocked a new badge:
        </p>

        <h3>
          ${badgeName}
        </h3>

        <p>
          Keep solving quizzes to unlock more badges.
        </p>
      `,
    });
  };

const sendLevelUpEmail =
  async (
    email,
    name,
    level
  ) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Level Up!",
      html: `
        <h2>
          Level Up 🚀
        </h2>

        <p>
          Congratulations ${name}
        </p>

        <p>
          You reached
          <strong>
            Level ${level}
          </strong>
        </p>

        <p>
          Keep earning XP.
        </p>
      `,
    });
  };
 
const sendResetPasswordEmail = async (
  email,
  name,
  resetUrl
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset Request</h2>

      <p>Hello ${name},</p>

      <p>
        Click the link below to reset your password.
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>
        This link expires in 15 minutes.
      </p>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendQuizCompletedEmail,
  sendBadgeEarnedEmail,
  sendResetPasswordEmail,
  sendLevelUpEmail,
};
