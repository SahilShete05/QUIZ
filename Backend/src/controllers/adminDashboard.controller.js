
const adminDashboardService = require("../services/adminDashboard.service");

const getAdminDashboard = async (req, res) => {
  try {
    const dashboard = await adminDashboardService.getAdminDashboard();

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the admin dashboard",
    });
  }
};

module.exports = {
  getAdminDashboard,
};
