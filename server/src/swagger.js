const swaggerJsdoc = require('swagger-jsdoc');

const errorResponse = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'Server error' },
  },
};

const validationErrorResponse = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          msg: { type: 'string', example: 'Valid email is required' },
          path: { type: 'string', example: 'email' },
          location: { type: 'string', example: 'body' },
        },
      },
    },
  },
};

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'David Akanang' },
    email: { type: 'string', format: 'email', example: 'david@example.com' },
    role: { type: 'string', enum: ['donor', 'claimer'] },
    city: { type: 'string', nullable: true, example: 'Lagos' },
  },
};

const listingSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    donorId: { type: 'string', format: 'uuid' },
    title: { type: 'string', example: 'Fresh bread and pastries' },
    category: { type: 'string', nullable: true, example: 'Bakery' },
    description: { type: 'string', nullable: true, example: 'Surplus bread from today' },
    photoUrl: { type: 'string', nullable: true, example: 'https://example.com/photo.jpg' },
    quantity: { type: 'string', example: '3 trays' },
    latitude: { type: 'number', nullable: true, example: 6.5244 },
    longitude: { type: 'number', nullable: true, example: 3.3792 },
    city: { type: 'string', nullable: true, example: 'Lagos' },
    address: { type: 'string', nullable: true, example: '12 Market Road' },
    expiresAt: { type: 'string', format: 'date-time' },
    pickupStart: { type: 'string', format: 'date-time' },
    pickupEnd: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: ['active', 'claimed', 'expired', 'completed'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const claimSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    listingId: { type: 'string', format: 'uuid' },
    claimerId: { type: 'string', format: 'uuid' },
    claimedAt: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: ['pending', 'confirmed', 'no_show'] },
  },
};

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
        Error: errorResponse,
        ValidationError: validationErrorResponse,
        User: userSchema,
        Listing: listingSchema,
        Claim: claimSchema,
      },
    },
    security: [{ bearerAuth: [] }],
    // API paths defined inline for cross-platform/Vercel compatibility.
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
      '/api/auth/signup': {
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
                    email: { type: 'string', format: 'email', example: 'david@example.com' },
                    password: { type: 'string', minLength: 6, example: 'securepassword123' },
                    role: { type: 'string', enum: ['donor', 'claimer'] },
                    city: { type: 'string', example: 'Lagos' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'User created successfully' },
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string', example: 'jwt.token.value' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error or user already exists' },
            500: { description: 'Server error during registration' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Log in an existing user',
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
                    email: { type: 'string', format: 'email', example: 'david@example.com' },
                    password: { type: 'string', example: 'securepassword123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Logged in successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Logged in successfully' },
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string', example: 'jwt.token.value' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
            500: { description: 'Server error during login' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'Log out user',
          tags: ['Auth'],
          responses: {
            200: {
              description: 'Logged out successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Logged out successfully. Please remove token from client.' },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Get current user',
          tags: ['Auth'],
          responses: {
            200: {
              description: 'Returns current user data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
          },
        },
      },
      '/api/listings': {
        get: {
          summary: 'Public feed of active listings',
          tags: ['Listings'],
          security: [],
          parameters: [
            {
              in: 'query',
              name: 'city',
              schema: { type: 'string' },
              description: 'Filter listings by city',
              example: 'Lagos',
            },
          ],
          responses: {
            200: {
              description: 'List of active listings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Listing' },
                  },
                },
              },
            },
            500: { description: 'Server error fetching listings' },
          },
        },
        post: {
          summary: 'Create a new listing',
          tags: ['Listings'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'quantity', 'expiresAt', 'pickupStart', 'pickupEnd'],
                  properties: {
                    title: { type: 'string', example: 'Fresh bread and pastries' },
                    category: { type: 'string', example: 'Bakery' },
                    description: { type: 'string', example: 'Surplus bread from today' },
                    quantity: { type: 'string', example: '3 trays' },
                    latitude: { type: 'number', example: 6.5244 },
                    longitude: { type: 'number', example: 3.3792 },
                    city: { type: 'string', example: 'Lagos' },
                    address: { type: 'string', example: '12 Market Road' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    pickupStart: { type: 'string', format: 'date-time' },
                    pickupEnd: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Listing created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Listing' },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Donor role required' },
            500: { description: 'Server error creating listing' },
          },
        },
      },
      '/api/listings/mine': {
        get: {
          summary: 'Poster dashboard listings',
          tags: ['Listings'],
          responses: {
            200: {
              description: 'List of owned listings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Listing' },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Donor role required' },
            500: { description: 'Server error fetching your listings' },
          },
        },
      },
      '/api/listings/{id}': {
        patch: {
          summary: 'Update an owned listing',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    category: { type: 'string' },
                    description: { type: 'string' },
                    photoUrl: { type: 'string' },
                    quantity: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    city: { type: 'string' },
                    address: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    pickupStart: { type: 'string', format: 'date-time' },
                    pickupEnd: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['active', 'claimed', 'expired', 'completed'] },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Listing updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Listing' },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Not authorized to update this listing' },
            404: { description: 'Listing not found' },
            500: { description: 'Server error updating listing' },
          },
        },
        delete: {
          summary: 'Delete an owned listing',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Listing deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Listing deleted successfully' },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Not authorized to delete this listing' },
            404: { description: 'Listing not found' },
            500: { description: 'Server error deleting listing' },
          },
        },
      },
      '/api/listings/{id}/photo': {
        post: {
          summary: 'Upload a photo for an owned listing',
          description: 'Uploads an image to Supabase Storage and updates the listing photoUrl.',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['photo'],
                  properties: {
                    photo: {
                      type: 'string',
                      format: 'binary',
                      description: 'JPEG, PNG, or WebP image up to 5MB',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Listing photo uploaded',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Listing photo uploaded successfully' },
                      photoUrl: { type: 'string', example: 'https://your-project.supabase.co/storage/v1/object/public/listing-photos/listings/id/photo.jpg' },
                      listing: { $ref: '#/components/schemas/Listing' },
                    },
                  },
                },
              },
            },
            400: { description: 'Missing, oversized, or unsupported image file' },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Not authorized to update this listing' },
            404: { description: 'Listing not found' },
            500: { description: 'Server error uploading listing photo' },
          },
        },
      },
      '/api/listings/{id}/claim': {
        post: {
          summary: 'Claim a listing',
          tags: ['Claims'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            201: {
              description: 'Listing claimed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Claim' },
                },
              },
            },
            400: { description: 'Listing unavailable or already claimed by this user' },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Claimer role required' },
            404: { description: 'Listing not found' },
            500: { description: 'Server error creating claim' },
          },
        },
      },
      '/api/listings/{id}/claims': {
        get: {
          summary: 'View claims on owned listing',
          tags: ['Claims'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'List of claims for the listing',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      allOf: [
                        { $ref: '#/components/schemas/Claim' },
                        {
                          type: 'object',
                          properties: {
                            claimer: { $ref: '#/components/schemas/User' },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Not authorized to view claims for this listing' },
            404: { description: 'Listing not found' },
            500: { description: 'Server error fetching listing claims' },
          },
        },
      },
      '/api/claims/mine': {
        get: {
          summary: 'Claimer dashboard claims',
          tags: ['Claims'],
          responses: {
            200: {
              description: 'List of claims made by the user',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      allOf: [
                        { $ref: '#/components/schemas/Claim' },
                        {
                          type: 'object',
                          properties: {
                            listing: { $ref: '#/components/schemas/Listing' },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Claimer role required' },
            500: { description: 'Server error fetching your claims' },
          },
        },
      },
      '/api/stats/poster': {
        get: {
          summary: 'Poster counters',
          tags: ['Stats'],
          responses: {
            200: {
              description: 'Poster statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      activeListings: { type: 'integer', example: 4 },
                      completedListings: { type: 'integer', example: 12 },
                      totalClaimsReceived: { type: 'integer', example: 18 },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Donor role required' },
            500: { description: 'Server error fetching poster stats' },
          },
        },
      },
      '/api/stats/claimer': {
        get: {
          summary: 'Claimer counters',
          tags: ['Stats'],
          responses: {
            200: {
              description: 'Claimer statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      activeClaims: { type: 'integer', example: 2 },
                      completedClaims: { type: 'integer', example: 7 },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid token' },
            403: { description: 'Claimer role required' },
            500: { description: 'Server error fetching claimer stats' },
          },
        },
      },
    },
  },
  apis: [], // paths are defined inline above, no file scanning needed
};

const specs = swaggerJsdoc(options);

module.exports = specs;
