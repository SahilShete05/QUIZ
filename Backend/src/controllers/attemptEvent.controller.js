const prisma = require("../config/prismaClient");

// =====================
// CREATE EVENT
// =====================

const createAttemptEvent = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { eventType, metadata } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: {
        id: attemptId,
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

    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({
        success: false,
        message: "Attempt already finished",
      });
    }

    const event = await prisma.attemptEvent.create({
      data: {
        attemptId,
        eventType,
        metadata,
      },
    });

    return res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// GET ATTEMPT EVENTS
// =====================

const getAttemptEvents = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await prisma.attempt.findUnique({
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

    const isOwner =
      attempt.userId === req.user.id;

    const isTeacher =
      attempt.quiz.createdById ===
      req.user.id;

    const isAdmin =
      req.user.role === "ADMIN";

    if (
      !isOwner &&
      !isTeacher &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const events =
      await prisma.attemptEvent.findMany({
        where: {
          attemptId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// EVENT SUMMARY
// =====================

const getAttemptEventSummary =
  async (req, res) => {
    try {
      const { attemptId } =
        req.params;

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

      const isOwner =
        attempt.userId ===
        req.user.id;

      const isTeacher =
        attempt.quiz.createdById ===
        req.user.id;

      const isAdmin =
        req.user.role === "ADMIN";

      if (
        !isOwner &&
        !isTeacher &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const events =
        await prisma.attemptEvent.findMany({
          where: {
            attemptId,
          },
        });

      const summary = {
        tabSwitches:
          events.filter(
            (e) =>
              e.eventType ===
              "TAB_SWITCH"
          ).length,

        copyAttempts:
          events.filter(
            (e) =>
              e.eventType ===
              "COPY_ATTEMPT"
          ).length,

        pasteAttempts:
          events.filter(
            (e) =>
              e.eventType ===
              "PASTE_ATTEMPT"
          ).length,

        rightClickAttempts:
          events.filter(
            (e) =>
              e.eventType ===
              "RIGHT_CLICK_ATTEMPT"
          ).length,
      };

      const totalViolations =
        summary.tabSwitches +
        summary.copyAttempts +
        summary.pasteAttempts +
        summary.rightClickAttempts;

      let riskLevel = "LOW";

      if (totalViolations >= 5) {
        riskLevel = "MEDIUM";
      }

      if (totalViolations >= 10) {
        riskLevel = "HIGH";
      }

      return res.status(200).json({
        success: true,
        summary: {
          ...summary,
          totalViolations,
          riskLevel,
        },
      });
    } catch (error) {
      console.error(
        "EVENT SUMMARY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };

module.exports = {
  createAttemptEvent,
  getAttemptEvents,
  getAttemptEventSummary,
};