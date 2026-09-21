const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Routes
const authRoutes = require("./routes/auth.route");
const quizRoutes = require("./routes/quiz.route");
const questionRoutes = require("./routes/question.routes");
const quizQuestionRoutes = require("./routes/quizQuestion.routes");
const attemptRoutes = require("./routes/attempt.routes");
const categoryRoutes = require("./routes/category.route");
const userRoutes = require("./routes/user.route");
const badgeRoutes = require("./routes/badge.routes");
const leaderboardRoutes = require("./routes/leaderboard.route");
const analyticsRoutes = require("./routes/analytics.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const attemptEventRoutes = require("./routes/attemptEvent.routes");
const aiRoutes = require("./routes/ai.rotues");
const teacherDashboardRoutes = require("./routes/teacherDashboard.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

// ======================
// SECURITY
// ======================

app.use(helmet());

// ======================
// CORS
// ======================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ======================
// MIDDLEWARES
// ======================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

// ======================
// HEALTH CHECK
// ======================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Quiz API Running",
  });
});

// ======================
// API ROUTES
// ======================

app.use("/api/auth", authRoutes);

app.use("/api/quizzes", quizRoutes);

app.use("/api/questions", questionRoutes);

app.use(
  "/api/quizzes",
  quizQuestionRoutes
);

app.use("/api/attempts", attemptRoutes);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use("/api/users", userRoutes);

app.use("/api/badges", badgeRoutes);

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/attempts",
  attemptEventRoutes
);

app.use("/api/ai", aiRoutes);

app.use(
  "/api/teacher-dashboard",
  teacherDashboardRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// ======================
// SWAGGER JSON
// ======================

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ======================
// SWAGGER
// ======================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ======================
// 404 HANDLER
// ======================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    success: false,
    message:
      err.message ||
      "Internal Server Error",
  });
});

module.exports = app;