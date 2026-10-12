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
  if (!process.env.EMAIL_USER) {
    throw new Error(
      "EMAIL_USER is missing from environment variables"
    );
  }

  if (
    !resetUrl ||
    resetUrl.includes("undefined")
  ) {
    throw new Error("Invalid password reset URL");
  }

  const safeName = String(name || "User")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",

    text: [
      `Hello ${name || "User"},`,
      "",
      "Click the link below to reset your password:",
      resetUrl,
      "",
      "This link expires in 15 minutes.",
      "If you did not request this reset, ignore this email.",
    ].join("\n"),

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: 0 auto;
        padding: 28px;
        color: #172033;
      ">
        <h2>Password Reset Request</h2>

        <p>Hello ${safeName},</p>

        <p>
          Click the button below to choose a new password.
        </p>

        <p style="margin: 28px 0;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 13px 24px;
              background: #00c995;
              color: #062b25;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
        </p>

        <p>This link expires in 15 minutes.</p>

        <p>
          If you did not request this reset, you can ignore this email.
        </p>
      </div>
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
