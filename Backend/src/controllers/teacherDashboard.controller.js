const { getTeacherDashboardData,} = require( "../services/teacherDashboard.service");

const getTeacherDashboard = async (
  req,
  res
) => {
  try {
    const dashboard =
      await getTeacherDashboardData(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getTeacherDashboard,
};