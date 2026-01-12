const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internal Requests Automation API',
      version: '1.0.0',
      description: 'API para la gestión y automatización de solicitudes internas',
      contact: {
        name: 'Soporte Backend',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Request: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 150.50 },
            description: { type: 'string', example: 'Compra de material de oficina' },
            type: { type: 'string', enum: ['PURCHASE', 'REFUND', 'TRAVEL'], example: 'PURCHASE' }
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@empresa.com' },
            password: { type: 'string', format: 'password', example: '123456' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;