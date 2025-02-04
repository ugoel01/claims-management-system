const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Claims Management API",
      version: "1.0.0",
      description: "API documentation for Claims Management System",
    },
    servers: [
      {
        url: "https://claims-management-system-avdw.onrender.com/", 
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API route files
};

// Initialize Swagger Docs
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
