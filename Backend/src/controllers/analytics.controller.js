const analyticsService = require("../services/analytics.service");

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Analytics error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "An error occurred while retrieving analytics"
        : error.message,
  });
};

const getQuizAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getQuizAnalytics(
      req.params.quizId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getQuestionAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getQuestionAnalytics(
      req.params.quizId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      ...analytics,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getQuizAttemptsIntegrity = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 50);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "page must be positive and limit must be between 1 and 100",
      });
    }

    const result = await analyticsService.getQuizAttemptsIntegrity(
      req.params.quizId,
      req.user,
      { page, limit },
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getOverallAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getOverallAnalytics(req.user);

    return res.status(200).json({
      success: true,
      ...analytics,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getQuizComparison = async (req, res) => {
  try {
    const result = await analyticsService.getQuizComparison(req.user);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAnalyticsTrends = async (req, res) => {
  try {
    const days = Number(req.query.days ?? 30);

    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: "days must be an integer between 1 and 365",
      });
    }

    const result = await analyticsService.getAnalyticsTrends(req.user, {
      days,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getTeacherAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can view teacher analytics",
      });
    }

    const result = await analyticsService.getTeacherAnalytics();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  getQuizAnalytics,
  getQuestionAnalytics,
  getQuizAttemptsIntegrity,
  getOverallAnalytics,
  getQuizComparison,
  getAnalyticsTrends,
  getTeacherAnalytics,
};