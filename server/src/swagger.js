const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodRescue API',
      version: '1.0.0',
      description: 'API documentation for the FoodRescue platform',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://foodrescue-deploy-server.vercel.app',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    // API paths defined inline for cross-platform/Vercel compatibility
    paths: {
      '/api/health': {
        get: {
          summary: 'API Healthcheck',
          description: 'Returns the current status of the API server',
          tags: ['System'],
          security: [],
          responses: {
            200: {
              description: 'API is running successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      message: { type: 'string', example: 'FoodRescue API is running' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: { type: 'string', example: 'David Akanang' },
                    email: { type: 'string', example: 'david@example.com' },
                    password: { type: 'string', example: 'securepassword123' },
                    role: { type: 'string', enum: ['donor', 'claimer'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error or user already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login an existing user',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'david@example.com' },
                    password: { type: 'string', example: 'securepassword123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
    },
  },
  apis: [], // paths are defined inline above, no file scanning needed
};

const specs = swaggerJsdoc(options);

module.exports = specs;
