const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ELF Finance API',
      version: '1.0.0',
      description: 'API documentation for ELF Finance application with MySQL database',
      contact: {
        name: 'API Support',
        email: 'support@elffinance.com'
      },
    },
    servers: [
      {
        url: process.env.SWAGGER_URL || 'http://localhost:3000' ,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated id of the user',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              description: 'User email',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'The date the user was created',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📚 Swagger documentation available at http://localhost:' + (process.env.PORT || 3000) + '/api-docs');
};

module.exports = setupSwagger;
