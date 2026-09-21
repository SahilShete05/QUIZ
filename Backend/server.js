const app = require("./src/app");

const prisma = require(
  "./src/config/prismaClient"
);

const {
  startAutoSubmitJob,
} = require(
  "./src/services/autoSubmit.services"
);

const PORT =
  process.env.PORT || 5000;

startAutoSubmitJob();

async function startServer() {
  try {
    await prisma.$connect();

    console.log(
      "Database connected"
    );

    app.listen(PORT,'0.0.0.0', () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
}

startServer();