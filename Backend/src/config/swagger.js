const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Online Quiz System API",
      version: "1.0.0",
      description:
        "Backend API Documentation for Online Quiz System",
    },

    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },

    security: [
      {
        cookieAuth: [],
      },
    ],
  },

  apis: [
    "./src/routes/*.js",
    "./src/controllers/*.js",
  ],
};

const swaggerSpec =
  swaggerJsdoc(options);

module.exports =
  swaggerSpec;